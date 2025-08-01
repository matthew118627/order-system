import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  TextField,
  Paper,
  Grid,
  CardContent,
  CardActions,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


const OrderSummary = ({ 
  items = [], 
  onRemoveItem, 
  onUpdateItem,
  subtotal = 0,
  onPrintOrder,
  onBack,
  isPrinting = false,
}) => {
  const total = subtotal; // 直接使用小计作为总计，不收取服务费

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    onUpdateItem(itemId, { quantity: newQuantity });
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
        <IconButton 
          edge="start" 
          color="inherit" 
          onClick={onBack}
          aria-label="返回"
          sx={{ mr: 1 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center', ml: 6 }}>
          訂單摘要
        </Typography>
        <Box sx={{ width: 40 }} /> {/* 用於平衡標題居中 */}
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {items.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Typography color="textSecondary" sx={{ mb: 2 }}>
              暫無商品，請添加商品到購物車
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={onBack}
              startIcon={<ArrowBackIcon />}
              sx={{ width: 'fit-content' }}
            >
              返回菜單
            </Button>
          </Box>
        ) : (
          <List dense>
            {items.map((item) => (
              <React.Fragment key={item.id}>
                <ListItem>
                  <ListItemText
                    primary={item.name}
                    secondary={
                      item.specialRequest && `備註: ${item.specialRequest}`
                    }
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton 
                      size="small" 
                      onClick={() => handleQuantityChange(item.id, (item.quantity || 1) - 1)}
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <Typography sx={{ mx: 1 }}>{item.quantity || 1}</Typography>
                    <IconButton 
                      size="small"
                      onClick={() => handleQuantityChange(item.id, (item.quantity || 1) + 1)}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                    <Typography sx={{ minWidth: 60, textAlign: 'right', ml: 2 }}>
                      ${item.price * (item.quantity || 1)}
                    </Typography>
                    <IconButton 
                      edge="end" 
                      aria-label="delete"
                      onClick={() => onRemoveItem(item.id)}
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      {items.length > 0 && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Grid container spacing={2} sx={{ mb: 2, mt: 1 }}>
            <Grid item xs={6}>
              <Typography>小計:</Typography>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'right' }}>
              <Typography>${subtotal.toFixed(2)}</Typography>
            </Grid>
            

            <Grid item xs={6} sx={{ fontWeight: 'bold' }}>
              <Typography variant="subtitle1">總計:</Typography>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'right', fontWeight: 'bold' }}>
              <Typography variant="subtitle1">${total.toFixed(2)}</Typography>
            </Grid>
          </Grid>
          
          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            onClick={onPrintOrder}
            disabled={items.length === 0 || isPrinting}
            sx={{ mt: 2, mb: 2, position: 'relative' }}
          >
            {isPrinting ? (
              <>
                <CircularProgress size={24} sx={{
                  color: 'inherit',
                  position: 'absolute',
                  left: '50%',
                  marginLeft: '-12px',
                }} />
                <span style={{ opacity: 0 }}>列印中...</span>
              </>
            ) : (
              `列印訂單 (${total.toFixed(2)})`
            )}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            size="large"
            onClick={onPrintOrder}
            disabled={items.length === 0}
            sx={{ mb: 2 }}
          >
            預覽訂單
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default OrderSummary;
