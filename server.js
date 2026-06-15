from pathlib import Path

content = """const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from project root
app.use(express.static(__dirname));

// API Routes
app.use('/api', apiRoutes);

// MongoDB Connection
const MONGO_URI = "mongodb+srv://bikashadmin:Abcd1234@cluster0.ss7rydv.mongodb.net/bikash88?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI)
.then(() => console.log("MongoDB connected successfully!"))
.catch(err => console.log("Database connection error:", err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
"""

out = Path("/mnt/data/server_fixed.js")
out.write_text(content, encoding="utf-8")
print(str(out))
