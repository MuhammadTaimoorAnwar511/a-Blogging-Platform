const User = require('../models/User');
const Blog = require('../models/Blog');

exports.followUser = async (req, res) => {
    try {
        const userToFollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user._id);
        
        if (!userToFollow) throw new Error('User not found!');

        if (currentUser.following.includes(req.params.id)) throw new Error('Already following this user.');

        userToFollow.followers.push(req.user._id);
        currentUser.following.push(req.params.id);

        await userToFollow.save();
        await currentUser.save();

        // Adding a notification for the user being followed
        userToFollow.notifications.push({
            type: 'new_follower',
            message: `${currentUser.username} started following you.`
            
        });
        await userToFollow.save();

        res.status(200).json({
            status: 'success',
            message: 'Successfully followed the user.'
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

exports.getUserFeed = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id).populate('following');

        const followingUsersIds = currentUser.following.map(user => user._id);
        
        const blogs = await Blog.find({ author: { $in: followingUsersIds } });

        res.status(200).json({
            status: 'success',
            blogs
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id);
        res.status(200).json({
            status: 'success',
            notifications: currentUser.notifications
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};