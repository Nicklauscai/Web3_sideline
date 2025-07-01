// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MyToken
 * @dev ERC20代币合约，支持受控铸造功能
 * @author Web3开发工程师
 * 
 * 主要功能：
 * - 标准ERC20功能 (转账、授权等)
 * - 所有者控制的铸造功能
 * - 单地址铸造限额控制
 * - 总供应量上限控制
 * - 防重入攻击保护
 * - 暂停/恢复铸造功能
 */
contract MyToken is ERC20, Ownable, ReentrancyGuard {
    
    // ===== 状态变量 =====
    
    /// @dev 代币精度 (18位小数)
    uint8 private constant _DECIMALS = 18;
    
    /// @dev 最大总供应量 (1亿代币)
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**_DECIMALS;
    
    /// @dev 单地址最大铸造限额 (10万代币)
    uint256 public constant MAX_MINT_PER_ADDRESS = 100_000 * 10**_DECIMALS;
    
    /// @dev 单次最大铸造数量 (1万代币)
    uint256 public constant MAX_MINT_PER_TX = 10_000 * 10**_DECIMALS;
    
    /// @dev 铸造功能是否暂停
    bool public mintPaused = false;
    
    /// @dev 记录每个地址已铸造的数量
    mapping(address => uint256) public mintedAmount;
    
    /// @dev 记录铸造历史
    struct MintRecord {
        address recipient;
        uint256 amount;
        uint256 timestamp;
    }
    
    /// @dev 铸造记录数组
    MintRecord[] public mintHistory;
    
    // ===== 事件 =====
    
    /// @dev 铸造事件
    event Mint(address indexed to, uint256 amount, uint256 timestamp);
    
    /// @dev 铸造状态变更事件
    event MintPausedChanged(bool paused);
    
    /// @dev 紧急提取事件
    event EmergencyWithdraw(address indexed to, uint256 amount);
    
    // ===== 修饰符 =====
    
    /// @dev 检查铸造是否暂停
    modifier whenMintNotPaused() {
        require(!mintPaused, "MyToken: minting is paused");
        _;
    }
    
    /// @dev 检查铸造数量是否有效
    modifier validMintAmount(uint256 amount) {
        require(amount > 0, "MyToken: mint amount must be greater than 0");
        require(amount <= MAX_MINT_PER_TX, "MyToken: mint amount exceeds per-tx limit");
        _;
    }
    
    // ===== 构造函数 =====
    
    /**
     * @dev 构造函数
     * @param initialOwner 初始所有者地址
     */
    constructor(address initialOwner) 
        ERC20("MyToken", "MTK") 
        Ownable(initialOwner)
    {
        require(initialOwner != address(0), "MyToken: initial owner cannot be zero address");
        
        // 给初始所有者铸造少量代币用于测试 (1000 MTK)
        _mint(initialOwner, 1000 * 10**_DECIMALS);
        
        // 记录初始铸造
        mintedAmount[initialOwner] = 1000 * 10**_DECIMALS;
        mintHistory.push(MintRecord({
            recipient: initialOwner,
            amount: 1000 * 10**_DECIMALS,
            timestamp: block.timestamp
        }));
        
        emit Mint(initialOwner, 1000 * 10**_DECIMALS, block.timestamp);
    }
    
    // ===== 公共函数 =====
    
    /**
     * @dev 铸造代币 (仅所有者)
     * @param to 接收地址
     * @param amount 铸造数量
     */
    function mint(address to, uint256 amount) 
        external 
        onlyOwner 
        nonReentrant 
        whenMintNotPaused 
        validMintAmount(amount)
    {
        require(to != address(0), "MyToken: cannot mint to zero address");
        
        // 检查总供应量限制
        require(
            totalSupply() + amount <= MAX_SUPPLY, 
            "MyToken: mint would exceed max supply"
        );
        
        // 检查单地址铸造限制
        require(
            mintedAmount[to] + amount <= MAX_MINT_PER_ADDRESS,
            "MyToken: mint would exceed per-address limit"
        );
        
        // 执行铸造
        _mint(to, amount);
        
        // 更新记录
        mintedAmount[to] += amount;
        mintHistory.push(MintRecord({
            recipient: to,
            amount: amount,
            timestamp: block.timestamp
        }));
        
        emit Mint(to, amount, block.timestamp);
    }
    
    /**
     * @dev 批量铸造代币 (仅所有者)
     * @param recipients 接收地址数组
     * @param amounts 铸造数量数组
     */
    function batchMint(address[] calldata recipients, uint256[] calldata amounts)
        external
        onlyOwner
        nonReentrant
        whenMintNotPaused
    {
        require(
            recipients.length == amounts.length && recipients.length > 0,
            "MyToken: arrays length mismatch or empty"
        );
        
        require(recipients.length <= 100, "MyToken: too many recipients");
        
        uint256 totalMintAmount = 0;
        
        // 预检查所有铸造请求
        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "MyToken: cannot mint to zero address");
            require(amounts[i] > 0, "MyToken: mint amount must be greater than 0");
            require(amounts[i] <= MAX_MINT_PER_TX, "MyToken: mint amount exceeds per-tx limit");
            
            require(
                mintedAmount[recipients[i]] + amounts[i] <= MAX_MINT_PER_ADDRESS,
                "MyToken: mint would exceed per-address limit"
            );
            
            totalMintAmount += amounts[i];
        }
        
        // 检查总供应量限制
        require(
            totalSupply() + totalMintAmount <= MAX_SUPPLY,
            "MyToken: batch mint would exceed max supply"
        );
        
        // 执行批量铸造
        for (uint256 i = 0; i < recipients.length; i++) {
            _mint(recipients[i], amounts[i]);
            mintedAmount[recipients[i]] += amounts[i];
            
            mintHistory.push(MintRecord({
                recipient: recipients[i],
                amount: amounts[i],
                timestamp: block.timestamp
            }));
            
            emit Mint(recipients[i], amounts[i], block.timestamp);
        }
    }
    
    // ===== 管理函数 =====
    
    /**
     * @dev 暂停/恢复铸造功能 (仅所有者)
     * @param paused 是否暂停
     */
    function setMintPaused(bool paused) external onlyOwner {
        mintPaused = paused;
        emit MintPausedChanged(paused);
    }
    
    /**
     * @dev 紧急提取合约中的ETH (仅所有者)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "MyToken: no ETH to withdraw");
        
        payable(owner()).transfer(balance);
        emit EmergencyWithdraw(owner(), balance);
    }
    
    // ===== 查询函数 =====
    
    /**
     * @dev 获取代币精度
     */
    function decimals() public pure override returns (uint8) {
        return _DECIMALS;
    }
    
    /**
     * @dev 获取剩余可铸造数量
     */
    function remainingMintableSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }
    
    /**
     * @dev 获取地址剩余可铸造数量
     * @param account 查询地址
     */
    function remainingMintableAmount(address account) external view returns (uint256) {
        return MAX_MINT_PER_ADDRESS - mintedAmount[account];
    }
    
    /**
     * @dev 获取铸造历史记录数量
     */
    function getMintHistoryLength() external view returns (uint256) {
        return mintHistory.length;
    }
    
    /**
     * @dev 获取指定范围的铸造历史
     * @param start 起始索引
     * @param end 结束索引
     */
    function getMintHistory(uint256 start, uint256 end) 
        external 
        view 
        returns (MintRecord[] memory) 
    {
        require(start <= end && end < mintHistory.length, "MyToken: invalid range");
        
        uint256 length = end - start + 1;
        MintRecord[] memory records = new MintRecord[](length);
        
        for (uint256 i = 0; i < length; i++) {
            records[i] = mintHistory[start + i];
        }
        
        return records;
    }
    
    /**
     * @dev 检查地址是否可以铸造指定数量
     * @param account 地址
     * @param amount 数量
     */
    function canMint(address account, uint256 amount) 
        external 
        view 
        returns (bool) 
    {
        if (mintPaused) return false;
        if (account == address(0)) return false;
        if (amount == 0 || amount > MAX_MINT_PER_TX) return false;
        if (totalSupply() + amount > MAX_SUPPLY) return false;
        if (mintedAmount[account] + amount > MAX_MINT_PER_ADDRESS) return false;
        
        return true;
    }
    
    // ===== 接收ETH =====
    
    /**
     * @dev 接收ETH
     */
    receive() external payable {
        // 合约可以接收ETH，但不执行任何操作
        // ETH可通过emergencyWithdraw提取
    }
} 