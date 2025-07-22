const express = require('express');
const router = express.Router({mergeParams: true});
const Follow = require('../models/follow')
const CatchAsync = require('../utils/catchAsync');
const User = require('../models/user')
const {apiAuth} = require('../middleware')


router.get('/:followerId/:followingId', apiAuth, CatchAsync(async (req, res) => {
    const { followerId, followingId } = req.params;
    const following = await User.findById(followingId);
    const follower = await User.findById(followerId);
    if (!following || !follower || followerId === followingId) {
        return res.status(404).json({ message: "User doesn't exist" })
    }
    const result = await Follow.toggle(followerId, followingId);
    const increase = result ? 1 : -1;
    await User.findByIdAndUpdate(followerId,
        { $inc: { 'stats.followingCount': increase } }
    )
    await User.findByIdAndUpdate(followingId,
        { $inc: { 'stats.followerCount': increase } }
    )
    res.json({ follow: result });
}))

module.exports = router