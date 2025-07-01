const { ethers } = require("hardhat");

/**
 * 部署MyToken合约
 */
async function main() {
    console.log("🚀 开始部署MyToken合约...\n");
    
    // 获取部署者账户
    const [deployer] = await ethers.getSigners();
    const deployerBalance = await ethers.provider.getBalance(deployer.address);
    
    console.log("📋 部署信息:");
    console.log("- 部署者地址:", deployer.address);
    console.log("- 部署者余额:", ethers.formatEther(deployerBalance), "ETH");
    console.log("- 网络:", network.name);
    
    // 获取合约工厂
    const MyToken = await ethers.getContractFactory("MyToken");
    
    // 部署合约
    console.log("\n⏳ 正在部署合约...");
    const token = await MyToken.deploy(deployer.address);
    
    // 等待部署完成
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    
    console.log("\n✅ 部署成功!");
    console.log("📋 合约信息:");
    console.log("- 合约地址:", tokenAddress);
    console.log("- 合约所有者:", await token.owner());
    console.log("- 代币名称:", await token.name());
    console.log("- 代币符号:", await token.symbol());
    console.log("- 代币精度:", await token.decimals());
    console.log("- 初始供应量:", ethers.formatEther(await token.totalSupply()), "MTK");
    console.log("- 最大供应量:", ethers.formatEther(await token.MAX_SUPPLY()), "MTK");
    
    // 计算部署成本
    const deployerBalanceAfter = await ethers.provider.getBalance(deployer.address);
    const deploymentCost = deployerBalance - deployerBalanceAfter;
    console.log("- 部署成本:", ethers.formatEther(deploymentCost), "ETH");
    
    // 保存部署信息到文件
    const deploymentInfo = {
        network: network.name,
        contractAddress: tokenAddress,
        deployer: deployer.address,
        deploymentCost: ethers.formatEther(deploymentCost),
        timestamp: new Date().toISOString(),
        txHash: token.deploymentTransaction()?.hash
    };
    
    // 如果是测试网或主网，显示验证命令
    if (network.name !== "hardhat" && network.name !== "localhost") {
        console.log("\n🔍 合约验证命令:");
        console.log(`npx hardhat verify --network ${network.name} ${tokenAddress} "${deployer.address}"`);
    }
    
    console.log("\n📄 部署信息已保存");
    console.log("合约部署完成! 🎉");
    
    return { token, deploymentInfo };
}

// 错误处理
main()
    .then(({ token, deploymentInfo }) => {
        console.log("\n✅ 部署流程完成!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ 部署过程中发生错误:", error);
        process.exit(1);
    }); 