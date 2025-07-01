import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Layout as AntLayout, Menu, Button, Space, Typography } from 'antd';
import { WalletOutlined, HomeOutlined, DollarOutlined, InfoCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useAccount, useDisconnect } from 'wagmi';
import { navigationItems } from '../config/routes';

const { Header, Content, Footer } = AntLayout;
const { Title, Text } = Typography;

interface LayoutProps {}

export const Layout: React.FC<LayoutProps> = () => {
  const location = useLocation();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  // 菜单图标映射
  const menuIcons: Record<string, React.ReactNode> = {
    '/': <HomeOutlined />,
    '/mint': <DollarOutlined />,
    '/token-info': <InfoCircleOutlined />,
    '/about': <QuestionCircleOutlined />,
  };

  // 处理钱包连接
  const handleWalletConnect = () => {
    // 这里使用Web3Modal连接钱包
    if (typeof window !== 'undefined' && (window as any).web3Modal) {
      (window as any).web3Modal.open();
    }
  };

  // 处理钱包断开
  const handleWalletDisconnect = () => {
    disconnect();
  };

  // 格式化地址显示
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Title level={3} style={{ margin: 0, marginRight: 32, color: '#1890ff' }}>
            MyToken DApp
          </Title>
          
          <Menu
            theme="light"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            style={{ flex: 1, border: 'none' }}
          >
            {navigationItems.map(item => (
              <Menu.Item key={item.key} icon={menuIcons[item.path]}>
                <Link to={item.path}>{item.label}</Link>
              </Menu.Item>
            ))}
          </Menu>
        </div>

        <Space>
          {isConnected ? (
            <Space>
              <Text type="secondary">
                {formatAddress(address || '')}
              </Text>
              <Button 
                type="primary" 
                danger 
                icon={<WalletOutlined />}
                onClick={handleWalletDisconnect}
              >
                断开连接
              </Button>
            </Space>
          ) : (
            <Button 
              type="primary" 
              icon={<WalletOutlined />}
              onClick={handleWalletConnect}
            >
              连接钱包
            </Button>
          )}
        </Space>
      </Header>

      <Content style={{ padding: '24px 50px', flex: 1 }}>
        <div style={{
          background: '#fff',
          padding: '24px',
          borderRadius: '8px',
          minHeight: 'calc(100vh - 160px)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Outlet />
        </div>
      </Content>

      <Footer style={{ textAlign: 'center', background: '#f0f2f5' }}>
        <Text type="secondary">
          MyToken DApp ©2024 - 基于以太坊的ERC20代币发行与Mint平台
        </Text>
      </Footer>
    </AntLayout>
  );
}; 