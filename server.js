const express = require('express');
const path = require('path');
const app = express();

// ১. এই লাইনটি আপনার public ফোল্ডারের ভেতরের CSS এবং HTML ফাইলকে সার্ভারের সাথে লিংক করবে
app.use(express.static(path.join(__dirname, 'public')));

// ২. মিডলওয়্যার (প্রয়োজনীয় অন্য কাজের জন্য)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ৩. রুট রাউট (হোম পেজ লোড করার জন্য)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ৪. ক্যাশ বাস্টিং এবং অন্য যেকোনো পেজে গেলেও যাতে index.html লোড হয় (Fallback Route)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ৫. সার্ভার পোর্ট কনফিগারেশন (Render-এর জন্য PORT ডাইনামিক রাখা হয়েছে)
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`বিকাশ৮৮ সার্ভারটি সফলভাবে পোর্ট ${PORT}-এ চালু হয়েছে!`);
});
