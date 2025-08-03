import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { menuData } from '../../src/data/menuData.js';
import Menu from '../models/Menu.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('正在嘗試連接到 MongoDB...');
    console.log('連接字串:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI, {
      // 移除了已棄用的選項
      serverSelectionTimeoutMS: 5000, // 5秒超時
    });
    
    console.log('MongoDB 連接成功');
    
    // 測試連接
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('可用的集合:', collections.map(c => c.name));
    
  } catch (error) {
    console.error('MongoDB 連接錯誤:', error.message);
    console.error('錯誤代碼:', error.codeName);
    console.error('完整錯誤:', error);
    process.exit(1);
  }
};

const initMenu = async () => {
  try {
    await connectDB();
    
    // Check if menu already exists
    const existingMenu = await Menu.findOne();
    if (existingMenu) {
      console.log('Menu already exists in the database');
      process.exit(0);
    }

    // Create new menu with the static data
    const menu = new Menu({
      categories: menuData.categories,
      lastUpdated: new Date()
    });

    await menu.save();
    console.log('Menu initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing menu:', error);
    process.exit(1);
  }
};

initMenu();
