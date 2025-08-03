import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, default: 1 },
  specialRequest: { type: String, default: '' },
  cookingStyle: { type: String, default: '' },
  mainIngredient: { type: String, default: '' },
  addOns: [{ 
    name: String, 
    price: Number 
  }]
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: { 
    type: String, 
    required: true,
    unique: true,
    index: true
  },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  customerNotes: { type: String, default: '' },
  phoneNumber: { type: String, default: '' },
  printStatus: {
    type: String,
    enum: ['pending', 'printed', 'failed'],
    default: 'pending'
  },
  printTaskId: { type: String, default: '' },
  printedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 自动更新 updatedAt 字段
orderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// 添加静态方法生成订单号
orderSchema.statics.generateOrderNumber = async function() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${dateStr}-${randomNum}`;
};

const Order = mongoose.model('Order', orderSchema);

export default Order;
