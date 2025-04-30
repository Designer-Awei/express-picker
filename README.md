# 快速取件导航单页面Web应用

本项目基于 Next.js + TypeScript，旨在为校内快递中心提供快递码识别、货架导航、自助出库及出库记录等功能，提升取件效率。所有数据均存储于本地 localStorage，保障隐私与易用性。

## 项目结构
```text
express-picker/
├── public/
│   ├── map-overview.svg         # 总平面图
│   ├── map-zone-a.svg          # 分区A平面图
│   ├── map-zone-b.svg          # 分区B平面图
│   ├── map-zone-c.svg          # 分区C平面图
├── pages/                      # Next.js页面目录
│   ├── index.tsx               # 首页（输入取件码/上传图片）
│   ├── map.tsx                 # 地图导航页
│   ├── result.tsx              # 取件结果页
├── components/                 # 复用组件
│   ├── CodeInput.tsx           # 取件码输入组件
│   ├── ImageUpload.tsx         # 图片上传组件
│   ├── MapDisplay.tsx          # 地图与高亮组件
│   ├── ShelfDialog.tsx         # 货架弹窗组件
│   ├── RecordList.tsx          # 出库记录组件
├── utils/                      # 工具函数
│   ├── siliconflow.ts          # SiliconFlow视觉大模型API
│   ├── storage.ts              # localStorage操作
├── 项目规划.md                 # 项目规划文档
```

## 启动开发

1. 安装依赖：
   ```bash
   npm install
   ```
2. 启动开发服务器：
   ```bash
   npm run dev
   ```
3. 打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 核心功能
1. **快递码输入/图片上传**：支持手动输入和图片识别，图片识别调用 SiliconFlow 视觉大模型。
2. **地图导航与高亮**：根据快递码（即货架号）自动跳转并高亮对应货架。
3. **自助出库**：点击货架弹窗扫码或标记未找到，流程自动推进。
4. **出库记录**：本地记录所有出库与未找到的快递，取件结束后展示统计结果。

## 技术栈
- Next.js（React 18，TypeScript）
- Ant Design
- SVG + React
- localStorage
- SiliconFlow 视觉大模型 API
- 浏览器原生摄像头 API

## UI自定义说明

### 首页输入区（CodeInputSection）
- 输入框采用Antd的Input.TextArea组件，已通过style和CSS强制高度固定为88px，内容始终顶部对齐。
- 输入框placeholder和光标严格对齐顶部。
- 右侧按钮区为竖直排列，上方为"上传"按钮，下方为"识别"按钮，二者宽度一致。
- 输入区整体采用卡片式白色背景、圆角和阴影，提升视觉层次。
- 相关样式详见`styles/CodeInputSection.module.css`。

---
> 本项目以两天开发周期为目标，优先保证核心功能可用，非核心功能可后续迭代完善。
