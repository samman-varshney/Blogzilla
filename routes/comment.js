const express = require('express');
const router = express.Router({mergeParams: true})
const {isLoggedIn, validateComment} = require('../middleware')
const commentController = require('../controller/comment')

router.post('/create', isLoggedIn, validateComment, commentController.create)

router.delete('/:commentId/delete', isLoggedIn, commentController.delete)


module.exports = router;