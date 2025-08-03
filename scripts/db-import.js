import { readdirSync, readFileSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 從環境變量獲取 Railway 的 MongoDB 連接字串
const remoteUri = process.env.MONGO_URL || 'mongodb://mongo:pPIsPzbeaoUXoCGYHYNllCzSDMdtTJYW@switchyard.proxy.rlwy.net:46604';
const inputDir = join(__dirname, '..', 'db-backup');

async function importDatabase() {
  const client = new MongoClient(remoteUri);
  
  try {
    console.log('連接到 Railway MongoDB...');
    await client.connect();
    console.log('成功連接到 Railway MongoDB');
    
    const db = client.db();
    
    // 讀取所有備份文件
    const files = readdirSync(inputDir).filter(file => file.endsWith('.json'));
    
    console.log(`找到 ${files.length} 個備份文件`);
    
    for (const file of files) {
      const collectionName = basename(file, '.json');
      const filePath = join(inputDir, file);
      const data = JSON.parse(readFileSync(filePath, 'utf8'));
      
      console.log(`處理集合: ${collectionName}, 文檔數量: ${data.length}`);
      
      if (data.length === 0) {
        console.log(`集合 ${collectionName} 為空，跳過導入`);
        continue;
      }
      
      const collection = db.collection(collectionName);
      
      // 清空現有集合
      console.log(`清空集合 ${collectionName}...`);
      await collection.deleteMany({});
      
      // 插入數據
      console.log(`正在導入 ${data.length} 個文檔到集合 ${collectionName}...`);
      const result = await collection.insertMany(data);
      console.log(`已導入集合: ${collectionName} (${result.insertedCount} 個文檔)`);
    }
    
    console.log('\n數據導入完成！');
    
  } catch (err) {
    console.error('導入數據時出錯:', err);
  } finally {
    await client.close();
  }
}

importDatabase();
