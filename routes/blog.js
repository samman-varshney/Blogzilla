const express = require('express');
const router = express.Router();
const {storage} = require('../cloudinary')//by default it will look for index file inside the clodinary folder
const {isLoggedIn, uploadMiddleware, validateBlog} = require('../middleware')
const blogController = require('../controller/blog')


router.get('/', blogController.index)

router.get('/create', isLoggedIn, blogController.createForm)

router.get('/:blogId/edit', isLoggedIn, blogController.editForm)

router.get('/:blogId/show', blogController.show)

router.post('/create', isLoggedIn, uploadMiddleware(storage, 'thumbnail', 2), validateBlog, blogController.create);

router.post('/:blogId/edit', isLoggedIn, uploadMiddleware(storage, 'thumbnail', 2), validateBlog, blogController.edit);

router.delete('/:blogId/delete', isLoggedIn, blogController.delete)


module.exports = router;