const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    questionNumber: {
        type: String, // String to allow "1a", "1b" etc if needed
        required: true
    },
    grade: {
        type: Number,
        required: true,
        enum: [10, 11, 12],
        default: 12
    },
    subject: {
        type: String, // Storing Name for now to avoid complex migration, or could be ID. Let's use Name for flexibility/speed unless ID is better.
        // The user asked for "page for adding subjects". Linking by ID is safer for renames.
        // Let's use String for now to match 'topic' pattern if we want loose coupling, 
        // BUT strong coupling (ObjectId) is better for structure. 
        // However, to keep it simple with the existing "paper" system (which serves as a pseudo-subject),
        // let's add `subject` as a String first to align with User request: "Mathematics subjects".
        required: true,
        default: 'Mathematics'
    },
    imageUrl: {
        type: String,
        default: ''
    },
    questionText: {
        type: String,
        required: true
    },
    paper: {
        type: String,
        // enum: ['Paper 1', 'Paper 2'], // Removing enum to allow more flexibility if subjects change
        required: true
    },
    topic: {
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
