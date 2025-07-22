const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose')
const { Schema } = mongoose;
const Blog = require('./blog');
const Follow = require('./follow')
const {cloudinary} = require('../cloudinary')


const userSchema = new Schema({
    firstname: {
        type: String,
        required: true,
        trim: true
    },
    lastname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    },
    avatar: {
        url: {
            type: String,
            default: '/images/cutezilla.png'
        },
        filename: {
            type: String,
            default: ''
        }
    },
    verified: {
        type: Boolean,
        default: true
    },
    bio: {
        type: String,
        trim: true
    },
    socials: {
        twitter: {
            type: String,
            match: [/^https?:\/\/(www\.)?(twitter\.com|x\.com)\/([A-Za-z0-9_]{1,15})\/?$/, 'Invalid Twitter profile URL']
        },
        linkedin: {
            type: String,
            match: [/^https?:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9-]{5,30}\/?$/, 'Invalid LinkedIn profile URL']
        },
        github: {
            type: String,
            match: [/^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9-]+\/?$/, 'Invalid GitHub profile URL']
        },
        instagram: {
            type: String,
            match: [/^https?:\/\/(www\.)?instagram\.com\/[A-Za-z0-9_.]+\/?$/, 'Invalid Instagram profile URL']
        }
    },
    handle: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true
    },
    stats: {
        followerCount: {
            type: Number,
            min: 0,
            default: 0
        },
        followingCount: {
            type: Number,
            min: 0,
            default: 0
        },
        blogCount: {
            type: Number,
            min: 0,
            default: 0
        }
    }
    
}, { timestamps: true });

userSchema.plugin(passportLocalMongoose, {usernameField: 'email'})

userSchema.virtual('fullname').get(function(){
    return this.firstname+" "+this.lastname;
})

userSchema.virtual('isVerified').get(function(){
    return this.verified;
})

userSchema.post('findOneAndDelete', async function(data){
    if(!data)return

    const blogs = await Blog.find({user: data._id});
    await Promise.all(blogs.map(blog => Blog.findByIdAndDelete(blog._id)));
    if(data.avatar && data.avatar.filename){
        await cloudinary.uploader.destroy(data.avatar.filename);
    }

})

userSchema.methods.getBlogs = async function(){
    return await Blog.find({user: this._id})
}

userSchema.methods.getFollowers = async function(){
    return await Follow.find({following: this._id}).populate('follow');
}

userSchema.methods.getFollowings = async function(){
    return await Follow.find({follow: this._id}).populate('following');
}



userSchema.set('toJSON', {virtuals: true})
userSchema.set('toObject', {virtuals: true})

module.exports = mongoose.model('User', userSchema);
