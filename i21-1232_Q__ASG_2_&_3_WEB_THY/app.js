const express = require('express');
const mongoose = require('mongoose');
/////
const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');
const userInteractionRoutes = require('./routes/userInteractionRoutes');
const adminRoutes=require('./routes/adminRoutes');
const searchRoutes=require('./routes/searchRoutes');
/////
require('dotenv').config();

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true
});

const db = mongoose.connection;

// Check the database connection status
db.on('error', (error) => {
    console.error(`Database connection error: ${error}`);
});

db.once('open', () => {
    console.log('Database connected successfully');
});
//ROUTES
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/userInteractions', userInteractionRoutes);
app.use('/api/admin',adminRoutes)
app.use('/api/search',searchRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

