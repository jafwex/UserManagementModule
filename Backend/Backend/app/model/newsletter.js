const mongoose = require('mongoose');
const newsletterSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

var newsletter = new mongoose.model('newsletter', newsletterSchema);
module.exports = newsletter;