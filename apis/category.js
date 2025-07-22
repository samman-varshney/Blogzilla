const express = require('express');
const router = express.Router({mergeParams: true});
const Blog = require('../models/blog')
const CatchAsync = require('../utils/catchAsync');



// define api for category
router.get('/:category', CatchAsync(async (req, res) => {
    const { category } = req.params;
    let blogs;
    if (category === 'All') {
        blogs = await Blog.find();
    } else {
        blogs = await Blog.find({ category: category });
    }

    res.json({ blogs: blogs, category: category });
}))

module.exports = router;