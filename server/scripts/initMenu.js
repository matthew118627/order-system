import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { menuData } from '../../src/data/menuData.js';
import Menu from '../models/Menu.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
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
