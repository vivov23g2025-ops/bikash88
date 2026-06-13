const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone: { type: String, required: true, unique: true, trim: true },
    password_hash: { type: String, required: true },
    wallet_balance: { type: Number, default: 0.00 }, // রিয়েল অ্যাকাউন্ট ব্যালেন্স
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
