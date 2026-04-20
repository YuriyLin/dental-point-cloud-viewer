# 3D Dental Visualization Demo

互動式 3D 牙齒分割視覺化 Demo - 使用 React + Three.js 建構的前端應用程式。

## 專案概述

本專案展示如何串接 3D 牙齒分割 API，並提供互動式的 3D 網格渲染與分割結果視覺化功能。

## 功能特點

- STL 檔案上傳
- 即時 AI 牙齒分割
- 互動式 3D 視圖 (旋轉、縮放、平移)
- 牙齒選取與高亮
- 分割結果顏色標註
- FDI 牙位編號顯示

## 目錄結構

```
3D-Dental-Visualization-Demo/
├── components/           # React 組件
│   ├── AIDemo.tsx       # 主 Demo 頁面
│   ├── InteractiveViewer.tsx  # 3D 視圖組件
│   └── ...
├── services/
│   └── apiService.ts    # API 串接服務
├── hooks/
│   └── useDentalViewer.ts  # 3D 視圖鉤子
├── public/              # 靜態資源
└── package.json
```

## 快速開始

### 前置需求

- Node.js 18+
- npm 或 yarn

### 安裝與執行

```bash
# 安裝依賴
npm install

# 複製環境變數檔案
cp .env.local.example .env.local

# 編輯 .env.local 設定 API URL
# VITE_API_BASE_URL=http://localhost:8000

# 啟動開發伺服器
npm run dev
```

### 建置發布

```bash
npm run build
```

## API 串接

本 Demo 串接後端 API 服務：

```typescript
import { segmentSTL, checkHealth } from './services/apiService';

// 健康檢查
const health = await checkHealth();

// 上傳並分割
const result = await segmentSTL(file);
```

### API 端點要求

需要後端提供以下端點：

| 方法 | 端點 | 說明 |
|------|------|------|
| GET | `/api/health` | 健康檢查 |
| POST | `/api/upload` | 上傳 STL 檔案 |
| POST | `/api/segment/{task_id}` | 執行分割 |
| GET | `/api/metadata/{task_id}` | 取得分割結果 |

詳見 [3D-Teeth-Segmentation-Core](https://github.com/yourusername/3D-Teeth-Segmentation-Core) 後端專案。

## 技術栈

- **前端框架**: React 18 + Vite
- **3D 渲染**: Three.js + React Three Fiber
- **樣式**: Tailwind CSS
- **HTTP 客戶端**: Fetch API
- **構建工具**: Vite

## 環境變數

| 變數 | 說明 | 預設值 |
|------|------|--------|
| `VITE_API_BASE_URL` | API 伺服器網址 | `http://localhost:8000` |

## 相關專案

- [3D-Teeth-Segmentation-Core](https://github.com/yourusername/3D-Teeth-Segmentation-Core) - 核心 ML 模型與 API 服務
