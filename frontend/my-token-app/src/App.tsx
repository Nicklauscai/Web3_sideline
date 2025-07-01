
import { RouterProvider } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { wagmiConfig } from './config/web3';
import { router } from './config/routes';
import './App.css';

// 创建React Query客户端
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 30_000,
    },
  },
});

// Ant Design主题配置
const themeConfig = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 8,
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      footerBg: '#f0f2f5',
    },
  },
};

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider locale={zhCN} theme={themeConfig}>
          <RouterProvider router={router} />
        </ConfigProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
