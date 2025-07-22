const express = require('express');
const router = express.Router({mergeParams: true});
const Blog = require('../models/blog')
const CatchAsync = require('../utils/catchAsync');
const Like = require('../models/like')
const {apiAuth} = require('../middleware')

router.get('/:blogId/like', apiAuth, CatchAsync(async (req, res) => {
    const { blogId } = req.params;

    const blog = await Blog.findById(blogId);
    if (!blog) {
        return res.status(404).json({ message: "Blog doesn't exist" });
    }

    // Toggle like (your Like.toggle should return true if liked, false if unliked)
    const result = await Like.toggle(req.user._id, blogId);

    // Atomically update like count
    const update = await Blog.findByIdAndUpdate(
        blogId,
        { $inc: { 'stats.likeCount': result ? 1 : -1 } },
        { new: true, select: 'stats.likeCount' } // return updated document
    );

    return res.status(200).json({
        message: result ? 'Blog liked' : 'Blog unliked',
        liked: result,
        likeCount: update.stats.likeCount
    });
}));


module.exports = router;