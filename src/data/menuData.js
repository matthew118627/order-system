// 菜单分类
export const menuCategories = [
  { id: 'chef-special', name: '廚師招牌菜' },
  { id: 'fish', name: '🐟魚🐟' },
  { id: 'home-style', name: '家常便餸 $62' },
  { id: 'steamed', name: '必備蒸餸' },
  { id: 'noodles-rice', name: '炒飯炒烏冬' },
  { id: 'a-la-carte', name: '其他單點' },
  { id: 'custom-order', name: '✏️ 手寫單' },
];

// 主料选项
const ingredients = {
  chicken: { emoji: '🐣', name: '蒜香雞扒件' },
  pork: { emoji: '🐷', name: '美極西班牙肉片' },
  beef: { emoji: '🐮', name: '嫩滑紐西蘭牛肉片' },
  shrimpPaste: { emoji: '🦐', name: '蝦羔', price: 8 }
};

// 常用选项
const commonOptions = {
  shrimpPaste: { 
    name: '蝦羔', 
    price: 8,
    emoji: '🦐',
    description: '可配蝦羔 +8' 
  }
};

// 菜單數據結構
export const menuData = {
  categories: [
    {
      id: 'custom-order',
      name: '✏️ 手寫單',
      items: [] // 這個分類不需要預設項目，因為它會顯示自定義表單
    },
    {
      id: 'chef-special',
      name: '廚師招牌菜',
      items: [
        { id: 'S1', name: '豆腐火腩飯', price: 68, type: 'simple' },
        { id: 'S2', name: '水上人肉餅', price: 68, type: 'simple' },
        { id: 'S3', name: '祕制手撕雞半隻', price: 68, type: 'simple' },
        { id: 'S4', name: '老闆鹽焗黃油雞半隻', price: 68, type: 'simple' },
        { id: 'S5', name: '潮汕鹵水鴨半隻', price: 68, type: 'simple' },
      ]
    },
    {
      id: 'fish',
      name: '魚類',
      items: [
        { 
          id: 'Z20', 
          name: '清蒸沙巴龍躉魚', 
          price: 78,
          type: 'simple'
        },
        { 
          id: 'Z21', 
          name: '鯇魚腩',
          baseName: '鯇魚腩',
          price: 68,
          type: 'with-method',
          methods: ['冬菜蒸', '薑葱炒']
        },
        { 
          id: 'Z22', 
          name: '黃花魚2條',
          baseName: '黃花魚2條',
          price: 68,
          type: 'with-method',
          methods: ['冬菜蒸', '鮮茄']
        },
        { 
          id: 'Z23', 
          name: '元朗烏頭',
          baseName: '元朗烏頭',
          price: 68,
          type: 'with-method',
          methods: ['豉汁', '檸檬蒸']
        },
        { 
          id: 'Z24', 
          name: '豉汁蒸 黃立倉', 
          price: 68,
          type: 'simple'
        },
        { 
          id: 'Z25', 
          name: '清蒸 紅鮋魚', 
          price: 68,
          type: 'simple'
        },
        { 
          id: 'Z26', 
          name: '清蒸 花鱸魚', 
          price: 68,
          type: 'simple'
        },
      ]
    },
    {
      id: 'home-style',
      name: '家常便餸 $62',
      items: [
        { 
          id: 'A1', 
          name: '茄子',
          baseName: '茄子',
          price: 62,
          type: 'with-method',
          methods: ['鮮茄', '香辣肉碎', '麻婆']
        },
        { 
          id: 'A2', 
          name: '香滑豆腐',
          baseName: '香滑豆腐',
          price: 62,
          type: 'with-method',
          methods: ['鮮茄', '香辣肉碎', '麻婆']
        },
        { 
          id: 'A3', 
          name: '蝦仁/牛肉/肉片 炒蛋',
          baseName: '鮮茄炒蛋',
          price: 62,
          type: 'with-ingredient',
          ingredients: [
            { emoji: '🦐', name: '蝦仁', price: 0 },
            { emoji: '🐮', name: '牛肉', price: 0 },
            { emoji: '🥩', name: '肉片', price: 0 }
          ]
        },
        { 
          id: 'A4', 
          name: '翠肉瓜炒',
          baseName: '翠肉瓜炒',
          price: 62,
          type: 'with-ingredient',
          ingredients: [
            { emoji: '🐮', name: '嫩滑紐西蘭牛肉片', price: 0 },
            { emoji: '🐷', name: '美極西班牙肉片', price: 0 },
            { emoji: '🐣', name: '蒜香雞扒件', price: 0 }
          ],
          addOns: [
            { name: '蝦羔', price: 8, emoji: '🦐' }
          ]
        },
        { 
          id: 'A5', 
          name: '西蘭花炒',
          baseName: '西蘭花炒',
          price: 62,
          type: 'with-ingredient',
          ingredients: [
            { emoji: '🐮', name: '嫩滑紐西蘭牛肉片', price: 0 },
            { emoji: '🐷', name: '美極西班牙肉片', price: 0 },
            { emoji: '🐣', name: '蒜香雞扒件', price: 0 }
          ],
          addOns: [
            { name: '蝦羔', price: 8, emoji: '🦐' }
          ]
        },
        { 
          id: 'A6', 
          name: '菜心炒',
          baseName: '菜心炒',
          price: 62,
          type: 'with-ingredient',
          ingredients: [
            { emoji: '🐮', name: '嫩滑紐西蘭牛肉片', price: 0 },
            { emoji: '🐷', name: '美極西班牙肉片', price: 0 },
            { emoji: '🐣', name: '蒜香雞扒件', price: 0 }
          ]
        },
        { 
          id: 'A7', 
          name: '椒鹽',
          baseName: '椒鹽',
          price: 62,
          type: 'with-ingredient',
          ingredients: [
            { emoji: '🐮', name: '嫩滑紐西蘭牛肉片', price: 0 },
            { emoji: '🐷', name: '美極西班牙肉片', price: 0 },
            { emoji: '🐣', name: '蒜香雞扒件', price: 0 }
          ]
        },
        { 
          id: 'A8', 
          name: '日式咖喱',
          baseName: '日式咖喱',
          price: 62,
          type: 'with-ingredient',
          ingredients: [
            { emoji: '🐮', name: '嫩滑紐西蘭牛肉片', price: 0 },
            { emoji: '🐷', name: '美極西班牙肉片', price: 0 },
            { emoji: '🐣', name: '蒜香雞扒件', price: 0 }
          ]
        },
        { 
          id: 'A9', 
          name: '蜜汁薯仔',
          baseName: '蜜汁薯仔',
          price: 62,
          type: 'with-ingredient',
          ingredients: [
            { emoji: '🐮', name: '嫩滑紐西蘭牛肉片', price: 0 },
            { emoji: '🐷', name: '美極西班牙肉片', price: 0 },
            { emoji: '🐣', name: '蒜香雞扒件', price: 0 }
          ]
        },
        { 
          id: 'A10', 
          name: '韓式柚子',
          baseName: '韓式柚子',
          price: 62,
          type: 'with-ingredient',
          ingredients: [
            { emoji: '🐮', name: '嫩滑紐西蘭牛肉片', price: 0 },
            { emoji: '🐷', name: '美極西班牙肉片', price: 0 },
            { emoji: '🐣', name: '蒜香雞扒件', price: 0 }
          ]
        },
        { 
          id: 'A11', 
          name: '波羅咕嚕',
          baseName: '波羅咕嚕',
          price: 62,
          type: 'with-ingredient',
          ingredients: [
            { emoji: '🐮', name: '嫩滑紐西蘭牛肉片', price: 0 },
            { emoji: '🐷', name: '美極西班牙肉片', price: 0 },
            { emoji: '🐣', name: '蒜香雞扒件', price: 0 }
          ]
        },
        { 
          id: 'A12', 
          name: '港式京都',
          baseName: '港式京都',
          price: 62,
          type: 'with-ingredient',
          ingredients: [
            { emoji: '🐮', name: '嫩滑紐西蘭牛肉片', price: 0 },
            { emoji: '🐷', name: '美極西班牙肉片', price: 0 },
            { emoji: '🐣', name: '蒜香雞扒件', price: 0 }
          ]
        },
        { 
          id: 'A13', 
          name: '鮮茄洋蔥',
          baseName: '鮮茄洋蔥',
          price: 62,
          type: 'with-ingredient',
          ingredients: [
            { emoji: '🐮', name: '嫩滑紐西蘭牛肉片', price: 0 },
            { emoji: '🐷', name: '美極西班牙肉片', price: 0 },
            { emoji: '🐣', name: '蒜香雞扒件', price: 0 }
          ]
        },
        { 
          id: 'A14', 
          name: '祕制薑油煎蛋',
          baseName: '祕制薑油煎蛋',
          price: 62,
          type: 'with-ingredient',
          ingredients: [
            { emoji: '🐮', name: '嫩滑紐西蘭牛肉片', price: 0 },
            { emoji: '🐷', name: '美極西班牙肉片', price: 0 },
            { emoji: '🐣', name: '蒜香雞扒件', price: 0 }
          ]
        },
      ]
    },
    {
      id: 'steamed',
      name: '必備蒸餸',
      items: [
        { 
          id: 'B1', 
          name: '蒸肉餅',
          baseName: '蒸肉餅',
          price: 62,
          type: 'with-method',
          methods: ['鹹蛋', '土魷', '臘腸', '榨菜']
        },
        { 
          id: 'B2', 
          name: '蒸水蛋',
          baseName: '蒸水蛋',
          price: 62,
          type: 'with-method',
          methods: ['蝦仁', '三色', '免治肉碎']
        },
        { 
          id: 'B3', 
          name: '蒸排骨',
          baseName: '蒸排骨',
          price: 62,
          type: 'with-method',
          methods: ['臘腸', '南瓜', '麵豉', '梅子', '蒜蓉']
        },
        { 
          id: 'B4', 
          name: '北茹豆卜蒸雞', 
          price: 62,
          type: 'simple'
        },
        { 
          id: 'B5', 
          name: '蒸西班牙肉片',
          baseName: '蒸西班牙肉片',
          price: 62,
          type: 'with-method',
          methods: ['榨菜', '蝦羔']
        },
      ]
    },
    {
      id: 'noodles-rice',
      name: '炒飯炒烏冬',
      items: [
        { 
          id: 'D1', 
          name: '炒飯',
          baseName: '炒飯',
          price: 62,
          type: 'with-method',
          methods: ['牛肉', '蝦仁', '鴨胸肉', '蝦羔']
        },
        { 
          id: 'D2', 
          name: '炒烏冬',
          baseName: '炒烏冬',
          price: 62,
          type: 'with-method',
          methods: ['牛肉', '豬扒', '雞柳', '肉片']
        },
      ]
    },
    {
      id: 'a-la-carte',
      name: '其他單點',
      items: [
        { id: 'E1', name: '白灼菜心', price: 28, type: 'simple' },
        { id: 'E2', name: '蒜蓉炒菜心', price: 38, type: 'simple' },
        { id: 'E3', name: '蒜蓉炒波菜苗', price: 38, type: 'simple' },
        { id: 'E4', name: '蒜蓉炒翠肉瓜', price: 38, type: 'simple' },
        { id: 'E5', name: '蒜蓉炒西蘭花', price: 38, type: 'simple' },
        { id: 'E6', name: '蒜蓉蒸茄子', price: 38, type: 'simple' },
        { id: 'E7', name: '香脆墨魚餅4塊', price: 38, type: 'simple' },
      ]
    }
  ]
};

// 根據分類獲取菜單項
function getMenuItemsByCategory(categoryId) {
  const category = menuData.categories.find(cat => cat.id === categoryId);
  return category ? category.items : [];
}

// 根據ID獲取菜單項
function getMenuItemById(id) {
  for (const category of menuData.categories) {
    const item = category.items.find(item => item.id === id);
    if (item) return item;
  }
  return null;
}

export { getMenuItemsByCategory, getMenuItemById };
