const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    questionNumber: {
        type: String, // String to allow "1a", "1b" etc if needed
        required: true
    },
    imageUrl: {
        type: String,
        default: ''
    },
    questionText: {
        type: String,
        required: true
    },
    // For "more fields", we can store arbitrary key-value pairs or an array of additional content
    additionalFields: [{
        label: String,
        value: String
    }],
    answer: {
        type: String, // Or could be complex object
        required: true
    },
    timer: {
        type: Number, // In seconds or minutes
        default: 0
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard', 'expert'],
        default: 'medium'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Question', questionSchema);
