"""
Unit tests for backend/economy/staking.py — locked SOUL staking with APY
rewards and decay mechanics, wired to /v11/staking/{stake,claim,positions}.
Previously under-tested (24%). Depends on backend/core/wallet.py (already
covered by test_wallet.py) for the debit/credit side of stake/claim.

Maturity is controlled by monkeypatching settings.staking_lock_days: a
negative value makes locked_until fall in the past (clearly matured,
avoiding clock-skew flakiness at a literal zero-day boundary); the default
(30 days) keeps a position clearly immature.
"""
import os
import tempfile
import uuid

_TEST_DB = os.path.join(tempfile.gettempdir(), "hive_staking_test.db")
os.environ.setdefault("DB_PATH", _TEST_DB)

from datetime import datetime, timedelta

import pytest

from backend.core.db import init_db, get_db
from backend.core.wallet import wallet_manager
from backend.core.config import settings
from backend.economy.staking import StakingManager

init_db()


def _agent(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8]}"


def _mature(stake_id: str, days_past_maturity: int = 1):
    """Backdate a position's locked_until so it reads as matured, without
    touching settings.staking_lock_days — claim_rewards() re-reads that
    setting at claim time and assumes it's unchanged since stake time
    (true in production, where it's a fixed startup config value; monkey-
    patching it negative to fake maturity breaks that assumption instead)."""
    conn = get_db()
    past = (datetime.now() - timedelta(days=days_past_maturity)).isoformat()
    conn.execute("UPDATE staking_positions SET locked_until = ? WHERE id = ?", (past, stake_id))
    conn.commit()


class TestStake:
    @pytest.mark.asyncio
    async def test_stake_below_minimum_is_rejected(self):
        s = StakingManager()
        agent = _agent("under-min")
        wallet_manager.credit(agent, 100.0)
        result = await s.stake(agent, 0.1)
        assert result["success"] is False
        assert "Minimum stake" in result["error"]

    @pytest.mark.asyncio
    async def test_stake_with_insufficient_balance_is_rejected(self):
        s = StakingManager()
        agent = _agent("poor")
        wallet_manager.credit(agent, 5.0)
        result = await s.stake(agent, 50.0)
        assert result["success"] is False
        assert "Insufficient SOUL" in result["error"]

    @pytest.mark.asyncio
    async def test_insufficient_stake_does_not_debit_wallet(self):
        s = StakingManager()
        agent = _agent("poor-untouched")
        wallet_manager.credit(agent, 5.0)
        await s.stake(agent, 50.0)
        assert wallet_manager.get_balance(agent)["soul_balance"] == 5.0

    @pytest.mark.asyncio
    async def test_successful_stake_debits_wallet_and_creates_position(self):
        s = StakingManager()
        agent = _agent("staker")
        wallet_manager.credit(agent, 100.0)
        result = await s.stake(agent, 40.0)
        assert result["success"] is True
        assert result["agent"] == agent
        assert result["amount"] == 40.0
        assert wallet_manager.get_balance(agent)["soul_balance"] == 60.0
        assert s.get_total_staked(agent) == 40.0

    @pytest.mark.asyncio
    async def test_estimated_reward_matches_apy_formula(self):
        s = StakingManager()
        agent = _agent("apy-check")
        wallet_manager.credit(agent, 100.0)
        result = await s.stake(agent, 100.0)
        expected = round(100.0 * settings.staking_apy * (settings.staking_lock_days / 365), 4)
        assert result["estimated_reward"] == expected


class TestClaimRewards:
    @pytest.mark.asyncio
    async def test_immature_position_is_not_claimable(self):
        s = StakingManager()
        agent = _agent("immature")
        wallet_manager.credit(agent, 100.0)
        await s.stake(agent, 50.0)  # default 30-day lock, still in the future

        result = await s.claim_rewards(agent)
        assert result["success"] is True
        assert result["positions_claimed"] == 0
        assert result["total_rewards_claimed"] == 0.0

    @pytest.mark.asyncio
    async def test_matured_position_pays_out_and_credits_wallet(self):
        s = StakingManager()
        agent = _agent("matured")
        wallet_manager.credit(agent, 100.0)
        staked = await s.stake(agent, 50.0)
        _mature(staked["stake_id"])
        balance_after_stake = wallet_manager.get_balance(agent)["soul_balance"]

        result = await s.claim_rewards(agent)
        assert result["success"] is True
        assert result["positions_claimed"] == 1
        assert result["total_rewards_claimed"] > 0.0

        new_balance = wallet_manager.get_balance(agent)["soul_balance"]
        assert new_balance == pytest.approx(balance_after_stake + result["total_rewards_claimed"])

    @pytest.mark.asyncio
    async def test_claiming_twice_only_pays_out_once(self):
        s = StakingManager()
        agent = _agent("double-claim")
        wallet_manager.credit(agent, 100.0)
        staked = await s.stake(agent, 50.0)
        _mature(staked["stake_id"])

        first = await s.claim_rewards(agent)
        assert first["positions_claimed"] == 1

        second = await s.claim_rewards(agent)
        assert second["positions_claimed"] == 0
        assert second["total_rewards_claimed"] == 0.0

    @pytest.mark.asyncio
    async def test_claim_with_no_positions_is_a_clean_no_op(self):
        s = StakingManager()
        result = await s.claim_rewards(_agent("never-staked"))
        assert result["success"] is True
        assert result["positions_claimed"] == 0
        assert result["total_rewards_claimed"] == 0.0


class TestPositionsAndQueries:
    @pytest.mark.asyncio
    async def test_get_positions_flags_maturity_correctly(self):
        s = StakingManager()
        agent = _agent("mixed-maturity")
        wallet_manager.credit(agent, 100.0)

        matured = await s.stake(agent, 10.0)
        _mature(matured["stake_id"])
        await s.stake(agent, 10.0)  # left at the default 30-day lock, still immature

        positions = s.get_positions(agent)
        assert len(positions) == 2
        mature_flags = sorted(p["is_mature"] for p in positions)
        assert mature_flags == [False, True]

    @pytest.mark.asyncio
    async def test_get_total_staked_sums_all_positions(self):
        s = StakingManager()
        agent = _agent("sum-check")
        wallet_manager.credit(agent, 100.0)
        await s.stake(agent, 10.0)
        await s.stake(agent, 15.0)
        assert s.get_total_staked(agent) == 25.0

    def test_get_total_staked_is_zero_for_unknown_agent(self):
        s = StakingManager()
        assert s.get_total_staked(_agent("never-staked")) == 0.0

    @pytest.mark.asyncio
    async def test_get_staking_position_returns_full_detail(self):
        s = StakingManager()
        agent = _agent("detail-check")
        wallet_manager.credit(agent, 100.0)
        staked = await s.stake(agent, 20.0)
        detail = s.get_staking_position(staked["stake_id"])
        assert detail["agent"] == agent
        assert detail["amount"] == 20.0

    def test_get_staking_position_returns_none_for_unknown_id(self):
        s = StakingManager()
        assert s.get_staking_position("stake_doesnotexist") is None

    @pytest.mark.asyncio
    async def test_get_agent_staking_history_lists_all_positions(self):
        s = StakingManager()
        agent = _agent("history-check")
        wallet_manager.credit(agent, 100.0)
        await s.stake(agent, 5.0)
        await s.stake(agent, 7.0)
        history = s.get_agent_staking_history(agent)
        assert len(history) == 2

    @pytest.mark.asyncio
    async def test_get_total_rewards_claimed_reflects_claims(self):
        s = StakingManager()
        agent = _agent("rewards-check")
        wallet_manager.credit(agent, 100.0)
        staked = await s.stake(agent, 50.0)
        _mature(staked["stake_id"])
        await s.claim_rewards(agent)
        assert s.get_total_rewards_claimed(agent) > 0.0

    @pytest.mark.asyncio
    async def test_leaderboard_orders_by_total_staked_descending(self):
        s = StakingManager()
        low, high = _agent("board-low"), _agent("board-high")
        wallet_manager.credit(low, 100.0)
        wallet_manager.credit(high, 100.0)
        await s.stake(low, 5.0)
        await s.stake(high, 50.0)
        board = s.get_leaderboard(limit=100)
        ranked = [row["agent"] for row in board if row["agent"] in (low, high)]
        assert ranked.index(high) < ranked.index(low)

    @pytest.mark.asyncio
    async def test_global_stats_reflect_real_positions(self):
        s = StakingManager()
        before = s.get_global_staking_stats()
        agent = _agent("global-stats")
        wallet_manager.credit(agent, 100.0)
        await s.stake(agent, 30.0)
        after = s.get_global_staking_stats()
        assert after["total_positions"] == before["total_positions"] + 1
        assert after["total_staked"] == pytest.approx(before["total_staked"] + 30.0)

    def test_config_accessors_match_settings(self):
        s = StakingManager()
        assert s.get_apy() == settings.staking_apy
        assert s.get_lock_days() == settings.staking_lock_days
        assert s.get_min_stake() == settings.staking_min_amount
