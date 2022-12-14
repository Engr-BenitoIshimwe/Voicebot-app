const mongoose = require('mongoose');

const ReportSchema = mongoose.Schema({
  keycode: {
    type: Number,
    unique: true,
    required: true,
  },
  firstname: {
    type: String,
    required: false,
  },
  lastname: {
    type: String,
    required: false,
   },
   email: {
    type: String,
    required: false,
  },
  phonenumber: {
    type: Number,
    required: false,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['mobbing', 'assault', 'other'],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['NEW', 'PENDING', 'HANDLED'],
    default: 'PENDING'
  }
});

module.exports = mongoose.model('reports', ReportSchema);
