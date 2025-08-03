import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, List, ListItem, ListItemText, ListItemSecondaryAction,
  Divider, Typography, Paper, Tabs, Tab, FormControl, InputLabel,
  Select, MenuItem, Grid, Tooltip
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Save as SaveIcon, Close as CloseIcon, Build as BuildIcon } from '@mui/icons-material';
import { getMenu, updateMenu } from '../services/menuService';

const MenuEditor = ({ open, onClose, onMenuUpdate }) => {
  const [menu, setMenu] = useState({ categories: [] });
  const [currentTab, setCurrentTab] = useState(0);
  const [editingItem, setEditingItem] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newItem, setNewItem] = useState({
    id: '',
    name: '',
    price: 0,
    type: 'simple',
    methods: []
  });
  const [newCategory, setNewCategory] = useState({
    id: '',
    name: '',
    items: []
  });

  const loadMenu = useCallback(async () => {
    try {
      const data = await getMenu();
      setMenu(data);
    } catch (error) {
      console.error('Failed to load menu:', error);
      alert('無法載入菜單');
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadMenu();
    }
  }, [open, loadMenu]);

  const handleSave = async () => {
    try {
      await updateMenu(menu.categories);
      if (onMenuUpdate) {
        onMenuUpdate(menu.categories);
      }
      alert('菜單已保存');
      onClose();
    } catch (error) {
      console.error('Failed to save menu:', error);
      alert('保存菜單失敗');
    }
  };

  const handleAddItem = () => {
    const category = menu.categories[currentTab];
    if (!category) return;

    const updatedCategories = [...menu.categories];
    const newItemWithId = {
      ...newItem,
      id: newItem.id || `item-${Date.now()}`,
    };

    updatedCategories[currentTab] = {
      ...category,
      items: [...(category.items || []), newItemWithId]
    };

    setMenu({ ...menu, categories: updatedCategories });
    setNewItem({
      id: '',
      name: '',
      price: 0,
      type: 'simple',
      baseName: '',
      methods: []
    });
  };

  const handleUpdateItem = () => {
    if (editingItem === null) return;

    const updatedCategories = [...menu.categories];
    const category = updatedCategories[currentTab];
    const itemIndex = category.items.findIndex(item => item.id === editingItem.id);

    if (itemIndex !== -1) {
      category.items[itemIndex] = { ...newItem };
      setMenu({ ...menu, categories: updatedCategories });
      setEditingItem(null);
      setNewItem({
        id: '',
        name: '',
        price: 0,
        type: 'simple',
        baseName: '',
        methods: []
      });
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setNewItem({ ...item });
  };

  const handleDeleteItem = (itemId) => {
    const updatedCategories = [...menu.categories];
    const category = updatedCategories[currentTab];
    category.items = category.items.filter(item => item.id !== itemId);
    setMenu({ ...menu, categories: updatedCategories });
  };

  const handleAddCategory = () => {
    const newCategoryWithId = {
      ...newCategory,
      id: newCategory.id || `cat-${Date.now()}`,
      items: []
    };

    setMenu({
      ...menu,
      categories: [...menu.categories, newCategoryWithId]
    });

    setNewCategory({
      id: '',
      name: '',
      items: []
    });
  };

  const handleDeleteCategory = (index) => {
    const updatedCategories = [...menu.categories];
    updatedCategories.splice(index, 1);
    setMenu({ ...menu, categories: updatedCategories });
    if (currentTab >= updatedCategories.length) {
      setCurrentTab(Math.max(0, updatedCategories.length - 1));
    }
  };

  const renderCategoryTabs = () => (
    <Tabs
      value={currentTab}
      onChange={(e, newValue) => setCurrentTab(newValue)}
      variant="scrollable"
      scrollButtons="auto"
    >
      {menu.categories.map((category, index) => (
        <Tab
          key={category.id || index}
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {category.name}
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCategory(index);
                }}
                sx={{ ml: 1 }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          }
        />
      ))}
    </Tabs>
  );

  const renderCategoryContent = () => {
    const category = menu.categories[currentTab];
    if (!category) return null;

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          {category.name} 項目
        </Typography>
        <List>
          {category.items?.map((item, index) => (
            <React.Fragment key={item.id || index}>
              <ListItem>
                <ListItemText
                  primary={item.name}
                  secondary={`$${item.price}${item.type === 'with-method' ? ` (${item.methods?.join(' / ')})` : ''}`}
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => handleEditItem(item)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" onClick={() => handleDeleteItem(item.id)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>

        <Box sx={{ mt: 3, p: 2, border: '1px dashed grey', borderRadius: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            {editingItem ? '編輯項目' : '新增項目'}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ID"
                value={newItem.id}
                onChange={(e) => setNewItem({ ...newItem, id: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="名稱"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="價格"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) || 0 })}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>類型</InputLabel>
                <Select
                  value={newItem.type}
                  onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                >
                  <MenuItem value="simple">簡單項目</MenuItem>
                  <MenuItem value="with-method">多種做法</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {newItem.type === 'with-method' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="做法 (用逗號分隔)"
                  value={newItem.methods?.join(', ')}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      methods: e.target.value.split(',').map((m) => m.trim())
                    })
                  }
                  margin="normal"
                  helperText="例如：冬菜蒸, 薑葱炒"
                />
              </Grid>
            )}
          </Grid>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            {editingItem && (
              <Button
                variant="outlined"
                onClick={() => {
                  setEditingItem(null);
                  setNewItem({
                    id: '',
                    name: '',
                    price: 0,
                    type: 'simple',
                    methods: []
                  });
                }}
                sx={{ mr: 1 }}
              >
                取消
              </Button>
            )}
            <Button
              variant="contained"
              onClick={editingItem ? handleUpdateItem : handleAddItem}
              startIcon={editingItem ? <SaveIcon /> : <AddIcon />}
            >
              {editingItem ? '更新' : '新增'}項目
            </Button>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <span>菜單編輯器</span>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            新增分類
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                label="分類ID"
                value={newCategory.id}
                onChange={(e) => setNewCategory({ ...newCategory, id: e.target.value })}
                margin="dense"
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                label="分類名稱"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                margin="dense"
                required
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleAddCategory}
                startIcon={<AddIcon />}
                disabled={!newCategory.name}
              >
                新增
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {menu.categories.length > 0 && (
          <Paper>
            {renderCategoryTabs()}
            <Box sx={{ p: 2 }}>
              {renderCategoryContent()}
            </Box>
          </Paper>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          取消
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary" startIcon={<SaveIcon />}>
          保存菜單
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MenuEditor;
