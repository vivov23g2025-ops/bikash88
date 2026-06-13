const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');
const Transaction = require('../models/Transaction');

// ১. ইউজার রেজিস্ট্রেশন (Sign Up) API
router.post('/register', async (req, res) => {
    try {
        const { phone, password } = req.body;

        // নম্বরটি আগে থেকেই আছে কিনা চেক করা
        const userExists = await User.findOne({ phone });
        if (userExists) {
            return res.status(400).json({ success: false, message: "এই নম্বরটি দিয়ে ইতিমধ্যেই অ্যাকাউন্ট খোলা আছে!" });
        }

        // পাসওয়ার্ড সিকিউর বা হ্যাশ করা
        const hashedPassword = await bcrypt.hash(password, 10);

        // নতুন ইউজার তৈরি ও ৫০ টাকা ফ্রি ব্যালেন্স উপহার
        const newUser = new User({
            phone,
            password: hashedPassword,
            balance: 50 // নতুন অ্যাকাউন্ট খুললে বোনাস
        });

        await newUser.save();
        res.status(201).json({ success: true, message: "অ্যাকাউন্ট তৈরি সফল হয়েছে! ৫০ টাকা বোনাস দেওয়া হয়েছে।" });

    } catch (error) {
        res.status(500).json({ success: false, message: "সার্ভার এরর: " + error.message });
    }
});

// ২. ইউজার লগইন (Login) API
router.post('/login', async (req, res) => {
    try {
        const { phone, password } = req.body;

        // ইউজার চেক করা
        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(400).json({ success: false, message: "অ্যাকাউন্ট পাওয়া যায়নি! প্রথমে রেজিস্ট্রেশন করুন।" });
        }

        // পাসওয়ার্ড চেক করা
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।" });
        }

        res.json({ 
            success: true, 
            message: "লগইন সফল হয়েছে!", 
            user: { phone: user.phone, balance: user.balance, role: user.role } 
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "সার্ভার এরর: " + error.message });
    }
});

// ৩. ব্যালেন্স চেক (Check Balance) API
router.get('/balance/:phone', async (req, res) => {
    try {
        const user = await User.findOne({ phone: req.params.phone });
        if (!user) return res.status(404).json({ success: false, message: "ইউজার পাওয়া যায়নি" });
        
        res.json({ success: true, balance: user.balance });
    } catch (error) {
        res.status(500).json({ success: false, message: "সার্ভার এরর" });
    }
});

// ৪. মানি ট্রান্সফার (Send Money) API
router.post('/send-money', async (req, res) => {
    try {
        const { senderPhone, receiverPhone, amount } = req.body;
        const transferAmount = Number(amount);

        if (transferAmount <= 0) {
            return res.status(400).json({ success: false, message: "সঠিক পরিমাণ টাকা লিখুন!" });
        }

        // প্রেরক ও প্রাপক খুঁজে বের করা
        const sender = await User.findOne({ phone: senderPhone });
        const receiver = await User.findOne({ phone: receiverPhone });

        if (!receiver) {
            return res.status(404).json({ success: false, message: "প্রাপকের বিকাশ অ্যাকাউন্টটি খুঁজে পাওয়া যায়নি!" });
        }

        if (sender.phone === receiver.phone) {
            return res.status(400).json({ success: false, message: "নিজের নম্বরে টাকা পাঠানো সম্ভব নয়!" });
        }

        // ব্যালেন্স চেক
        if (sender.balance < transferAmount) {
            return res.status(400).json({ success: false, message: "আপনার অ্যাকাউন্টে পর্যাপ্ত ব্যালেন্স নেই!" });
        }

        // ব্যালেন্স আদান-প্রদান করা
        sender.balance -= transferAmount;
        receiver.balance += transferAmount;

        await sender.save();
        await receiver.save();

        // হিস্ট্রিতে ট্রানজেকশন রেকর্ড সেভ করা
        const transaction = new Transaction({
            sender: senderPhone,
            receiver: receiverPhone,
            amount: transferAmount,
            type: "Send Money"
        });
        await transaction.save();

        res.json({ success: true, message: `সফলভাবে ${transferAmount} টাকা পাঠানো হয়েছে!`, newBalance: sender.balance });

    } catch (error) {
        res.status(500).json({ success: false, message: "সার্ভার এরর: " + error.message });
    }
});

// ৫. স্টেটমেন্ট বা হিস্ট্রি (Transaction History) API
router.get('/statement/:phone', async (req, res) => {
    try {
        const phone = req.params.phone;
        // ইউজারের করা বা আসা সব লেনদেনের তালিকা (সর্বশেষগুলো আগে আসবে)
        const history = await Transaction.find({
            $or: [{ sender: phone }, { receiver: phone }]
        }).sort({ date: -1 });

        res.json({ success: true, history });
    } catch (error) {
        res.status(500).json({ success: false, message: "সার্ভার এরর" });
    }
});

module.exports = router;
