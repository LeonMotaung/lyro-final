const mongoose = require('mongoose');

const contentBlockSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['text', 'image'],
        required: true
    },
    content: {
        type: String,
        required: true
    }
}, { _id: false });

const nbtTestSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    availableFrom: {
        type: Date,
        required: true
    },
    availableUntil: {
        type: Date,
        required: true
    },
    durationMinutes: {
        type: Number,
        required: true,
        default: 60
    },
    questions: [{
        // Legacy support for simple text questions
        questionText: {
            type: String
        },
        // New flexible content blocks
        questionContent: [contentBlockSchema],

        // Legacy support for simple text options
        options: [{
            type: String
        }],
        // New flexible content blocks for options
        optionsContent: [[contentBlockSchema]], // Array of arrays

        correctOptionIndex: {
            type: Number, // 0-3
            required: true
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('NBTTest', nbtTestSchema);
