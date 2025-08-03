import express from 'express';
import Order from '../models/Order.js';
import { printOrder } from '../services/yilianyun.js';

const router = express.Router();

// 創建新訂單
router.post('/', async (req, res) => {
  console.log('收到創建訂單請求:', JSON.stringify(req.body, null, 2));
  try {
    const { items, subtotal, customerNotes } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('無效的訂單項目:', items);
      return res.status(400).json({
        success: false,
        message: '訂單項目不能為空',
        receivedData: req.body
      });
    }
    
    // 生成訂單號
    const orderNumber = await Order.generateOrderNumber();
    
    // 創建訂單
    const order = new Order({
      orderNumber,
      items,
      subtotal,
      customerNotes,
      status: 'pending'
    });

    // 保存訂單到數據庫
    const savedOrder = await order.save();
    
    try {
      // 嘗試打印訂單
      const printTaskId = await printOrder(items, orderNumber);
      
      // 更新訂單打印狀態
      savedOrder.printStatus = 'printed';
      savedOrder.printTaskId = printTaskId;
      savedOrder.printedAt = new Date();
      await savedOrder.save();
      
      res.status(201).json({
        success: true,
        order: savedOrder,
        message: '訂單已成功創建並發送到打印機'
      });
    } catch (printError) {
      console.error('打印訂單時出錯:', printError);
      
      // 更新訂單打印狀態為失敗
      savedOrder.printStatus = 'failed';
      await savedOrder.save();
      
      res.status(201).json({
        success: true,
        order: savedOrder,
        warning: '訂單已創建，但打印時出現問題',
        error: printError.message
      });
    }
  } catch (error) {
    console.error('創建訂單時出錯:', error);
    res.status(500).json({
      success: false,
      message: '創建訂單時出錯',
      error: error.message
    });
  }
});

// 更新訂單狀態
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: '狀態不能為空'
      });
    }
    
    // 驗證狀態值是否有效
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `無效的狀態值。允許的值為: ${validStatuses.join(', ')}`
      });
    }
    
    const order = await Order.findByIdAndUpdate(
      id,
      { 
        status,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '找不到指定的訂單'
      });
    }
    
    res.json({
      success: true,
      order,
      message: `訂單狀態已更新為: ${status}`
    });
    
  } catch (error) {
    console.error('更新訂單狀態時出錯:', error);
    res.status(500).json({
      success: false,
      message: '更新訂單狀態時出錯',
      error: error.message
    });
  }
});

// 獲取所有訂單
router.get('/', async (req, res) => {
  try {
    console.log('收到獲取訂單請求，查詢參數:', req.query);
    const { status, startDate, endDate } = req.query;
    
    // 構建查詢條件
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    console.log('構建的查詢條件:', JSON.stringify(query, null, 2));
    
    // 查詢所有訂單（不分頁）
    console.log('開始查詢所有訂單...');
    const startTime = Date.now();
    
    // 查詢訂單（不分頁）
    const orders = await Order.find(query)
      .sort({ createdAt: -1 });
      
    const total = orders.length;
    const queryTime = Date.now() - startTime;
    
    console.log(`查詢完成，共找到 ${total} 條訂單記錄，耗時 ${queryTime}ms`);
    
    if (orders.length > 0) {
      console.log('第一條訂單日期:', orders[0].createdAt);
      console.log('最後一條訂單日期:', orders[orders.length - 1].createdAt);
    }
    
    res.json({
      success: true,
      count: total,
      total,
      data: orders
    });
  } catch (error) {
    console.error('獲取訂單時出錯:', error);
    res.status(500).json({
      success: false,
      message: '獲取訂單時出錯',
      error: error.message
    });
  }
});

// 獲取單個訂單
router.get('/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const order = await Order.findOne({ orderNumber });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '未找到該訂單'
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('獲取訂單詳情時出錯:', error);
    res.status(500).json({
      success: false,
      message: '獲取訂單詳情時出錯',
      error: error.message
    });
  }
});

// 更新訂單狀態
router.patch('/:orderNumber/status', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: '無效的訂單狀態'
      });
    }
    
    const order = await Order.findOneAndUpdate(
      { orderNumber },
      { 
        status,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '未找到該訂單'
      });
    }
    
    res.json({
      success: true,
      message: '訂單狀態已更新',
      data: order
    });
  } catch (error) {
    console.error('更新訂單狀態時出錯:', error);
    res.status(500).json({
      success: false,
      message: '更新訂單狀態時出錯',
      error: error.message
    });
  }
});

// 重新打印訂單
router.post('/:orderNumber/reprint', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const order = await Order.findOne({ orderNumber });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '未找到該訂單'
      });
    }
    
    try {
      // 嘗試重新打印訂單
      const printTaskId = await printOrder(order.items, order.orderNumber);
      
      // 更新訂單打印狀態
      order.printStatus = 'printed';
      order.printTaskId = printTaskId;
      order.printedAt = new Date();
      await order.save();
      
      res.json({
        success: true,
        message: '訂單已重新發送到打印機',
        data: order
      });
    } catch (printError) {
      console.error('重新打印訂單時出錯:', printError);
      
      // 更新訂單打印狀態為失敗
      order.printStatus = 'failed';
      await order.save();
      
      res.status(500).json({
        success: false,
        message: '重新打印訂單時出錯',
        error: printError.message,
        data: order
      });
    }
  } catch (error) {
    console.error('處理重新打印請求時出錯:', error);
    res.status(500).json({
      success: false,
      message: '處理重新打印請求時出錯',
      error: error.message
    });
  }
});

export default router;
