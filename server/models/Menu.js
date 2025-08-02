import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  type: { type: String, default: 'simple' },
  baseName: { type: String },
  methods: [{ type: String }],
  description: { type: String }
}, { _id: false });

const categorySchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  items: [menuItemSchema]
}, { _id: false });

const menuSchema = new mongoose.Schema({
  categories: [categorySchema],
  lastUpdated: { type: Date, default: Date.now }
});

const Menu = mongoose.model('Menu', menuSchema);

export default Menu;
