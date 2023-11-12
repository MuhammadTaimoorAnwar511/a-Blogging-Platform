const Blog = require('../models/Blog');
const User = require('../models/User'); 

exports.searchBlogs = async (req, res) => {
    try {
        const queryObj = {};

        // Search by keyword in title or content
        if (req.query.keywords) {
            queryObj.$or = [
                { title: { $regex: req.query.keywords, $options: 'i' } },
                { content: { $regex: req.query.keywords, $options: 'i' } }
            ];
        }
        // Search by category
        if (req.query.category) {
            queryObj.categories = req.query.category;
        }
        // Search by author's username
        if (req.query.author) {
            const author = await User.findOne({ username: req.query.author });
            if (author) {
                queryObj.author = author._id;
            } else {
                // If no author is found, return an error response
                return res.status(404).json({
                    status: 'error',
                    message: 'Author not found'
                });
            }
        }
        // Sorting
        let sort = '';
        if (req.query.sortBy) {
            sort = req.query.sortBy;
        }
        // FILTER Find the blogs with the given criteria
        const blogs = await Blog.find(queryObj).sort(sort).populate('author', 'username');
        res.status(200).json({
            status: 'success',
            results: blogs.length,
            blogs
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};