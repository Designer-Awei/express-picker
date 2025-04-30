import type { AppProps } from 'next/app';
import '../styles/globals.css';

/**
 * 应用程序入口组件
 * @param {AppProps} props - 应用程序属性
 * @returns {JSX.Element} 返回应用程序根组件
 */
export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
