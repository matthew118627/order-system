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
 * @returns {Promise} 打印任務ID
 */
async function printOrder(orderItems, orderId) {
  try {
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

    // 保存訂單到後端
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderNumber: orderId,
        items: formattedItems,
        subtotal: orderItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0)
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('保存訂單到後端失敗:', errorData);
      throw new Error(errorData.message || '保存訂單失敗');
    }
    
    const orderData = await response.json();
    
    // 使用本地時間，確保時區正確
    const now = new Date();
    // 使用本地時間的各個部分
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const formattedTime = `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
    
    // 構建打印內容
    let content = '';
    content += `<CB>訂單 #${orderId}</CB><BR>`;
    content += '------------------------<BR>';
    content += '<B>餐廳點餐系統</B><BR>';
    content += `時間: ${formattedTime}<BR>`;
    content += '------------------------<BR>';
    content += '<B>商品名稱        數量   單價  小計</B><BR>';
    content += '------------------------<BR>';
    
    // 添加訂單項目
    orderItems.forEach(item => {
      const itemTotal = item.price * (item.quantity || 1);
      content += `${item.name}  x${item.quantity || 1}  $${item.price.toFixed(2)}  $${itemTotal.toFixed(2)}<BR>`;
      
      // 如果有特殊要求或備註，添加到打印內容中
      if (item.specialRequest) {
        content += `  - ${item.specialRequest}<BR>`;
      }
      
      // 如果有烹飪方式或主料，添加到打印內容中
      if (item.cookingStyle || item.mainIngredient) {
        const details = [];
        if (item.cookingStyle) details.push(item.cookingStyle);
        if (item.mainIngredient) details.push(item.mainIngredient);
        content += `  (${details.join(' + ')})\n`;
      }
      
      // 如果有附加選項，添加到打印內容中
      if (item.addOns && item.addOns.length > 0) {
        item.addOns.forEach(addOn => {
          content += `  + ${addOn}<BR>`;
        });
      }
      
      content += '------------------------<BR>';
    });
    
    // 添加總計
    const total = orderItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    
    content += `<RIGHT>總計: ${total.toFixed(2)}</RIGHT><BR>`;
    content += '------------------------<BR>';
    content += '<C>感謝您的惠顧！</C><BR>';
    content += '<C>歡迎再次光臨</C><BR>';

    // 發送打印請求到後端 API
    const printResponse = await fetch(`${API_BASE_URL}/yilianyun-proxy/print`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        machineCode: MACHINE_CODE,
        content: content,
        originId: orderId
      })
    });

    if (!printResponse.ok) {
      const errorData = await printResponse.json();
      throw new Error(errorData.message || '發送打印請求失敗');
    }

    const result = await printResponse.json();
    return result.data?.id || 'unknown';
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
