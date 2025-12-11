const mongoose = require('mongoose');

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
        questionText: {
            type: String, // LaTeX supported
            required: true
        },
        options: [{
            type: String, // LaTeX supported, exactly 4 expected usually
            required: true
        }],
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
