import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

// 调试模式
const DEBUG = true;

// 獲取當前文件所在目錄
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加載環境變量
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// 从环境变量获取配置
const clientId = process.env.YILIANYUN_CLIENT_ID;
const clientSecret = process.env.YILIANYUN_CLIENT_SECRET;

// 调试信息
console.log('=== 环境变量信息 ===');
console.log('加载的Client ID:', clientId);
console.log('Client Secret 长度:', clientSecret?.length);
console.log('===================');

// 验证环境变量
if (!clientId || !clientSecret) {
  console.error('错误：缺少必要的环境变量 YILIANYUN_CLIENT_ID 或 YILIANYUN_CLIENT_SECRET');
  process.exit(1);
}

// 強制使用境外API域名
const API_BASE_URL = "https://open-api-os.10ss.net";
console.log("使用境外API域名:", API_BASE_URL);

// 生成UUID v4
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 生成簽名
 * @param {string} timestamp 時間戳（秒）
 * @returns {string} 簽名字符串
 */
function generateSignature(timestamp) {
  try {
    // 確保所有參數都是字符串並去除首尾空格
    const clientIdStr = String(clientId).trim();
    const timestampStr = String(timestamp).trim();
    const clientSecretStr = String(clientSecret).trim();
    
    // 獲取當前時間（北京時間）
    const now = new Date();
    const beijingOffset = 8 * 60 * 60 * 1000; // 北京時區偏移（毫秒）
    const beijingTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + beijingOffset);
    const beijingTimestamp = Math.floor(beijingTime.getTime() / 1000);
    
    // 使用服務器返回的時間戳（如果可用）
    const finalTimestamp = timestamp || beijingTimestamp;
    
    if (DEBUG) {
      console.log("\n=== 簽名調試信息 ===");
      console.log("當前時間 (本地):", now.toISOString());
      console.log("當前時間 (北京):", beijingTime.toISOString());
      console.log("時間戳 (秒):", finalTimestamp);
      console.log("Client ID:", clientIdStr);
      console.log("Client Secret 長度:", clientSecretStr.length);
    }
    
    // 檢查必要的環境變量
    if (!clientIdStr || !clientSecretStr) {
      throw new Error("缺少必要的環境變量: YILIANYUN_CLIENT_ID 或 YILIANYUN_CLIENT_SECRET");
    }
    
    // 生成簽名字符串
    const signStr = clientIdStr + finalTimestamp + clientSecretStr;
    
    // 调试信息
    if (DEBUG) {
      console.log('=== 签名生成过程 ===');
      console.log('使用的Client ID:', clientIdStr);
      console.log('使用的时间戳:', finalTimestamp);
      console.log('Client Secret 长度:', clientSecretStr?.length);
      console.log('签名字符串:', signStr);
      console.log('==================');
    }
    
    if (DEBUG) {
      console.log("簽名原始字符串:", signStr);
    }
    
    // 創建MD5哈希
    const hash = crypto.createHash("md5");
    hash.update(signStr, "utf8");
    const sign = hash.digest("hex").toUpperCase();
    
    if (DEBUG) {
      console.log("生成的簽名:", sign);
      console.log("==================\n");
    }
    
    return sign;
  } catch (error) {
    console.error("生成簽名時出錯:", error);
    throw new Error("生成簽名失敗: " + error.message);
  }
}

/**
 * 獲取訪問令牌
 * @returns {Promise<Object>} 訪問令牌信息
 */
export async function getAccessToken() {
  try {
    console.log("\n=== 開始獲取訪問令牌 ===");
    const timestamp = Math.floor(Date.now() / 1000);
    const requestId = generateUUID();
    const sign = generateSignature(timestamp);

    // 構建請求參數
    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "client_credentials");
    params.append("sign", sign);
    params.append("scope", "all");
    params.append("timestamp", timestamp.toString());
    params.append("id", requestId);

    if (DEBUG) {
      console.log("\n=== 請求參數 ===");
      console.log(`API 端點: ${API_BASE_URL}/v2/oauth/oauth`);
      console.log("請求頭:", {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Node.js/axios",
        "Accept": "application/json"
      });
      console.log("請求體:", params.toString());
      console.log("================\n");
    }

    // 發送請求
    const response = await axios.post(
      `${API_BASE_URL}/v2/oauth/oauth`,
      params.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Node.js/axios",
          "Accept": "application/json"
        },
        timeout: 10000 // 10秒超時
      }
    );

    if (DEBUG) {
      console.log("\n=== 服務器響應 ===");
      console.log("狀態碼:", response.status);
      console.log("響應頭:", response.headers);
      console.log("響應數據:", response.data);
      console.log("================\n");
    }
    
    if (response.data.error) {
      const errorMsg = `獲取訪問令牌失敗 (錯誤碼: ${response.data.error}): ${response.data.error_description || "未知錯誤"}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    console.log("✅ 成功獲取訪問令牌");
    return response.data;
  } catch (error) {
    console.error("\n❌ 獲取訪問令牌出錯");
    if (error.response) {
      // 服務器返回了錯誤響應
      console.error("錯誤狀態碼:", error.response.status);
      console.error("錯誤響應頭:", error.response.headers);
      console.error("錯誤響應數據:", error.response.data);
      
      if (error.response.data && error.response.data.error === 3002) {
        console.error("\n⚠️ 錯誤 3002 可能的原因:");
        console.error("1. 請確認 client_id 和 client_secret 是否正確");
        console.error("2. 請確認時間戳是否在5分鐘有效期內");
        console.error("3. 請檢查簽名生成邏輯是否正確");
        console.error("4. 請確認 API 端點是否正確");
      }
    } else if (error.request) {
      // 請求已發送但未收到響應
      console.error("請求已發送但未收到響應:", error.request);
      console.error("請檢查網絡連接或 API 端點是否可達");
    } else {
      // 其他錯誤
      console.error("錯誤信息:", error.message);
    }
    
    throw new Error("獲取訪問令牌失敗: " + (error.response?.data?.error_description || error.message));
  }
}

/**
 * 打印訂單
 * @param {string} machineCode 打印機終端號
 * @param {string} content 打印內容
 * @param {string} [accessToken] 訪問令牌，如果未提供將自動獲取
 * @returns {Promise<Object>} 打印結果
 */
export async function printOrder(machineCode, content, accessToken) {
  try {
    console.log("正在發送打印請求...");
    
    let token = accessToken;
    if (!token) {
      const tokenData = await getAccessToken();
      token = tokenData.body?.access_token;
      if (!token) {
        throw new Error("無法獲取有效的訪問令牌");
      }
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const sign = generateSignature(timestamp);
    
    // 使用UUID v4格式的请求ID
    const requestId = generateUUID();
    const originId = `order_${generateUUID()}`.substring(0, 64);
    
    // 構建請求參數
    const params = new URLSearchParams();
    params.append("client_id", String(clientId));
    params.append("grant_type", "client_credentials");
    params.append("sign", String(sign));
    params.append("scope", "all");
    params.append("timestamp", String(timestamp));
    params.append("id", String(requestId));
    
    // 如果是打印請求，添加額外參數
    if (token) {
      params.append("access_token", String(token));
    }
    if (machineCode) {
      params.append("machine_code", String(machineCode));
    }
    if (content) {
      params.append("content", String(content));
    }
    if (originId) {
      params.append("origin_id", String(originId));
    }

    console.log("發送打印請求參數:", {
      client_id: clientId,
      access_token: token.substring(0, 10) + "...", // 部分顯示token
      machine_code: machineCode,
      content: content.substring(0, 50) + "...", // 部分顯示內容
      origin_id: originId,
      origin_id_length: originId.length,
      sign: sign,
      timestamp: timestamp,
      id: requestId,
      id_length: requestId.length
    });

    const response = await axios.post(`${API_BASE_URL}/v2/print/index`, params.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Node.js/axios",
        "Accept": "application/json"
      }
    });

    console.log("打印請求響應:", response.data);
    
    if (response.data.error) {
      throw new Error(`打印失敗: ${response.data.error_description || "未知錯誤"}`);
    }
    
    return response.data;
  } catch (error) {
    console.error("打印請求出錯:", error.response?.data || error.message);
    throw new Error("打印失敗: " + (error.response?.data?.error_description || error.message));
  }
}

export default {
  getAccessToken,
  printOrder
};
