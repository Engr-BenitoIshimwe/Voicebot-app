const mongoose = require('mongoose');

const ReportSchema = mongoose.Schema({
  firstname: {
    type: String,
  },
  lastname: {
    type: String,
   },
   email: {
    type: String,
  },
  phonenumber: {
    type: Number,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['mobbing', 'assault', 'other'],
    default: 'other',
    required: true,
  },
  status: {
    type: String,
    enum: ['NEW', 'PENDING', 'HANDLED'],
    default: 'PENDING',
  }
});

module.exports = mongoose.model('reports', ReportSchema);
