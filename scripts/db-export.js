import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 本地 MongoDB 連接字串
const localUri = 'mongodb://localhost:27017/order-system';
const outputDir = join(__dirname, '..', 'db-backup');

async function exportDatabase() {
  const client = new MongoClient(localUri);
  
  try {
    console.log('連接到本地 MongoDB...');
    await client.connect();
    console.log('成功連接到本地 MongoDB');
    
    const db = client.db();
    const collections = await db.listCollections().toArray();
    
    // 創建備份目錄
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
    
    // 導出每個集合
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      const collection = db.collection(collectionName);
      const data = await collection.find({}).toArray();
      
      const outputFile = join(outputDir, `${collectionName}.json`);
      writeFileSync(outputFile, JSON.stringify(data, null, 2));
      console.log(`已導出集合: ${collectionName} (${data.length} 個文檔)`);
    }
    
    console.log(`\n所有數據已導出到: ${outputDir}`);
    
  } catch (err) {
    console.error('導出數據時出錯:', err);
  } finally {
    await client.close();
  }
}

exportDatabase();
