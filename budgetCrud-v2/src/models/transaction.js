const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
  date: {
    type: String,
    required: true
  },
  transaction_type: {
    type: String
  },
  payment_type: {
    type: String,
    required: true
  },
  transaction_category: {
    type: String
  },
  description: {
    type: String
  },
  amount: {
    required: true,
    type: Number
  }
});

const transaction = new mongoose.model('Transaction', transactionSchema);

module.exports = transaction;
