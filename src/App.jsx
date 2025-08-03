import React, { useState, useEffect } from 'react';
import { 
  Container, Box, AppBar, Toolbar, Typography, IconButton, 
  Drawer, Badge, Tabs, Tab, useMediaQuery, useTheme, Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CalculateIcon from '@mui/icons-material/Calculate';
import BuildIcon from '@mui/icons-material/Build';
// Menu data will be loaded from the backend
import MenuSection from './components/MenuSection';
import OrderSummary from './components/OrderSummary';
import ReportsPage from './components/ReportsPage';
import MenuEditor from './components/MenuEditor';
import { printOrder } from './services/yilianyun';
import { getMenu, updateMenu } from './services/menuService';

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showMenuEditor, setShowMenuEditor] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [menuDataState, setMenuDataState] = useState({ categories: [] });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // 從後端加載菜單
  useEffect(() => {
    const loadMenu = async () => {
      try {
        const data = await getMenu();
        if (data && data.categories) {
          setMenuDataState(data);
        }
      } catch (error) {
        console.error('加載菜單失敗:', error);
      }
    };

    loadMenu();
  }, []);

  // 處理菜單更新
  const handleMenuUpdate = (updatedCategories) => {
    setMenuDataState({ ...menuDataState, categories: updatedCategories });
    // 如果當前選中的分類不存在了，切換到全部
    if (!updatedCategories.some(cat => cat.id === selectedCategory)) {
      setSelectedCategory('all');
    }
  };

  // 处理分类切换
  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
    if (newValue !== 'all') {
      const element = document.getElementById(newValue);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 根据选中的分类过滤菜单
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredCategories(menuDataState.categories);
    } else {
      setFilteredCategories(
        menuDataState.categories.filter(cat => cat.id === selectedCategory)
      );
    }
  }, [selectedCategory, menuDataState]);

  const addToOrder = (item) => {
    setOrderItems(prevItems => {
      // 如果是自定義項目，使用現有ID，否則生成新ID
      const newItem = item.isCustom 
        ? { ...item, id: `custom-${Date.now()}` }
        : { ...item, id: `${item.id}-${Date.now()}` };
      return [...prevItems, newItem];
    });
  };

  const removeFromOrder = (itemId) => {
    setOrderItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const updateOrderItem = (itemId, updates) => {
    setOrderItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      )
    );
  };

  const toggleCart = () => {
    setCartOpen(!cartOpen);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrintOrder = async (phoneNumber = '') => {
    if (orderItems.length === 0) return;
    if (isPrinting) return; // 防止重複點擊
    
    setIsPrinting(true);
    
    try {
      // 生成訂單號 (使用時間戳+隨機數)
      const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // 調用打印服務，傳入手機號碼
      await printOrder(orderItems, orderId, phoneNumber);
      
      // 打印成功後清空購物車
      setOrderItems([]);
      setCartOpen(false);
      
      // 顯示成功消息
      alert(`訂單 #${orderId} 已發送到打印機！`);
    } catch (error) {
      console.error('打印出錯:', error);
      alert(`打印出錯: ${error.message || '請檢查打印機連接並重試'}`);
    } finally {
      setIsPrinting(false);
    }
  };

  // 處理返回按鈕點擊
  const handleBack = () => {
    if (showReports) {
      setShowReports(false);
    } else {
      setCartOpen(false);
    }
  };

  // 切換報表視圖
  const toggleReports = () => {
    setShowReports(!showReports);
  };

  const totalItems = orderItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          {/* 已隱藏漢堡菜單圖標 */}
          {/* 已隱藏漢堡菜單圖標 */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 2, display: 'none' }}
          >
            <MenuIcon />
          </IconButton>
          <IconButton 
            color="inherit" 
            onClick={() => setShowReports(true)}
            aria-label="查看報表"
            sx={{ mr: 2 }}
          >
            <CalculateIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {showReports ? '銷售報表' : '餐廳點餐系統'}
          </Typography>
          <Tooltip title="編輯菜單">
            <IconButton 
              color="inherit" 
              onClick={() => setShowMenuEditor(true)}
              sx={{ mr: 1 }}
            >
              <BuildIcon />
            </IconButton>
          </Tooltip>
          <IconButton color="inherit" onClick={toggleCart}>
            <Badge badgeContent={totalItems} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ p: { xs: 1, sm: 2, md: 3 }, pt: { xs: 8, sm: 10 } }}>
        <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
          {showReports ? (
            <ReportsPage onBack={() => setShowReports(false)} />
          ) : (
            <>
              <Box sx={{ 
                position: 'sticky', 
                top: 64, 
                zIndex: 1, 
                bgcolor: 'background.paper',
                boxShadow: 1,
                mb: 2,
                borderRadius: 1,
                overflow: 'hidden'
              }}>
                <Tabs
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  variant={isMobile ? 'scrollable' : 'standard'}
                  scrollButtons={isMobile ? 'auto' : false}
                  allowScrollButtonsMobile
                >
                  <Tab label="全部" value="all" sx={{ minWidth: 80, py: 1.5 }} />
                  {menuDataState.categories.map((category) => (
                    <Tab 
                      key={category.id} 
                      label={category.name} 
                      value={category.id}
                      sx={{ minWidth: 80, py: 1.5 }}
                    />
                  ))}
                </Tabs>
              </Box>

              {/* 菜单内容 */}
              {filteredCategories.map(category => (
                <Box key={category.id} id={category.id}>
                  <MenuSection 
                    category={category}
                    items={category.items}
                    onAddToOrder={addToOrder}
                  />
                </Box>
              ))}
            </>
          )}
        </Container>
      </Box>

      <Drawer
        anchor="right"
        open={cartOpen}
        onClose={toggleCart}
        PaperProps={{
          sx: { width: '100%', maxWidth: 500, p: 2 },
        }}
      >
        <OrderSummary 
          items={orderItems} 
          onRemoveItem={removeFromOrder} 
          onUpdateItem={updateOrderItem}
          subtotal={orderItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0)}
          onPrintOrder={handlePrintOrder}
          onBack={handleBack}
          isPrinting={isPrinting}
        />
      </Drawer>
      <MenuEditor 
        open={showMenuEditor}
        onClose={() => setShowMenuEditor(false)}
        onMenuUpdate={handleMenuUpdate}
      />
    </Box>
  );
}

export default App;
