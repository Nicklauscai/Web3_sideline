const { network } = require("hardhat");
const deployConfig = require('./config/deploy-config');
const DeploymentManager = require('./utils/deployment-manager');

/**
 * 合约验证脚本
 * 用于验证已部署的合约源码
 */
class ContractVerifier {
    constructor() {
        this.networkName = network.name;
        this.config = deployConfig.networks[this.networkName];
        this.deploymentManager = new DeploymentManager();
        
        if (!this.config) {
            throw new Error(`不支持的网络: ${this.networkName}`);
        }
        
        if (!this.config.verification) {
            throw new Error(`${this.config.name} 不支持合约验证`);
        }
    }

    /**
     * 验证合约
     * @param {string} contractAddress 合约地址（可选，从部署记录中获取）
     * @param {string} initialOwner 初始所有者地址（可选，从部署记录中获取）
     */
    async verify(contractAddress = null, initialOwner = null) {
        try {
            console.log(`🔍 开始在 ${this.config.name} 上验证合约...\n`);
            
            // 获取合约信息
            const contractInfo = await this.getContractInfo(contractAddress, initialOwner);
            
            // 检查是否已经验证
            if (await this.checkIfAlreadyVerified(contractInfo.address)) {
                console.log("✅ 合约已经验证过了！");
                return;
            }
            
            // 执行验证
            await this.executeVerification(contractInfo);
            
            // 更新部署记录
            await this.updateDeploymentRecord(contractInfo.address);
            
            console.log("\n✅ 合约验证完成！");
            
        } catch (error) {
            console.error("❌ 验证失败:", error.message);
            throw error;
        }
    }

    /**
     * 获取合约信息
     */
    async getContractInfo(contractAddress, initialOwner) {
        let address, owner;
        
        if (contractAddress) {
            // 使用提供的地址
            address = contractAddress;
            
            if (!initialOwner) {
                // 尝试从部署记录获取所有者
                const deployment = this.deploymentManager.getDeployment(this.networkName);
                if (deployment && deployment.initialOwner) {
                    owner = deployment.initialOwner;
                } else {
                    throw new Error("请提供合约初始所有者地址");
                }
            } else {
                owner = initialOwner;
            }
        } else {
            // 从部署记录获取
            const deployment = this.deploymentManager.getDeployment(this.networkName);
            
            if (!deployment) {
                throw new Error(`没有找到 ${this.networkName} 的部署记录`);
            }
            
            address = deployment.contractAddress;
            owner = deployment.initialOwner;
        }
        
        console.log("📋 合约信息:");
        console.log(`- 网络: ${this.config.name}`);
        console.log(`- 合约地址: ${address}`);
        console.log(`- 初始所有者: ${owner}`);
        
        return { address, owner };
    }

    /**
     * 检查合约是否已验证
     */
    async checkIfAlreadyVerified(contractAddress) {
        // 这里可以扩展为调用区块浏览器API检查验证状态
        // 目前从部署记录检查
        const deployment = this.deploymentManager.getDeployment(this.networkName);
        return deployment && deployment.verified;
    }

    /**
     * 执行验证
     */
    async executeVerification(contractInfo, retryCount = 0) {
        try {
            console.log("\n⏳ 正在验证合约源码...");
            
            const { run } = require("hardhat");
            
            await run("verify:verify", {
                address: contractInfo.address,
                constructorArguments: [contractInfo.owner],
                network: this.networkName
            });
            
            console.log("✅ 合约源码验证成功！");
            
            if (this.config.explorerUrl) {
                console.log(`🔗 查看验证结果: ${this.config.explorerUrl}/address/${contractInfo.address}#code`);
            }
            
        } catch (error) {
            if (error.message.includes("Already Verified")) {
                console.log("✅ 合约已经验证过了！");
                return;
            }
            
            if (retryCount < deployConfig.verification.retries) {
                console.log(`⏳ 验证失败，5秒后重试... (${retryCount + 1}/${deployConfig.verification.retries})`);
                console.log(`错误信息: ${error.message}`);
                
                await this.sleep(5000);
                return await this.executeVerification(contractInfo, retryCount + 1);
            } else {
                throw new Error(`验证失败: ${error.message}`);
            }
        }
    }

    /**
     * 更新部署记录的验证状态
     */
    async updateDeploymentRecord(contractAddress) {
        try {
            const deployment = this.deploymentManager.getDeployment(this.networkName);
            
            if (deployment && deployment.contractAddress === contractAddress) {
                deployment.verified = true;
                deployment.verifiedAt = new Date().toISOString();
                
                await this.deploymentManager.saveDeployment(this.networkName, deployment);
                console.log("📄 已更新部署记录的验证状态");
            }
        } catch (error) {
            console.warn("⚠️ 更新部署记录失败:", error.message);
        }
    }

    /**
     * 工具方法：延时
     */
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * 批量验证所有网络的合约
 */
async function verifyAllNetworks() {
    const deploymentManager = new DeploymentManager();
    const allDeployments = deploymentManager.getAllDeployments();
    
    console.log("🔍 批量验证所有网络的合约...\n");
    
    for (const [networkName, deployment] of Object.entries(allDeployments)) {
        const config = deployConfig.networks[networkName];
        
        if (!config || !config.verification) {
            console.log(`⏭️ 跳过 ${networkName}：不支持验证`);
            continue;
        }
        
        if (deployment.contracts.MyToken.verified) {
            console.log(`✅ ${config.name} 的合约已验证`);
            continue;
        }
        
        try {
            console.log(`\n🔍 验证 ${config.name} 的合约...`);
            
            // 创建验证器实例（需要设置正确的网络）
            process.env.HARDHAT_NETWORK = networkName;
            
            const verifier = new ContractVerifier();
            await verifier.verify(
                deployment.contracts.MyToken.address,
                deployment.contracts.MyToken.deployer
            );
            
        } catch (error) {
            console.error(`❌ ${config.name} 验证失败:`, error.message);
        }
    }
    
    console.log("\n✅ 批量验证完成！");
}

/**
 * 主函数
 */
async function main() {
    try {
        // 解析命令行参数
        const args = process.argv.slice(2);
        
        if (args.includes('--all')) {
            // 批量验证所有网络
            await verifyAllNetworks();
        } else {
            // 验证当前网络
            const contractAddress = args.find(arg => arg.startsWith('0x'));
            const ownerIndex = args.indexOf('--owner');
            const initialOwner = ownerIndex !== -1 ? args[ownerIndex + 1] : null;
            
            const verifier = new ContractVerifier();
            await verifier.verify(contractAddress, initialOwner);
        }
        
        process.exit(0);
        
    } catch (error) {
        console.error("❌ 验证过程出错:", error.message);
        
        console.log("\n💡 使用方法:");
        console.log("验证当前网络合约: npx hardhat run scripts/verify-contract.js --network <network>");
        console.log("验证指定合约: npx hardhat run scripts/verify-contract.js --network <network> <contract_address> --owner <owner_address>");
        console.log("批量验证所有: npx hardhat run scripts/verify-contract.js --all");
        
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main();
}

module.exports = { ContractVerifier }; 