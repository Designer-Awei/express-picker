import React, { useState } from 'react';
import { Modal, Button, Input, Select, Space } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const EXPRESS_AREAS = [
  { label: '菜鸟驿站', value: '菜鸟驿站' },
  { label: '韵达京东', value: '韵达京东' },
  { label: '顺丰快递', value: '顺丰快递' },
];

export interface RecognizeCard {
  code: string;
  area: string;
}

interface RecognizeResultModalProps {
  open: boolean;
  cards: RecognizeCard[];
  onChange: (cards: RecognizeCard[]) => void;
  onCancel: () => void;
  onOk: () => void;
}

/**
 * 识别结果弹窗组件
 * @param {RecognizeResultModalProps} props - 组件属性
 * @returns {JSX.Element}
 */
const RecognizeResultModal: React.FC<RecognizeResultModalProps> = ({ open, cards, onChange, onCancel, onOk }) => {
  const [localCards, setLocalCards] = useState(cards);

  // 同步外部cards变化
  React.useEffect(() => { setLocalCards(cards); }, [cards]);

  // 编辑卡片内容
  const handleCardChange = (idx: number, key: keyof RecognizeCard, value: string) => {
    const newCards = localCards.map((c, i) => i === idx ? { ...c, [key]: value } : c);
    setLocalCards(newCards);
    onChange(newCards);
  };

  // 删除卡片
  const handleDelete = (idx: number) => {
    const newCards = localCards.filter((_, i) => i !== idx);
    setLocalCards(newCards);
    onChange(newCards);
  };

  // 新增卡片
  const handleAdd = () => {
    const newCards = [...localCards, { code: '', area: EXPRESS_AREAS[0].value }];
    setLocalCards(newCards);
    onChange(newCards);
  };

  return (
    <Modal
      open={open}
      title="识别结果"
      onCancel={onCancel}
      onOk={onOk}
      footer={null}
      width={440}
      style={{ top: 60 }}
      styles={{ body: { padding: 0, background: '#fafbfc' } }}
      destroyOnClose
    >
      <div style={{ padding: '20px 24px 0 24px' }}>
        <div style={{ display: 'flex', fontWeight: 500, color: '#888', marginBottom: 8 }}>
          <span style={{ flex: 2 }}>取件码</span>
          <span style={{ flex: 2 }}>快递分区</span>
          <span style={{ flex: 1 }}></span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {localCards.map((card, idx) => (
            <div key={idx} style={{ background: '#fff7e6', borderRadius: 10, padding: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Input
                value={card.code}
                onChange={e => handleCardChange(idx, 'code', e.target.value)}
                style={{ flex: 2, marginRight: 8 }}
                placeholder="请输入取件码"
              />
              <Select
                value={card.area}
                onChange={v => handleCardChange(idx, 'area', v)}
                style={{ flex: 2, marginRight: 8 }}
                options={EXPRESS_AREAS}
              />
              <Button
                icon={<DeleteOutlined />}
                danger
                type="text"
                onClick={() => handleDelete(idx)}
                style={{ flex: 1 }}
              />
            </div>
          ))}
        </div>
        <div style={{ margin: '18px 0', textAlign: 'center' }}>
          <Button type="dashed" icon={<PlusOutlined />} onClick={handleAdd} style={{ color: '#fa8c16', borderColor: '#fa8c16', background: '#fffbe6' }}>
            添加快递
          </Button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, margin: '8px 0 8px 0' }}>
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" onClick={onOk} style={{ background: '#fa8c16', borderColor: '#fa8c16' }}>确认</Button>
        </div>
      </div>
    </Modal>
  );
};

export default RecognizeResultModal; 