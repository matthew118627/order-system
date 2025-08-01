// 使用ES模塊
import YLY from 'yly-nodejs-sdk';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 獲取當前文件所在目錄
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加載環境變量
// 加載環境變量
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { YILIANYUN_CLIENT_ID: clientId, YILIANYUN_CLIENT_SECRET: clientSecret } = process.env;

// 初始化SDK
const yly = new YLY({
  client_id: clientId,
  client_secret: clientSecret,
  debug: true // 開啟調試模式
});

/**
 * 獲取訪問令牌
 * @returns {Promise<Object>} 訪問令牌信息
 */
async function getAccessToken() {
  try {
    console.log('正在使用SDK獲取訪問令牌...');
    const result = await yly.getToken();
    console.log('SDK獲取訪問令牌成功:', result);
    return result;
  } catch (error) {
    console.error('SDK獲取訪問令牌失敗:', error);
    throw new Error(`獲取訪問令牌失敗: ${error.message}`);
  }
}

/**
 * 打印訂單
 * @param {string} machineCode 打印機終端號
 * @param {string} content 打印內容
 * @param {string} [originId] 可選，商戶訂單號
 * @returns {Promise<Object>} 打印結果
 */
async function printOrder(machineCode, content, originId) {
  try {
    console.log('正在使用SDK打印訂單...');
    const result = await yly.printIndex({
      machineCode,
      content,
      originId: originId || `order_${Date.now()}`
    });
    console.log('SDK打印訂單成功:', result);
    return result;
  } catch (error) {
    console.error('SDK打印訂單失敗:', error);
    throw new Error(`打印訂單失敗: ${error.message}`);
  }
}

export {
  getAccessToken,
  printOrder
};
