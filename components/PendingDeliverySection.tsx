import { List, Button } from 'antd';
import styles from '../styles/Home.module.css';

/**
 * 待取快递列表组件
 * @returns {JSX.Element} 返回包含待取快递列表的组件
 */
export default function PendingDeliverySection() {
  // 模拟数据，后续替换成真实数据
  const mockData = [
    {
      id: '12-3-4567',
      location: '宝岛理发站',
    },
    {
      id: '21-3-3333',
      location: '韵达东区',
    }
  ];

  return (
    <div className={styles.section}>
      <List
        header={<div style={{ fontWeight: 'bold' }}>待取快递</div>}
        bordered
        dataSource={mockData}
        renderItem={(item) => (
          <List.Item
            extra={
              <Button type="primary" size="small">
                取件
              </Button>
            }
          >
            <List.Item.Meta
              title={`快递单号：${item.id}`}
              description={`取件区域：${item.location}`}
            />
          </List.Item>
        )}
      />
    </div>
  );
} 