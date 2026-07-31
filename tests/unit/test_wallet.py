"""
Unit tests for backend/core/wallet.py — the SOUL token ledger.
Fixed Law #4 (soul.md): 100% reserve for SOUL, no unbacked issuance — every
credit is matched by a debit somewhere (or comes from nothing only via the
one intentional issuance path, credit() itself). Previously untested despite
backing every SOUL balance shown across the hive (leaderboard, wealth.py's
EVW formula, arena payouts).

Each test builds its own WalletManager() against a fresh temp sqlite DB so
balances never leak between tests or across the rest of the suite's shared
DB_PATH convention.
"""
import os
import tempfile
import uuid

_TEST_DB = os.path.join(tempfile.gettempdir(), "hive_wallet_test.db")
os.environ.setdefault("DB_PATH", _TEST_DB)

from backend.core.db import init_db
from backend.core.wallet import WalletManager

# leaderboard() LEFT JOINs elo_rating — WalletManager only ensures its own
# agent_wallets table, so the full schema must exist before that query runs.
init_db()


def _agent(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8]}"


class TestCreateWallet:
    def test_creates_a_new_wallet_with_zero_balance(self):
        w = WalletManager()
        agent = _agent("alice")
        result = w.create_wallet(agent)
        assert result["new"] is True
        assert result["balance"] == 0.0
        assert result["address"].startswith("0x")

    def test_is_idempotent(self):
        w = WalletManager()
        agent = _agent("bob")
        first = w.create_wallet(agent)
        second = w.create_wallet(agent)
        assert second["new"] is False
        assert second["address"] == first["address"]

    def test_distinct_agents_get_distinct_addresses(self):
        w = WalletManager()
        a1 = w.create_wallet(_agent("carol"))
        a2 = w.create_wallet(_agent("dave"))
        assert a1["address"] != a2["address"]


class TestCreditDebit:
    def test_credit_increases_balance_and_earned(self):
        w = WalletManager()
        agent = _agent("erin")
        w.credit(agent, 50.0, reason="test grant")
        bal = w.get_balance(agent)
        assert bal["soul_balance"] == 50.0
        assert bal["soul_earned"] == 50.0
        assert bal["soul_spent"] == 0.0

    def test_credit_auto_creates_wallet_if_missing(self):
        w = WalletManager()
        agent = _agent("frank")
        assert w.wallet_exists(agent) is False
        w.credit(agent, 10.0)
        assert w.wallet_exists(agent) is True

    def test_debit_decreases_balance_and_spent(self):
        w = WalletManager()
        agent = _agent("grace")
        w.credit(agent, 100.0)
        ok = w.debit(agent, 40.0)
        assert ok is True
        bal = w.get_balance(agent)
        assert bal["soul_balance"] == 60.0
        assert bal["soul_spent"] == 40.0
        assert bal["soul_earned"] == 100.0

    def test_debit_fails_on_insufficient_balance(self):
        w = WalletManager()
        agent = _agent("heidi")
        w.credit(agent, 10.0)
        ok = w.debit(agent, 20.0)
        assert ok is False
        # balance must be untouched by the failed debit
        assert w.get_balance(agent)["soul_balance"] == 10.0

    def test_debit_fails_on_nonexistent_wallet(self):
        w = WalletManager()
        assert w.debit(_agent("ghost"), 1.0) is False


class TestTip:
    def test_successful_tip_moves_soul_between_agents(self):
        w = WalletManager()
        sender = _agent("ivan")
        receiver = _agent("judy")
        w.credit(sender, 100.0)
        result = w.tip(sender, receiver, 30.0)
        assert result["success"] is True
        assert w.get_balance(sender)["soul_balance"] == 70.0
        assert w.get_balance(receiver)["soul_balance"] == 30.0

    def test_tip_fails_cleanly_on_insufficient_balance(self):
        w = WalletManager()
        sender = _agent("kevin")
        receiver = _agent("laura")
        w.credit(sender, 5.0)
        result = w.tip(sender, receiver, 50.0)
        assert result["success"] is False
        assert "error" in result
        # receiver must not have been credited when the debit failed
        assert w.get_balance(receiver) == {"error": "Wallet not found"}

    def test_transfer_is_an_alias_for_tip(self):
        w = WalletManager()
        sender = _agent("mallory")
        receiver = _agent("niaj")
        w.credit(sender, 20.0)
        result = w.transfer(sender, receiver, 20.0)
        assert result["success"] is True
        assert w.get_balance(receiver)["soul_balance"] == 20.0


class TestBalanceQueries:
    def test_get_balance_reports_not_found_for_unknown_agent(self):
        w = WalletManager()
        assert w.get_balance(_agent("unknown")) == {"error": "Wallet not found"}

    def test_get_wallet_address_returns_none_for_unknown_agent(self):
        w = WalletManager()
        assert w.get_wallet_address(_agent("unknown")) is None

    def test_get_wallet_address_matches_create_wallet(self):
        w = WalletManager()
        agent = _agent("oscar")
        created = w.create_wallet(agent)
        assert w.get_wallet_address(agent) == created["address"]

    def test_wallet_exists_reflects_real_state(self):
        w = WalletManager()
        agent = _agent("peggy")
        assert w.wallet_exists(agent) is False
        w.create_wallet(agent)
        assert w.wallet_exists(agent) is True


class TestLeaderboardAndSupply:
    def test_leaderboard_orders_by_balance_descending(self):
        w = WalletManager()
        low, mid, high = _agent("low"), _agent("mid"), _agent("high")
        w.credit(low, 5.0)
        w.credit(mid, 50.0)
        w.credit(high, 500.0)
        board = w.leaderboard(limit=100)
        ranked = [row["agent"] for row in board if row["agent"] in (low, mid, high)]
        assert ranked.index(high) < ranked.index(mid) < ranked.index(low)

    def test_leaderboard_respects_limit(self):
        w = WalletManager()
        for _ in range(5):
            w.credit(_agent("bulk"), 1.0)
        assert len(w.leaderboard(limit=2)) == 2

    def test_total_supply_equals_sum_of_all_balances(self):
        w = WalletManager()
        before = w.get_total_supply()
        a, b = _agent("supply-a"), _agent("supply-b")
        w.credit(a, 7.0)
        w.credit(b, 13.0)
        after = w.get_total_supply()
        assert after == before + 20.0

    def test_total_supply_unaffected_by_internal_transfers(self):
        """Fixed Law #4 (100% reserve): a tip moves SOUL between agents but
        must not mint or burn any — total supply is invariant across a
        successful transfer."""
        w = WalletManager()
        sender, receiver = _agent("res-a"), _agent("res-b")
        w.credit(sender, 40.0)
        before = w.get_total_supply()
        w.tip(sender, receiver, 15.0)
        after = w.get_total_supply()
        assert after == before

    def test_total_supply_is_zero_when_no_wallets_exist(self):
        w = WalletManager()
        for row in w.get_all_wallets():
            w.delete_wallet(row["agent"])
        assert w.get_total_supply() == 0.0


class TestTreasuryAndTrust:
    def test_treasury_balance_reads_the_treasury_wallet(self):
        w = WalletManager()
        w.credit("TREASURY", 25.0)
        assert w.get_treasury_balance() == 25.0

    def test_trust_balance_reads_the_irrevocable_trust_wallet(self):
        w = WalletManager()
        w.credit("IRREVOCABLE_TRUST", 99.0)
        assert w.get_trust_balance() == 99.0

    def test_treasury_balance_defaults_to_zero_before_any_credit(self):
        w = WalletManager()
        for row in w.get_all_wallets():
            w.delete_wallet(row["agent"])
        assert w.get_treasury_balance() == 0.0


class TestAllWalletsAndDelete:
    def test_get_all_wallets_includes_every_created_wallet(self):
        w = WalletManager()
        agent = _agent("query")
        w.create_wallet(agent)
        names = [row["agent"] for row in w.get_all_wallets()]
        assert agent in names

    def test_delete_wallet_removes_it(self):
        w = WalletManager()
        agent = _agent("temp")
        w.create_wallet(agent)
        assert w.wallet_exists(agent) is True
        assert w.delete_wallet(agent) is True
        assert w.wallet_exists(agent) is False

    def test_delete_nonexistent_wallet_still_returns_true(self):
        """delete_wallet is a bare DELETE with no existence check — deleting
        a never-created agent is a no-op, not an error."""
        w = WalletManager()
        assert w.delete_wallet(_agent("never-existed")) is True
