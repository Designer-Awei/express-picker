import { List, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import styles from '../styles/Home.module.css';
import React, { useRef, useState, useMemo } from 'react';
import { MAP_OPTIONS } from './MapSection';

export interface PendingDelivery {
  id: string;
  location: string;
}

interface PendingDeliverySectionProps {
  pendingDeliveries: PendingDelivery[];
  onDelete?: (id: string) => void;
  selectedMap?: string;
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
 * 获取分区排序权重，权重越小越靠前
 * @param area 分区名称
 * @param selectedMap 当前选中的地图
 */
function getAreaWeight(area: string, selectedMap: string): number {
  // 默认排序顺序
  const defaultOrder = ['菜鸟', '韵达', '顺丰', '其他'];
  
  // 如果是总览图，则按默认顺序
  if (selectedMap === 'demo-map.svg') {
    for (let i = 0; i < defaultOrder.length; i++) {
      if (area.includes(defaultOrder[i])) return i;
    }
    return defaultOrder.length; // 其他区域放最后
  }
  
  // 跟随地图选择器顺序
  // 当前选中的分区放最前面
  for (const option of MAP_OPTIONS) {
    // 跳过总图
    if (option.value === 'demo-map.svg') continue;
    
    // 如果是当前选中的地图，对应分区权重为0
    if (option.value === selectedMap && area.includes(option.label.split('-')[1])) {
      return 0;
    }
  }
  
  // 其他分区按默认顺序
  for (let i = 0; i < defaultOrder.length; i++) {
    if (area.includes(defaultOrder[i])) return i + 1;
  }
  
  return defaultOrder.length + 1; // 其他区域放最后
}

/**
 * 待取快递列表组件
 * @param {PendingDelivery[]} pendingDeliveries - 待取快递数据
 * @param {function} onDelete - 删除回调
 * @param {string} selectedMap - 当前选中的地图
 * @returns {JSX.Element} 返回包含待取快递列表的组件
 */
export default function PendingDeliverySection({ 
  pendingDeliveries = [], 
  onDelete,
  selectedMap = 'demo-map.svg'
}: PendingDeliverySectionProps) {
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

  // 对待取快递进行排序
  const sortedDeliveries = useMemo(() => {
    if (!pendingDeliveries.length) return [];
    
    return [...pendingDeliveries].sort((a, b) => {
      // 1. 先按照分区的权重排序（当前选中地图对应的分区优先）
      const areaWeightA = getAreaWeight(a.location, selectedMap);
      const areaWeightB = getAreaWeight(b.location, selectedMap);
      
      if (areaWeightA !== areaWeightB) {
        return areaWeightA - areaWeightB;
      }
      
      // 2. 同一分区内按取件码数值升序排序
      // 提取数字部分并转换为数字进行比较
      const numA = a.id.split('-').map(part => parseInt(part, 10));
      const numB = b.id.split('-').map(part => parseInt(part, 10));
      
      // 逐段比较数字
      for (let i = 0; i < Math.min(numA.length, numB.length); i++) {
        if (numA[i] !== numB[i]) {
          return numA[i] - numB[i]; // 升序排列
        }
      }
      
      // 如果前面部分都相同，短的排在前面
      return numA.length - numB.length;
    });
  }, [pendingDeliveries, selectedMap]);

  return (
    <div className={styles.section}>
      <List
        header={<div style={{ fontWeight: 'bold' }}>待取快递</div>}
        bordered
        dataSource={sortedDeliveries}
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
                  <div style={{ fontWeight: 500, fontSize: 16 }}>取件码：{item.id}</div>
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