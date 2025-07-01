require('dotenv').config();

/**
 * 部署配置文件
 * 管理不同网络的部署参数和设置
 */

const deployConfig = {
    // 合约构造函数参数配置
    contractParams: {
        // 可以根据网络自定义初始所有者
        getInitialOwner: (network, deployer) => {
            switch (network) {
                case 'localhost':
                case 'hardhat':
                    return deployer; // 本地网络使用部署者
                case 'sepolia':
                case 'goerli':
                    return process.env.TESTNET_OWNER || deployer; // 测试网可配置
                case 'mainnet':
                    return process.env.MAINNET_OWNER || deployer; // 主网强烈建议配置
                default:
                    return deployer;
            }
        }
    },

    // 网络特定配置
    networks: {
        localhost: {
            name: '本地网络',
            chainId: 31337,
            currency: 'ETH',
            explorerUrl: 'http://localhost:8545',
            gasLimit: 30000000,
            gasPrice: null, // 自动计算
            confirmations: 1,
            verification: false, // 本地网络无需验证
            saveDeployment: true
        },
        hardhat: {
            name: 'Hardhat网络',
            chainId: 31337,
            currency: 'ETH',
            explorerUrl: null,
            gasLimit: 30000000,
            gasPrice: null,
            confirmations: 1,
            verification: false,
            saveDeployment: false // 内存网络不保存
        },
        sepolia: {
            name: 'Sepolia测试网',
            chainId: 11155111,
            currency: 'SepoliaETH',
            explorerUrl: 'https://sepolia.etherscan.io',
            gasLimit: 8000000,
            gasPrice: null, // 自动计算
            confirmations: 6, // 测试网等待更多确认
            verification: true,
            saveDeployment: true,
            faucet: 'https://sepoliafaucet.com'
        },
        goerli: {
            name: 'Goerli测试网',
            chainId: 5,
            currency: 'GoerliETH',
            explorerUrl: 'https://goerli.etherscan.io',
            gasLimit: 8000000,
            gasPrice: null,
            confirmations: 6,
            verification: true,
            saveDeployment: true,
            faucet: 'https://goerlifaucet.com'
        },
        mainnet: {
            name: '以太坊主网',
            chainId: 1,
            currency: 'ETH',
            explorerUrl: 'https://etherscan.io',
            gasLimit: 8000000,
            gasPrice: null,
            confirmations: 12, // 主网等待更多确认
            verification: true,
            saveDeployment: true,
            requireConfirmation: true // 主网部署需要确认
        }
    },

    // 部署选项
    deployment: {
        // 最小余额要求 (ETH)
        minBalance: {
            localhost: 0,
            hardhat: 0,
            sepolia: 0.01,
            goerli: 0.01,
            mainnet: 0.1
        },
        
        // Gas价格限制 (Gwei)
        maxGasPrice: {
            localhost: null,
            hardhat: null,
            sepolia: 50,
            goerli: 50,
            mainnet: 100
        },

        // 超时设置 (秒)
        timeout: {
            deployment: 300, // 5分钟
            confirmation: 600, // 10分钟
            verification: 300 // 5分钟
        }
    },

    // 验证配置
    verification: {
        delay: 30000, // 等待30秒后开始验证
        retries: 3,
        apiKey: {
            etherscan: process.env.ETHERSCAN_API_KEY
        }
    },

    // 存储配置
    storage: {
        deploymentsDir: './deployments',
        backupDir: './deployments/backups',
        contractsJsonPath: './deployments/contracts.json'
    }
};

module.exports = deployConfig; 