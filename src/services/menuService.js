// 導入 API 基礎 URL 配置
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/menu`;

console.log('菜單服務 API 配置:', {
  hostname: window.location.hostname,
  href: window.location.href,
  API_BASE_URL,
  API_URL
});

export const getMenu = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('獲取菜單失敗');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('獲取菜單錯誤:', error);
    throw error;
  }
};

export const updateMenu = async (categories) => {
  try {
    const response = await fetch(API_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ categories }),
    });

    if (!response.ok) {
      throw new Error('更新菜單失敗');
    }

    return await response.json();
  } catch (error) {
    console.error('更新菜單錯誤:', error);
    throw error;
  }
};

export const initMenu = async () => {
  try {
    const response = await fetch(`${API_URL}/init`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('初始化菜單失敗');
    }

    return await response.json();
  } catch (error) {
    console.error('初始化菜單錯誤:', error);
    throw error;
  }
};
