const CatchAsync = require('../utils/catchAsync')
const Blog = require('../models/blog')
const User = require('../models/user')
const Follow = require('../models/follow')
const Like = require('../models/like')
const Draft = require('../models/draft')
const {cloudinary } = require('../cloudinary')


module.exports.delete =  CatchAsync(async (req, res, next) => {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
        req.flash('error', 'User not found');
        return res.redirect('/');
    }

    // Handle followers
    const followers = await user.getFollowers();
    await Promise.all(
        followers.map(async (f) => {
        await User.findByIdAndUpdate(f.follow, {
            $inc: { 'stats.followingCount': -1 },
        });
        await Follow.findByIdAndDelete(f._id);
        })
    );

    // Handle followings
    const followings = await user.getFollowings();
    await Promise.all(
        followings.map(async (f) => {
        await User.findByIdAndUpdate(f.following, {
            $inc: { 'stats.followerCount': -1 },
        });
        await Follow.findByIdAndDelete(f._id);
        })
    );

    // Handle likes (on others' blogs)
    const likes = await Like.find({ user: userId });
    await Promise.all(
        likes.map(async (l) => {
        await Blog.findByIdAndUpdate(l.blog, {
            $inc: { 'stats.likeCount': -1 },
        });
        await Like.findByIdAndDelete(l._id);
        })
    );

    // Delete user — this should come last
    await User.findByIdAndDelete(userId);

    // Logout and redirect
    req.logout(() => {
        req.flash('success', 'Your account has been deleted');
        res.redirect('/');
    });
})

module.exports.index = async (req, res) => {
    const userId = req.user._id; // Assuming user is logged in and available
    const result = await Blog.aggregate([   // aggreate to collect data from doc
        { $match: { user: userId } },  // stage 1 filtering the docs
        {
            $group: {      // in stage 2 we are grouping them 
                _id: null, // we set it null because we want to group every thing into single object
                totalViews: { $sum: "$stats.viewCount" },
                totalComments: { $sum: "$stats.commentCount" }
            }
        }
    ]);
    req.user.recentBlogs = await Blog.find({user: req.user._id}).limit(2).sort({createdAt: -1});
    // const oneWeekAgo = new Date();
    // oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // const oneWeekAgoBlogs = await Blog.countDocuments({
    //                     user: userId, // or author: userId depending on your schema
    //                     createdAt: { $gte: oneWeekAgo }
    //                 });
    // const oneWeekAgoFollowers = await Follow.countDocuments({
    //                     following: userId, // or author: userId depending on your schema
    //                     createdAt: { $gte: oneWeekAgo }
    //                 });
    

    console.log(result); // eg - [ { _id: null, totalLikes: 1, totalComments: 0 } ]
    res.render('dashboard/index', {
        title: 'Dashboard',
        activePage: 'dashboard',
        user: req.user,
        totalComments: result[0]?.totalComments || 0,
        totalViews: result[0]?.totalViews || 0
    });
};


module.exports.editProfilePage = CatchAsync(async (req, res)=>{
    const blogCount = await Blog.countDocuments({user: req.user._id})
    res.render('dashboard/editProfile', {
        title: 'My Profile',
        activePage: 'editProfile',
        user: req.user,
        recentActivity: [],
        blogCount: blogCount
        });
})


module.exports.editProfile = CatchAsync(async (req, res)=>{
    for( let key in req.body.socials){
        if(req.body.socials[key] === ''){
            delete req.body.socials[key];
        }
    }
    await User.findByIdAndUpdate(req.user._id,
        {
            ...req.body
        }
    );
    // console.log(req.body)
    req.flash('success', 'Profile details updated successfully')
    res.redirect(`/users/${req.user._id}`);
})

module.exports.myBlogs = CatchAsync(async (req, res)=>{
    const blogs = await Blog.find({user: req.user._id});
    const drafts = await Draft.find({user: req.user._id})
    res.render('dashboard/myBlogs', {
        title: 'My Blogs',
        activePage: 'myBlogs',
        user: req.user,
        blogs: blogs,
        drafts:drafts
        });
    
    
})

module.exports.connections = CatchAsync(async (req, res)=>{
    const followings = await Follow.find({follow: req.user._id}).populate('following');
    const followers = await Follow.find({following: req.user._id}).populate('follow');
    // const followingDocs = await Follow.find({ follow: req.user._id }).select('following');
    const followingIds = followings.map(f => f.following._id);
    const followerIds = followers.map(f=>f.follow_id);
    const suggestions = await Follow.aggregate([
    {
        $match: {
        follow: { $in: followingIds },
        following: {$nin: [...followingIds, req.user._id, ...followerIds]}
        }
    },
    {
        $group: {
        _id: '$following'
        }
    },
    {
        $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
        }
    },
    {
        $unwind: '$user'
    },
    {
        $replaceRoot: { newRoot: '$user' }
    },
    {$limit: 10}
    ]);
    // console.log("suggestions for current user:",suggestions)

    res.render('dashboard/connections', {
        title: 'Connections',
        activePage: 'connections',
        user: req.user,
        followers: followers,
        followings: followings,
        suggestions: suggestions
        });
})

module.exports.blogAnalytics = CatchAsync(async (req, res)=>{
    const {blogId} = req.params;
    const blog = await Blog.findById(blogId);
    
    if(!blog || !blog.user.equals(req.user._id)){
        req.flash('error', "blog not found")
        return res.redirect('/blogs');
    }

    const comments = await blog.getCommentsWithUsers();
    res.render('dashboard/blogAnalytics', {
        title: `Blog Analytics`,
        activePage: `myBlogs`,
        user: req.user,
        blog: blog,
        comments: comments
        });
})

module.exports.password = CatchAsync( async (req, res)=>{
    
    const {currentPassword, newPassword, confirmPassword} = req.body;
    const user = await User.findById(req.user._id);

    //check if current password is valid
    const isValid = await user.authenticate(currentPassword)
    if(!isValid){
        req.flash('error', 'Current password is Worng');
        return res.redirect('/dashboard/editProfile');
    }
    //check is new and confirm are same
    if(newPassword !== confirmPassword){
        req.flash('error', "New password and confirmation doesn't match")
        return res.redirect('/dashboard/editProfile')
    }
    //update password
    await user.setPassword(newPassword);
    await user.save();

    //logout the user
    req.logOut((err)=>{
        if(err) return next(err);

        req.flash('success', "Password changed Successfully, Please re-login")
        res.redirect('/login')
    })
})


module.exports.avatar = CatchAsync(async (req, res) => {
    console.log(req.file)
    if (req.file) {
        try {
            if (req.user.avatar && req.user.avatar.filename) {
                const result  = await cloudinary.uploader.destroy(req.user.avatar.filename);
                console.log(result);
            }
        } catch (err) {
            console.error('Cloudinary delete error:', err.message);
        }
        
        await User.findByIdAndUpdate(req.user._id, {
            avatar: {
                url: req.file.path,
                filename: req.file.filename
            }
        });
    }

    req.flash('success', 'Avatar image updated successfully');
    res.redirect(`/users/${req.user._id}`);
})