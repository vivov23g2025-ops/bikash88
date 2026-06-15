const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    type: { type: String, enum: ['deposit', 'withdrawal'], required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['bkash', 'nagad', 'rocket'], required: true },
    transactionId: { type: String, default: null }, // ডিপোজিটের TxnID (উইথড্রর জন্য ফাঁকা থাকবে)
    userNumber: { type: String, required: true }, // যে নম্বর থেকে ক্যাশআউট বা উইথড্র করা হয়েছে
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }, // এডমিন কন্ট্রোল
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', TransactionSchema);