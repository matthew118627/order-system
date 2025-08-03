import express from 'express';
import Menu from '../models/Menu.js';

const router = express.Router();

// 初始化菜單數據
router.post('/init', async (req, res) => {
  try {
    // 檢查是否已存在菜單
    const existingMenu = await Menu.findOne();
    if (existingMenu) {
      return res.status(400).json({ message: '菜單已初始化' });
    }

    // 創建一個空的菜單
    const menu = new Menu({
      categories: [],
      lastUpdated: new Date()
    });

    await menu.save();
    res.status(201).json({ message: '菜單初始化成功', menu });
  } catch (error) {
    console.error('初始化菜單錯誤:', error);
    res.status(500).json({ message: '服務器錯誤', error: error.message });
  }
});

// 獲取完整菜單
router.get('/', async (req, res) => {
  try {
    console.log('收到獲取菜單請求');
    let menu = await Menu.findOne();
    
    // 如果沒有找到菜單，創建一個空的
    if (!menu) {
      console.log('未找到現有菜單，創建新菜單...');
      menu = new Menu({
        categories: [],
        lastUpdated: new Date()
      });
      await menu.save();
      console.log('已創建新菜單');
    }
    
    console.log('返回菜單數據:', JSON.stringify(menu, null, 2));
    res.json(menu);
  } catch (error) {
    console.error('獲取菜單錯誤:', error);
    res.status(500).json({ 
      message: '服務器錯誤', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// 更新菜單
router.put('/', async (req, res) => {
  try {
    const { categories } = req.body;
    
    let menu = await Menu.findOne();
    if (!menu) {
      menu = new Menu({ categories });
    } else {
      menu.categories = categories;
      menu.lastUpdated = new Date();
    }

    await menu.save();
    res.json({ message: '菜單更新成功', menu });
  } catch (error) {
    console.error('更新菜單錯誤:', error);
    res.status(500).json({ message: '服務器錯誤', error: error.message });
  }
});

export default router;
