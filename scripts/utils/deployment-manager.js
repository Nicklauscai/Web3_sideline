const fs = require('fs');
const path = require('path');
const deployConfig = require('../config/deploy-config');

/**
 * 部署管理器
 * 负责保存、读取和管理合约部署信息
 */
class DeploymentManager {
    constructor() {
        this.deploymentsDir = deployConfig.storage.deploymentsDir;
        this.backupDir = deployConfig.storage.backupDir;
        this.contractsJsonPath = deployConfig.storage.contractsJsonPath;
        
        this.ensureDirectories();
    }

    /**
     * 确保必要的目录存在
     */
    ensureDirectories() {
        if (!fs.existsSync(this.deploymentsDir)) {
            fs.mkdirSync(this.deploymentsDir, { recursive: true });
        }
        
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    }

    /**
     * 保存部署信息
     * @param {string} network 网络名称
     * @param {object} deploymentInfo 部署信息
     */
    async saveDeployment(network, deploymentInfo) {
        try {
            // 保存网络特定的部署文件
            const networkFile = path.join(this.deploymentsDir, `${network}.json`);
            
            // 如果文件已存在，先备份
            if (fs.existsSync(networkFile)) {
                await this.backupDeployment(network);
            }

            // 写入新的部署信息
            fs.writeFileSync(networkFile, JSON.stringify(deploymentInfo, null, 2));
            
            // 更新总的合约信息文件
            await this.updateContractsJson(network, deploymentInfo);
            
            console.log(`✅ 部署信息已保存到: ${networkFile}`);
            return true;
        } catch (error) {
            console.error('❌ 保存部署信息失败:', error);
            return false;
        }
    }

    /**
     * 读取部署信息
     * @param {string} network 网络名称
     */
    getDeployment(network) {
        try {
            const networkFile = path.join(this.deploymentsDir, `${network}.json`);
            
            if (!fs.existsSync(networkFile)) {
                return null;
            }
            
            const data = fs.readFileSync(networkFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error(`❌ 读取${network}部署信息失败:`, error);
            return null;
        }
    }

    /**
     * 获取所有网络的部署信息
     */
    getAllDeployments() {
        try {
            if (!fs.existsSync(this.contractsJsonPath)) {
                return {};
            }
            
            const data = fs.readFileSync(this.contractsJsonPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('❌ 读取所有部署信息失败:', error);
            return {};
        }
    }

    /**
     * 备份现有部署信息
     * @param {string} network 网络名称
     */
    async backupDeployment(network) {
        try {
            const networkFile = path.join(this.deploymentsDir, `${network}.json`);
            
            if (fs.existsSync(networkFile)) {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const backupFile = path.join(this.backupDir, `${network}-${timestamp}.json`);
                
                fs.copyFileSync(networkFile, backupFile);
                console.log(`📄 已备份现有部署信息到: ${backupFile}`);
            }
        } catch (error) {
            console.warn('⚠️ 备份部署信息失败:', error);
        }
    }

    /**
     * 更新合约总览文件
     * @param {string} network 网络名称
     * @param {object} deploymentInfo 部署信息
     */
    async updateContractsJson(network, deploymentInfo) {
        try {
            let contracts = {};
            
            // 读取现有的合约信息
            if (fs.existsSync(this.contractsJsonPath)) {
                const data = fs.readFileSync(this.contractsJsonPath, 'utf8');
                contracts = JSON.parse(data);
            }

            // 更新或添加当前网络的信息
            contracts[network] = {
                chainId: deploymentInfo.chainId,
                contracts: {
                    MyToken: {
                        address: deploymentInfo.contractAddress,
                        deployer: deploymentInfo.deployer,
                        deploymentTime: deploymentInfo.timestamp,
                        txHash: deploymentInfo.txHash,
                        gasUsed: deploymentInfo.gasUsed,
                        verified: deploymentInfo.verified || false
                    }
                },
                lastUpdated: new Date().toISOString()
            };

            // 写入文件
            fs.writeFileSync(this.contractsJsonPath, JSON.stringify(contracts, null, 2));
            
        } catch (error) {
            console.warn('⚠️ 更新合约总览文件失败:', error);
        }
    }

    /**
     * 检查合约是否已部署
     * @param {string} network 网络名称
     */
    isDeployed(network) {
        const deployment = this.getDeployment(network);
        return deployment && deployment.contractAddress;
    }

    /**
     * 获取合约地址
     * @param {string} network 网络名称
     */
    getContractAddress(network) {
        const deployment = this.getDeployment(network);
        return deployment ? deployment.contractAddress : null;
    }

    /**
     * 显示部署概览
     */
    showDeploymentSummary() {
        console.log("\n📋 部署概览:");
        console.log("=" .repeat(50));
        
        const allDeployments = this.getAllDeployments();
        
        if (Object.keys(allDeployments).length === 0) {
            console.log("暂无部署记录");
            return;
        }

        Object.entries(allDeployments).forEach(([network, info]) => {
            const config = deployConfig.networks[network];
            console.log(`\n🌐 ${config?.name || network}:`);
            console.log(`   地址: ${info.contracts.MyToken.address}`);
            console.log(`   部署者: ${info.contracts.MyToken.deployer}`);
            console.log(`   部署时间: ${new Date(info.contracts.MyToken.deploymentTime).toLocaleString()}`);
            console.log(`   验证状态: ${info.contracts.MyToken.verified ? '✅ 已验证' : '⏳ 未验证'}`);
            
            if (config?.explorerUrl) {
                console.log(`   浏览器: ${config.explorerUrl}/address/${info.contracts.MyToken.address}`);
            }
        });
        
        console.log("=" .repeat(50));
    }

    /**
     * 清理旧的备份文件 (保留最近10个)
     */
    cleanupBackups() {
        try {
            const files = fs.readdirSync(this.backupDir)
                .filter(file => file.endsWith('.json'))
                .map(file => ({
                    name: file,
                    time: fs.statSync(path.join(this.backupDir, file)).mtime
                }))
                .sort((a, b) => b.time - a.time);

            // 保留最近10个，删除其余
            if (files.length > 10) {
                const toDelete = files.slice(10);
                toDelete.forEach(file => {
                    fs.unlinkSync(path.join(this.backupDir, file.name));
                });
                console.log(`🧹 已清理${toDelete.length}个旧备份文件`);
            }
        } catch (error) {
            console.warn('⚠️ 清理备份文件失败:', error);
        }
    }
}

module.exports = DeploymentManager; 