const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, enum: ['Furniture', 'Electronics', 'Books', 'Vehicles', 'Appliances', 'Other'], required: true },
  images: [{ type: String }],
  condition: { type: String, enum: ['Like New', 'Good', 'Fair', 'Needs Repair'], default: 'Good' },
  phone: { type: String, required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  status: { type: String, enum: ['Available', 'Sold'], default: 'Available' }
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);
