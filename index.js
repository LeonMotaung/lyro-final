const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
const multer = require('multer');

// Configure Multer (Memory Storage for Serverless/Base64 conversion)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Models
const User = require('./models/User');
const Question = require('./models/Question');
const Voucher = require('./models/Voucher');
const NBTTest = require('./models/NBTTest');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://smetchappy:Egd8lV7C8J5mcymM@backeddb.pmksk.mongodb.net/lyro?retryWrites=true&w=majority&appName=BackedDB';

require('dotenv').config();
// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser('lyro-secure-secret-key-change-this')); // Use a secret for signed cookies
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

app.get('/paper1', async (req, res) => {
    try {
        const stats = await Question.aggregate([
            { $match: { paper: 'Paper 1' } },
            { $group: { _id: '$topic', count: { $sum: 1 } } }
        ]);

        const counts = {};
        stats.forEach(s => counts[s._id] = s.count);

        res.render('paper1', { counts });
    } catch (err) {
        console.error(err);
        res.render('paper1', { counts: {} });
    }
});

app.get('/paper2', async (req, res) => {
    try {
        const stats = await Question.aggregate([
            { $match: { paper: 'Paper 2' } },
            { $group: { _id: '$topic', count: { $sum: 1 } } }
        ]);

        const counts = {};
        stats.forEach(s => counts[s._id] = s.count);

        res.render('paper2', { counts });
    } catch (err) {
        console.error(err);
        res.render('paper2', { counts: {} });
    }
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

// Auth Middleware
const isAdmin = (req, res, next) => {
    // Check for signed cookie to allow access
    if (req.signedCookies.adminAuth === 'true') {
        next();
    } else {
        res.redirect('/admin/login');
    }
};

// Admin Login (Unprotected)
app.get('/admin/login', (req, res) => {
    if (req.signedCookies.adminAuth === 'true') {
        return res.redirect('/admin');
    }
    res.render('admin/login', { error: null });
});

app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    // Use environment variables or default fallback (Note: Change these in production!)
    const validUser = process.env.ADMIN_USERNAME || 'admin';
    const validPass = process.env.ADMIN_PASSWORD || 'password123';

    if (username === validUser && password === validPass) {
        // Set signed cookie valid for 24 hours
        res.cookie('adminAuth', 'true', {
            signed: true,
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });
        res.redirect('/admin');
    } else {
        res.render('admin/login', { error: 'Invalid credentials' });
    }
});

app.get('/admin/logout', (req, res) => {
    res.clearCookie('adminAuth');
    res.redirect('/admin/login');
});

// Practice Route
app.get('/practice', async (req, res) => {
    try {
        let { paper, topic } = req.query;
        if (!paper || !topic) {
            return res.redirect('/learn');
        }

        // Trim whitespace just in case
        paper = paper.trim();
        topic = topic.trim();

        // Create case-insensitive regex for topic to handle minor encoding/casing differences
        // Escape special regex characters in topic string first
        const escapeRegex = (string) => {
            return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        };

        const topicRegex = new RegExp(`^${escapeRegex(topic)}$`, 'i');

        console.log(`Querying DB - Paper: "${paper}", Topic Regex: "${topicRegex}"`);

        const questions = await Question.find({
            paper: paper,
            topic: { $regex: topicRegex }
        }).sort({ questionNumber: 1 });

        console.log(`Found ${questions.length} questions.`);

        res.render('practice', { paper, topic, questions });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Admin Dashboard (Protected)
app.get('/admin', isAdmin, async (req, res) => {
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

// Admin Users (Protected)
app.get('/admin/users', isAdmin, async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.render('admin/users', { page: 'users', users });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Admin Content (Protected)
// Admin Content (Protected) - List and Create
app.get('/admin/content', isAdmin, async (req, res) => {
    try {
        const questions = await Question.find().sort({ createdAt: -1 });
        res.render('admin/content', { page: 'content', success: req.query.success, questions: questions || [] });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Delete Question
app.post('/admin/content/delete/:id', isAdmin, async (req, res) => {
    try {
        await Question.findByIdAndDelete(req.params.id);
        res.redirect('/admin/content');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting question');
    }
});

// Edit Question Form
app.get('/admin/content/edit/:id', isAdmin, async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) return res.status(404).send('Question not found');
        res.render('admin/edit_content', { page: 'content', question });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Update Question
app.post('/admin/content/update/:id', isAdmin, upload.single('imageFile'), async (req, res) => {
    try {
        const { paper, topic, questionNumber, difficulty, imageUrl, imgSourceType, questionText, answer, timer, additionalFields } = req.body;

        const question = await Question.findById(req.params.id);
        if (!question) return res.status(404).send('Question not found');

        // Handle Image Logic
        let finalImageUrl = imageUrl || '';
        if (req.file) {
            const b64 = Buffer.from(req.file.buffer).toString('base64');
            const mimeType = req.file.mimetype;
            finalImageUrl = `data:${mimeType};base64,${b64}`;
        } else if (imgSourceType === 'keep') {
            finalImageUrl = question.imageUrl;
        }

        const fields = additionalFields || [];

        question.paper = paper;
        question.topic = topic;
        question.questionNumber = questionNumber;
        question.difficulty = difficulty;
        question.imageUrl = finalImageUrl;
        question.questionText = questionText;
        question.answer = answer;
        question.timer = timer;
        question.additionalFields = fields; // This might need robust handling if partial updates, but replace is fine

        await question.save();
        res.redirect('/admin/content?success=true');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating question');
    }
});

app.post('/admin/content/create', isAdmin, upload.single('imageFile'), async (req, res) => {
    try {
        const { paper, topic, questionNumber, difficulty, imageUrl, questionText, answer, timer, additionalFields } = req.body;

        // Handle Image Logic
        let finalImageUrl = imageUrl || '';
        if (req.file) {
            // Convert buffer to Data URI
            const b64 = Buffer.from(req.file.buffer).toString('base64');
            const mimeType = req.file.mimetype;
            finalImageUrl = `data:${mimeType};base64,${b64}`;
        }

        // Handle additionalFields
        const fields = additionalFields || [];

        const newQuestion = new Question({
            paper,
            topic,
            questionNumber,
            difficulty,
            imageUrl: finalImageUrl,
            questionText,
            additionalFields: fields,
            answer,
            timer
        });

        await newQuestion.save();
        res.redirect('/admin/content?success=true');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating question');
    }
});

// Admin Vouchers (Protected)
app.get('/admin/vouchers', isAdmin, async (req, res) => {
    try {
        const vouchers = await Voucher.find().sort({ createdAt: -1 }).limit(50);
        res.render('admin/vouchers', { page: 'vouchers', vouchers, newVouchers: [] });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.post('/admin/vouchers/create', isAdmin, async (req, res) => {
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

// --- NBT Prep Routes (Admin) ---

// List Tests
app.get('/admin/nbt', isAdmin, async (req, res) => {
    try {
        const tests = await NBTTest.find().sort({ availableFrom: -1 });
        res.render('admin/nbt_list', { page: 'nbt', tests });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Create Test Form
app.get('/admin/nbt/create', isAdmin, (req, res) => {
    res.render('admin/nbt_create', { page: 'nbt' });
});

// Create Test Action
app.post('/admin/nbt/create', isAdmin, async (req, res) => {
    try {
        const { title, description, availableFrom, availableUntil, durationMinutes } = req.body;

        const newTest = new NBTTest({
            title,
            description,
            availableFrom,
            availableUntil,
            durationMinutes,
            questions: []
        });

        await newTest.save();
        res.redirect(`/admin/nbt/edit/${newTest._id}`); // Redirect to edit to add questions
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating test');
    }
});

// Edit Test Page
app.get('/admin/nbt/edit/:id', isAdmin, async (req, res) => {
    try {
        const test = await NBTTest.findById(req.params.id);
        if (!test) return res.status(404).send('Test not found');
        res.render('admin/nbt_edit', { page: 'nbt', test });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Update Test Details
app.post('/admin/nbt/update/:id', isAdmin, async (req, res) => {
    try {
        const { title, availableFrom, availableUntil, durationMinutes } = req.body;
        await NBTTest.findByIdAndUpdate(req.params.id, {
            title,
            availableFrom,
            availableUntil,
            durationMinutes
        });
        res.redirect(`/admin/nbt/edit/${req.params.id}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating test');
    }
});

// Delete Test
app.post('/admin/nbt/delete/:id', isAdmin, async (req, res) => {
    try {
        await NBTTest.findByIdAndDelete(req.params.id);
        res.redirect('/admin/nbt');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting test');
    }
});

// Add Question to Test
app.post('/admin/nbt/add-question/:id', isAdmin, async (req, res) => {
    try {
        const { questionText, options, correctOptionIndex } = req.body;

        const test = await NBTTest.findById(req.params.id);
        if (!test) return res.status(404).send('Test not found');

        test.questions.push({
            questionText,
            options, // Array of strings from form
            correctOptionIndex
        });

        await test.save();
        res.redirect(`/admin/nbt/edit/${req.params.id}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error adding question');
    }
});

// Delete Question from Test
// Delete Question from Test
app.post('/admin/nbt/delete-question/:id/:questionIndex', isAdmin, async (req, res) => {
    try {
        const { id, questionIndex } = req.params;
        const test = await NBTTest.findById(id);
        if (!test) return res.status(404).send('Test not found');

        test.questions.splice(questionIndex, 1);
        await test.save();

        res.redirect(`/admin/nbt/edit/${id}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting question');
    }
});

// Edit Question Form
app.get('/admin/nbt/edit-question/:id/:questionIndex', isAdmin, async (req, res) => {
    try {
        const { id, questionIndex } = req.params;
        const test = await NBTTest.findById(id);
        if (!test) return res.status(404).send('Test not found');

        const question = test.questions[questionIndex];
        if (!question) return res.status(404).send('Question not found');

        res.render('admin/nbt_edit_question', { page: 'nbt', testId: id, question, questionIndex });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Update Question Action
app.post('/admin/nbt/update-question/:id/:questionIndex', isAdmin, async (req, res) => {
    try {
        const { id, questionIndex } = req.params;
        const { questionText, options, correctOptionIndex } = req.body;

        const test = await NBTTest.findById(id);
        if (!test) return res.status(404).send('Test not found');

        test.questions[questionIndex].questionText = questionText;
        test.questions[questionIndex].options = options;
        test.questions[questionIndex].correctOptionIndex = correctOptionIndex;

        await test.save();
        res.redirect(`/admin/nbt/edit/${id}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating question');
    }
});


// --- NBT Prep Routes (Student) ---

app.get('/nbt', async (req, res) => {
    try {
        // Show all tests, let the view handle "Upcoming/expired" logic visual
        const tests = await NBTTest.find().sort({ availableFrom: 1 });
        res.render('nbt/index', { tests });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.get('/nbt/take/:id', async (req, res) => {
    try {
        const test = await NBTTest.findById(req.params.id);
        if (!test) return res.status(404).send('Test not found');

        // Basic date check logic (optional, but good for enforcement)
        const now = new Date();
        const start = new Date(test.availableFrom);
        const end = new Date(test.availableUntil);

        if (now < start) return res.send("Test not yet available.");
        if (now > end) return res.send("Test has expired.");

        res.render('nbt/take', { test });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});
if (require.main === module) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
}

module.exports = app;
