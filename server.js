const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const allowedOrigins = [
    'https://from-sjay-to-rumbi.netlify.app',
    'https://sjay-to-rumbie.netlify.app',
    'https://sjay.netlify.app', // <-- Add this line
    'http://localhost:3000' // for local development
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

const app = express(); // <-- Move this line up!

app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static('uploads'));


// ...rest of your code...

// ...your routes and MongoDB connection...

// Connect to MongoDB (Atlas)
mongoose.connect(process.env.MONGODB_URI);

// ...existing code...

// User schema
const User = mongoose.model('User', new mongoose.Schema({
    name: String,
    surname: String,
    birthday: String,
    username: { type: String, unique: true },
    password: String
}));

// Register endpoint
app.post('/api/signup', async (req, res) => {
    const { name, surname, birthday, username, password } = req.body;
    if (await User.findOne({ username })) {
        return res.status(400).json({ message: 'Username already exists!' });
    }
    await User.create({ name, surname, birthday, username, password });
    res.json({ message: 'Registration successful!' });
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (!user) {
        return res.status(400).json({ message: 'Invalid credentials!' });
    }
    res.json({ message: 'Login successful!' });
});

const multer = require('multer');
const path = require('path');

// Set storage location and filename
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Save files to 'uploads' folder
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Create 'uploads' folder if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded!' });
    }
    res.json({ message: 'File uploaded successfully!', filename: req.file.filename });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));