import express from 'express';
import { getAccessToken } from '../services/yilianyun.js';

const router = express.Router();

// 獲取訪問令牌
router.get('/oauth/token', async (req, res) => {
  console.log('\n=== 收到獲取訪問令牌請求 ===');
  console.log('請求時間:', new Date().toISOString());
  console.log('請求頭:', JSON.stringify(req.headers, null, 2));
  
  try {
    console.log('開始調用 getAccessToken()...');
    const token = await getAccessToken();
    console.log('成功獲取訪問令牌');
    
    res.json({
      success: true,
      access_token: token,
      expires_in: 3600 // 假設令牌有效期為1小時
    });
  } catch (error) {
    console.error('\n=== 獲取訪問令牌時出錯 ===');
    console.error('錯誤時間:', new Date().toISOString());
    console.error('錯誤堆棧:', error.stack);
    console.error('錯誤詳情:', {
      name: error.name,
      message: error.message,
      code: error.code,
      response: error.response?.data || '無響應數據'
    });
    
    // 檢查是否是Axios錯誤
    if (error.isAxiosError) {
      console.error('Axios錯誤詳情:', {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        data: error.config?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseHeaders: error.response?.headers,
        responseData: error.response?.data
      });
    }
    
    res.status(500).json({
      success: false,
      message: '獲取訪問令牌時出錯',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        code: error.code,
        response: error.response?.data
      } : undefined
    });
  }
});

export default router;
