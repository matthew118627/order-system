import React from 'react';
import { Box, Typography, Divider, Grid } from '@mui/material';
import MenuItem from './MenuItem';
import CustomOrderItem from './CustomOrderItem';

const MenuSection = ({ category, items, onAddToOrder }) => {
  // 如果是自定義訂單分類，顯示自定義訂單組件
  if (category.id === 'custom-order') {
    return (
      <Box id={category.id} mb={4}>
        <Typography 
          variant="h5" 
          component="h2" 
          gutterBottom 
          sx={{
            fontWeight: 'bold',
            color: 'primary.main',
            borderBottom: '2px solid',
            borderColor: 'primary.main',
            pb: 1,
            mb: 2
          }}
        >
          {category.name}
        </Typography>
        
        <CustomOrderItem onAddToOrder={onAddToOrder} />
        
        <Divider sx={{ my: 4 }} />
      </Box>
    );
  }

  // 如果沒有項目，不顯示
  if (!items || items.length === 0) return null;

  return (
    <Box id={category.id} mb={4}>
      <Typography 
        variant="h5" 
        component="h2" 
        gutterBottom 
        sx={{
          fontWeight: 'bold',
          color: 'primary.main',
          borderBottom: '2px solid',
          borderColor: 'primary.main',
          pb: 1,
          mb: 2
        }}
      >
        {category.name}
      </Typography>
      
      <Grid container spacing={2}>
        {items.map((item) => (
          <Grid key={item.id} xs={12} sm={6} md={4} item>
            <MenuItem item={item} onAddToOrder={onAddToOrder} />
          </Grid>
        ))}
      </Grid>
      
      <Divider sx={{ my: 4 }} />
    </Box>
  );
};

export default MenuSection;
