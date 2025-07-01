// 合约配置文件
// 管理不同网络的合约地址和配置

export interface ContractConfig {
  address: string;
  verified: boolean;
}

export interface NetworkConfig {
  chainId: number;
  chainName: string;
  currency: string;
  explorerUrl?: string;
  rpcUrl?: string;
  contracts: {
    MyToken: ContractConfig;
  };
  lastUpdated?: string;
}

export interface ContractsConfig {
  [networkName: string]: NetworkConfig;
}

// 默认合约配置（开发时使用）
export const defaultContracts: ContractsConfig = {
  localhost: {
    chainId: 31337,
    chainName: "本地网络",
    currency: "ETH",
    explorerUrl: "http://localhost:8545",
    rpcUrl: "http://127.0.0.1:8545",
    contracts: {
      MyToken: {
        address: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // 默认地址
        verified: false,
      },
    },
  },
  sepolia: {
    chainId: 11155111,
    chainName: "Sepolia测试网",
    currency: "SepoliaETH",
    explorerUrl: "https://sepolia.etherscan.io",
    contracts: {
      MyToken: {
        address: "", // 部署后填写
        verified: false,
      },
    },
  },
  goerli: {
    chainId: 5,
    chainName: "Goerli测试网",
    currency: "GoerliETH",
    explorerUrl: "https://goerli.etherscan.io",
    contracts: {
      MyToken: {
        address: "", // 部署后填写
        verified: false,
      },
    },
  },
  mainnet: {
    chainId: 1,
    chainName: "以太坊主网",
    currency: "ETH",
    explorerUrl: "https://etherscan.io",
    contracts: {
      MyToken: {
        address: "", // 部署后填写
        verified: false,
      },
    },
  },
};

// 获取当前网络配置
export function getNetworkConfig(networkName: string): NetworkConfig | null {
  return defaultContracts[networkName] || null;
}

// 获取当前网络的合约地址
export function getContractAddress(
  networkName: string,
  contractName: keyof NetworkConfig["contracts"] = "MyToken"
): string | null {
  const network = getNetworkConfig(networkName);
  return network?.contracts[contractName]?.address || null;
}

// 根据链ID获取网络名称
export function getNetworkNameByChainId(chainId: number): string | null {
  for (const [networkName, config] of Object.entries(defaultContracts)) {
    if (config.chainId === chainId) {
      return networkName;
    }
  }
  return null;
}

// 支持的网络列表
export const supportedNetworks = Object.keys(defaultContracts);

// 测试网络列表
export const testNetworks = ["localhost", "sepolia", "goerli"];

// 是否为测试网络
export function isTestNetwork(networkName: string): boolean {
  return testNetworks.includes(networkName);
} 