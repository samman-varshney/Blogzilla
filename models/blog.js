const mongoose = require('mongoose');
const { Schema } = mongoose;
const { JSDOM } = require('jsdom');
const Comment = require('./comment');
const {cloudinary} = require('../cloudinary')
const Like = require('./like')

const thumbnailSchema = new Schema({
    url: {
        type: String,
        required: true
    },
    filename: {
        type: String,
        required: true
    }
}, { _id: false });  // Prevent creating a separate _id for subdoc

const blogSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['Technology', 'Health', 'Lifestyle',
            'Travel', 'Food', 'Entertainment',
            'Literature', 'Religion', 'Science',
            'Astronomy', 'Photography', 'Cooking'],
        required: true
    },
    thumbnail: {
        type: thumbnailSchema,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    stats: {
        commentCount: {
            type: Number,
            default: 0,
            min: 0
        },
        likeCount: {
            type: Number,
            default: 0,
            min: 0
        },
        viewCount: {
            type: Number,
            default: 0,
            min: 0
        },
        wordCount: {
            type: Number,
            required: true,
        },
        charCount: {
            type: Number,
            required: true
        }
    },
    summary: {
        type: String,
        trim: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tags: [{
        type: Schema.Types.ObjectId,
        ref: 'Tag'
    }]
}, { timestamps: true });


blogSchema.index({user: 1});

blogSchema.methods.getCommentsWithUsers = async function(){
    return await Comment.find({blog: this._id}).populate('user');
}

blogSchema.post('findOneAndDelete', async function (data) {
    if (!data) return //if no blog is delete then return 
    const blogId = data._id//blog Id
    await Comment.deleteMany({ blog: blogId });//deleting all associated comments 
    await Like.deleteMany({blog: blogId});//deleting all the likes
    await cloudinary.uploader.destroy(data.thumbnail.filename);//deleting associated cloudinary files
})


blogSchema.virtual('preview').get(function () {
    try {
        if (this.summary) return this.summary;

        const html = `<!DOCTYPE html><html><body>${this.content}</body></html>`;
        const dom = new JSDOM(html);
        const doc = dom.window.document;

        const firstP = doc.querySelector('p');
        return firstP
            ? firstP.textContent.trim().substring(0, 50)
            : doc.body.textContent.trim().substring(0, 50);
    } catch (err) {
        console.error('Preview error:', err.message);
        return 'error';
    }
});


blogSchema.virtual('readTime').get(function () {
    const wordsPerMinute = 200;
    const totalMinutes = this.stats.wordCount / wordsPerMinute;

    const minutes = Math.floor(totalMinutes);
    const seconds = Math.round((totalMinutes - minutes) * 60);

    if (minutes === 0) return `${seconds} sec `;
    if (seconds < 10) return `${minutes} min `;
    return `${minutes} min ${seconds} sec`;
})

blogSchema.set('toObject', { virtuals: true });
blogSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Blog', blogSchema);
