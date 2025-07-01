# MyToken DApp Frontend

基于React + TypeScript + Vite构建的Web3 DApp前端应用。

## 🚀 技术栈

- **React 19** - 前端框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Ant Design** - UI组件库
- **Wagmi** - React Web3钩子
- **Viem** - 以太坊客户端
- **Web3Modal** - 钱包连接
- **React Router DOM** - 路由管理

## 📦 项目结构

```
src/
├── components/          # 通用组件
│   └── Layout.tsx      # 页面布局组件
├── pages/              # 页面组件
│   ├── Home.tsx        # 首页
│   ├── Mint.tsx        # Mint页面
│   ├── TokenInfo.tsx   # 代币信息页面
│   └── About.tsx       # 关于页面
├── config/             # 配置文件
│   ├── contracts.ts    # 合约配置
│   ├── web3.ts         # Web3配置
│   ├── abi.ts          # 合约ABI
│   └── routes.tsx      # 路由配置
├── assets/             # 静态资源
├── App.tsx             # 主应用组件
└── main.tsx            # 应用入口
```

## 🛠️ 开发指南

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

### 其他命令

```bash
# 类型检查
npm run type-check

# 代码检查
npm run lint

# 自动修复代码问题
npm run lint:fix

# 预览构建结果
npm run preview

# 清理缓存
npm run clean
```

## 🔧 配置说明

### 环境变量

创建 `.env.local` 文件并配置以下变量：

```env
# WalletConnect项目ID
VITE_WALLETCONNECT_PROJECT_ID=your_project_id

# 默认网络
VITE_DEFAULT_NETWORK=localhost

# 应用信息
VITE_APP_NAME=MyToken DApp
VITE_APP_URL=http://localhost:5173

# 网络RPC配置
VITE_LOCALHOST_RPC_URL=http://127.0.0.1:8545
VITE_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_project_id
VITE_GOERLI_RPC_URL=https://goerli.infura.io/v3/your_project_id
VITE_MAINNET_RPC_URL=https://mainnet.infura.io/v3/your_project_id
```

### 合约地址配置

编辑 `src/config/contracts.ts` 文件，更新不同网络的合约地址：

```typescript
export const defaultContracts: ContractsConfig = {
  localhost: {
    contracts: {
      MyToken: {
        address: "0x...YOUR_LOCAL_CONTRACT_ADDRESS",
        verified: false,
      },
    },
  },
  // ... 其他网络配置
};
```

## 🌐 支持的网络

- **Localhost** (Chain ID: 31337) - 开发环境
- **Sepolia** (Chain ID: 11155111) - 测试网
- **Goerli** (Chain ID: 5) - 测试网
- **Mainnet** (Chain ID: 1) - 主网

## 📱 功能特性

### ✅ 已实现

- 🎨 响应式UI设计
- 🔗 多钱包连接支持
- 🌐 多网络切换
- 📄 页面路由导航
- 🛡️ TypeScript类型安全
- 🎯 Ant Design组件库

### 🚧 开发中

- 🪙 代币铸造功能
- 📊 实时代币信息查询
- 📈 用户余额和历史记录
- 🔍 交易状态监控

## 🔗 与后端集成

前端项目需要与Hardhat后端项目配合使用：

1. 启动Hardhat本地节点：
   ```bash
   cd ../../  # 回到项目根目录
   npm run node
   ```

2. 部署合约：
   ```bash
   npm run deploy:localhost
   ```

3. 更新前端合约配置：
   ```bash
   npm run deployment:frontend
   ```

## 🐛 故障排除

### 常见问题

1. **钱包连接失败**
   - 检查WalletConnect项目ID是否正确配置
   - 确保钱包软件已安装并解锁

2. **网络切换问题**
   - 确保钱包已连接到正确的网络
   - 检查RPC配置是否正确

3. **合约交互失败**
   - 确认合约已正确部署
   - 检查合约地址配置
   - 验证ABI是否与合约匹配

## �� 许可证

MIT License
