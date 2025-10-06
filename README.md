# 个人财务分析仪表盘（支持微信支付宝账单）

一个基于 React + TypeScript + Vite 的前端应用，用于导入财务数据（CSV / XLSX），进行清洗与统计分析，并通过图表和表格进行可视化展示，同时支持日期范围选择与 PDF 报表导出，帮助个人或团队快速了解财务状况。

## 功能特性

- 文件上传与解析（支持 CSV / XLSX）
- 数据清洗与汇总统计（总收入、总支出、类别聚合等）
- 可视化图表：折线图、柱状图、饼图等（Recharts）
- 日期范围筛选与日历选择（React Day Picker + 自定义 UI）
- 报表导出（HTML2Canvas + jsPDF）
- 轻量状态管理（Zustand）与通知反馈（Sonner）
- Tailwind CSS 设计系统与 Radix UI 组件
 - 支持支付宝与微信支付账单导入（CSV / XLSX）

## 技术栈

- 前端框架：`React 18`、`TypeScript`
- 构建工具：`Vite`
- UI 与样式：`Tailwind CSS`、`Radix UI`、`lucide-react`
- 图表：`Recharts`
- 状态管理：`Zustand`
- 文件与数据：`PapaParse`、`xlsx`
- 日期与工具：`date-fns`
- 路由：`react-router-dom`

## 快速开始

### 环境要求

- `Node.js >= 18`
- 推荐使用 `pnpm`（项目包含 `pnpm-lock.yaml`），也可使用 `npm`

### 安装依赖

```bash
pnpm install
# 或者
npm install
```

### 本地开发

```bash
pnpm dev
# 启动后访问 http://localhost:5173/
```

### 生产构建与预览

```bash
pnpm build
pnpm preview
# 预览默认 http://localhost:4173/
```

### 代码检查与类型检查

```bash
pnpm lint   # 运行 ESLint
pnpm check  # TypeScript 增量项目类型检查
```

## 目录结构

```
Personal_Accounts/
├── src/
│   ├── components/           # 组件库
│   │   ├── Charts.tsx        # 图表展示
│   │   ├── DataOverview.tsx  # 数据概览卡片
│   │   ├── DataTables.tsx    # 表格与明细
│   │   ├── DateRangePicker.tsx
│   │   ├── FileUpload.tsx    # 文件上传
│   │   └── ui/               # 基础 UI（Radix/Tailwind 封装）
│   ├── pages/
│   │   └── Home.tsx          # 主页入口
│   ├── store/
│   │   └── financialStore.ts # 财务数据状态管理
│   ├── utils/
│   │   ├── dataProcessor.ts  # 数据清洗与聚合
│   │   └── pdfExport.ts      # PDF 导出
│   ├── types/                # 类型定义
│   │   └── financial.ts
│   └── hooks/useTheme.ts     # 主题切换与监听
└── .trae/documents/          # 项目文档（中文）
```

## 使用说明

1. 在首页点击“上传文件”，选择 CSV 或 XLSX 数据文件（支持支付宝与微信支付账单导出文件）。
2. 系统自动解析并在“数据概览”与“图表”区域进行可视化展示。
3. 使用“日期范围选择器”筛选需要分析的时间区间。
4. 在需要时，点击“导出 PDF”生成当前视图的报表用于分享与留存。

## 数据来源与格式

- 支付宝：在“账单详情”页面导出 CSV 或 XLSX 文件。
- 微信支付：在“交易账单”页面导出 CSV 或 XLSX 文件。
- 建议使用 UTF-8 编码，包含基本字段：日期、交易类别、金额、备注/说明。

## 文档与参考

- 产品需求文档：`.trae/documents/财务分析仪表板-产品需求文档.md`
- 技术架构文档：`.trae/documents/财务分析仪表板-技术架构文档.md`

## 常见问题（FAQ）

- 无法解析文件：请确认文件为 CSV 或 XLSX 格式且编码正确。
- 图表数据为空：检查解析后数据是否包含有效记录与数值字段。
- PDF 导出模糊：提升浏览器缩放或在高分辨率屏幕导出以增强清晰度。
 - 支付宝/微信 CSV 乱码：导出为 UTF-8 编码或先转换为 UTF-8。

## 开发与贡献

- 欢迎提交 Issue 与 Pull Request 来改进功能与体验。
- 项目使用 ESLint + TypeScript 进行基础规范约束，提交前建议运行 `pnpm lint` 与 `pnpm check`。

