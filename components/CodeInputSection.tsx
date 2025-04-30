import { Button } from 'antd';
import { UploadOutlined, FileOutlined } from '@ant-design/icons';
import styles from '../styles/CodeInputSection.module.css';
import React from 'react';

/**
 * 快递码输入区域组件
 * @returns {JSX.Element} 返回包含输入框和上传按钮的组件
 */
export default function CodeInputSection() {
  return (
    <div className={styles.inputSection}>
      <div className={styles.inputContainer}>
        <div className={styles.inputWrapper}>
          <textarea
            className={styles.input}
            placeholder="请输入快递单号或上传图片..."
            style={{ height: 88, minHeight: 88, maxHeight: 88, resize: 'none', padding: '8px 10px', fontSize: 16, lineHeight: 1.5, width: '100%', boxSizing: 'border-box', borderRadius: 8, border: '1px solid #d9d9d9', background: '#fff', fontFamily: 'inherit' }}
          />
        </div>
        <div className={styles.buttonsWrapper}>
          <Button 
            size="large"
            className={styles.uploadButton}
          >
            <UploadOutlined /> 上传
          </Button>
          <Button 
            type="primary" 
            size="large"
            className={styles.recognizeButton}
          >
            <FileOutlined /> 识别
          </Button>
        </div>
      </div>
    </div>
  );
} 