const express = require('express');
const router = express.Router({mergeParams: true});
const dashboardController = require('../controller/dashboard')
const {isLoggedIn, uploadMiddleware, validateUser} = require('../middleware');
// const CatchAsync = require('../utils/catchAsync');

const {avatarStore} = require('../cloudinary')//by default it will look for index file inside the clodinary folder


// const User = require('../models/user')

router.delete('/editprofile/delete', isLoggedIn, dashboardController.delete);

router.get('/', isLoggedIn, dashboardController.index)

router.get('/editProfile', isLoggedIn, dashboardController.editProfilePage)

router.post('/editProfile', isLoggedIn, validateUser, dashboardController.editProfile)

router.get('/myBlogs', isLoggedIn, dashboardController.myBlogs)

router.get('/connections', isLoggedIn, dashboardController.connections)

router.get('/blogs/:blogId/analytics', isLoggedIn,  dashboardController.blogAnalytics)

router.post('/editProfile/avatar', isLoggedIn, uploadMiddleware(avatarStore, 'avatar', 2), dashboardController.avatar);

router.post('/editProfile/password', isLoggedIn, dashboardController.password)



module.exports = router