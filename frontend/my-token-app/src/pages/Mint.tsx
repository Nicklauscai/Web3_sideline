import React from 'react';
import { Card, Typography, Alert } from 'antd';
import { useAccount } from 'wagmi';

const { Title, Paragraph } = Typography;

export const Mint: React.FC = () => {
  const { isConnected } = useAccount();

  return (
    <div>
      <Title level={2}>Mint代币</Title>
      <Paragraph>在这里您可以铸造MyToken代币</Paragraph>
      
      {!isConnected ? (
        <Alert
          message="请先连接钱包"
          description="您需要连接Web3钱包才能使用Mint功能"
          type="warning"
          showIcon
        />
      ) : (
        <Card title="Mint功能">
          <Paragraph>Mint功能正在开发中...</Paragraph>
          <Paragraph>将在下一个任务中实现具体的Mint界面和功能。</Paragraph>
        </Card>
      )}
    </div>
  );
}; 