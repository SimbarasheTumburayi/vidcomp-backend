const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
app.use(cors({
    origin: 'https://from-sjay-to-rumbi.netlify.app'
}));

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB (local)
mongoose.connect(process.env.MONGODB_URI);

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

app.listen(3000, () => console.log('Server running on http://localhost:3000'));