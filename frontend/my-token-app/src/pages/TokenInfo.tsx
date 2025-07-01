import React from 'react';
import { Card, Typography, Alert } from 'antd';
import { useAccount } from 'wagmi';

const { Title, Paragraph } = Typography;

export const TokenInfo: React.FC = () => {
  const { isConnected } = useAccount();

  return (
    <div>
      <Title level={2}>代币信息</Title>
      <Paragraph>查看MyToken代币的详细信息和统计数据</Paragraph>
      
      {!isConnected ? (
        <Alert
          message="请先连接钱包"
          description="您需要连接Web3钱包才能查看完整的代币信息"
          type="warning"
          showIcon
        />
      ) : (
        <Card title="代币信息">
          <Paragraph>代币信息功能正在开发中...</Paragraph>
          <Paragraph>将在后续任务中实现代币信息查询功能。</Paragraph>
        </Card>
      )}
    </div>
  );
}; 