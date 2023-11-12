const User = require('../models/User');
const Blog = require('../models/Blog');

exports.getAllUsers = async (req, res) => {
    try {
        // Check if the requesting user is an admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                status: 'error',
                message: 'You do not have permission to perform this action'
            });
        }

        const users = await User.find({}); // Fetch all users
        res.status(200).json({
            status: 'success',
            data: users
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};
exports.blockUser = async (req, res) => {
    try {
        // Ensure only admins can perform this action
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                status: 'error',
                message: 'You do not have permission to perform this action'
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            throw new Error('User not found');
        }

        // Toggle the isActive status
        user.isActive = !user.isActive;
        await user.save();

        res.status(200).json({
            status: 'success',
            message: `User ${user.isActive ? 'unblocked' : 'blocked'} successfully`
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};
exports.getAllBlogs = async (req, res) => {
    try {
        if( req.user.role !=='admin') 
        {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied. Only admins can perform this action.'
            });
        }

        // Proceed with fetching blogs if user is an admin
        const blogs = await Blog.find().populate('author', 'username');
        res.status(200).json({
            status: 'success',
            results: blogs.length,
            blogs
        });
    } catch (error) {
        res.status(400).json({
            status: 'error1',
            message: error.message
        });
    }
};
exports.getBlogById = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming this is how you get the user's ID
        const userRole = req.user.role; // Assuming this is how you get the user's role

        const blog = await Blog.findById(req.params.id).populate('author', 'username');

        // Check if user is admin or the owner of the blog
        if (userRole !== 'admin' && blog.author._id.toString() !== userId) {
            return res.status(403).json({
                status: 'error',
                message: 'You do not have permission to view this blog!'
            });
        }

        res.status(200).json({
            status: 'success',
            blog
        });
    } catch (error) {
        res.status(404).json({
            status: 'error',
            message: 'Blog not found!'
        });
    }
};
exports.disableBlog = async (req, res) => {
    try {
        const userRole = req.user.role; // Assuming this is how you get the user's role

        if (userRole === 'admin') {
            const blog = await Blog.findById(req.params.id);
            if (!blog) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Blog not found'
                });
            }

            // Toggle the isEnabled status
            blog.isEnabled = !blog.isEnabled;
            await blog.save();

            const statusMessage = blog.isEnabled ? 'Blog has been enabled' : 'Blog has been disabled';
            res.status(200).json({
                status: 'success',
                message: statusMessage
            });
        } else {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied'
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error updating the blog status'
        });
    }
};
