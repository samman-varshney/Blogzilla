const express = require('express');
const router = express.Router({mergeParams: true});
const CatchAsync = require('../utils/catchAsync');
const Draft = require('../models/draft')
const {isLoggedIn} = require('../middleware')
const mongoose = require('mongoose')


router.get('/:draftId/edit', isLoggedIn, CatchAsync(async (req, res) => {
    const { draftId } = req.params;
    if (!mongoose.isValidObjectId(draftId)) {
        req.flash('error', 'Invalid draft Id')
        return res.redirect('/dashboard/myBlogs');
    }
    const draft = await Draft.findOne({ _id: draftId, user: req.user._id });
    if (!draft) {
        req.flash('error', "Draft doesn't exists")
        return res.redirect('/dashboard/myBlogs');
    }
    console.log(draft)
    res.render('draft/edit', { draft: draft });
}))

module.exports = router;