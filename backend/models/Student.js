const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  savedPGs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PG' }]
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
