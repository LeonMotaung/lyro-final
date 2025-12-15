const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    subscriptionExpiry: {
        type: Date
    },
    surname: { type: String, required: true },
    age: { type: Number, required: true },
    grade: { type: Number, required: true, enum: [10, 11, 12] },
    school: { type: String, required: true },
    town: { type: String, required: true },
    postalCode: { type: String, required: true },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);
