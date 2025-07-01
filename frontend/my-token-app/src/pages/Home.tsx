import React from 'react';
import { Card, Row, Col, Statistic, Button, Typography, Space, Alert } from 'antd';
import { DollarOutlined, WalletOutlined, TrophyOutlined, SafetyOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useAccount } from 'wagmi';

const { Title, Paragraph } = Typography;

export const Home: React.FC = () => {
  const { isConnected } = useAccount();

  return (
    <div>
      {/* 欢迎标题 */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <Title level={1} style={{ color: '#1890ff', marginBottom: 16 }}>
          欢迎来到 MyToken DApp
        </Title>
        <Paragraph style={{ fontSize: 18, color: '#666' }}>
          基于以太坊的ERC20代币发行与Mint平台
        </Paragraph>
      </div>

      {/* 连接钱包提示 */}
      {!isConnected && (
        <Alert
          message="请先连接您的钱包"
          description="要使用Mint功能和查看代币信息，您需要先连接您的Web3钱包（如MetaMask）。"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* 功能统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="代币符号"
              value="MTK"
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="最大供应量"
              value="100,000,000"
              suffix="MTK"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="单次Mint限额"
              value="10,000"
              suffix="MTK"
              prefix={<SafetyOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="地址Mint限额"
              value="100,000"
              suffix="MTK"
              prefix={<WalletOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 功能介绍 */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card
            title="🪙 Mint代币"
            extra={<Link to="/mint">去Mint</Link>}
          >
            <Paragraph>
              在这里您可以铸造MyToken代币。每个地址最多可以铸造100,000个代币，
              单次交易最多可以铸造10,000个代币。
            </Paragraph>
            <Space>
              <Button type="primary" size="large">
                <Link to="/mint">开始Mint</Link>
              </Button>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="📊 代币信息"
            extra={<Link to="/token-info">查看详情</Link>}
          >
            <Paragraph>
              查看代币的详细信息，包括总供应量、您的余额、Mint历史记录等。
              实时了解代币的分发情况。
            </Paragraph>
            <Space>
              <Button size="large">
                <Link to="/token-info">查看信息</Link>
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 特性介绍 */}
      <Card style={{ marginTop: 32 }} title="🚀 平台特性">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              <SafetyOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
              <Title level={4}>安全可靠</Title>
              <Paragraph>
                基于OpenZeppelin的安全合约标准，经过充分测试，确保资金安全。
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              <DollarOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
              <Title level={4}>标准ERC20</Title>
              <Paragraph>
                完全兼容ERC20标准，可以在任何支持ERC20的钱包和交易所中使用。
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              <WalletOutlined style={{ fontSize: 48, color: '#fa8c16', marginBottom: 16 }} />
              <Title level={4}>简单易用</Title>
              <Paragraph>
                直观的用户界面，连接钱包即可开始使用，无需复杂的设置。
              </Paragraph>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}; 