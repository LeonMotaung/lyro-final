const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://smetchappy:Egd8lV7C8J5mcymM@backeddb.pmksk.mongodb.net/lyro?retryWrites=true&w=majority&appName=BackedDB';

require('dotenv').config();
// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Database Connection
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
    res.render('index', { title: 'Lyro | Welcome' });
});

app.get('/onboarding', (req, res) => {
    console.log('Accessing /onboarding route');
    res.render('onboarding');
});

app.get('/learn', (req, res) => {
    res.render('learn');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/formulas', (req, res) => {
    res.render('formulas');
});

app.get('/paper1', (req, res) => {
    res.render('paper1');
});

app.get('/paper2', (req, res) => {
    res.render('paper2');
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
