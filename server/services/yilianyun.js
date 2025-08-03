import 'dotenv/config';
import axios from 'axios';
import { createHash, randomUUID } from 'crypto';
import https from 'https';
import http from 'http';
import dns from 'dns';
import { promisify } from 'util';

// 將回調風格的函數轉換為 Promise
const dnsLookup = promisify(dns.lookup);

// 從環境變量中獲取配置
const CLIENT_ID = process.env.YILIANYUN_CLIENT_ID || '';
const CLIENT_SECRET = process.env.YILIANYUN_CLIENT_SECRET || '';
const MACHINE_CODE = process.env.YILIANYUN_MACHINE_CODE || '';

// 調試信息
console.log('=== 環境變量配置 ===');
console.log('CLIENT_ID:', CLIENT_ID || '未設置');
console.log('CLIENT_SECRET 長度:', CLIENT_SECRET ? CLIENT_SECRET.length : 0);
console.log('MACHINE_CODE:', MACHINE_CODE || '未設置');
console.log('==================');

// 檢查必要的環境變量
if (!CLIENT_ID || !CLIENT_SECRET || !MACHINE_CODE) {
  console.error('錯誤：缺少必要的環境變量，請檢查 .env 文件');
  console.log('CLIENT_ID:', CLIENT_ID ? '已設置' : '未設置');
  console.log('CLIENT_SECRET:', CLIENT_SECRET ? '已設置' : '未設置');
  console.log('MACHINE_CODE:', MACHINE_CODE ? '已設置' : '未設置');
  process.exit(1);
}

// 存儲訪問令牌
let accessToken = '';
let tokenExpireTime = 0;

// 獲取服務器時間戳（秒）
async function getServerTimestamp() {
  try {
    const response = await axios.get('http://worldtimeapi.org/api/ip', { timeout: 3000 });
    if (response.data && response.data.unixtime) {
      const timestamp = parseInt(response.data.unixtime, 10);
      console.log('從 worldtimeapi 獲取服務器時間戳:', timestamp);
      return timestamp;
    }
  } catch (error) {
    console.warn('獲取服務器時間失敗，使用本地時間:', error.message);
  }
  // 如果獲取失敗，返回本地時間戳（秒）
  return Math.floor(Date.now() / 1000);
}

// 生成簽名
async function generateSignature() {
  // 確保 client_secret 沒有多餘的空格或換行
  const cleanClientSecret = CLIENT_SECRET.trim();
  const clientIdStr = String(CLIENT_ID).trim();
  
  // 使用服務器返回的時間戳
  let timestamp = Math.floor(Date.now() / 1000);
  
  try {
    // 使用 axios 獲取易聯雲服務器時間
    const response = await axios.get('https://open-api-os.10ss.net/v2/system/time', {
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    });
    
    if (response.data && response.data.timestamp) {
      timestamp = response.data.timestamp;
      console.log('使用易聯雲服務器時間戳:', timestamp);
    }
  } catch (error) {
    console.warn('獲取易聯雲服務器時間失敗，使用本地時間戳:', error.message);
  }
  
  const timestampStr = String(timestamp);
  
  // 用於日誌的北京時間
  const beijingTime = new Date(timestamp * 1000).toLocaleString('zh-TW', { 
    timeZone: 'Asia/Shanghai',
    hour12: false 
  });
  
  console.log('生成簽名時的 UTC 時間:', new Date(timestamp * 1000).toISOString());
  console.log('生成簽名時的北京時間:', beijingTime);
  
  // 按照文檔要求拼接簽名字符串：client_id + timestamp + client_secret
  const signStr = String(CLIENT_ID) + String(timestamp) + cleanClientSecret;
  
  console.log('\n=== 簽名調試信息 ===');
  console.log('1. client_id (raw):', JSON.stringify(CLIENT_ID), 'length:', String(CLIENT_ID).length);
  console.log('2. timestamp (raw):', timestamp, 'type:', typeof timestamp, 'length:', String(timestamp).length);
  console.log('3. client_secret (raw):', cleanClientSecret, 'length:', cleanClientSecret.length);
  
  console.log('\n簽名字符串拼接順序:');
  console.log('client_id (', String(CLIENT_ID), ') +');
  console.log('timestamp (', String(timestamp), ') +');
  console.log('client_secret (', cleanClientSecret, ')');
  
  console.log('\n完整簽名字符串:', signStr);
  console.log('簽名字符串長度:', signStr.length);
  
  const md5Hash = createHash('md5').update(signStr, 'utf8').digest('hex').toLowerCase();
  console.log('生成的 MD5 簽名 (小寫):', md5Hash);
  console.log('簽名長度:', md5Hash.length, '位');

  console.log('\n=== 簽名生成調試信息 ===');
  // 顯示 client_secret 的前後各2個字符，中間用...代替
  const secretDisplay = cleanClientSecret 
    ? `${cleanClientSecret.substring(0, 2)}...${cleanClientSecret.substring(cleanClientSecret.length - 2)}`
    : '空';
    
  console.log('client_id (類型:', typeof clientIdStr, '):', clientIdStr);
  console.log('timestamp (類型:', typeof timestampStr, '):', timestampStr);
  console.log('client_secret (類型:', typeof cleanClientSecret, '):', secretDisplay);
  console.log('簽名字符串 (client_id + timestamp + client_secret):', clientIdStr + timestampStr + secretDisplay);
  console.log('簽名字符串長度:', signStr.length);
  
  // 計算MD5並轉小寫
  const sign = createHash('md5').update(signStr, 'utf8').digest('hex').toLowerCase();
  console.log('生成的簽名 (MD5小寫):', sign);
  console.log('簽名長度:', sign.length);
  console.log('=== 簽名生成完成 ===\n');
  
  return { sign, timestamp };
}

// 生成符合易聯雲要求的UUID
function generateNonce() {
  // 生成符合UUID v4標準的隨機字符串
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// 獲取訪問令牌
export async function getAccessToken() {
  console.log('\n=== 開始獲取訪問令牌 ===');
  const now = Math.floor(Date.now() / 1000);
  console.log('當前本地時間:', new Date().toISOString());
  console.log('當前時間戳(秒):', now);
  
  // 檢查緩存的令牌是否有效
  if (accessToken && now < tokenExpireTime) {
    console.log('使用緩存的訪問令牌，到期時間:', new Date(tokenExpireTime * 1000).toISOString());
    return accessToken;
  }
  
  try {
    // 使用海外API端點（因為我們在台灣）
    const API_BASE_URL = 'https://open-api-os.10ss.net/v2';
    
    console.log('\n=== 準備請求參數 ===');
    const client_id = String(CLIENT_ID).trim();
    const id = generateNonce();
    
    // 生成簽名（包含時間戳）
    console.log('正在生成簽名...');
    const { sign, timestamp } = await generateSignature();

    // 構建請求參數（只包含參數值）
    const params = {
      client_id: CLIENT_ID,
      grant_type: 'client_credentials',
      scope: 'all',
      timestamp: timestamp.toString(),
      sign: sign,
      id: id
    };
    
    // 構建請求參數，確保類型正確
    const requestParams = new URLSearchParams();
    requestParams.append('client_id', String(CLIENT_ID));
    requestParams.append('grant_type', 'client_credentials');
    requestParams.append('scope', 'all');
    requestParams.append('timestamp', String(timestamp)); // 確保是字符串
    requestParams.append('sign', sign);
    requestParams.append('id', id);
    
    // 記錄完整的調試信息
    console.log('\n=== 簽名生成信息 ===');
    console.log('使用的 client_id:', client_id);
    console.log('使用的時間戳 (秒):', timestamp);
    console.log('生成的隨機 ID:', id);
    
    // 顯示簽名相關信息（不顯示完整的 client_secret）
    const secretDisplay = CLIENT_SECRET ? 
      `${CLIENT_SECRET.substring(0, 2)}...${CLIENT_SECRET.substring(CLIENT_SECRET.length - 2)}` : 
      '未設置';
    
    console.log('client_secret 長度:', CLIENT_SECRET ? CLIENT_SECRET.length : 0);
    console.log('client_secret 首尾:', secretDisplay);
    console.log('生成的簽名 (MD5 小寫):', sign);
    
    // 顯示請求參數（不包含敏感信息）
    const debugParams = { ...params };
    if (debugParams.sign) debugParams.sign = sign.substring(0, 8) + '...';
    console.log('\n=== 請求參數 ===');
    console.log(JSON.stringify(debugParams, null, 2));
    
    const requestConfig = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Node.js/axios',
        'Accept': 'application/json'
      },
      timeout: 10000,
      httpAgent: new http.Agent({ keepAlive: true }),
      httpsAgent: new https.Agent({ keepAlive: true })
    };
    
    console.log('\n=== 發送獲取令牌請求 ===');
    console.log('請求URL:', `${API_BASE_URL}/oauth/oauth`);
    console.log('請求頭:', JSON.stringify(requestConfig.headers, null, 2));
    
    // 發送請求
    const response = await axios({
      method: 'post',
      url: `${API_BASE_URL}/oauth/oauth`,
      data: requestParams.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Node.js/axios',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Connection': 'keep-alive'
      },
      timeout: 15000, // 增加超時時間
      httpAgent: new http.Agent({ keepAlive: true }),
      httpsAgent: new https.Agent({ keepAlive: true })
    });
    
    console.log('請求成功，狀態碼:', response.status);
    console.log('響應數據:', JSON.stringify(response.data, null, 2));
    
    // 處理響應
    if (response.data && response.data.body) {
      const { access_token, expires_in, refresh_token } = response.data.body;
      if (access_token && expires_in) {
        accessToken = access_token;
        tokenExpireTime = now + parseInt(expires_in, 10) - 300; // 提前5分鐘過期
        console.log('獲取訪問令牌成功，將於', new Date(tokenExpireTime * 1000).toISOString(), '過期');
        return accessToken;
      }
    }
    
    throw new Error('獲取訪問令牌失敗：響應數據格式不正確');
    
  } catch (error) {
    console.error('獲取訪問令牌出錯:', error.response ? {
      status: error.response.status,
      statusText: error.response.statusText,
      data: error.response.data
    } : error.message);
    throw new Error(`獲取訪問令牌失敗: ${error.message}`);
  }
}

// 打印訂單
export async function printOrder(items, orderNumber, phoneNumber = '') {
  try {
    console.log('\n=== 開始打印訂單 ===');
    console.log('訂單號:', orderNumber);
    
    // 獲取訪問令牌
    console.log('正在獲取訪問令牌...');
    const token = await getAccessToken();
    
    // 確保 token 是字符串
    if (typeof token !== 'string') {
      console.error('錯誤：獲取的 access_token 不是字符串:', token);
      throw new Error('無效的訪問令牌');
    }
    
    console.log('獲取訪問令牌成功');
    
    // 格式化訂單內容，傳遞電話號碼
    const content = formatOrderContent(items, orderNumber, phoneNumber);
    
    // 構建請求參數
    const params = {
      client_id: CLIENT_ID,
      access_token: token,
      machine_code: MACHINE_CODE,
      content: content,
      origin_id: orderNumber,
      id: generateNonce(),
      timestamp: Math.floor(Date.now() / 1000).toString(),
    };

    // 生成簽名
    console.log('\n=== 生成簽名 ===');
    
    // 1. 準備簽名參數
    const timestamp = params.timestamp;
    const clientId = CLIENT_ID.trim();
    const clientSecret = CLIENT_SECRET.trim();
    
    // 2. 按照 client_id + timestamp + client_secret 的順序拼接
    const signContent = clientId + timestamp + clientSecret;
    
    // 3. 計算 MD5 並轉小寫
    const sign = createHash('md5')
      .update(signContent, 'utf8')
      .digest('hex')
      .toLowerCase();
    
    // 4. 添加簽名到請求參數
    params.sign = sign;
    
    // 調試日誌
    console.log('簽名參數:');
    console.log('  client_id:', clientId);
    console.log('  timestamp:', timestamp);
    console.log('  client_secret:', clientSecret.replace(/./g, '*'));
    console.log('簽名字符串 (client_id + timestamp + client_secret):', 
      `${clientId}${timestamp}${clientSecret.replace(/./g, '*')}`);
    console.log('生成的簽名 (MD5小寫):', sign);
    
    // 記錄發送的參數（不包含敏感信息）
    const debugParams = { ...params };
    if (debugParams.content) debugParams.content = '[內容已省略]';
    if (debugParams.access_token) debugParams.access_token = '***' + debugParams.access_token.slice(-4);
    
    console.log('\n=== 發送打印請求 ===');
    // 定義 API 基礎 URL - 使用境外域名
    const API_BASE_URL = 'https://open-api-os.10ss.net/v2';
    const requestUrl = `${API_BASE_URL}/print/index`;
    
    // 準備請求數據
    const requestData = new URLSearchParams(params).toString();
    
    console.log('請求URL:', requestUrl);
    console.log('請求頭:', JSON.stringify({
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Node.js/axios',
      'Accept': 'application/json',
      'Content-Length': Buffer.byteLength(requestData)
    }, null, 2));
    
    // 記錄請求數據（敏感信息已過濾）
    console.log('請求數據 (敏感信息已過濾):', 
      requestData
        .replace(/access_token=[^&]*/, 'access_token=***')
        .replace(/sign=[^&]*/, 'sign=***')
    );
    
    try {
      console.log('\n=== 發送HTTP請求 ===');
      const startTime = Date.now();
      
      const response = await axios({
        method: 'post',
        url: requestUrl,
        data: requestData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Node.js/axios',
          'Accept': 'application/json',
          'Content-Length': Buffer.byteLength(requestData)
        },
        timeout: 15000,
        httpsAgent: new https.Agent({  
          rejectUnauthorized: false, // 跳過 SSL 證書驗證
          keepAlive: true
        })
      });
      
      const endTime = Date.now();
      console.log(`請求完成，耗時: ${endTime - startTime}ms`);
      
      console.log('\n=== 打印API響應 ===');
      console.log('狀態碼:', response.status);
      console.log('響應頭:', JSON.stringify(response.headers, null, 2));
      console.log('響應數據:', JSON.stringify(response.data, null, 2));
      
      if (response.data.error) {
        throw new Error(`打印失敗: ${response.data.error_description || response.data.error}`);
      }
      
      return response.data.body?.id || null;
      
    } catch (error) {
      console.error('\n=== 請求過程中出錯 ===');
      if (error.response) {
        console.error('錯誤響應狀態碼:', error.response.status);
        console.error('錯誤響應數據:', error.response.data);
      } else if (error.request) {
        console.error('請求已發送但未收到響應:', error.request);
      } else {
        console.error('請求設置出錯:', error.message);
      }
      throw error;
    }
  } catch (error) {
    console.error('打印訂單時出錯:', error.response?.data || error.message);
    throw new Error(`打印訂單失敗: ${error.message}`);
  }
}

// 格式化訂單內容，創建簡潔環保的收據格式
function formatOrderContent(items, orderNumber, phoneNumber = '') {
  // 初始化內容數組
  const content = [];
  
  // 獲取當前日期時間（本地時間格式，12小時制）
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // 只取後兩位數年份
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  // 12小時制時間格式
  let hours = now.getHours();
  const ampm = hours >= 12 ? '下午' : '上午';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 應該轉換為 12
  const timeStr = `${ampm} ${String(hours).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  const dateStr = `${year}-${month}-${day} ${timeStr}`;

  // 計算總金額和總數量
  const subtotal = items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  
  // 添加表頭
  if (phoneNumber && phoneNumber.trim()) {
    content.push(`<FS2>${phoneNumber}</FS2>`);
  }
  
  content.push(
    '鮮 有限公司',
    `時間:${dateStr}`,
    '--------------------------------',
    '品名  數量  小計',
    '--------------------------------'
  );

  // 添加每個商品
  items.forEach((item, index) => {
    const quantity = item.quantity || 1;
    const itemTotal = item.price * quantity;
    const formattedTotal = itemTotal.toFixed(1); // 保留一位小數
    const itemNumber = (index + 1).toString().padStart(2, '0'); // 兩位數序號

    // 添加商品行
    content.push(`${itemNumber}.${item.name}  ${quantity}個   $${formattedTotal}`);

    // 處理自定義菜品的備註
    const note = item.specialRequest || item.notes || item.remarks || '';
    // 處理備註陣列（如果存在）
    const notes = Array.isArray(note) ? note : [note];
    
    // 添加所有備註
    notes.forEach(noteItem => {
      if (noteItem && noteItem.trim()) {
        content.push(`備注:${noteItem.trim()}`);
      }
    });

    // 添加分隔線
    content.push('--------------------------------');
  });

  // 添加總計
  content.push(
    `數量:${totalQuantity}`,
    `實付:$${subtotal.toFixed(1)}`,
    '\n\n\n'  // 添加空行（確保打印完成）
  );
  
  // 直接返回內容，不添加任何打印指令
  return content.join('\n');
}
// 獲取打印機狀態
export async function getPrinterStatus() {
try {
  const token = await getAccessToken();
    
    const params = {
      client_id: CLIENT_ID,
      access_token: token,
      machine_code: MACHINE_CODE,
      id: generateNonce(),
      timestamp: Math.floor(Date.now() / 1000).toString(),
    };

    params.sign = generateSign(params);

    // 直接發送參數值，不帶參數名
    const requestBody = [
      CLIENT_ID,
      token,
      MACHINE_CODE,
      params.id,
      params.timestamp,
      params.sign
    ].join('&');

    const response = await axios.post('https://open-api.10ss.net/printer/status', requestBody, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Node.js/axios',
        'Accept': 'application/json'
      },
      timeout: 15000
    });
    
    if (response.data && response.data.body) {
      return {
        status: response.data.body.state,
        statusText: getStatusText(response.data.body.state),
        online: response.data.body.online === 1,
        ...response.data.body
      };
    }
    throw new Error('獲取打印機狀態失敗：響應數據格式不正確');
  } catch (error) {
    console.error('獲取打印機狀態時出錯:', error.response?.data || error.message);
    throw new Error(`獲取打印機狀態失敗: ${error.message}`);
  }
}

// 獲取狀態文本
function getStatusText(status) {
  const statusMap = {
    0: '正常',
    1: '缺紙',
    2: '機蓋打開',
    3: '打印頭過熱',
    4: '暫停',
    5: '緩存中',
    6: '其他錯誤'
  };
  return statusMap[status] || `未知狀態(${status})`;
}
// 在模塊加載時輸出調試信息
console.log('當前本地時間:', new Date().toISOString());
console.log('當前時間戳(秒):', Math.floor(Date.now() / 1000));

// 確保環境變量已正確加載
if (!CLIENT_ID || !CLIENT_SECRET || !MACHINE_CODE) {
  console.error('❌ 錯誤：缺少必要的環境變量');
  console.error('請檢查 .env 文件中的以下變量是否已正確設置：');
  console.error('- YILIANYUN_CLIENT_ID');
  console.error('- YILIANYUN_CLIENT_SECRET');
  console.error('- YILIANYUN_MACHINE_CODE');
  process.exit(1);
}