const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();

// মিডলওয়্যার (ফ্রন্টএন্ডের সাথে কানেক্ট করার জন্য)
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// স্ট্যাটিক ফ্রন্টএন্ড ফোল্ডার লিংক (index.html এবং style.css এখানে থাকবে)
app.use(express.static('public'));

// এপিআই রুট লিংক
app.use('/api', apiRoutes);

// ক্লাউড MongoDB Atlas কানেকশন লিঙ্ক (আপনার ইউজারনেম ও পাসওয়ার্ড সেট করা হয়েছে)
const MONGO_URI = "mongodb+srv://bikashadmin:Abcd1234@cluster0.ss7rydv.mongodb.net/bikash88?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI)
.then(() => console.log("MongoDB এর সাথে রিয়েল কানেকশন সফল হয়েছে! 🔌"))
.catch(err => console.log("ডাটাবেজ কানেকশন এরর: ", err));

// সার্ভার পোর্ট সেটিংস
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`বিকাশ৮৮ সার্ভার লাইভ চলছে পোর্ট: ${PORT} এ`);
});