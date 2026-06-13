const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// ------------ ১. রিয়েল রেজিস্ট্রেশন এপিআই ------------
router.post('/register', async (req, res) => {
    try {
        const { username, phone, password } = req.body;

        if (!username || !phone || !password) {
            return res.status(400).json({ status: "error", message: "সবগুলো ফিল্ড পূরণ করুন!" });
        }

        // ইউজার আগে থেকেই আছে কিনা চেক
        const existingUser = await User.findOne({ $or: [{ username: username.toLowerCase() }, { phone }] });
        if (existingUser) {
            return res.status(400).json({ status: "error", message: "ইউজারনেম বা ফোন নম্বরটি ইতিমধ্যে ব্যবহৃত হয়েছে!" });
        }

        // পাসওয়ার্ড হ্যাশ (এনক্রিপ্ট) করা
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username: username.toLowerCase(),
            phone,
            password_hash: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ status: "success", message: "রেজিস্ট্রেশন সফল হয়েছে! লগইন করুন।" });

    } catch (error) {
        res.status(500).json({ status: "error", message: "সার্ভারে সমস্যা হয়েছে, আবার চেষ্টা করুন।" });
    }
});

// ------------ ২. রিয়েল লগইন এপিআই ------------
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username: username.toLowerCase() });
        if (!user) {
            return res.status(400).json({ status: "error", message: "ইউজারনেম পাওয়া যায়নি!" });
        }

        // পাসওয়ার্ড ভেরিফাই করা
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ status: "error", message: "ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।" });
        }

        if (user.status === 'suspended') {
            return res.status(403).json({ status: "error", message: "আপনার অ্যাকাউন্টটি সাময়িকভাবে স্থগিত আছে।" });
        }

        // লগইন সফল (রিয়েল ডাটা ফ্রন্টএন্ডে পাঠানো হচ্ছে)
        res.status(200).json({
            status: "success",
            message: "লগইন সফল হয়েছে!",
            user: {
                id: user._id,
                username: user.username,
                phone: user.phone,
                balance: user.wallet_balance
            }
        });

    } catch (error) {
        res.status(500).json({ status: "error", message: "সার্ভার এরর!" });
    }
});

// ------------ ৩. ম্যানুয়াল ডিপোজিট রিকোয়েস্ট এপিআই ------------
router.post('/deposit', async (req, res) => {
    try {
        const { userId, amount, method, transactionId, userNumber } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ status: "error", message: "ইউজার পাওয়া যায়নি!" });

        const newDeposit = new Transaction({
            userId: user._id,
            username: user.username,
            type: 'deposit',
            amount: Number(amount),
            method,
            transactionId,
            userNumber
        });

        await newDeposit.save();
        res.status(200).json({ status: "success", message: "ডিপোজিট রিকোয়েস্ট জমা হয়েছে। এডমিন ভেরিফাই করছে।" });

    } catch (error) {
        res.status(500).json({ status: "error", message: "ডিপোজিট সাবমিট হয়নি।" });
    }
});

// ------------ ৪. উইথড্রয়াল রিকোয়েস্ট এপিআই ------------
router.post('/withdraw', async (req, res) => {
    try {
        const { userId, amount, method, userNumber } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ status: "error", message: "ইউজার পাওয়া যায়নি!" });

        // ব্যালেন্স চেক করা
        if (user.wallet_balance < Number(amount)) {
            return res.status(400).json({ status: "error", message: "আপনার অ্যাকাউন্টে পর্যাপ্ত ব্যালেন্স নেই!" });
        }

        // উইথড্র রিকোয়েস্ট তৈরি করা এবং সাময়িকভাবে ব্যালেন্স কেটে নেওয়া
        const newWithdraw = new Transaction({
            userId: user._id,
            username: user.username,
            type: 'withdrawal',
            amount: Number(amount),
            method,
            userNumber
        });

        user.wallet_balance -= Number(amount); // ব্যালেন্স হোল্ড করা
        await user.save();
        await newWithdraw.save();

        res.status(200).json({ status: "success", message: "উইথড্রয়াল রিকোয়েস্ট সফল হয়েছে। কিছুক্ষণের মধ্যে টাকা পেয়ে যাবেন।" });

    } catch (error) {
        res.status(500).json({ status: "error", message: "উইথড্র সাবমিট হয়নি।" });
    }
});

module.exports = router;