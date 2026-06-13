const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    sender: { type: String, required: true },
    receiver: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, required: true }, // Send Money, Cash In, etc.
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
