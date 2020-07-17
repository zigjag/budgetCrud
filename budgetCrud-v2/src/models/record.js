const mongoose = require('mongoose');

const recordSchema = mongoose.Schema({
  date: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  payment_type: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  amount: {
    required: true,
    type: Number
  }
});

const record = new mongoose.model('Transaction', recordSchema);

module.exports = record;
