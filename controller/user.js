
const CatchAsync = require('../utils/catchAsync')
const User = require('../models/user')
const Blog = require('../models/blog')
const {getHandle} = require('../middleware')
const Follow = require('../models/follow')

module.exports.register = async (req, res)=>{
    try{
        console.log('registering the user');
        const {firstname, lastname, email, password} = req.body;
        const handle = getHandle(email);
        const user = new User({firstname, lastname, email, handle});
        const registeredUser = await User.register(user, password)
        req.login(registeredUser, (err)=>{
            if(err) return next(err);
            req.flash('success', "Welcome to Blogzilla");
            res.redirect('/blogs')
        })
    }catch(err){
        req.flash('error','Provided Email is already registered with some other account')
        res.redirect('/register');
    }
   
}

module.exports.logOut = (req, res, next)=>{
    req.logOut( (err)=>{
        if(err)
            return next(err);
        req.flash('success', "Your are Successfully Logged Out")
        res.redirect('/blogs');
    });
    
}

module.exports.loginForm = (req, res)=>{
    res.render('user/login');
}

module.exports.registerForm = (req, res)=>{
    res.render('user/register')
}

module.exports.login = (req, res)=>{
    req.flash('success', `Welcome Back ${req.user.firstname} ${req.user.lastname}`)
    res.redirect('/blogs');
}


module.exports.profile = CatchAsync(async (req, res)=>{
    const {userId} = req.params;
    const user = await User.findById(userId);
    if(!user){
        req.flash('error', "User doesn't exists");
        return res.redirect('/blogs');
    }
    const blogs = await Blog.find({user: userId}).sort({'stats.likeCount': -1});
    let isFollow = false;

    if(req.isAuthenticated() && req.user.isVerified){
        isFollow = await Follow.isFollow(req.user._id, userId);
    }
    res.render('user/profile', {user: user, isFollow: isFollow, blogs: blogs});
})