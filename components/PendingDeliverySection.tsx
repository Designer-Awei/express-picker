import { List, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import styles from '../styles/Home.module.css';
import React, { useRef, useState } from 'react';

export interface PendingDelivery {
  id: string;
  location: string;
}

interface PendingDeliverySectionProps {
  pendingDeliveries: PendingDelivery[];
  onDelete?: (id: string) => void;
}

/**
 * 获取分区对应的卡片背景色
 * @param area 分区
 */
function getCardBg(area: string) {
  if (area.includes('菜鸟')) return '#e6f7ff'; // 淡蓝
  if (area.includes('韵达')) return '#fffbe6'; // 淡黄
  if (area.includes('顺丰')) return '#f5f5f5'; // 浅灰
  return '#f5f5f5';
}

/**
 * 待取快递列表组件
 * @param {PendingDelivery[]} pendingDeliveries - 待取快递数据
 * @param {function} onDelete - 删除回调
 * @returns {JSX.Element} 返回包含待取快递列表的组件
 */
export default function PendingDeliverySection({ pendingDeliveries = [], onDelete }: PendingDeliverySectionProps) {
  // 记录每个卡片的滑动距离
  const [swipeX, setSwipeX] = useState<{ [id: string]: number }>({});
  const startXRef = useRef<{ [id: string]: number }>({});

  // 触摸/鼠标事件
  const handleStart = (id: string, clientX: number) => {
    startXRef.current[id] = clientX;
  };
  const handleMove = (id: string, clientX: number) => {
    const dx = Math.min(0, clientX - (startXRef.current[id] || 0));
    setSwipeX(prev => ({ ...prev, [id]: dx }));
  };
  const handleEnd = (id: string) => {
    // 超过-60px则完全展开，否则回弹
    setSwipeX(prev => ({ ...prev, [id]: (prev[id] || 0) < -60 ? -80 : 0 }));
  };
  const handleDelete = (id: string) => {
    if (onDelete) onDelete(id);
    setSwipeX(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  return (
    <div className={styles.section}>
      <List
        header={<div style={{ fontWeight: 'bold' }}>待取快递</div>}
        bordered
        dataSource={pendingDeliveries}
        renderItem={(item) => {
          const x = swipeX[item.id] || 0;
          return (
            <div
              style={{ position: 'relative', overflow: 'hidden', userSelect: 'none', marginBottom: 8 }}
              onMouseDown={e => handleStart(item.id, e.clientX)}
              onMouseMove={e => {
                if (e.buttons === 1) handleMove(item.id, e.clientX);
              }}
              onMouseUp={() => handleEnd(item.id)}
              onTouchStart={e => handleStart(item.id, e.touches[0].clientX)}
              onTouchMove={e => handleMove(item.id, e.touches[0].clientX)}
              onTouchEnd={() => handleEnd(item.id)}
            >
              {/* 删除区域 */}
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  height: '100%',
                  width: 80,
                  background: '#ff4d4f',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1,
                  transition: 'background 0.2s',
                  color: '#fff',
                  fontSize: 22,
                  cursor: 'pointer',
                  boxShadow: x < -60 ? '0 2px 8px #ff4d4f33' : undefined
                }}
                onClick={() => handleDelete(item.id)}
              >
                <DeleteOutlined />
              </div>
              {/* 卡片内容 */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  transform: `translateX(${x}px)`,
                  transition: x === 0 || x === -80 ? 'transform 0.2s' : undefined,
                  background: getCardBg(item.location),
                  borderRadius: 0,
                  minHeight: 56,
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: '0 1px 4px #0001',
                  padding: '12px 24px',
                  marginBottom: 0
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 16 }}>快递单号：{item.id}</div>
                  <div style={{ color: '#888', fontSize: 14 }}>取件区域：{item.location}</div>
                </div>
                <Button type="primary" size="small" style={{ marginLeft: 12 }}>
                  取件
                </Button>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
} 