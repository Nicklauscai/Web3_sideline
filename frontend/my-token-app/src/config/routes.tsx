import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Home } from '../pages/Home';
import { Mint } from '../pages/Mint';
import { TokenInfo } from '../pages/TokenInfo';
import { About } from '../pages/About';

// 路由配置
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'mint',
        element: <Mint />,
      },
      {
        path: 'token-info',
        element: <TokenInfo />,
      },
      {
        path: 'about',
        element: <About />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

// 导航菜单配置
export const navigationItems = [
  {
    key: '/',
    label: '首页',
    path: '/',
  },
  {
    key: '/mint',
    label: 'Mint代币',
    path: '/mint',
  },
  {
    key: '/token-info',
    label: '代币信息',
    path: '/token-info',
  },
  {
    key: '/about',
    label: '关于',
    path: '/about',
  },
]; 