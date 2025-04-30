import { Layout } from '../components/Layout';
import CodeInputSection from '../components/CodeInputSection';
// import MapSection from '../components/MapSection';
// import PendingDeliverySection from '../components/PendingDeliverySection';
import styles from '../styles/Home.module.css';
import MapSection from '@/components/MapSection';
import PendingDeliverySection from '@/components/PendingDeliverySection';

/**
 * 主页面组件
 * @returns {JSX.Element} 返回包含三个主要分区的页面布局
 */
export default function Home() {
  return (
    <Layout 
      header={null}
      content={
        <div className={"contentContainer " + styles.contentContainer}>
          {/* 分区1: 快递码输入区域 */}
          <CodeInputSection />
          
          {/* 分区2: 地图显示区域 */}
          <MapSection />
          
          {/* 分区3: 待取快递列表区域 */}
          <PendingDeliverySection />
        </div>
      }
      footer={<div className={styles.footer}>© 2025 快速取件导航系统</div>}
    />
  );
}
