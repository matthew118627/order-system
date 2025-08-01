import 'dotenv/config';
import { printOrder } from './services/yilianyun.js';

// 測試打印功能
async function testPrint() {
  try {
    console.log('=== 開始測試打印功能 ===');
    
    // 創建一個測試訂單
    const testOrder = [
      { name: '牛肉麵', quantity: 2, price: 120 },
      { name: '水餃', quantity: 1, price: 80, specialRequest: '不要加辣' },
      { name: '酸辣湯', quantity: 1, price: 50 }
    ];
    
    const orderNumber = `TEST-${Date.now().toString().slice(-6)}`;
    console.log(`正在發送測試訂單: ${orderNumber}`);
    
    const result = await printOrder(testOrder, orderNumber);
    console.log('打印請求成功，響應:', result);
    
  } catch (error) {
    console.error('測試打印時出錯:', error);
  }
}

testPrint();
