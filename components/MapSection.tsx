import { useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { DownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import styles from '../styles/Home.module.css';

export const MAP_OPTIONS = [
  { label: '总图-快递中心', value: 'demo-map.svg' },
  { label: '分区-菜鸟驿站', value: 'cainiao.svg' },
  { label: '分区-韵达京东', value: 'yunda-jd.svg' },
  { label: '分区-顺丰快递', value: 'sf.svg' },
];

interface MapSectionProps {
  selectedMap: string;
  onMapChange: (map: string) => void;
}

/**
 * 地图显示区域组件
 * @param {string} selectedMap - 当前选中的地图
 * @param {function} onMapChange - 地图变更回调
 * @returns {JSX.Element} 返回包含可切换地图、指北针和地图SVG的区域
 */
export default function MapSection({ selectedMap = 'demo-map.svg', onMapChange }: MapSectionProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  /**
   * 切换地图
   * @param {string} value 地图文件名
   */
  function handleSelect(value: string) {
    onMapChange(value);
    setDropdownOpen(false);
  }

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
      {/* 顶部栏：地图选择器+指北针 */}
      <div style={{ display: 'flex', width: '92vw', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        {/* 地图选择器 */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <button
            style={{
              display: 'flex', alignItems: 'center', borderRadius: 24, border: '2px solid #222', background: '#fff', padding: '4px 18px 4px 16px', fontSize: 18, fontWeight: 500, cursor: 'pointer', outline: 'none', minWidth: 160
            }}
            onClick={() => setDropdownOpen(v => !v)}
          >
            <span>{MAP_OPTIONS.find(opt => opt.value === selectedMap)?.label}</span>
            <span style={{ marginLeft: 12, fontSize: 20, lineHeight: 1, display: 'flex', alignItems: 'center' }}>
              <DownOutlined style={{ transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'none' }} />
            </span>
          </button>
          {dropdownOpen && (
            <div style={{ position: 'absolute', top: 40, left: 0, background: '#fff', border: '1px solid #ddd', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', minWidth: 160 }}>
              {MAP_OPTIONS.map(opt => (
                <div
                  key={opt.value}
                  style={{ padding: '10px 18px', cursor: 'pointer', fontSize: 16, color: selectedMap === opt.value ? '#1677ff' : '#222', background: selectedMap === opt.value ? '#f0f7ff' : '#fff' }}
                  onClick={() => handleSelect(opt.value)}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* 指北针 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, userSelect: 'none' }}>
          <ArrowUpOutlined style={{ fontSize: 26, color: '#222', fontWeight: 700 }} />
          <span style={{ fontWeight: 700, fontSize: 26, marginLeft: 2, color: '#222' }}>N</span>
        </div>
      </div>
      {/* 地图显示区，支持缩放与拖动 */}
      <div style={{ width: '92vw', height: '45vw', background: '#fff', border: '2px solid #222', borderRadius: 18, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={4}
          centerOnInit={true}
        >
          <TransformComponent
            wrapperStyle={{ width: '100%', height: '100%', overflow: 'hidden' }}
          >
            <img
              src={`/assets/${selectedMap}`}
              alt="地图"
              style={{ maxWidth: '100%', maxHeight: '100%', display: 'block', objectFit: 'contain', background: '#fff' }}
            />
          </TransformComponent>
        </TransformWrapper>
      </div>
    </div>
  );
} 