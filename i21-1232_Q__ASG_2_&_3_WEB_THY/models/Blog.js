const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    categories: [String],
    ratings: [Number], 
    keywords: [String], 
    isEnabled: {
        type: Boolean,
        default: true,
    }, 
    isActive: {
        type: Boolean,
        default: true,
    },   
    comments: [{
        text: String,
        postedBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
});
module.exports = mongoose.model('Blog', blogSchema);