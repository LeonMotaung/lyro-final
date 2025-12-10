const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const crypto = require('crypto');

// Models
const User = require('./models/User');
const Question = require('./models/Question');
const Voucher = require('./models/Voucher');

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

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/instructions', (req, res) => {
    res.render('instructions');
});

app.get('/terms', (req, res) => {
    res.render('terms');
});

// --- Admin Routes ---

// Admin Dashboard
app.get('/admin', async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const questionCount = await Question.countDocuments();
        const voucherCount = await Voucher.countDocuments({ status: 'active' });

        res.render('admin/dashboard', {
            page: 'dashboard',
            stats: { userCount, questionCount, voucherCount }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Admin Users
app.get('/admin/users', async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.render('admin/users', { page: 'users', users });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Admin Content
app.get('/admin/content', async (req, res) => {
    try {
        // You might want to list recent questions here too
        res.render('admin/content', { page: 'content' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.post('/admin/content/create', async (req, res) => {
    try {
        const { questionNumber, difficulty, imageUrl, questionText, answer, timer, additionalFields } = req.body;

        // Handle additionalFields if it comes in as array or undefined
        // If from form, it might be an array of objects or undefined if empty
        const fields = additionalFields || [];

        const newQuestion = new Question({
            questionNumber,
            difficulty,
            imageUrl,
            questionText,
            additionalFields: fields,
            answer,
            timer
        });

        await newQuestion.save();
        res.redirect('/admin/content'); // Redirect back to refresh/showing success
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating question');
    }
});

// Admin Vouchers
app.get('/admin/vouchers', async (req, res) => {
    try {
        const vouchers = await Voucher.find().sort({ createdAt: -1 }).limit(50);
        res.render('admin/vouchers', { page: 'vouchers', vouchers, newVouchers: [] });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.post('/admin/vouchers/create', async (req, res) => {
    try {
        const { durationMonths, quantity } = req.body;
        const qty = parseInt(quantity) || 1;
        const duration = parseInt(durationMonths) || 1;
        const newVouchers = [];

        for (let i = 0; i < qty; i++) {
            const code = crypto.randomBytes(4).toString('hex').toUpperCase();
            newVouchers.push({
                code,
                durationMonths: duration,
                status: 'active'
            });
        }

        const created = await Voucher.insertMany(newVouchers);

        // Fetch all again to show list
        const allVouchers = await Voucher.find().sort({ createdAt: -1 }).limit(50);

        res.render('admin/vouchers', {
            page: 'vouchers',
            vouchers: allVouchers,
            newVouchers: created
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error generating vouchers');
    }
});

// Start Server
if (require.main === module) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
}

module.exports = app;
