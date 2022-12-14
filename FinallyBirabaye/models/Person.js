const mongoose = require('mongoose');

const PersonSchema = mongoose.Schema({
  keycode: {
    type: String,
    required: true,
``},
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
  }
  description: {
    type: String,
    required: true,
  }
  status: {
    type: String,
    enum: ['NEW', 'PENDING', 'HANDLED'],
    default: 'PENDING'
  }
});

module.exports = mongoose.model('Person', PersonSchema);