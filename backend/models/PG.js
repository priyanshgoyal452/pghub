const mongoose = require('mongoose');

const pgSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  location: { type: String, required: true },
  rent: { type: Number, required: true },
  facilities: [{ type: String }],
  images: [{ type: String }],
  contactDetails: {
    phone: { type: String, required: true },
    email: { type: String }
  },
  reviews: [{
    userName: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  gender: { type: String, enum: ['Boys', 'Girls', 'Co-ed'], required: true },
  furnishing: { type: String, enum: ['Fully Furnished', 'Semi Furnished', 'Unfurnished'], default: 'Fully Furnished' },
  roomType: { type: String, default: 'Single Room' },
  description: { type: String },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner' },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('PG', pgSchema);
