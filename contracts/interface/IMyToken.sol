// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title IMyToken
 * @dev MyToken合约接口，定义了所有公开可调用的函数
 */
interface IMyToken is IERC20 {
    
    // ===== 结构体 =====
    
    /// @dev 铸造记录结构
    struct MintRecord {
        address recipient;
        uint256 amount;
        uint256 timestamp;
    }
    
    // ===== 事件 =====
    
    /// @dev 铸造事件
    event Mint(address indexed to, uint256 amount, uint256 timestamp);
    
    /// @dev 铸造状态变更事件
    event MintPausedChanged(bool paused);
    
    /// @dev 紧急提取事件
    event EmergencyWithdraw(address indexed to, uint256 amount);
    
    // ===== 常量 =====
    
    /// @dev 最大总供应量
    function MAX_SUPPLY() external view returns (uint256);
    
    /// @dev 单地址最大铸造限额
    function MAX_MINT_PER_ADDRESS() external view returns (uint256);
    
    /// @dev 单次最大铸造数量
    function MAX_MINT_PER_TX() external view returns (uint256);
    
    // ===== 状态变量 =====
    
    /// @dev 铸造功能是否暂停
    function mintPaused() external view returns (bool);
    
    /// @dev 获取地址已铸造数量
    function mintedAmount(address account) external view returns (uint256);
    
    /// @dev 获取铸造历史记录
    function mintHistory(uint256 index) external view returns (MintRecord memory);
    
    // ===== 铸造功能 =====
    
    /// @dev 铸造代币
    function mint(address to, uint256 amount) external;
    
    /// @dev 批量铸造代币
    function batchMint(address[] calldata recipients, uint256[] calldata amounts) external;
    
    // ===== 管理功能 =====
    
    /// @dev 暂停/恢复铸造功能
    function setMintPaused(bool paused) external;
    
    /// @dev 紧急提取ETH
    function emergencyWithdraw() external;
    
    // ===== 查询功能 =====
    
    /// @dev 获取剩余可铸造数量
    function remainingMintableSupply() external view returns (uint256);
    
    /// @dev 获取地址剩余可铸造数量
    function remainingMintableAmount(address account) external view returns (uint256);
    
    /// @dev 获取铸造历史记录数量
    function getMintHistoryLength() external view returns (uint256);
    
    /// @dev 获取指定范围的铸造历史
    function getMintHistory(uint256 start, uint256 end) external view returns (MintRecord[] memory);
    
    /// @dev 检查地址是否可以铸造指定数量
    function canMint(address account, uint256 amount) external view returns (bool);
} 