import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import CodeInputSection from '../components/CodeInputSection';
// import MapSection from '../components/MapSection';
// import PendingDeliverySection from '../components/PendingDeliverySection';
import styles from '../styles/Home.module.css';
import MapSection from '@/components/MapSection';
import PendingDeliverySection, { PendingDelivery } from '@/components/PendingDeliverySection';
import { RecognizeCard } from '@/components/RecognizeResultModal';

/**
 * 主页面组件
 * @returns {JSX.Element} 返回包含三个主要分区的页面布局
 */
export default function Home() {
  const [pendingDeliveries, setPendingDeliveries] = useState<PendingDelivery[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [selectedMap, setSelectedMap] = useState('demo-map.svg');

  /**
   * 解决服务端渲染问题：标记客户端环境
   */
  useEffect(() => {
    setIsClient(true);
  }, []);

  /**
   * 从localStorage读取待取快递数据
   * 仅在客户端执行，避免SSR报错
   */
  useEffect(() => {
    if (isClient) {
      try {
        const saved = localStorage.getItem('pendingDeliveries');
        if (saved) {
          const parsedData = JSON.parse(saved);
          if (Array.isArray(parsedData)) {
            setPendingDeliveries(parsedData);
          }
        }
      } catch (error) {
        console.error('读取localStorage数据失败:', error);
      }
    }
  }, [isClient]);

  /**
   * localStorage持久化：变更时写入
   */
  useEffect(() => {
    if (isClient && pendingDeliveries.length > 0) {
      try {
        localStorage.setItem('pendingDeliveries', JSON.stringify(pendingDeliveries));
      } catch (error) {
        console.error('写入localStorage数据失败:', error);
      }
    }
  }, [pendingDeliveries, isClient]);

  /**
   * 识别确认后同步到分区3
   * @param {RecognizeCard[]} cards
   */
  const handleRecognizeConfirm = (cards: RecognizeCard[]) => {
    // 合并到待取快递列表（可去重）
    setPendingDeliveries(prev => {
      const newList = [...prev];
      cards.forEach(card => {
        if (!newList.some(item => item.id === card.code)) {
          newList.push({ id: card.code, location: card.area });
        }
      });
      return newList;
    });
  };

  /**
   * 删除待取快递
   */
  const handleDeleteDelivery = (id: string) => {
    setPendingDeliveries(prev => {
      const updated = prev.filter(item => item.id !== id);
      // 在数组更新后立即存储到localStorage
      if (isClient) {
        localStorage.setItem('pendingDeliveries', JSON.stringify(updated));
      }
      return updated;
    });
  };

  return (
    <Layout 
      header={null}
      content={
        <div className={"contentContainer " + styles.contentContainer}>
          {/* 分区1: 快递码输入区域 */}
          <CodeInputSection onConfirm={handleRecognizeConfirm} />
          
          {/* 分区2: 地图显示区域 */}
          <MapSection selectedMap={selectedMap} onMapChange={setSelectedMap} />
          
          {/* 分区3: 待取快递列表区域 */}
          <PendingDeliverySection 
            pendingDeliveries={pendingDeliveries} 
            onDelete={handleDeleteDelivery} 
            selectedMap={selectedMap}
          />
        </div>
      }
      footer={<div className={styles.footer}>© 2025 快速取件导航系统</div>}
    />
  );
}
