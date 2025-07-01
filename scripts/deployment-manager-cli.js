const fs = require('fs');
const path = require('path');
const deployConfig = require('./config/deploy-config');
const DeploymentManager = require('./utils/deployment-manager');

/**
 * 部署管理CLI工具
 * 用于查看、管理和操作合约部署信息
 */
class DeploymentManagerCLI {
    constructor() {
        this.deploymentManager = new DeploymentManager();
    }

    /**
     * 显示所有部署信息
     */
    showAll() {
        console.log("📋 所有网络部署信息\n");
        this.deploymentManager.showDeploymentSummary();
    }

    /**
     * 显示特定网络的详细信息
     */
    showNetwork(networkName) {
        const deployment = this.deploymentManager.getDeployment(networkName);
        const config = deployConfig.networks[networkName];
        
        if (!deployment) {
            console.log(`❌ 没有找到 ${networkName} 的部署记录`);
            return;
        }
        
        console.log(`📋 ${config?.name || networkName} 详细信息:`);
        console.log("=" .repeat(50));
        
        // 基本信息
        console.log("🌐 网络信息:");
        console.log(`  - 网络名称: ${config?.name || networkName}`);
        console.log(`  - 链ID: ${deployment.chainId}`);
        console.log(`  - 货币: ${config?.currency || 'ETH'}`);
        
        // 合约信息
        console.log("\n📄 合约信息:");
        console.log(`  - 合约地址: ${deployment.contractAddress}`);
        console.log(`  - 部署者: ${deployment.deployer}`);
        console.log(`  - 合约所有者: ${deployment.initialOwner}`);
        
        if (deployment.contractInfo) {
            console.log(`  - 代币名称: ${deployment.contractInfo.name}`);
            console.log(`  - 代币符号: ${deployment.contractInfo.symbol}`);
            console.log(`  - 代币精度: ${deployment.contractInfo.decimals}`);
            console.log(`  - 当前供应量: ${deployment.contractInfo.totalSupply}`);
            console.log(`  - 最大供应量: ${deployment.contractInfo.maxSupply}`);
        }
        
        // 部署信息
        console.log("\n🚀 部署信息:");
        console.log(`  - 部署时间: ${new Date(deployment.timestamp).toLocaleString()}`);
        console.log(`  - 交易哈希: ${deployment.txHash}`);
        console.log(`  - 部署成本: ${deployment.deploymentCost} ETH`);
        console.log(`  - Gas使用量: ${deployment.gasUsed}`);
        console.log(`  - 部署耗时: ${deployment.deployTime ? (deployment.deployTime / 1000).toFixed(2) + '秒' : '未知'}`);
        
        // 验证状态
        console.log("\n🔍 验证状态:");
        console.log(`  - 验证状态: ${deployment.verified ? '✅ 已验证' : '⏳ 未验证'}`);
        if (deployment.verifiedAt) {
            console.log(`  - 验证时间: ${new Date(deployment.verifiedAt).toLocaleString()}`);
        }
        
        // 区块浏览器链接
        if (config?.explorerUrl) {
            console.log("\n🔗 区块浏览器链接:");
            console.log(`  - 合约: ${config.explorerUrl}/address/${deployment.contractAddress}`);
            console.log(`  - 部署交易: ${config.explorerUrl}/tx/${deployment.txHash}`);
        }
        
        console.log("=" .repeat(50));
    }

    /**
     * 导出部署信息到JSON文件
     */
    exportToJson(outputPath = './deployments-export.json') {
        try {
            const allDeployments = this.deploymentManager.getAllDeployments();
            
            if (Object.keys(allDeployments).length === 0) {
                console.log("❌ 没有可导出的部署信息");
                return;
            }
            
            fs.writeFileSync(outputPath, JSON.stringify(allDeployments, null, 2));
            console.log(`✅ 部署信息已导出到: ${path.resolve(outputPath)}`);
            
        } catch (error) {
            console.error("❌ 导出失败:", error.message);
        }
    }

    /**
     * 生成前端配置文件
     */
    generateFrontendConfig(outputPath = './frontend-contracts.json') {
        try {
            const allDeployments = this.deploymentManager.getAllDeployments();
            
            if (Object.keys(allDeployments).length === 0) {
                console.log("❌ 没有可用的部署信息");
                return;
            }
            
            // 转换为前端需要的格式
            const frontendConfig = {};
            
            Object.entries(allDeployments).forEach(([network, deployment]) => {
                const config = deployConfig.networks[network];
                
                frontendConfig[network] = {
                    chainId: deployment.chainId,
                    chainName: config?.name || network,
                    currency: config?.currency || 'ETH',
                    explorerUrl: config?.explorerUrl,
                    contracts: {
                        MyToken: {
                            address: deployment.contracts.MyToken.address,
                            verified: deployment.contracts.MyToken.verified
                        }
                    },
                    rpcUrl: config?.rpcUrl, // 需要在配置中添加
                    lastUpdated: deployment.lastUpdated
                };
            });
            
            fs.writeFileSync(outputPath, JSON.stringify(frontendConfig, null, 2));
            console.log(`✅ 前端配置文件已生成: ${path.resolve(outputPath)}`);
            
            // 显示使用说明
            console.log("\n💡 使用说明:");
            console.log("1. 将此文件复制到前端项目中");
            console.log("2. 在前端代码中导入并使用合约地址");
            console.log("3. 根据当前网络选择对应的合约地址");
            
        } catch (error) {
            console.error("❌ 生成前端配置失败:", error.message);
        }
    }

    /**
     * 检查所有网络的合约状态
     */
    async checkContractStatus() {
        const allDeployments = this.deploymentManager.getAllDeployments();
        
        if (Object.keys(allDeployments).length === 0) {
            console.log("❌ 没有可检查的部署信息");
            return;
        }
        
        console.log("🔍 检查所有网络的合约状态...\n");
        
        for (const [network, deployment] of Object.entries(allDeployments)) {
            const config = deployConfig.networks[network];
            console.log(`🌐 ${config?.name || network}:`);
            
            try {
                // 这里可以扩展为实际的合约状态检查
                // 目前只显示基本信息
                console.log(`  ✅ 合约地址: ${deployment.contracts.MyToken.address}`);
                console.log(`  📊 验证状态: ${deployment.contracts.MyToken.verified ? '已验证' : '未验证'}`);
                
                if (config?.explorerUrl) {
                    console.log(`  🔗 浏览器: ${config.explorerUrl}/address/${deployment.contracts.MyToken.address}`);
                }
                
            } catch (error) {
                console.log(`  ❌ 检查失败: ${error.message}`);
            }
            
            console.log();
        }
    }

    /**
     * 清理部署记录
     */
    cleanupDeployments(networkName = null) {
        try {
            if (networkName) {
                // 清理特定网络
                const deploymentFile = path.join(this.deploymentManager.deploymentsDir, `${networkName}.json`);
                
                if (fs.existsSync(deploymentFile)) {
                    // 先备份
                    this.deploymentManager.backupDeployment(networkName);
                    
                    // 删除文件
                    fs.unlinkSync(deploymentFile);
                    console.log(`✅ 已清理 ${networkName} 的部署记录`);
                    
                    // 更新总配置文件
                    const allDeployments = this.deploymentManager.getAllDeployments();
                    if (allDeployments[networkName]) {
                        delete allDeployments[networkName];
                        fs.writeFileSync(
                            this.deploymentManager.contractsJsonPath,
                            JSON.stringify(allDeployments, null, 2)
                        );
                    }
                } else {
                    console.log(`❌ 没有找到 ${networkName} 的部署记录`);
                }
            } else {
                // 清理所有备份文件
                this.deploymentManager.cleanupBackups();
                console.log("✅ 已清理旧的备份文件");
            }
            
        } catch (error) {
            console.error("❌ 清理失败:", error.message);
        }
    }

    /**
     * 显示网络配置信息
     */
    showNetworks() {
        console.log("🌐 支持的网络配置:\n");
        
        Object.entries(deployConfig.networks).forEach(([key, config]) => {
            console.log(`📍 ${key}:`);
            console.log(`  - 名称: ${config.name}`);
            console.log(`  - 链ID: ${config.chainId}`);
            console.log(`  - 货币: ${config.currency}`);
            console.log(`  - Gas限制: ${config.gasLimit.toLocaleString()}`);
            console.log(`  - 确认数: ${config.confirmations}`);
            console.log(`  - 支持验证: ${config.verification ? '是' : '否'}`);
            console.log(`  - 保存部署: ${config.saveDeployment ? '是' : '否'}`);
            
            if (config.explorerUrl) {
                console.log(`  - 浏览器: ${config.explorerUrl}`);
            }
            
            if (config.faucet) {
                console.log(`  - 水龙头: ${config.faucet}`);
            }
            
            console.log();
        });
    }

    /**
     * 显示帮助信息
     */
    showHelp() {
        console.log("📚 部署管理工具使用说明\n");
        
        console.log("可用命令:");
        console.log("  list              - 显示所有部署信息");
        console.log("  show <network>    - 显示特定网络的详细信息");
        console.log("  export [path]     - 导出部署信息到JSON文件");
        console.log("  frontend [path]   - 生成前端配置文件");
        console.log("  check             - 检查所有合约状态");
        console.log("  cleanup [network] - 清理部署记录");
        console.log("  networks          - 显示网络配置");
        console.log("  help              - 显示此帮助信息");
        
        console.log("\n使用示例:");
        console.log("  node scripts/deployment-manager-cli.js list");
        console.log("  node scripts/deployment-manager-cli.js show localhost");
        console.log("  node scripts/deployment-manager-cli.js export ./my-deployments.json");
        console.log("  node scripts/deployment-manager-cli.js frontend ./frontend/src/contracts.json");
    }
}

/**
 * 主函数
 */
async function main() {
    const cli = new DeploymentManagerCLI();
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        cli.showHelp();
        return;
    }
    
    const command = args[0];
    
    try {
        switch (command) {
            case 'list':
                cli.showAll();
                break;
                
            case 'show':
                if (args[1]) {
                    cli.showNetwork(args[1]);
                } else {
                    console.log("❌ 请指定网络名称");
                    console.log("使用方法: show <network>");
                }
                break;
                
            case 'export':
                cli.exportToJson(args[1]);
                break;
                
            case 'frontend':
                cli.generateFrontendConfig(args[1]);
                break;
                
            case 'check':
                await cli.checkContractStatus();
                break;
                
            case 'cleanup':
                cli.cleanupDeployments(args[1]);
                break;
                
            case 'networks':
                cli.showNetworks();
                break;
                
            case 'help':
            default:
                cli.showHelp();
                break;
        }
        
    } catch (error) {
        console.error("❌ 执行命令时出错:", error.message);
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main();
}

module.exports = { DeploymentManagerCLI }; 