import { Layout as AntLayout } from 'antd';
import styles from './Layout.module.css';

interface LayoutProps {
  header: React.ReactNode;
  content: React.ReactNode;
  footer: React.ReactNode;
}

/**
 * 布局组件，将页面分为三个主要部分
 * @param {LayoutProps} props - 组件属性
 * @returns {JSX.Element} 布局组件
 */
export const Layout: React.FC<LayoutProps> = ({ content, footer }) => {
  const { Content, Footer } = AntLayout;
  
  return (
    <AntLayout className={styles.layout}>
      <Content className={styles.content}>{content}</Content>
      <Footer className={styles.footer}>{footer}</Footer>
    </AntLayout>
  );
};

export default Layout; 