import { defaultWagmiConfig } from '@web3modal/wagmi';
import { createWeb3Modal } from '@web3modal/wagmi';
import { http } from 'viem';
import { mainnet, sepolia, goerli, localhost } from 'viem/chains';

// 环境变量
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'default-project-id';
const appName = import.meta.env.VITE_APP_NAME || 'MyToken DApp';
const appDescription = 'ERC20代币发行与Mint DApp';
const appUrl = import.meta.env.VITE_APP_URL || 'http://localhost:5173';

// 定义支持的链
export const chains = [
  {
    ...localhost,
    rpcUrls: {
      default: { http: [import.meta.env.VITE_LOCALHOST_RPC_URL || 'http://127.0.0.1:8545'] }
    }
  },
  {
    ...sepolia,
    rpcUrls: {
      default: { http: [import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/'] }
    }
  },
  {
    ...goerli,
    rpcUrls: {
      default: { http: [import.meta.env.VITE_GOERLI_RPC_URL || 'https://goerli.infura.io/v3/'] }
    }
  },
  {
    ...mainnet,
    rpcUrls: {
      default: { http: [import.meta.env.VITE_MAINNET_RPC_URL || 'https://mainnet.infura.io/v3/'] }
    }
  }
] as const;

// Wagmi配置
export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata: {
    name: appName,
    description: appDescription,
    url: appUrl,
    icons: [`${appUrl}/favicon.ico`]
  },
  transports: {
    [localhost.id]: http(),
    [sepolia.id]: http(),
    [goerli.id]: http(),
    [mainnet.id]: http(),
  }
});

// 创建Web3Modal实例
export const web3Modal = createWeb3Modal({
  wagmiConfig,
  projectId,
  enableAnalytics: false,
  enableOnramp: false,
  themeMode: 'light',
  themeVariables: {
    '--w3m-font-family': 'Arial, sans-serif',
    '--w3m-accent': '#1890ff',
  }
});

// 网络配置映射
export const networkConfigs = {
  [localhost.id]: {
    name: '本地网络',
    symbol: 'ETH',
    decimals: 18,
    rpcUrl: 'http://127.0.0.1:8545',
    blockExplorer: 'http://localhost:8545',
  },
  [sepolia.id]: {
    name: 'Sepolia测试网',
    symbol: 'SepoliaETH',
    decimals: 18,
    rpcUrl: 'https://sepolia.infura.io/v3/',
    blockExplorer: 'https://sepolia.etherscan.io',
  },
  [goerli.id]: {
    name: 'Goerli测试网',
    symbol: 'GoerliETH',
    decimals: 18,
    rpcUrl: 'https://goerli.infura.io/v3/',
    blockExplorer: 'https://goerli.etherscan.io',
  },
  [mainnet.id]: {
    name: '以太坊主网',
    symbol: 'ETH',
    decimals: 18,
    rpcUrl: 'https://mainnet.infura.io/v3/',
    blockExplorer: 'https://etherscan.io',
  },
};

// 获取网络配置
export function getNetworkConfig(chainId: number) {
  return networkConfigs[chainId as keyof typeof networkConfigs];
}

// 是否为支持的网络
export function isSupportedNetwork(chainId: number): boolean {
  return chainId in networkConfigs;
}

// 默认网络
export const DEFAULT_CHAIN_ID = import.meta.env.VITE_DEFAULT_NETWORK === 'mainnet' ? mainnet.id : localhost.id; 