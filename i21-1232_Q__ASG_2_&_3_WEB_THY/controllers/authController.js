const jwt = require('jsonwebtoken');
const User = require('../models/User');


exports.register = async (req, res) => {
    try {
        // Set default role to 'user' if not provided
        const role = req.body.role || 'user';

        // Check if role is valid
        if (!['user', 'admin'].includes(role)) {
            throw new Error('Invalid role');
        }

        const user = await User.create({ ...req.body, role });
        res.status(201).json({
            status: 'success',
            user
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

exports.login = async (req, res) => {
    try {
        // Find the user by email
        const user = await User.findOne({ email: req.body.email });

        // Check if the user exists and the password is correct
        if (!user || !(await user.comparePassword(req.body.password))) {
            throw new Error('Invalid credentials');
        }

        // Check if the user's account is active
        if (!user.isActive) {
            throw new Error('Account is not active');
        }

        // Generate a token with a 1-day expiration
        //const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {expiresIn: '1d'});
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // Respond with the token
        res.status(200).json({
            status: 'success',
            token
        });
    } catch (error) {
        // Handle errors, such as invalid credentials or inactive account
        res.status(401).json({
            status: 'error',
            message: error.message
        });
    }
};

exports.protect = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            throw new Error('User not found');
        }
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({
            status: 'error',
            message: 'You are not authorized'
        });
    }
};

exports.getProfile = async (req, res) => {
    res.status(200).json({
        status: 'success',
        data: req.user
    });
};

exports.updateProfile = async (req, res) => {
    try {
        // 1. Define which fields are allowed to be updated
        const allowedUpdates = ['username', 'email']; // Only include fields that are part of your schema

        // 2. Create an object with only the allowed updates
        const updates = Object.keys(req.body).filter(key => allowedUpdates.includes(key));
        const updateData = {};
        updates.forEach(key => updateData[key] = req.body[key]);

        // 3. Update the user in the database
        const user = await User.findById(req.user._id); // Assuming req.user._id contains the authenticated user's id

        if (!user) {
            throw new Error('User not found');
        }

        updates.forEach(update => user[update] = updateData[update]);

        // Save the updates to the database
        await user.save(); // This will also trigger the mongoose pre-save middleware, including password hashing

        // 4. Return the updated user
        res.status(200).json({
            status: 'success',
            data: user
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};