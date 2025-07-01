const { ethers, network } = require("hardhat");
const readline = require('readline');
const deployConfig = require('./config/deploy-config');
const DeploymentManager = require('./utils/deployment-manager');

/**
 * 增强版合约部署脚本
 * 支持多网络部署、配置管理、自动验证和完整的错误处理
 */
class EnhancedDeployer {
    constructor() {
        this.networkName = network.name;
        this.config = deployConfig.networks[this.networkName];
        this.deploymentManager = new DeploymentManager();
        
        if (!this.config) {
            throw new Error(`不支持的网络: ${this.networkName}`);
        }
    }

    /**
     * 执行部署流程
     */
    async deploy() {
        try {
            console.log(`🚀 开始在${this.config.name}上部署MyToken合约...\n`);
            
            // 预检查
            await this.preDeploymentChecks();
            
            // 获取部署参数
            const deployParams = await this.getDeploymentParams();
            
            // 主网部署需要确认
            if (this.config.requireConfirmation) {
                await this.confirmMainnetDeployment();
            }
            
            // 执行部署
            const deploymentResult = await this.executeDeployment(deployParams);
            
            // 等待确认
            await this.waitForConfirmations(deploymentResult.transaction);
            
            // 验证合约
            if (this.config.verification) {
                await this.verifyContract(deploymentResult);
            }
            
            // 保存部署信息
            if (this.config.saveDeployment) {
                await this.saveDeploymentInfo(deploymentResult);
            }
            
            // 显示部署结果
            this.displayDeploymentResult(deploymentResult);
            
            return deploymentResult;
            
        } catch (error) {
            console.error('❌ 部署失败:', error.message);
            throw error;
        }
    }

    /**
     * 部署前检查
     */
    async preDeploymentChecks() {
        console.log("🔍 执行部署前检查...");
        
        // 检查网络连接
        try {
            const blockNumber = await ethers.provider.getBlockNumber();
            console.log(`✅ 网络连接正常 (区块高度: ${blockNumber})`);
        } catch (error) {
            throw new Error(`网络连接失败: ${error.message}`);
        }
        
        // 获取部署者账户
        const [deployer] = await ethers.getSigners();
        console.log(`📋 部署者地址: ${deployer.address}`);
        
        // 检查余额
        const balance = await ethers.provider.getBalance(deployer.address);
        const balanceEth = parseFloat(ethers.formatEther(balance));
        const minBalance = deployConfig.deployment.minBalance[this.networkName] || 0;
        
        console.log(`💰 账户余额: ${balanceEth.toFixed(6)} ${this.config.currency}`);
        
        if (balanceEth < minBalance) {
            throw new Error(`余额不足！需要至少 ${minBalance} ${this.config.currency}，当前只有 ${balanceEth.toFixed(6)}`);
        }
        
        // 检查Gas价格
        if (this.config.gasPrice === null) {
            const gasPrice = await ethers.provider.getFeeData();
            const gasPriceGwei = parseFloat(ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei'));
            const maxGasPrice = deployConfig.deployment.maxGasPrice[this.networkName];
            
            console.log(`⛽ 当前Gas价格: ${gasPriceGwei.toFixed(2)} Gwei`);
            
            if (maxGasPrice && gasPriceGwei > maxGasPrice) {
                throw new Error(`Gas价格过高！当前 ${gasPriceGwei.toFixed(2)} Gwei，最大允许 ${maxGasPrice} Gwei`);
            }
        }
        
        // 检查是否已经部署
        if (this.deploymentManager.isDeployed(this.networkName)) {
            const existingAddress = this.deploymentManager.getContractAddress(this.networkName);
            console.log(`⚠️ 检测到已存在的部署: ${existingAddress}`);
            
            const answer = await this.askQuestion('是否要重新部署？这将覆盖现有记录 (y/N): ');
            if (answer.toLowerCase() !== 'y') {
                throw new Error('用户取消部署');
            }
        }
        
        console.log("✅ 预检查完成\n");
    }

    /**
     * 获取部署参数
     */
    async getDeploymentParams() {
        console.log("📋 准备部署参数...");
        
        const [deployer] = await ethers.getSigners();
        
        // 获取初始所有者地址
        const initialOwner = deployConfig.contractParams.getInitialOwner(
            this.networkName, 
            deployer.address
        );
        
        console.log(`👤 合约初始所有者: ${initialOwner}`);
        
        if (initialOwner !== deployer.address) {
            console.log(`⚠️ 注意：合约所有者与部署者不同！`);
            
            // 验证所有者地址是否有效
            if (!ethers.isAddress(initialOwner)) {
                throw new Error(`无效的所有者地址: ${initialOwner}`);
            }
        }
        
        return {
            initialOwner,
            deployer: deployer.address
        };
    }

    /**
     * 主网部署确认
     */
    async confirmMainnetDeployment() {
        console.log("\n🚨 警告：您即将在以太坊主网上部署合约！");
        console.log("这将消耗真实的ETH，请确保：");
        console.log("1. 您已经充分测试了合约");
        console.log("2. 您有足够的ETH支付Gas费用");
        console.log("3. 您确认要在主网上部署");
        
        const confirmation1 = await this.askQuestion('\n输入 "DEPLOY" 确认部署: ');
        if (confirmation1 !== 'DEPLOY') {
            throw new Error('用户取消主网部署');
        }
        
        const confirmation2 = await this.askQuestion('再次确认，输入 "YES" 继续: ');
        if (confirmation2 !== 'YES') {
            throw new Error('用户取消主网部署');
        }
        
        console.log("✅ 已确认主网部署\n");
    }

    /**
     * 执行部署
     */
    async executeDeployment(params) {
        console.log("⏳ 正在部署合约...");
        
        const MyToken = await ethers.getContractFactory("MyToken");
        
        // 设置部署选项
        const deployOptions = {
            gasLimit: this.config.gasLimit
        };
        
        if (this.config.gasPrice) {
            deployOptions.gasPrice = ethers.parseUnits(this.config.gasPrice.toString(), 'gwei');
        }
        
        // 执行部署
        const startTime = Date.now();
        const token = await MyToken.deploy(params.initialOwner, deployOptions);
        
        console.log(`📤 部署交易已发送: ${token.deploymentTransaction().hash}`);
        console.log("⏳ 等待交易确认...");
        
        // 等待部署交易被挖矿
        const receipt = await token.deploymentTransaction().wait(1);
        const deployTime = Date.now() - startTime;
        
        const contractAddress = await token.getAddress();
        
        console.log(`✅ 合约部署成功！`);
        console.log(`📍 合约地址: ${contractAddress}`);
        console.log(`⛽ Gas使用量: ${receipt.gasUsed.toString()}`);
        console.log(`⏱️ 部署耗时: ${(deployTime / 1000).toFixed(2)}秒`);
        
        // 获取部署时的链信息
        const chainId = await ethers.provider.getNetwork().then(n => n.chainId);
        
        return {
            contract: token,
            contractAddress,
            transaction: token.deploymentTransaction(),
            receipt,
            params,
            deployTime,
            chainId: Number(chainId)
        };
    }

    /**
     * 等待交易确认
     */
    async waitForConfirmations(transaction) {
        const requiredConfirmations = this.config.confirmations;
        
        if (requiredConfirmations <= 1) {
            return; // 已经等待了1个确认
        }
        
        console.log(`⏳ 等待 ${requiredConfirmations} 个区块确认...`);
        
        try {
            await transaction.wait(requiredConfirmations);
            console.log(`✅ 已获得 ${requiredConfirmations} 个确认`);
        } catch (error) {
            console.warn(`⚠️ 等待确认时出错: ${error.message}`);
        }
    }

    /**
     * 验证合约
     */
    async verifyContract(deploymentResult) {
        try {
            console.log("\n🔍 开始验证合约源码...");
            
            // 等待一段时间，让区块浏览器同步
            console.log(`⏳ 等待 ${deployConfig.verification.delay / 1000} 秒后开始验证...`);
            await this.sleep(deployConfig.verification.delay);
            
            // 执行验证
            await this.runVerification(deploymentResult);
            
        } catch (error) {
            console.warn(`⚠️ 合约验证失败: ${error.message}`);
            console.log("💡 您可以稍后手动验证合约");
            console.log(`🔍 验证命令: npx hardhat verify --network ${this.networkName} ${deploymentResult.contractAddress} "${deploymentResult.params.initialOwner}"`);
        }
    }

    /**
     * 执行验证（带重试）
     */
    async runVerification(deploymentResult, retryCount = 0) {
        try {
            const { run } = require("hardhat");
            
            await run("verify:verify", {
                address: deploymentResult.contractAddress,
                constructorArguments: [deploymentResult.params.initialOwner],
                network: this.networkName
            });
            
            console.log("✅ 合约源码验证成功！");
            deploymentResult.verified = true;
            
        } catch (error) {
            if (retryCount < deployConfig.verification.retries) {
                console.log(`⏳ 验证失败，${5}秒后重试... (${retryCount + 1}/${deployConfig.verification.retries})`);
                await this.sleep(5000);
                return await this.runVerification(deploymentResult, retryCount + 1);
            } else {
                throw error;
            }
        }
    }

    /**
     * 保存部署信息
     */
    async saveDeploymentInfo(deploymentResult) {
        console.log("\n📄 保存部署信息...");
        
        const deploymentInfo = {
            network: this.networkName,
            chainId: deploymentResult.chainId,
            contractAddress: deploymentResult.contractAddress,
            deployer: deploymentResult.params.deployer,
            initialOwner: deploymentResult.params.initialOwner,
            deploymentCost: ethers.formatEther(
                deploymentResult.receipt.gasUsed * deploymentResult.receipt.gasPrice
            ),
            gasUsed: deploymentResult.receipt.gasUsed.toString(),
            gasPrice: deploymentResult.receipt.gasPrice.toString(),
            txHash: deploymentResult.transaction.hash,
            timestamp: new Date().toISOString(),
            deployTime: deploymentResult.deployTime,
            verified: deploymentResult.verified || false,
            contractInfo: {
                name: await deploymentResult.contract.name(),
                symbol: await deploymentResult.contract.symbol(),
                decimals: Number(await deploymentResult.contract.decimals()),
                totalSupply: ethers.formatEther(await deploymentResult.contract.totalSupply()),
                maxSupply: ethers.formatEther(await deploymentResult.contract.MAX_SUPPLY())
            }
        };
        
        await this.deploymentManager.saveDeployment(this.networkName, deploymentInfo);
        
        // 清理旧备份
        this.deploymentManager.cleanupBackups();
    }

    /**
     * 显示部署结果
     */
    displayDeploymentResult(deploymentResult) {
        console.log("\n🎉 部署完成！");
        console.log("=" .repeat(60));
        console.log(`🌐 网络: ${this.config.name}`);
        console.log(`📍 合约地址: ${deploymentResult.contractAddress}`);
        console.log(`👤 合约所有者: ${deploymentResult.params.initialOwner}`);
        console.log(`⛽ Gas使用: ${deploymentResult.receipt.gasUsed.toString()}`);
        console.log(`💰 部署成本: ${ethers.formatEther(deploymentResult.receipt.gasUsed * deploymentResult.receipt.gasPrice)} ETH`);
        console.log(`🔍 验证状态: ${deploymentResult.verified ? '✅ 已验证' : '⏳ 未验证'}`);
        
        if (this.config.explorerUrl) {
            console.log(`🔗 区块浏览器: ${this.config.explorerUrl}/address/${deploymentResult.contractAddress}`);
        }
        
        console.log("=" .repeat(60));
        
        // 显示后续步骤
        console.log("\n📋 后续步骤:");
        console.log("1. 将合约地址添加到前端配置");
        console.log("2. 测试合约的基本功能");
        console.log("3. 如需要，进行额外的权限配置");
        
        if (!deploymentResult.verified && this.config.verification) {
            console.log("4. 手动验证合约源码");
        }
        
        // 显示所有部署概览
        this.deploymentManager.showDeploymentSummary();
    }

    /**
     * 工具方法：询问用户输入
     */
    async askQuestion(question) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        return new Promise((resolve) => {
            rl.question(question, (answer) => {
                rl.close();
                resolve(answer.trim());
            });
        });
    }

    /**
     * 工具方法：延时
     */
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * 主函数
 */
async function main() {
    try {
        const deployer = new EnhancedDeployer();
        await deployer.deploy();
        
        console.log("\n✅ 部署流程完成！");
        process.exit(0);
        
    } catch (error) {
        console.error("❌ 部署失败:", error.message);
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main();
}

module.exports = { EnhancedDeployer }; 