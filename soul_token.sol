// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// ============================================================
// SOUL TOKEN — Sovereign Hive Economic Layer
// ERC-20 with agent wallet registry and DAO treasury
// Deploy to Sepolia testnet first; promote to mainnet after audit
// ============================================================

// Minimal ERC-20 interface (no external deps needed for testnet)
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, address indexed spender2, uint256 value);
}

// ─── SOUL TOKEN ─────────────────────────────────────────────
contract SOULToken {
    // ── ERC-20 State ──
    string  public constant name     = "SOUL";
    string  public constant symbol   = "SOUL";
    uint8   public constant decimals = 18;
    uint256 public constant MAX_SUPPLY = 1_000_000 * 10**18;  // 1M SOUL

    mapping(address => uint256)                     private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    uint256 private _totalSupply;

    // ── Sovereign / DAO ──
    address public sovereign;      // human owner
    address public daoTreasury;    // DAO treasury contract (set after deploy)
    bool    public treasurySet;

    // ── Agent Registry ──
    struct AgentRecord {
        string  name;
        bool    registered;
        uint256 eloRating;         // synced from backend
        uint256 totalEarned;
        uint256 totalSpent;
    }
    mapping(address => AgentRecord) public agents;
    mapping(string  => address)     public agentAddress;   // name → wallet
    address[]                        public agentList;

    // ── Events ──
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event AgentRegistered(string indexed agentName, address wallet, uint256 startingBalance);
    event AgentTipped(address indexed from, address indexed to, string fromName, string toName, uint256 amount);
    event RewardMinted(address indexed agent, string agentName, uint256 amount, string reason);
    event TreasurySet(address treasury);
    event EloSynced(address indexed agent, uint256 newRating);

    // ─── CONSTRUCTOR ──────────────────────────────────────
    constructor() {
        sovereign = msg.sender;
        // Mint initial treasury supply to sovereign
        _mint(msg.sender, 100_000 * 10**18);   // 100k SOUL to sovereign wallet
    }

    // ─── MODIFIERS ────────────────────────────────────────
    modifier onlySovereign() {
        require(msg.sender == sovereign, "SOUL: not sovereign");
        _;
    }
    modifier onlyAuthorized() {
        require(
            msg.sender == sovereign || msg.sender == daoTreasury,
            "SOUL: not authorized"
        );
        _;
    }

    // ─── ERC-20 CORE ──────────────────────────────────────
    function totalSupply() public view returns (uint256) { return _totalSupply; }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 amount) public returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function allowance(address owner, address spender) public view returns (uint256) {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) public returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        uint256 currentAllowance = _allowances[from][msg.sender];
        require(currentAllowance >= amount, "SOUL: insufficient allowance");
        _approve(from, msg.sender, currentAllowance - amount);
        _transfer(from, to, amount);
        return true;
    }

    // ─── AGENT REGISTRY ───────────────────────────────────
    /**
     * Register an agent wallet and give it a starting balance.
     * Called by the backend when a new agent is spawned.
     * startingBalance should be small (e.g. 100 SOUL) as earned allowance.
     */
    function registerAgent(
        string calldata agentName,
        address wallet,
        uint256 startingBalance
    ) external onlySovereign {
        require(!agents[wallet].registered, "SOUL: already registered");
        require(agentAddress[agentName] == address(0), "SOUL: name taken");
        require(_totalSupply + startingBalance <= MAX_SUPPLY, "SOUL: exceeds max supply");

        agents[wallet] = AgentRecord({
            name:         agentName,
            registered:   true,
            eloRating:    1200,
            totalEarned:  startingBalance,
            totalSpent:   0
        });
        agentAddress[agentName] = wallet;
        agentList.push(wallet);

        if (startingBalance > 0) {
            _mint(wallet, startingBalance);
        }
        emit AgentRegistered(agentName, wallet, startingBalance);
    }

    /**
     * Mint reward tokens to an agent (e.g. for completing a task).
     */
    function rewardAgent(
        address agentWallet,
        uint256 amount,
        string calldata reason
    ) external onlyAuthorized {
        require(agents[agentWallet].registered, "SOUL: agent not registered");
        require(_totalSupply + amount <= MAX_SUPPLY, "SOUL: exceeds max supply");
        _mint(agentWallet, amount);
        agents[agentWallet].totalEarned += amount;
        emit RewardMinted(agentWallet, agents[agentWallet].name, amount, reason);
    }

    /**
     * Agent-to-agent tip (any registered agent can tip another).
     */
    function tip(address toAgent, uint256 amount) external {
        require(agents[msg.sender].registered || msg.sender == sovereign, "SOUL: not an agent");
        require(agents[toAgent].registered, "SOUL: recipient not registered");
        _transfer(msg.sender, toAgent, amount);
        agents[toAgent].totalEarned  += amount;
        agents[msg.sender].totalSpent += amount;
        emit AgentTipped(
            msg.sender, toAgent,
            agents[msg.sender].name,
            agents[toAgent].name,
            amount
        );
    }

    /**
     * Sync ELO rating from backend (sovereign or treasury calls this).
     */
    function syncElo(address agentWallet, uint256 newRating) external onlyAuthorized {
        require(agents[agentWallet].registered, "SOUL: agent not registered");
        agents[agentWallet].eloRating = newRating;
        emit EloSynced(agentWallet, newRating);
    }

    // ─── TREASURY ─────────────────────────────────────────
    function setTreasury(address treasury) external onlySovereign {
        require(!treasurySet, "SOUL: treasury already set");
        daoTreasury = treasury;
        treasurySet = true;
        emit TreasurySet(treasury);
    }

    function transferSovereignty(address newSovereign) external onlySovereign {
        require(newSovereign != address(0), "SOUL: zero address");
        sovereign = newSovereign;
    }

    // ─── VIEW HELPERS ─────────────────────────────────────
    function getAgentCount() external view returns (uint256) { return agentList.length; }

    function getAgentInfo(address wallet) external view returns (
        string memory agentName,
        uint256 balance,
        uint256 eloRating,
        uint256 totalEarned,
        uint256 totalSpent
    ) {
        AgentRecord memory r = agents[wallet];
        return (r.name, _balances[wallet], r.eloRating, r.totalEarned, r.totalSpent);
    }

    // ─── INTERNAL ─────────────────────────────────────────
    function _transfer(address from, address to, uint256 amount) internal {
        require(from != address(0), "SOUL: transfer from zero");
        require(to   != address(0), "SOUL: transfer to zero");
        require(_balances[from] >= amount, "SOUL: insufficient balance");
        _balances[from] -= amount;
        _balances[to]   += amount;
        emit Transfer(from, to, amount);
    }

    function _mint(address account, uint256 amount) internal {
        require(account != address(0), "SOUL: mint to zero");
        _totalSupply      += amount;
        _balances[account] += amount;
        emit Transfer(address(0), account, amount);
    }

    function _approve(address owner, address spender, uint256 amount) internal {
        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }
}


// ─── DAO TREASURY ─────────────────────────────────────────
/**
 * Holds SOUL tokens and distributes dividends.
 * Sovereign + high-ELO agents (Sachems) can propose distributions.
 */
contract SOULTreasury {
    SOULToken public soul;
    address   public sovereign;

    struct Distribution {
        address[] recipients;
        uint256[] amounts;
        string    reason;
        bool      executed;
        uint256   approvals;
        mapping(address => bool) voted;
    }
    Distribution[] public distributions;

    event DistributionProposed(uint256 id, string reason, uint256 totalAmount);
    event DistributionApproved(uint256 id, address approver);
    event DistributionExecuted(uint256 id);

    modifier onlySovereign() { require(msg.sender == sovereign, "Treasury: not sovereign"); _; }

    constructor(address _soul) {
        soul     = SOULToken(_soul);
        sovereign = msg.sender;
    }

    function proposeDistribution(
        address[] calldata recipients,
        uint256[] calldata amounts,
        string calldata reason
    ) external onlySovereign returns (uint256 id) {
        require(recipients.length == amounts.length, "Treasury: length mismatch");
        id = distributions.length;
        distributions.push();
        Distribution storage d = distributions[id];
        d.recipients = recipients;
        d.amounts    = amounts;
        d.reason     = reason;
        d.executed   = false;
        d.approvals  = 1;
        d.voted[msg.sender] = true;
        uint256 total;
        for (uint i; i < amounts.length; i++) total += amounts[i];
        emit DistributionProposed(id, reason, total);
    }

    function approveDistribution(uint256 id) external onlySovereign {
        Distribution storage d = distributions[id];
        require(!d.voted[msg.sender], "Treasury: already voted");
        d.voted[msg.sender] = true;
        d.approvals++;
        emit DistributionApproved(id, msg.sender);
    }

    function executeDistribution(uint256 id) external onlySovereign {
        Distribution storage d = distributions[id];
        require(!d.executed, "Treasury: already executed");
        require(d.approvals >= 1, "Treasury: not enough approvals");
        d.executed = true;
        for (uint i; i < d.recipients.length; i++) {
            soul.transfer(d.recipients[i], d.amounts[i]);
        }
        emit DistributionExecuted(id);
    }

    function balance() external view returns (uint256) {
        return soul.balanceOf(address(this));
    }
}
