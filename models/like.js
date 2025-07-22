const mongoose = require('mongoose');
const {Schema} = mongoose;

const likeSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    blog: {
        type: Schema.Types.ObjectId,
        ref: 'Blog',
        required: true
    }
}, {timestamps: true})

likeSchema.index({user: 1, blog: 1}, {unique: true});//for query the like doc by combined user and blog Id and prevent duplicacy by set it as unique
likeSchema.index({blog: 1});

likeSchema.statics.isLikesByUser = async function (userId, blogId){
    return await this.findOne({user: userId, blog: blogId});
}

likeSchema.statics.toggle = async function (userId, blogId){
    const exists = await this.findOne({user: userId, blog: blogId});

    if(exists){
        await this.deleteOne({user: userId, blog: blogId});
        return false; //unliked
    }else{
        await this.create({ user: userId, blog: blogId });
        return true; //liked
    }
}

module.exports = mongoose.model('Like', likeSchema);