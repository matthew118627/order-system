import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Grid,
  Typography,
  IconButton,
  InputAdornment,
  Box
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const CustomOrderItem = ({ onAddToOrder }) => {
  const [dishName, setDishName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');

  const handleAddToOrder = () => {
    if (!dishName.trim() || !price) return;
    
    const item = {
      id: `custom-${Date.now()}`,
      name: dishName,
      price: parseFloat(price),
      quantity: quantity,
      notes: notes,
      isCustom: true // 標記為自定義項目
    };
    
    onAddToOrder(item);
    
    // 重置表單
    setDishName('');
    setPrice('');
    setNotes('');
    setQuantity(1);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
  };

  return (
    <Card sx={{ mb: 2, backgroundColor: '#f9f9f9' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          自定義菜品
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="菜品名稱"
              variant="outlined"
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
              size="small"
              required
            />
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <TextField
              fullWidth
              label="單價 (HKD)"
              type="number"
              variant="outlined"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                inputProps: { min: 0, step: 1 }
              }}
              size="small"
              required
            />
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <Box display="flex" alignItems="center">
              <IconButton 
                onClick={() => handleQuantityChange(quantity - 1)}
                size="small"
                disabled={quantity <= 1}
              >
                <RemoveIcon />
              </IconButton>
              
              <TextField
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                type="number"
                inputProps={{ min: 1, style: { textAlign: 'center' } }}
                size="small"
                sx={{ width: '60px', mx: 1 }}
              />
              
              <IconButton 
                onClick={() => handleQuantityChange(quantity + 1)}
                size="small"
              >
                <AddIcon />
              </IconButton>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="備註 (可選)"
              variant="outlined"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              size="small"
              multiline
              rows={2}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleAddToOrder}
              disabled={!dishName.trim() || !price}
              startIcon={<AddIcon />}
            >
              加入訂單 (${(quantity * parseFloat(price || 0)).toFixed(2)})
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default CustomOrderItem;
