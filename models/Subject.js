const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    grade: {
        type: Number,
        required: true,
        enum: [10, 11, 12]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Composite index to ensure unique subject names per grade
subjectSchema.index({ name: 1, grade: 1 }, { unique: true });

module.exports = mongoose.model('Subject', subjectSchema);
