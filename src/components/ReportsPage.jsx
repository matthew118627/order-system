import React, { useState, useEffect } from 'react';

import MuiAlert from '@mui/material/Alert';
import {
  Box,
  Snackbar,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  TablePagination,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableSortLabel,
  Chip,
  Grid
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import DateRangeIcon from '@mui/icons-material/DateRange';
import FilterListIcon from '@mui/icons-material/FilterList';
import CancelIcon from '@mui/icons-material/Cancel';

// 使用 Vite 環境變量
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.DEV ? 'http://localhost:3001/api' : 'https://order-system-production-9479.up.railway.app/api');

console.log('API 基礎 URL:', API_BASE_URL);

const ReportsPage = ({ onBack }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [orderBy, setOrderBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // 顯示通知
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };
  
  // 關閉通知
  const closeSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };
  
  // 處理標籤切換
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // 處理重置過濾條件
  const handleResetFilters = () => {
    setSearchTerm('');
    setDateRange({ start: '', end: '' });
    setFilterDialogOpen(false);
  };

  // 確認取消訂單對話框
  const renderCancelDialog = () => (
    <Dialog 
      open={cancelDialogOpen} 
      onClose={() => setCancelDialogOpen(false)}
    >
      <DialogTitle>確認取消訂單</DialogTitle>
      <DialogContent>
        <Typography>確定要取消訂單 {orderToCancel?.orderNumber} 嗎？此操作無法還原。</Typography>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={() => setCancelDialogOpen(false)}
          disabled={canceling}
        >
          取消
        </Button>
        <Button 
          onClick={handleCancelOrder} 
          color="error"
          variant="contained"
          disabled={canceling}
          startIcon={canceling ? <CircularProgress size={20} /> : <CancelIcon />}
        >
          {canceling ? '處理中...' : '確認取消'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  // 取消訂單
  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    
    try {
      setCanceling(true);
      const url = `${API_BASE_URL}/orders/${orderToCancel._id}`;
      console.log('發送取消訂單請求到:', url);
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' })
      });
      
      const responseData = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        console.error('後端返回錯誤:', {
          status: response.status,
          statusText: response.statusText,
          data: responseData
        });
        throw new Error(`取消訂單失敗 (${response.status}): ${responseData.message || response.statusText}`);
      }
      
      console.log('訂單取消成功:', responseData);
      
      // 更新本地狀態
      const updatedOrders = orders.map(order => 
        order._id === orderToCancel._id 
          ? { ...order, status: 'cancelled', updatedAt: new Date().toISOString() } 
          : order
      );
      
      setOrders(updatedOrders);
      setFilteredOrders(updatedOrders);
      setCancelDialogOpen(false);
      showSnackbar('訂單已成功取消', 'success');
    } catch (error) {
      console.error('取消訂單時出錯:', error);
      const errorMessage = error.message.includes('Failed to fetch') 
        ? '無法連接到伺服器，請檢查網絡連接'
        : error.message;
      showSnackbar(errorMessage, 'error');
    } finally {
      setCanceling(false);
      setOrderToCancel(null);
    }
  };

  // 渲染過濾對話框
  const renderFilterDialog = () => (
    <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)}>
      <DialogTitle>篩選訂單</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, mb: 3, width: '400px' }}>
          <TextField
            label="搜索訂單號或商品"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="開始日期"
              type="date"
              fullWidth
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DateRangeIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="結束日期"
              type="date"
              fullWidth
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleResetFilters} color="secondary">
          重置
        </Button>
        <Button onClick={() => setFilterDialogOpen(false)} color="primary">
          應用
        </Button>
      </DialogActions>
    </Dialog>
  );

  // 獲取訂單數據
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/orders`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || '獲取訂單數據失敗');
        }
        
        const result = await response.json();
        // 處理不同格式的響應數據
        const ordersData = Array.isArray(result) 
          ? result 
          : (result.orders || result.data || []);
          
        if (!Array.isArray(ordersData)) {
          throw new Error('無效的訂單數據格式');
        }
        
        // 將字符串日期轉換為 Date 對象以便排序
        const processedData = ordersData.map(order => ({
          ...order,
          createdAt: order.createdAt ? new Date(order.createdAt) : new Date(),
          updatedAt: order.updatedAt ? new Date(order.updatedAt) : new Date(),
          // 確保每個訂單都有必要的字段
          orderNumber: order.orderNumber || `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          items: order.items || [],
          subtotal: order.subtotal || 0,
          status: order.status || 'pending',
          printStatus: order.printStatus || 'pending'
        }));
        
        setOrders(processedData);
        setFilteredOrders(processedData);
      } catch (err) {
        console.error('獲取訂單數據時出錯:', err);
        setError(err.message || '無法加載訂單數據');
        // 設置空數組以避免後續的 .map 錯誤
        setOrders([]);
        setFilteredOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);
  
  // 處理排序
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  
  // 處理搜索和過濾
  useEffect(() => {
    let result = [...orders];
    
    // 應用搜索
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(order => 
        order.orderNumber.toLowerCase().includes(term) ||
        order.items.some(item => item.name.toLowerCase().includes(term))
      );
    }
    
    // 應用日期範圍過濾
    if (dateRange.start || dateRange.end) {
      let startDate = dateRange.start ? new Date(dateRange.start) : null;
      let endDate = dateRange.end ? new Date(dateRange.end) : null;
      
      if (startDate) {
        // 設置為當天開始時間 (本地時區)
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        console.log('過濾開始日期 (本地時區):', startDate);
        
        result = result.filter(order => {
          if (!order.createdAt) return false;
          // 將訂單日期轉換為本地時區的當天開始時間
          const orderDate = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt);
          const orderDateStart = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
          return orderDateStart >= startDate;
        });
      }
      
      if (endDate) {
        // 設置為當天結束時間 (本地時區)
        endDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999);
        console.log('過濾結束日期 (本地時區):', endDate);
        
        result = result.filter(order => {
          if (!order.createdAt) return false;
          // 將訂單日期轉換為本地時區的當天開始時間
          const orderDate = order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt);
          const orderDateStart = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
          return orderDateStart <= endDate;
        });
      }
      
      console.log('過濾後的訂單數量:', result.length, '開始日期:', startDate, '結束日期:', endDate);
    }
    
    // 應用排序
    result.sort((a, b) => {
      let comparison = 0;
      if (a[orderBy] > b[orderBy]) {
        comparison = 1;
      } else if (a[orderBy] < b[orderBy]) {
        comparison = -1;
      }
      return order === 'desc' ? -comparison : comparison;
    });
    
    setFilteredOrders(result);
    setPage(0); // 重置到第一頁
  }, [orders, searchTerm, dateRange, orderBy, order]);

  // 處理分頁變化
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // 計算銷售數據
  const calculateSalesData = () => {
    // 使用過濾後的訂單數據，排除已取消的訂單
    const validOrders = filteredOrders.filter(order => order.status !== 'cancelled');
    // 只使用過濾後的訂單，不再回退到未過濾的 orders
    const ordersToUse = validOrders;
    
    // 計算總銷售額和總數量
    let totalRevenue = 0;
    let totalQuantity = 0;
    const totalOrders = new Set();
    
    // 將所有訂單的項目合併到一個數組
    const allItems = [];
    ordersToUse.forEach(order => {
      // 確保訂單有 orderNumber
      if (!order.orderNumber) return;
      
      totalOrders.add(order.orderNumber);
      
      // 確保訂單有 items 數組
      if (!Array.isArray(order.items)) return;
      
      order.items.forEach(item => {
        if (!item) return;
        
        const itemQuantity = Number(item.quantity) || 1;
        const itemPrice = Number(item.price) || 0;
        const itemRevenue = itemPrice * itemQuantity;
        
        totalRevenue += itemRevenue;
        totalQuantity += itemQuantity;
        
        allItems.push({
          ...item,
          date: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '未知日期',
          orderNumber: order.orderNumber,
          orderTime: order.createdAt ? new Date(order.createdAt) : new Date(),
          itemRevenue: itemRevenue,
          itemQuantity: itemQuantity
        });
      });
    });

    // 按商品名稱分組計算
    const itemsMap = new Map();
    allItems.forEach(item => {
      if (!item.name) return;
      
      const key = item.name;
      if (!itemsMap.has(key)) {
        itemsMap.set(key, {
          name: item.name,
          quantity: 0,
          revenue: 0,
          cost: 0,
          orders: new Set(),
          lastOrdered: null
        });
      }
      
      const existing = itemsMap.get(key);
      existing.quantity += item.itemQuantity;
      existing.revenue += item.itemRevenue;
      existing.cost += item.itemRevenue * 0.4; // 假設成本為售價的40%
      
      if (item.orderNumber) {
        existing.orders.add(item.orderNumber);
      }
      
      // 更新最後訂購時間
      if (item.orderTime && (!existing.lastOrdered || item.orderTime > existing.lastOrdered)) {
        existing.lastOrdered = item.orderTime;
      }
    });
    
    // 轉換為數組並添加訂單數
    const salesData = Array.from(itemsMap.values()).map(item => ({
      ...item,
      orderCount: item.orders.size
    }));
    
    // 計算總成本
    const totalCost = salesData.reduce((sum, item) => sum + (item.cost || 0), 0);
    
    // 計算總利潤
    const totalProfit = totalRevenue - totalCost;
    
    // 計算利潤率
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    
    // 返回所有統計數據
    return {
      salesData,
      summary: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalQuantity,
        totalOrders: totalOrders.size,
        totalCost: parseFloat(totalCost.toFixed(2)),
        totalProfit: parseFloat(totalProfit.toFixed(2)),
        profitMargin: parseFloat(profitMargin.toFixed(2))
      }
    };
  };

  const { salesData, summary } = calculateSalesData();
  const paginatedData = Array.isArray(salesData) 
    ? salesData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) 
    : [];

  // 計算總計
  const [cost, setCost] = useState(0);
  const [profit, setProfit] = useState(0);

  const totals = Array.isArray(salesData) 
    ? salesData.reduce((acc, item) => ({
        quantity: acc.quantity + (item.quantity || 0),
        revenue: acc.revenue + (item.revenue || 0),
        cost: acc.cost + (item.cost || 0),
      }), { quantity: 0, revenue: 0, cost: 0 })
    : { quantity: 0, revenue: 0, cost: 0 };

  // 當成本或收入變化時更新利潤
  useEffect(() => {
    setProfit(totals.revenue - cost);
  }, [totals.revenue, cost]);

  const handleCostChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setCost(value);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">加載銷售數據失敗: {error}</Alert>
      </Box>
    );
  }

  // 渲染訂單表格
  const renderOrderTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>訂單號</TableCell>
            <TableCell>商品</TableCell>
            <TableCell align="right">數量</TableCell>
            <TableCell align="right">單價</TableCell>
            <TableCell align="right">小計</TableCell>
            <TableCell>下單時間</TableCell>
            <TableCell align="center">狀態</TableCell>
            <TableCell align="center">操作</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredOrders
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((order) => (
              <TableRow key={order._id}>
                <TableCell>{order.orderNumber}</TableCell>
                <TableCell>
                  {order.items.map((item, idx) => (
                    <div key={idx}>
                      {item.quantity}x {item.name}
                      {item.specialRequest && (
                        <Chip 
                          label={`備註: ${item.specialRequest}`} 
                          size="small" 
                          sx={{ ml: 1, fontSize: '0.7rem' }}
                        />
                      )}
                    </div>
                  ))}
                </TableCell>
                <TableCell align="right">
                  {order.items.reduce((sum, item) => sum + (item.quantity || 1), 0)}
                </TableCell>
                <TableCell align="right">
                  ${order.items[0]?.price?.toFixed(2) || '0.00'}
                </TableCell>
                <TableCell align="right">${order.subtotal?.toFixed(2) || '0.00'}</TableCell>
                <TableCell>{order.createdAt?.toLocaleString() || 'N/A'}</TableCell>
                <TableCell align="center">
                  <Chip 
                    label={order.status || 'pending'} 
                    color={
                      order.status === 'completed' ? 'success' : 
                      order.status === 'cancelled' ? 'error' : 'default'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  {order.status !== 'cancelled' && (
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOrderToCancel(order);
                        setCancelDialogOpen(true);
                      }}
                      title="取消訂單"
                    >
                      <CancelIcon fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredOrders.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="每頁顯示："
        labelDisplayedRows={({ from, to, count }) => 
          `第 ${from} - ${to} 筆，共 ${count} 筆`
        }
      />
    </TableContainer>
  );

  // 渲染銷售統計表格
  const renderSalesTable = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>商品名稱</TableCell>
            <TableCell align="right">銷售數量</TableCell>
            <TableCell align="right">銷售額</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedData.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.name}</TableCell>
              <TableCell align="right">{item.quantity}</TableCell>
              <TableCell align="right">${item.revenue.toFixed(2)}</TableCell>
            </TableRow>
          ))}
          {/* 銷售總計 */}
          <TableRow>
            <TableCell colSpan={3} sx={{ p: 0 }}>
              <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: 1 }}>
                <Typography variant="h6" gutterBottom>銷售總計</Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="textSecondary">總銷售數量：</Typography>
                    <Typography variant="h6">{totals.quantity} 份</Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="textSecondary">總收入：</Typography>
                    <Typography variant="h6">${totals.revenue.toFixed(2)}</Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="textSecondary">總成本：</Typography>
                    <TextField
                      fullWidth
                      size="small"
                      variant="standard"
                      value={cost || ''}
                      onChange={handleCostChange}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      sx={{ maxWidth: 150 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="textSecondary">總利潤：</Typography>
                    <Typography variant="h6" color={profit >= 0 ? 'success.main' : 'error.main'}>
                      ${Math.abs(profit).toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={salesData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="每頁顯示："
        labelDisplayedRows={({ from, to, count }) => 
          `第 ${from} - ${to} 筆，共 ${count} 筆`
        }
      />
    </TableContainer>
  );

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={onBack} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" component="h1">
            銷售報表
          </Typography>
        </Box>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<FilterListIcon />}
            onClick={() => setFilterDialogOpen(true)}
            sx={{ mr: 1 }}
          >
            篩選
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
          >
            導出報表
          </Button>
        </Box>
      </Box>
      
      {renderFilterDialog()}
      {renderCancelDialog()}
      
      {/* 通知組件 */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={closeSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      <Tabs 
        value={activeTab} 
        onChange={handleTabChange} 
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
      >
        <Tab label="銷售統計" />
        <Tab label="訂單列表" />
      </Tabs>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {activeTab === 0 ? renderSalesTable() : renderOrderTable()}
      </Box>
    </Box>
  );
};

export default ReportsPage;
