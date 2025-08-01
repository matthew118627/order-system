import 'dotenv/config';
import { printOrder } from './services/yilianyun.js';

// 測試訂單數據
const testOrder = {
  items: [
    {
      itemId: 'test-item-1',
      name: '測試菜品',
      price: 68,
      quantity: 1,
      specialRequest: '',
      cookingStyle: '',
      mainIngredient: '',
      addOns: []
    }
  ],
  subtotal: 68,
  customerNotes: '測試備註'
};

// 生成訂單號
const orderNumber = 'TEST-' + Date.now().toString().slice(-6);

// 執行測試
console.log('=== 開始測試打印訂單 ===');
console.log(`訂單號: ${orderNumber}`);
console.log('訂單內容:', JSON.stringify(testOrder, null, 2));

printOrder(testOrder.items, orderNumber)
  .then(() => {
    console.log('=== 打印請求發送成功 ===');
    process.exit(0);
  })
  .catch(error => {
    console.error('=== 打印過程中出錯 ===');
    console.error(error);
    process.exit(1);
  });
