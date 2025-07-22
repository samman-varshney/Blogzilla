const express = require('express');
const router = express.Router({mergeParams: true});
const CatchAsync = require('../utils/catchAsync');
const Draft = require('../models/draft')
const { storage } = require('../cloudinary')//by default it will look for index file inside the clodinary folder
const {isLoggedIn, uploadMiddleware} = require('../middleware')
const mongoose = require('mongoose')

router.post('/', isLoggedIn, uploadMiddleware(storage, 'thumbnail', 2), CatchAsync(async (req, res) => {
    const {auto = true} = req.query;
    const { title, content, category } = req.body;

    if ((!title?.trim() && !content?.trim()) || (content.trim().length < 100)) {
        return res.status(400).json({ message: 'Content is not Long enough to save as Draft' })
    }

    const data = {
        title: title, category: category, content: content, user: req.user._id, isAutoSaved: auto
    };

    if (req.file) {
        data.thumbnail = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    const draft = new Draft(data);

    await draft.save();

    res.json(draft);
}))

router.patch('/:draftId', isLoggedIn, uploadMiddleware(storage, 'thumbnail', 2), CatchAsync(async (req, res) => {
    // const { title, content, category } = req.body;
    const {auto = true} = req.query;
    const { draftId } = req.params;

    if (!mongoose.isValidObjectId(draftId)) {
        return res.status(400).json('invalid draft id');
    }

    const updateData = {
        ...req.body, isAutoSaved: auto
    };

    if (req.file) {
        updateData.thumbnail = {
            url: req.file.path,
            filename: req.file.filename
        };
    }

    const updatedDraft = await Draft.findOneAndUpdate(
        { _id: draftId, user: req.user._id }, // ✅ ensure ownership
        updateData,
        { new: true }
    );

    if (!updatedDraft) {
        return res.status(404).json({ message: 'Draft not found or unauthorized' });
    }

    res.json(updatedDraft);
}))

router.delete('/:draftId', isLoggedIn, CatchAsync(async (req, res) => {
    const { draftId } = req.params;
    if (!mongoose.isValidObjectId(draftId)) {

        return res.status(400).json({ message: 'Invalid draft Id' })
    }
    const draft = await Draft.findOneAndDelete({ _id: draftId, user: req.user._id });
    if (!draft) {

        return res.status(400).json({ message: 'draft not found' })
    }
    // Mongoose middleware handles cloudinary image deletion, if any
    req.flash('success', 'draft deleted successfully')
    res.json({ message: 'draft deleted successfully' });
}));

// router.get('/drafts/:draftId/edit', isLoggedIn, CatchAsync(async (req, res) => {
//     const { draftId } = req.params;
//     if (!mongoose.isValidObjectId(draftId)) {
//         req.flash('error', 'Invalid draft Id')
//         return res.redirect('/dashboard/myBlogs');
//     }
//     const draft = await Draft.findOne({ _id: draftId, user: req.user._id });
//     if (!draft) {
//         req.flash('error', "Draft doesn't exists")
//         return res.redirect('/dashboard/myBlogs');
//     }
//     console.log(draft)
//     res.render('draft/edit', { draft: draft });
// }))

module.exports = router;