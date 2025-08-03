// API 基礎 URL 配置
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV 
    ? 'http://localhost:3001/api' 
    : 'https://order-system-production-9479.up.railway.app/api'
  );

console.log('當前 API 基礎 URL:', API_BASE_URL);
