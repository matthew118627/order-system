// 確保 dotenv 配置在文件頂部加載
import 'dotenv/config';
import axios from 'axios';
import { createHash } from 'crypto';
import https from 'https';

// 從環境變量中獲取配置
const CLIENT_ID = process.env.YILIANYUN_CLIENT_ID || '';
const CLIENT_SECRET = process.env.YILIANYUN_CLIENT_SECRET || '';

// 生成隨機ID
function generateNonce() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// 創建自定義的 axios 實例，跳過 SSL 證書驗證
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({  
    rejectUnauthorized: false, // 跳過 SSL 證書驗證
    keepAlive: true
  }),
  timeout: 10000
});

async function testToken() {
  try {
    console.log('=== 測試獲取訪問令牌 ===');
    console.log('當前工作目錄:', process.cwd());
    
    // 使用 ES 模塊方式導入 path
    const path = await import('path');
    const envPath = path.resolve(process.cwd(), '.env');
    console.log('加載的 .env 文件路徑:', envPath);
    
    // 驗證環境變量
    if (!CLIENT_ID || !CLIENT_SECRET) {
      console.error('錯誤：缺少必要的環境變量');
      console.log('CLIENT_ID:', CLIENT_ID || '未設置');
      console.log('CLIENT_SECRET:', CLIENT_SECRET ? '已設置' : '未設置');
      return;
    }
    
    console.log('Client ID:', CLIENT_ID);
    console.log('Client Secret 長度:', CLIENT_SECRET.length);
    console.log('Client Secret 前後2位:', 
      CLIENT_SECRET.substring(0, 2) + '...' + CLIENT_SECRET.substring(CLIENT_SECRET.length - 2)
    );
    
    // 使用本地時間戳
    const timestamp = Math.floor(Date.now() / 1000);
    console.log('\n=== 時間信息 ===');
    console.log('本地時間戳 (秒):', timestamp);
    console.log('UTC 時間:', new Date(timestamp * 1000).toISOString());
    
    // 生成簽名
    console.log('\n=== 生成簽名 ===');
    // 生成隨機ID
    const requestId = generateNonce();
    
    // 構建參數對象（按照參數名排序）
    const paramsObj = {
      client_id: CLIENT_ID.trim(),
      grant_type: 'client_credentials',
      scope: 'all',
      timestamp: timestamp.toString(),
      id: requestId
    };
    
    // 按照參數名排序
    const sortedKeys = Object.keys(paramsObj).sort();
    
    // 構建簽名字符串（只拼接參數值）
    let signContent = '';
    sortedKeys.forEach(key => {
      signContent += paramsObj[key];
    });
    
    // 添加 client_secret 到簽名字符串
    signContent += CLIENT_SECRET.trim();
    
    // 記錄簽名相關信息
    console.log('\n=== 簽名生成過程 ===');
    console.log('1. 參數對象 (按參數名排序後):');
    sortedKeys.forEach(key => {
      console.log(`   ${key}: ${paramsObj[key]}`);
    });
    
    console.log('2. 簽名字符串 (參數值按參數名排序後直接拼接):');
    console.log('   ' + sortedKeys.map(k => paramsObj[k]).join(''));
    
    console.log('3. 添加 client_secret 後:');
    console.log('   ' + signContent);
    
    // 計算 MD5 簽名（確保所有字符都轉為小寫）
    const sign = createHash('md5')
      .update(signContent.toLowerCase(), 'utf8')  // 確保簽名字符串轉為小寫
      .digest('hex')
      .toLowerCase();  // 再次確保結果為小寫
      
    console.log('4. MD5 簽名 (小寫):', sign);
    
    // 構建請求參數（使用上面生成的 requestId）
    const params = new URLSearchParams();
    params.append('client_id', paramsObj.client_id);
    params.append('grant_type', paramsObj.grant_type);
    params.append('scope', paramsObj.scope);
    params.append('timestamp', paramsObj.timestamp);
    params.append('sign', sign);
    params.append('id', paramsObj.id);
    
    // 記錄實際發送的參數
    console.log('\n=== 請求參數 ===');
    console.log('請求 URL: https://open-api-os.10ss.net/v2/oauth/oauth');
    console.log('Content-Type: application/x-www-form-urlencoded');
    console.log('請求體:');
    console.log(params.toString());
    
    console.log('\n=== 發送請求 ===');
    console.log('請求 URL: https://open-api-os.10ss.net/v2/oauth/oauth');
    console.log('請求參數:');
    console.log('client_id:', CLIENT_ID);
    console.log('grant_type: client_credentials');
    console.log('scope: all');
    console.log('timestamp:', timestamp);
    console.log('sign:', sign);
    
    // 發送請求
    console.log('\n=== 發送請求 ===');
    const startTime = Date.now();
    
    // 使用自定義的 axios 實例發送請求
    const response = await axiosInstance({
      method: 'post',
      url: 'https://open-api-os.10ss.net/v2/oauth/oauth',
      data: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Node.js/axios',
        'Accept': 'application/json'
      }
    });
    
    const endTime = Date.now();
    console.log(`請求耗時: ${endTime - startTime}ms`);
    
    console.log('\n=== 響應數據 ===');
    console.log('狀態碼:', response.status);
    console.log('響應數據:', response.data);
    
    if (response.data && response.data.body && response.data.body.access_token) {
      console.log('\n=== 令牌信息 ===');
      console.log('Access Token:', response.data.body.access_token);
      console.log('過期時間 (秒):', response.data.body.expires_in);
      console.log('Scope:', response.data.body.scope);
    }
    
  } catch (error) {
    console.error('\n=== 發生錯誤 ===');
    if (error.response) {
      // 服務器返回了錯誤響應
      console.error('錯誤狀態碼:', error.response.status);
      console.error('錯誤數據:', error.response.data);
    } else if (error.request) {
      // 請求已發送但未收到響應
      console.error('未收到響應:', error.request);
    } else {
      // 發送請求時出錯
      console.error('請求錯誤:', error.message);
    }
  }
}

testToken();
