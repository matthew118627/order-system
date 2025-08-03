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
    const { machineCode, content, originId, phoneNumber } = req.body;
    console.log('收到打印請求，電話號碼:', phoneNumber || '未提供');
    
    if (!machineCode || !content) {
      return res.status(400).json({
        success: false,
        message: '缺少必要參數: machineCode 和 content 為必填項'
      });
    }

    const result = await printOrder(machineCode, content, originId, phoneNumber);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('打印訂單出錯:', error);
    res.status(500).json({
      success: false,
      message: error.message || '打印訂單失敗',
      error: process.env.NODE_ENV === 'development' ? error.stack : {}
    });
  }
});

export default router;
