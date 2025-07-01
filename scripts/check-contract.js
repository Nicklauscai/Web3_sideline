const { ethers } = require("hardhat");

/**
 * 检查MyToken合约的基本信息和功能
 */
async function main() {
    console.log("🔍 检查MyToken合约信息...\n");
    
    // 获取合约工厂
    const MyToken = await ethers.getContractFactory("MyToken");
    
    // 获取部署者账户
    const [deployer] = await ethers.getSigners();
    console.log("📋 部署者地址:", deployer.address);
    
    // 部署合约进行测试
    console.log("\n🚀 部署合约进行功能检查...");
    const token = await MyToken.deploy(deployer.address);
    await token.waitForDeployment();
    
    const tokenAddress = await token.getAddress();
    console.log("✅ 合约部署成功:", tokenAddress);
    
    // 检查基本信息
    console.log("\n📊 代币基本信息:");
    console.log("- 名称:", await token.name());
    console.log("- 符号:", await token.symbol());
    console.log("- 精度:", await token.decimals());
    console.log("- 初始供应量:", ethers.formatEther(await token.totalSupply()), "MTK");
    console.log("- 最大供应量:", ethers.formatEther(await token.MAX_SUPPLY()), "MTK");
    console.log("- 单地址最大铸造限额:", ethers.formatEther(await token.MAX_MINT_PER_ADDRESS()), "MTK");
    console.log("- 单次最大铸造数量:", ethers.formatEther(await token.MAX_MINT_PER_TX()), "MTK");
    
    // 检查权限
    console.log("\n🔐 权限检查:");
    console.log("- 合约所有者:", await token.owner());
    console.log("- 铸造是否暂停:", await token.mintPaused());
    
    // 检查余额
    console.log("\n💰 余额信息:");
    const deployerBalance = await token.balanceOf(deployer.address);
    console.log("- 部署者余额:", ethers.formatEther(deployerBalance), "MTK");
    console.log("- 部署者已铸造量:", ethers.formatEther(await token.mintedAmount(deployer.address)), "MTK");
    
    // 检查铸造功能
    console.log("\n🔨 铸造功能检查:");
    const mintAmount = ethers.parseEther("100"); // 100 MTK
    const canMint = await token.canMint(deployer.address, mintAmount);
    console.log("- 是否可以铸造100 MTK:", canMint);
    
    if (canMint) {
        console.log("- 尝试铸造100 MTK...");
        const tx = await token.mint(deployer.address, mintAmount);
        await tx.wait();
        console.log("✅ 铸造成功!");
        
        const newBalance = await token.balanceOf(deployer.address);
        console.log("- 新余额:", ethers.formatEther(newBalance), "MTK");
    }
    
    // 检查历史记录
    console.log("\n📜 铸造历史:");
    const historyLength = await token.getMintHistoryLength();
    console.log("- 历史记录数量:", historyLength.toString());
    
    if (historyLength > 0) {
        const history = await token.getMintHistory(0, historyLength - 1n);
        history.forEach((record, index) => {
            console.log(`- 记录${index + 1}: ${record.recipient} 铸造了 ${ethers.formatEther(record.amount)} MTK`);
        });
    }
    
    // 检查剩余可铸造量
    console.log("\n📈 剩余可铸造信息:");
    console.log("- 剩余总供应量:", ethers.formatEther(await token.remainingMintableSupply()), "MTK");
    console.log("- 部署者剩余可铸造量:", ethers.formatEther(await token.remainingMintableAmount(deployer.address)), "MTK");
    
    console.log("\n✅ 合约功能检查完成!");
}

// 错误处理
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ 检查过程中发生错误:", error);
        process.exit(1);
    }); 