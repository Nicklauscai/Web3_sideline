import React from 'react';
import { Card, Typography, Row, Col, Divider, Tag, Space } from 'antd';
import { GithubOutlined, ApiOutlined, SafetyOutlined, RocketOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

export const About: React.FC = () => {
  return (
    <div>
      <Title level={2}>关于 MyToken DApp</Title>
      
      <Card style={{ marginBottom: 24 }}>
        <Title level={3}>项目简介</Title>
        <Paragraph>
          MyToken DApp 是一个基于以太坊区块链的ERC20代币发行与Mint平台。
          本项目使用了最新的Web3技术栈，为用户提供安全、便捷的代币铸造体验。
        </Paragraph>
        
        <Divider />
        
        <Title level={4}>技术栈</Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card size="small" title="前端技术">
              <Space direction="vertical">
                <Text><Tag color="blue">React 18</Tag> 现代化前端框架</Text>
                <Text><Tag color="cyan">TypeScript</Tag> 类型安全</Text>
                <Text><Tag color="geekblue">Vite</Tag> 快速构建工具</Text>
                <Text><Tag color="volcano">Ant Design</Tag> UI组件库</Text>
              </Space>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card size="small" title="Web3技术">
              <Space direction="vertical">
                <Text><Tag color="purple">Wagmi</Tag> React Web3钩子</Text>
                <Text><Tag color="magenta">Viem</Tag> 以太坊客户端</Text>
                <Text><Tag color="orange">Web3Modal</Tag> 钱包连接</Text>
                <Text><Tag color="green">Ethers.js</Tag> 以太坊库</Text>
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <SafetyOutlined />
                安全特性
              </Space>
            }
          >
            <Space direction="vertical">
              <Text>🔒 基于OpenZeppelin安全标准</Text>
              <Text>🛡️ 防重入攻击保护</Text>
              <Text>⚡ Gas优化设计</Text>
              <Text>🔍 完整的事件日志</Text>
              <Text>✅ 全面的单元测试</Text>
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <RocketOutlined />
                核心功能
              </Space>
            }
          >
            <Space direction="vertical">
              <Text>🪙 代币铸造（Mint）</Text>
              <Text>📊 实时代币信息查询</Text>
              <Text>👛 多钱包连接支持</Text>
              <Text>🌐 多网络支持</Text>
              <Text>📱 响应式设计</Text>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 24 }}>
        <Title level={4}>合约信息</Title>
        <Paragraph>
          MyToken智能合约遵循ERC20标准，具有以下特性：
        </Paragraph>
        <ul>
          <li>代币名称：MyToken</li>
          <li>代币符号：MTK</li>
          <li>小数位数：18位</li>
          <li>最大供应量：100,000,000 MTK</li>
          <li>单地址Mint限额：100,000 MTK</li>
          <li>单次Mint限额：10,000 MTK</li>
        </ul>
      </Card>

      <Card style={{ marginTop: 24 }}>
        <Title level={4}>
          <Space>
            <ApiOutlined />
            开发信息
          </Space>
        </Title>
        <Paragraph>
          本项目是一个完整的Web3 DApp开发示例，展示了从智能合约开发到前端界面的完整流程。
        </Paragraph>
        <Space>
          <Text type="secondary">
            <GithubOutlined /> 开源项目
          </Text>
          <Text type="secondary">版本：v1.0.0</Text>
          <Text type="secondary">最后更新：2024年</Text>
        </Space>
      </Card>
    </div>
  );
}; 