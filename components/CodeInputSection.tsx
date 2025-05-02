import { Button } from 'antd';
import { UploadOutlined, FileOutlined } from '@ant-design/icons';
import styles from '../styles/CodeInputSection.module.css';
import React, { useRef, useState } from 'react';
import RecognizeResultModal, { RecognizeCard } from './RecognizeResultModal';
import { recognizeExpressByText, recognizeExpressByImages } from '../utils/siliconflow';

/**
 * CodeInputSection 组件props类型
 */
export interface CodeInputSectionProps {
  onConfirm?: (cards: RecognizeCard[]) => void;
}

/**
 * 快递码输入区域组件
 * @param {CodeInputSectionProps} props
 * @returns {JSX.Element} 返回包含输入框和上传按钮的组件
 */
export default function CodeInputSection({ onConfirm }: CodeInputSectionProps) {
  const [textValue, setTextValue] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [recognizeCards, setRecognizeCards] = useState<RecognizeCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 互斥逻辑：有文本时禁用上传，有图片时禁用文本输入
  const isTextDisabled = imageFiles.length > 0;
  const isUploadDisabled = !!textValue;

  /**
   * 处理文本输入变化
   * @param e React.ChangeEvent<HTMLTextAreaElement>
   */
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextValue(e.target.value);
    if (imageFiles.length > 0) setImageFiles([]); // 输入文本时清除图片
  };

  /**
   * 处理图片上传
   * @param e React.ChangeEvent<HTMLInputElement>
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);
    if (files.length > 0) setTextValue(''); // 上传图片时清空文本
  };

  /**
   * 触发文件选择
   */
  const handleUploadClick = () => {
    if (!isUploadDisabled && fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  /**
   * 移除单张图片
   */
  const handleRemoveImage = (idx: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
  };

  // 生成图片信息文本
  const imageInfoText = imageFiles.length > 0
    ? imageFiles.map((file, idx) => `${file.name}${idx < imageFiles.length - 1 ? ', ' : ''}`).join('')
    : '';

  /**
   * 预处理输入文本，提取分区与快递码对应关系
   * @param {string} text - 用户输入文本
   * @returns {{code: string, area: string}[]} - 结构化快递码与分区
   */
  function parseCodesWithArea(text: string): { code: string, area: string }[] {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    let currentArea = '菜鸟驿站';
    const result: { code: string, area: string }[] = [];
    for (const line of lines) {
      if (line.startsWith('-')) {
        // 以-开头为分区
        currentArea = line.replace(/^-+/, '').replace(/[:：]/g, '').trim() || currentArea;
        continue;
      }
      // 匹配1-1-2345、22-2-3456等格式
      const match = line.match(/\d{1,2}-\d-\d{4}/);
      if (match) {
        result.push({ code: match[0], area: currentArea });
      }
    }
    return result;
  }

  /**
   * 识别按钮点击事件
   */
  const handleRecognize = async () => {
    setError(null);
    setLoading(true);
    try {
      let cards: RecognizeCard[] = [];
      if (!isTextDisabled && textValue) {
        // 文本输入，优先用大模型结构化结果
        const modelCards = await recognizeExpressByText(textValue);
        if (modelCards.length > 0) {
          cards = modelCards;
        } else {
          // 若无结构化，降级本地正则/分区
          const parsed = parseCodesWithArea(textValue);
          cards = parsed;
        }
      } else if (isTextDisabled && imageFiles.length > 0) {
        // 图片识别
        const base64Arr = await Promise.all(imageFiles.map(file => fileToBase64(file)));
        const cardsFromImg = await recognizeExpressByImages(base64Arr);
        cards = cardsFromImg;
      }
      if (cards.length === 0) {
        setError('未识别到快递码，请检查输入内容或图片清晰度');
        setLoading(false);
        return;
      }
      setRecognizeCards(cards);
      setModalOpen(true);
    } catch (e: any) {
      setError('识别失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 文件转base64
   * @param file File对象
   * @returns Promise<string>
   */
  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * 弹窗卡片内容变更
   * @param cards 识别卡片数组
   */
  const handleCardsChange = (cards: RecognizeCard[]) => {
    setRecognizeCards(cards);
  };

  /**
   * 弹窗取消
   */
  const handleModalCancel = () => {
    setModalOpen(false);
  };

  /**
   * 弹窗确认（同步到分区3）
   */
  const handleModalOk = () => {
    setModalOpen(false);
    if (onConfirm) onConfirm(recognizeCards);
    setTextValue('');
    setImageFiles([]);
    setRecognizeCards([]);
  };

  return (
    <div className={styles.inputSection}>
      <div className={styles.inputContainer}>
        <div className={styles.inputWrapper}>
          <textarea
            className={styles.input}
            placeholder={isTextDisabled ? '' : '请输入快递单号或上传图片...'}
            style={{ height: 88, minHeight: 88, maxHeight: 88, resize: 'none', padding: '8px 10px', fontSize: 16, lineHeight: 1.5, width: '100%', boxSizing: 'border-box', borderRadius: 8, border: '1px solid #d9d9d9', background: '#fff', fontFamily: 'inherit' }}
            value={isTextDisabled ? '' : textValue}
            onChange={handleTextChange}
            disabled={isTextDisabled}
          />
          {/* 图片信息和移除按钮显示在文本框内 */}
          {isTextDisabled && imageFiles.length > 0 && (
            <div style={{
              position: 'absolute',
              left: 34,
              top: 24,
              color: '#888',
              fontSize: 13,
              display: 'flex',
              flexWrap: 'wrap',
              zIndex: 1,
              maxWidth: 'calc(100% - 120px)', // 限制最大宽度，避免溢出
              wordBreak: 'break-all', // 超长单词换行
              whiteSpace: 'pre-wrap', // 保证自动换行
              lineHeight: 1.7
            }}>
              {imageFiles.map((file, idx) => (
                <span key={file.name + idx}>
                  {file.name}
                  <Button size="small" type="link" onClick={() => handleRemoveImage(idx)} style={{ paddingLeft: 4, paddingRight: 40 }}>
                    移除
                  </Button>
                </span>
              ))}
            </div>
          )}
        </div>
        <div className={styles.buttonsWrapper}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileChange}
            disabled={isUploadDisabled}
          />
          <Button 
            size="large"
            className={styles.uploadButton}
            onClick={handleUploadClick}
            disabled={isUploadDisabled}
          >
            <UploadOutlined /> 上传
          </Button>
          <Button 
            type="primary" 
            size="large"
            className={styles.recognizeButton}
            disabled={!textValue && imageFiles.length === 0 || loading}
            loading={loading}
            onClick={handleRecognize}
          >
            <FileOutlined /> 识别
          </Button>
        </div>
      </div>
      {/* 错误提示 */}
      {error && (
        <div style={{ width: '92%', margin: '8px auto 0 auto', textAlign: 'left' }}>
          <div style={{ color: 'red' }}>{error}</div>
        </div>
      )}
      {/* 识别结果弹窗 */}
      <RecognizeResultModal
        open={modalOpen}
        cards={recognizeCards}
        onChange={handleCardsChange}
        onCancel={handleModalCancel}
        onOk={handleModalOk}
      />
    </div>
  );
} 