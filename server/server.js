import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前模块的目录名
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载根目录下的 .env 文件
const envPath = path.resolve(process.cwd(), '.env');
console.log('正在加载环境变量文件:', envPath);

try {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.error('加载环境变量文件时出错:', result.error);
    process.exit(1);
  }
  console.log('环境变量文件加载成功');
  console.log('YILIANYUN_CLIENT_ID:', process.env.YILIANYUN_CLIENT_ID ? '已设置' : '未设置');
  console.log('YILIANYUN_CLIENT_SECRET:', process.env.YILIANYUN_CLIENT_SECRET ? '已设置' : '未设置');
  console.log('YILIANYUN_MACHINE_CODE:', process.env.YILIANYUN_MACHINE_CODE ? '已设置' : '未设置');
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? '已设置' : '未设置');
} catch (error) {
  console.error('加载环境变量文件时发生错误:', error);
  process.exit(1);
}

// 检查必要的环境变量
const requiredEnvVars = [
  'YILIANYUN_CLIENT_ID',
  'YILIANYUN_CLIENT_SECRET',
  'YILIANYUN_MACHINE_CODE',
  'MONGODB_URI'
];

let hasMissingEnv = false;
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`錯誤：缺少必要的環境變量 ${envVar}`);
    hasMissingEnv = true;
  }
}

if (hasMissingEnv) {
  console.error('錯誤：缺少必要的環境變量，請檢查 .env 文件');
  process.exit(1);
}
import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import connectDB from './config/db.js';

// 導入路由
import orderRoutes from './routes/orderRoutes.js';
import authRoutes from './routes/authRoutes.js';

// 初始化 Express 應用
const app = express();
const PORT = process.env.PORT || 3001;

// 連接 MongoDB 數據庫
connectDB();

// 中間件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 日誌中間件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// 易聯雲 API 代理配置
const yilianyunProxy = createProxyMiddleware({
  target: 'https://open-api.10ss.net',
  changeOrigin: true,
  pathRewrite: {
    '^/api/yilianyun': '' // 移除 /api/yilianyun 前綴
  },
  onProxyReq: (proxyReq, req) => {
    // 添加必要的請求頭
    proxyReq.setHeader('Content-Type', 'application/x-www-form-urlencoded');
    
    // 如果是 POST 請求，且包含請求體，則轉換為 URL 編碼格式
    if (req.body && (req.method === 'POST' || req.method === 'PUT')) {
      const bodyData = Object.keys(req.body).map(key => 
        `${encodeURIComponent(key)}=${encodeURIComponent(req.body[key])}`
      ).join('&');
      
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
      proxyReq.end();
    }
  },
  onError: (err, req, res) => {
    console.error('易聯雲 API 代理錯誤:', err);
    res.status(500).json({ 
      success: false, 
      message: '易聯雲 API 代理錯誤',
      error: err.message 
    });
  }
});

// 路由
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);

// 易聯雲SDK路由
import yilianyunRoutes from './routes/yilianyunRoutes.js';
app.use('/api/yilianyun', yilianyunRoutes);
app.use('/api/yilianyun', yilianyunProxy);

// 健康檢查端點
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version
  });
});

// 處理 404 錯誤
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '未找到請求的資源',
    path: req.originalUrl
  });
});

// 全局錯誤處理中間件
app.use((err, req, res, next) => {
  console.error('服務器錯誤:', err);
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || '服務器內部錯誤',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

// 啟動服務器
const server = app.listen(PORT, () => {
  console.log(`服務器運行在 http://localhost:${PORT}`);
  console.log(`環境: ${process.env.NODE_ENV || 'development'}`);
});

// 處理未捕獲的 Promise 拒絕
process.on('unhandledRejection', (err) => {
  console.error('未捕獲的 Promise 拒絕:', err);
  
  // 優雅關閉服務器
  server.close(() => {
    console.log('服務器已關閉');
    process.exit(1);
  });
});

// 處理未捕獲的異常
process.on('uncaughtException', (err) => {
  console.error('未捕獲的異常:', err);
  
  // 優雅關閉服務器
  server.close(() => {
    console.log('服務器已關閉');
    process.exit(1);
  });
});

// 處理進程終止信號
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信號，準備關閉服務器');
  
  server.close(() => {
    console.log('服務器已關閉');
    process.exit(0);
  });
});

export default server;
