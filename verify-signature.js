import { createHash } from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// 添加 ESM 的 __dirname 支持
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function generateSignature() {
  const client_id = '1048944806';
  const timestamp = '1753467317';
  const client_secret = 'c23232d900d7a255c16eccc20b08a7c8';
  
  const signStr = client_id + timestamp + client_secret;
  const sign = createHash('md5').update(signStr, 'utf8').digest('hex').toUpperCase();
  
  console.log('簽名字符串:', signStr);
  console.log('生成的簽名:', sign);
  console.log('預期簽名: 36BC506420410EB7F62721D7A831C5A2');
  console.log('簽名是否匹配:', sign === '36BC506420410EB7F62721D7A831C5A2');
  
  // 檢查 client_secret 是否有隱藏字符
  console.log('\nclient_secret 長度:', client_secret.length);
  console.log('client_secret 是否包含非字母數字字符:', 
    client_secret.match(/[^a-zA-Z0-9]/) ? '是' : '否');
}

generateSignature();
