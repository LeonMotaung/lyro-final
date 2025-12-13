const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const bcrypt = require('bcrypt');
const session = require('express-session');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Configure Multer (Memory Storage for Serverless/Base64 conversion)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const isValid = allowedTypes.test(file.mimetype);
        cb(null, isValid);
    }
});

// Models
const User = require('./models/User');
const Question = require('./models/Question');
const Voucher = require('./models/Voucher');
const NBTTest = require('./models/NBTTest');
const School = require('./models/School');
const Subject = require('./models/Subject');
const Topic = require('./models/Topic');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disabled for simplicity with inline scripts/styles
}));
app.use(compression());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser(process.env.SESSION_SECRET || 'lyro-secure-secret-key-change-this'));
app.use(session({
    secret: process.env.SESSION_SECRET || 'lyro-secure-layout-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(express.static(path.join(__dirname, 'public')));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Database Connection with improved settings
mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
    socketTimeoutMS: 45000, // Socket timeout
    family: 4 // Use IPv4, skip trying IPv6
})
    .then(() => {
        console.log('✅ MongoDB Connected Successfully');
        // Start server only after DB connection
        if (require.main === module) {
            app.listen(PORT, '0.0.0.0', () => {
                console.log(`Server running on http://0.0.0.0:${PORT}`);
            });
        }
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        console.log('💡 Troubleshooting tips:');
        console.log('   1. Check your internet connection');
        console.log('   2. Verify MongoDB Atlas IP whitelist includes your IP');
        console.log('   3. Ensure your MongoDB cluster is not paused');
        console.log('   4. Check if your firewall is blocking port 27017');
        process.exit(1); // Exit if DB fails
    });

// Handle connection events
mongoose.connection.on('connected', () => {
    console.log('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('⚠️  Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
    console.log('🔌 Mongoose disconnected from MongoDB');
});

// Routes
app.get('/', (req, res) => {
    res.render('index', { title: 'Lyro | Welcome' });
});

app.get('/onboarding', (req, res) => {
    console.log('Accessing /onboarding route');
    res.render('onboarding');
});

app.get('/learn', (req, res) => {
    res.redirect('/learn12');
});

app.get('/learn10', async (req, res) => {
    try {
        const subjects = await Subject.find({ grade: 10 }).sort({ name: 1 });
        res.render('learn10', { subjects });
    } catch (err) {
        console.error(err);
        res.render('learn10', { subjects: [] });
    }
});

app.get('/learn11', async (req, res) => {
    try {
        const subjects = await Subject.find({ grade: 11 }).sort({ name: 1 });
        res.render('learn11', { subjects });
    } catch (err) {
        console.error(err);
        res.render('learn11', { subjects: [] });
    }
});

app.get('/learn12', async (req, res) => {
    try {
        const subjects = await Subject.find({ grade: 12 }).sort({ name: 1 });
        res.render('learn12', { subjects });
    } catch (err) {
        console.error(err);
        res.render('learn12', { subjects: [] });
    }
});

app.get('/subject/:id', async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (!subject) return res.redirect('/');

        const topics = await Topic.find({ subject: subject._id }).sort({ name: 1 });

        // Render a view that lists topics. We can reuse 'paper1' style or create 'subject_view.ejs'
        // Let's create 'subject_app.ejs'
        res.render('subject_app', { subject, topics });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

app.get('/login', (req, res) => {
    // If already logged in, redirect
    if (req.session.userId) {
        return res.redirect('/learn');
    }
    res.render('login');
});

// User Login API
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && await bcrypt.compare(password, user.password)) {
            // Set session
            req.session.userId = user._id;
            req.session.role = user.role;
            res.json({ success: true, redirect: '/learn' });
        } else {
            res.status(401).json({ error: 'Invalid email or password' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signup', async (req, res) => {
    try {
        const { name, surname, age, school, town, postalCode, email, password } = req.body;

        // Basic validation
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check availability
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const newUser = new User({
            name,
            surname,
            age,
            school,
            town,
            postalCode,
            email,
            password: await bcrypt.hash(password, 10)
        });

        await newUser.save();

        // Auto login after signup (optional) or just confirm
        req.session.userId = newUser._id;

        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during signup' });
    }
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
        let { paper, topic, subject, grade } = req.query;

        // Validation: Needs topic and (paper OR subject)
        if (!topic) {
            return res.redirect('/');
        }
        if (!paper && !subject) {
            // Default fallback if loosely navigating?
        }

        const query = {};

        // Topic Regex
        const escapeRegex = (string) => {
            return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        };
        const topicRegex = new RegExp(`^${escapeRegex(topic.trim())}$`, 'i');
        query.topic = { $regex: topicRegex };

        // Paper or Subject
        if (paper) {
            query.paper = paper.trim();
        }
        if (subject) {
            query.subject = subject.trim();
        }
        if (grade) {
            query.grade = parseInt(grade);
        }

        console.log(`Querying DB Practice:`, query);

        const questions = await Question.find(query).sort({ questionNumber: 1 });

        res.render('practice', { paper: paper || subject, topic, questions });
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
        const schoolCount = await School.countDocuments();

        res.render('admin/dashboard', {
            page: 'dashboard',
            stats: { userCount, questionCount, voucherCount, schoolCount }
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
        const subjects = await Subject.find().sort({ grade: 1, name: 1 });
        const topics = await Topic.find().populate('subject').sort({ grade: 1, name: 1 });

        res.render('admin/content', {
            page: 'content',
            success: req.query.success,
            questions: questions || [],
            subjects: subjects || [],
            topics: topics || []
        });
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
        const { grade, subject, paper, topic, questionNumber, difficulty, imageUrl, imgSourceType, questionText, answer, timer, additionalFields } = req.body;

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

        question.grade = grade || 12;
        question.subject = subject || 'Mathematics';
        question.paper = paper;
        question.topic = topic;
        question.questionNumber = questionNumber;
        question.difficulty = difficulty;
        question.imageUrl = finalImageUrl;
        question.questionText = questionText;
        question.answer = answer;
        question.timer = timer;
        question.additionalFields = fields;

        await question.save();
        res.redirect('/admin/content?success=true');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating question');
    }
});

app.post('/admin/content/create', isAdmin, upload.single('imageFile'), async (req, res) => {
    try {
        const { grade, subject, paper, topic, questionNumber, difficulty, imageUrl, questionText, answer, timer, additionalFields } = req.body;

        // Handle Image Logic
        let finalImageUrl = imageUrl || '';
        if (req.file) {
            // Convert buffer to Data URI
            const b64 = Buffer.from(req.file.buffer).toString('base64');
            const mimeType = req.file.mimetype;
            finalImageUrl = `data:${mimeType};base64,${b64}`;
        }

        const fields = additionalFields || [];

        const newQuestion = new Question({
            grade: grade || 12,
            subject: subject || 'Mathematics',
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

// --- Subject & Topic Management ---

// Subjects
app.get('/admin/subjects', isAdmin, async (req, res) => {
    try {
        const subjects = await Subject.find().sort({ grade: 1, name: 1 });
        res.render('admin/subjects', { page: 'subjects', subjects });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.post('/admin/subjects/add', isAdmin, async (req, res) => {
    try {
        await Subject.create(req.body);
        res.redirect('/admin/subjects');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error adding subject');
    }
});

app.post('/admin/subjects/delete/:id', isAdmin, async (req, res) => {
    try {
        await Subject.findByIdAndDelete(req.params.id);
        // Optional: cascading delete of topics? For now keep it simple.
        res.redirect('/admin/subjects');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting subject');
    }
});

// Topics
app.get('/admin/topics', isAdmin, async (req, res) => {
    try {
        const topics = await Topic.find().populate('subject').sort({ grade: 1, name: 1 });
        const subjects = await Subject.find().sort({ grade: 1, name: 1 });
        res.render('admin/topics', { page: 'topics', topics, subjects });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

app.post('/admin/topics/add', isAdmin, async (req, res) => {
    try {
        await Topic.create(req.body);
        res.redirect('/admin/topics');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error adding topic');
    }
});

app.post('/admin/topics/delete/:id', isAdmin, async (req, res) => {
    try {
        await Topic.findByIdAndDelete(req.params.id);
        res.redirect('/admin/topics');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting topic');
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
        const { questionContent, questionContentType, options, optionsType, correctOptionIndex } = req.body;

        const test = await NBTTest.findById(id);
        if (!test) return res.status(404).send('Test not found');

        // Handle flexible content blocks for question
        if (questionContent && questionContentType) {
            const contentArray = Array.isArray(questionContent) ? questionContent : [questionContent];
            const typeArray = Array.isArray(questionContentType) ? questionContentType : [questionContentType];

            const questionBlocks = contentArray.map((content, idx) => ({
                type: typeArray[idx] || 'text',
                content: content
            }));

            test.questions[questionIndex].questionContent = questionBlocks;
            // Also set questionText for backward compatibility (combine text blocks)
            test.questions[questionIndex].questionText = contentArray
                .filter((_, idx) => typeArray[idx] === 'text')
                .join('\n\n');
        }

        // Handle flexible content blocks for options
        if (options && optionsType) {
            const optionsContent = [];

            // options is an object like: { 0: ['text1', 'text2'], 1: ['text1'], ... }
            for (let i = 0; i < 4; i++) {
                const optionBlocks = [];
                const optionValues = options[i];
                const optionTypes = optionsType[i];

                if (optionValues) {
                    const valuesArray = Array.isArray(optionValues) ? optionValues : [optionValues];
                    const typesArray = Array.isArray(optionTypes) ? optionTypes : [optionTypes];

                    valuesArray.forEach((value, idx) => {
                        if (value && value.trim()) {
                            optionBlocks.push({
                                type: typesArray[idx] || 'text',
                                content: value
                            });
                        }
                    });
                }

                optionsContent.push(optionBlocks);
            }

            test.questions[questionIndex].optionsContent = optionsContent;
            // Also set options for backward compatibility (combine text blocks)
            test.questions[questionIndex].options = optionsContent.map(blocks =>
                blocks.filter(b => b.type === 'text').map(b => b.content).join(' ')
            );
        }

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

// List Schools
app.get('/admin/schools', isAdmin, async (req, res) => {
    try {
        const schools = await School.find().sort({ name: 1 });
        res.render('admin/schools', { page: 'schools', schools });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Add School
app.post('/admin/schools/add', isAdmin, async (req, res) => {
    try {
        const { name, grades } = req.body;
        // Ensure grades is an array even if single value
        const gradesArray = Array.isArray(grades) ? grades : [grades];

        const newSchool = new School({
            name,
            grades: gradesArray
        });
        await newSchool.save();
        res.redirect('/admin/schools');
    } catch (err) {
        console.error(err);
        // Simple duplicate error handling or generic
        res.status(500).send('Error adding school (Name might be duplicate)');
    }
});

// Delete School
app.post('/admin/schools/delete/:id', isAdmin, async (req, res) => {
    try {
        await School.findByIdAndDelete(req.params.id);
        res.redirect('/admin/schools');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting school');
    }
});

// Edit School Form
app.get('/admin/schools/edit/:id', isAdmin, async (req, res) => {
    try {
        const school = await School.findById(req.params.id);
        if (!school) return res.status(404).send('School not found');
        res.render('admin/school_edit', { page: 'schools', school });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Update School Action
app.post('/admin/schools/update/:id', isAdmin, async (req, res) => {
    try {
        const { name, grades } = req.body;
        const gradesArray = Array.isArray(grades) ? grades : [grades];

        await School.findByIdAndUpdate(req.params.id, {
            name,
            grades: gradesArray
        });
        res.redirect('/admin/schools');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating school');
    }
});

if (require.main === module) {
    // Server startup handled in mongoose.connect()
}

module.exports = app;
