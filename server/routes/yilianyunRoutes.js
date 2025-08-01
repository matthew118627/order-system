import express from 'express';
import { getAccessToken, printOrder } from '../services/yilianyun-http.js';

const router = express.Router();

// 獲取訪問令牌
router.get('/token', async (req, res) => {
  try {
    const result = await getAccessToken();
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('獲取訪問令牌出錯:', error);
    res.status(500).json({
      success: false,
      message: error.message || '獲取訪問令牌失敗',
      error: process.env.NODE_ENV === 'development' ? error.stack : {}
    });
  }
});

// 打印訂單
router.post('/print', async (req, res) => {
  try {
    console.log('收到打印請求:', JSON.stringify({
      body: req.body,
      headers: req.headers
    }, null, 2));

    const { machineCode, content, originId } = req.body;
    
    if (!machineCode) {
      console.error('缺少必要參數: machineCode');
      return res.status(400).json({
        success: false,
        message: '缺少必要參數: machineCode 為必填項'
      });
    }

    if (!content) {
      console.error('缺少必要參數: content');
      return res.status(400).json({
        success: false,
        message: '缺少必要參數: content 為必填項'
      });
    }

    console.log('開始處理打印請求...');
    const result = await printOrder(machineCode, content, originId);
    
    console.log('打印請求處理完成:', JSON.stringify(result, null, 2));
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('打印訂單出錯:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    
    res.status(500).json({
      success: false,
      message: error.message || '打印訂單失敗',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack,
        response: error.response?.data
      } : {}
    });
  }
});

export default router;
