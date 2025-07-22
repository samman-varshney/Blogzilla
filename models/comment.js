const mongoose = require('mongoose');
const {Schema} = mongoose;
// const User = require('./user')
const commentSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    blog:{
        type: Schema.Types.ObjectId,
        ref: 'Blog',
        required: true
    },
    body: {
        type: String,
        required: true
    }
}, {timestamps: true})

commentSchema.index({blog: 1});


module.exports = mongoose.model('Comment', commentSchema);