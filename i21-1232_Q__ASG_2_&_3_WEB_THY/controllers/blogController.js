const Blog = require('../models/Blog');

exports.createBlog = async (req, res) => {
    try {
        req.body.author = req.user._id;
        const blog = await Blog.create(req.body);
        res.status(201).json({
            status: 'success',
            blog
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};
exports.getBlogsByAuthor = async (req, res) => {
    try {
        // Assuming the author's ID is passed in the request, for example as a query parameter
        const authorId = req.query.authorId;

        if (!authorId) {
            return res.status(400).json({
                status: 'error',
                message: 'Author ID is required.'
            });
        }

        // Find blogs where the author field matches the provided author ID
        const blogs = await Blog.find({ author: authorId }).populate('author', 'username');

        // If no blogs are found for this author, you could choose to handle it as you wish, e.g., sending a different response
        if (blogs.length === 0) {
            return res.status(404).json({
                status: 'not found',
                message: 'No blogs found for the given author.'
            });
        }

        // Send the response with the blogs
        res.status(200).json({
            status: 'success',
            results: blogs.length,
            blogs
        });
    } catch (error) {
        res.status(400).json({
            status: 'error123',
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

exports.updateBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) throw new Error('Blog not found!');


        //if (String(blog.author) !== req.user._id) throw new Error('Unauthorized');
        if (String(blog.author) !== String(req.user._id)) throw new Error('Unauthorized');

        const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            status: 'success',
            blog: updatedBlog
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

exports.deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) throw new Error('Blog not found!');
        if (String(blog.author) !== String(req.user._id) ) throw new Error('Unauthorized');

        await Blog.findByIdAndDelete(req.params.id);
        res.status(200).json({
            status: 'success',
            message: 'Blog deleted successfully!'
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

exports.rateBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) throw new Error('Blog not found!');

        blog.ratings.push(req.body.rating);
        await blog.save();
        res.status(200).json({
            status: 'success',
            averageRating: (blog.ratings.reduce((a, b) => a + b, 0) / blog.ratings.length).toFixed(2)
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

exports.commentOnBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) throw new Error('Blog not found!');

        const comment = {
            text: req.body.text,
            postedBy: req.user._id
        };

        blog.comments.push(comment);
        await blog.save();

        res.status(200).json({
            status: 'success',
            comments: blog.comments
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};
exports.paging = async (req, res) => {
    try {
        const { page = 1, limit = 10, keyword = '' } = req.query;
        const skip = (page - 1) * limit;

        // Basic filtering based on a keyword, assuming it searches in the blog title
        const query = keyword ? { title: { $regex: keyword, $options: 'i' } } : {};

        const blogs = await Blog.find(query)
            .skip(skip)
            .limit(limit)
            .populate('author', 'username');

        // Get the total number of blogs for pagination purposes
        const total = await Blog.countDocuments(query);

        res.status(200).json({
            status: 'success',
            results: blogs.length,
            blogs,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};
