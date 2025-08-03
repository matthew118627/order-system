/**
 * 易聯雲打印服務
 * 用於與易聯雲API通信，實現訂單打印功能
 */

// 易聯雲API憑證
const CLIENT_ID = '1048944806';
const CLIENT_SECRET = 'c23232d900d7a255c16eccc20b08a7c8';
const MACHINE_CODE = '4004933591';

// 後端 API 基礎 URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV ? 'http://localhost:3001/api' : 'https://order-system-production-9479.up.railway.app/api');

console.log('易聯雲 API 基礎 URL:', API_BASE_URL);

// 存儲訪問令牌
let accessToken = '';
let tokenExpireTime = 0;

// 導出函數
export { printOrder };

/**
 * 獲取訪問令牌
 */
async function getAccessToken() {
  // 如果令牌未過期，直接返回緩存的令牌
  if (accessToken && Date.now() < tokenExpireTime) {
    return accessToken;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/oauth/token`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // 不再需要手動構建簽名，後端會處理
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('獲取訪問令牌失敗:', data.error_description);
      throw new Error(data.error_description || '獲取訪問令牌失敗');
    }

    // 更新訪問令牌和過期時間（提前5分鐘過期）
    accessToken = data.access_token;
    tokenExpireTime = Date.now() + (data.expires_in - 300) * 1000;
    
    return accessToken;
  } catch (error) {
    console.error('獲取訪問令牌出錯:', error);
    throw error;
  }
}

/**
 * 發送打印請求並保存訂單到後端
 * @param {Array} orderItems 訂單項目數組
 * @param {string} orderId 訂單ID
 * @param {string} phoneNumber 客戶電話號碼
 * @returns {Promise} 打印任務ID
 */
async function printOrder(orderItems, orderId, phoneNumber = '') {
  console.log('準備發送打印請求，電話號碼:', phoneNumber);
  
  // 轉換菜單項為後端期望的格式
  const formattedItems = orderItems.map(item => ({
    itemId: item.id.split('-')[0], // 移除時間戳部分
    name: item.name,
    price: item.price,
    quantity: item.quantity || 1,
    specialRequest: item.specialRequest || '',
    cookingStyle: item.cookingStyle || '',
    mainIngredient: item.mainIngredient || '',
    addOns: item.addOns || []
  }));

  // 計算總金額
  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  
  // 構建請求體
  const requestBody = {
    items: formattedItems,
    orderNumber: orderId,
    phoneNumber: phoneNumber ? String(phoneNumber).trim() : '',
    subtotal: subtotal
  };
  
  console.log('發送到後端的請求體:', JSON.stringify(requestBody, null, 2));

  // 保存訂單並發送到打印機
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('保存訂單到後端失敗:', errorData);
      throw new Error(errorData.message || '保存訂單失敗');
    }
    
    return await response.json();
  } catch (error) {
    console.error('保存訂單到後端時出錯:', error);
    throw error; // 重新拋出錯誤，讓調用方處理
  }
  
  // 然後發送打印請求
  try {
    const token = await getAccessToken();
    
    // 構建打印內容
    let content = '';
    content += `<CB>訂單 #${orderId}</CB><BR>`;
    content += '------------------------<BR>';
    content += '<B>餐廳點餐系統</B><BR>';
    content += `時間: ${new Date().toLocaleString()}<BR>`;
    content += '------------------------<BR>';
    content += '<B>商品名稱        數量   單價  小計</B><BR>';
    content += '------------------------<BR>';
    
    // 添加訂單項目
    orderItems.forEach(item => {
      const name = item.name.length > 10 ? item.name.substring(0, 10) + '...' : item.name;
      const quantity = item.quantity || 1;
      const price = item.price.toFixed(2);
      const subtotal = (quantity * item.price).toFixed(2);
      
      content += `${name}<BR>`;
      content += `  ${quantity} x ${price} = ${subtotal}<BR>`;
      
      // 如果有特殊要求，添加備註
      if (item.specialRequest) {
        content += `  備註: ${item.specialRequest}<BR>`;
      }
    });
    
    content += '------------------------<BR>';
    
    // 計算總價
    const total = orderItems.reduce((sum, item) => {
      return sum + (item.price * (item.quantity || 1));
    }, 0);
    
    content += `<RIGHT>總計: ${total.toFixed(2)}</RIGHT><BR>`;
    content += '------------------------<BR>';
    content += '<C>感謝您的惠顧！</C><BR>';
    content += '<C>歡迎再次光臨</C><BR>';

    // 轉換菜單項為後端期望的格式
    const formattedItems = orderItems.map(item => ({
      itemId: item.id || Date.now().toString(),
      name: item.name,
      price: item.price,
      quantity: item.quantity || 1,
      specialRequest: item.specialRequest || '',
      cookingStyle: item.cookingStyle || '',
      mainIngredient: item.mainIngredient || '',
      addOns: item.addOns || []
    }));

    // 發送打印請求到後端
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: formattedItems,
        subtotal: total,
        customerNotes: ''
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '打印請求失敗');
    }

    const data = await response.json();
    return data.data?.printTaskId || 'unknown';
  } catch (error) {
    console.error('打印訂單時出錯:', error);
    throw error;
  }
}

/**
 * 查詢打印機狀態
 * @returns {Promise} 打印機狀態信息
 */
export async function getPrinterStatus() {
  try {
    const token = await getAccessToken();
    
    const response = await fetch(`${API_BASE_URL}/printer/status`);
    
    if (!response.ok) {
      throw new Error('獲取打印機狀態失敗');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('獲取打印機狀態時出錯:', error);
    throw error;
  }
}

/**
 * 獲取打印機狀態文本描述
 */
const getPrinterStatusText = (statusCode) => {
  const statusMap = {
    0: '正常',
    1: '缺紙',
    2: '機蓋打開',
    3: '打印頭過熱',
    4: '暫停',
    5: '緩存中',
    6: '其他錯誤'
  };
  
  return statusMap[statusCode] || `未知狀態 (${statusCode})`;
};
