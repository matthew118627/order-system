import React, { useState, useEffect } from 'react';
import { 
  Box, Button, Typography, TextField, Chip, Card, CardContent, Tooltip, IconButton, 
  Divider, Stack, Grid, InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import InfoIcon from '@mui/icons-material/Info';

const MenuItem = ({ item, onAddToOrder }) => {
  const [selectedMethod, setSelectedMethod] = useState('');
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [specialRequest, setSpecialRequest] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    // Reset form when item changes
    setSelectedMethod('');
    setSelectedIngredient(null);
    setSelectedAddOns([]);
    setSpecialRequest('');
    setQuantity(1);
  }, [item.id]);

  const handleAddToOrder = () => {
    let itemName = item.baseName || item.name;
    let finalPrice = item.price;
    
    // 处理做法选择
    if (item.type === 'with-method' && selectedMethod) {
      itemName = `${selectedMethod}${itemName}`;
    }
    
    // 处理主料选择
    if (item.type === 'with-ingredient' && selectedIngredient) {
      itemName = `${itemName} ${selectedIngredient.name}`;
      finalPrice += selectedIngredient.price || 0;
    }
    
    // 处理加配项
    if (selectedAddOns.length > 0) {
      const addOnsText = selectedAddOns.map(addOn => addOn.name).join('、');
      itemName += ` (加配: ${addOnsText})`;
      finalPrice += selectedAddOns.reduce((sum, addOn) => sum + (addOn.price || 0), 0);
    }

    onAddToOrder({
      id: `${item.id}-${Date.now()}`,
      name: itemName,
      price: finalPrice,
      specialRequest,
      originalItem: item,
      quantity: quantity
    });
  };

  const toggleAddOn = (addOn) => {
    setSelectedAddOns(prev => 
      prev.some(a => a.name === addOn.name)
        ? prev.filter(a => a.name !== addOn.name)
        : [...prev, addOn]
    );
  };

  const isAddButtonDisabled = 
    (item.type === 'with-method' && !selectedMethod) ||
    (item.type === 'with-ingredient' && !selectedIngredient);

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2, overflow: 'hidden' }}>
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Box>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              {item.baseName || item.name}
              {item.id && (
                <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  {item.id}
                </Typography>
              )}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {item.baseName && item.name !== item.baseName ? item.name : ''}
            </Typography>
          </Box>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
            ${item.price}
          </Typography>
        </Box>

        {/* 做法选择 */}
        {item.type === 'with-method' && (
          <Box mb={2}>
            <Box display="flex" alignItems="center" mb={1}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                請選擇做法：
              </Typography>
              <Tooltip title="請選擇一種做法">
                <InfoIcon color="action" fontSize="small" sx={{ ml: 0.5 }} />
              </Tooltip>
            </Box>
            <Box display="flex" gap={1} flexWrap="wrap">
              {item.methods?.map((method) => (
                <Chip
                  key={method}
                  label={method}
                  onClick={() => setSelectedMethod(method)}
                  color={selectedMethod === method ? 'primary' : 'default'}
                  variant={selectedMethod === method ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* 主料选择 */}
        {item.type === 'with-ingredient' && item.ingredients && (
          <Box mb={2}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'medium', mb: 1 }}>
              請選擇主料：
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {item.ingredients.map((ing) => (
                <Chip
                  key={ing.emoji}
                  label={`${ing.emoji} ${ing.name}`}
                  onClick={() => setSelectedIngredient(ing)}
                  color={selectedIngredient?.emoji === ing.emoji ? 'primary' : 'default'}
                  variant={selectedIngredient?.emoji === ing.emoji ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* 加配选项 */}
        {item.addOns && item.addOns.length > 0 && (
          <Box mb={2}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'medium', mb: 1 }}>
              加配選項：
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {item.addOns.map((addOn) => (
                <Chip
                  key={addOn.name}
                  label={`${addOn.emoji || ''} ${addOn.name} +${addOn.price}`}
                  onClick={() => toggleAddOn(addOn)}
                  color={selectedAddOns.some(opt => opt.name === addOn.name) ? 'primary' : 'default'}
                  variant={selectedAddOns.some(opt => opt.name === addOn.name) ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* 特别要求 */}
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            label="特別要求 (可選)"
            variant="outlined"
            value={specialRequest}
            onChange={(e) => setSpecialRequest(e.target.value)}
            InputProps={{
              sx: { borderRadius: 2 },
              endAdornment: specialRequest && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSpecialRequest('')}>
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Box>

        {/* 数量选择和加入订单按钮 */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mt={2}>
          <Box display="flex" alignItems="center">
            <IconButton 
              size="small" 
              onClick={decrementQuantity}
              sx={{ border: '1px solid', borderColor: 'divider' }}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
            <Typography variant="body1" sx={{ mx: 2 }}>{quantity}</Typography>
            <IconButton 
              size="small" 
              onClick={incrementQuantity}
              sx={{ border: '1px solid', borderColor: 'divider' }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddToOrder}
            disabled={isAddButtonDisabled}
            startIcon={<AddIcon />}
            size="small"
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
          >
            加入訂單
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MenuItem;
