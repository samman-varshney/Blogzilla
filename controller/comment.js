

const Blog = require('../models/blog');
const Comment = require('../models/comment');
const CatchAsync = require('../utils/catchAsync')


module.exports.create = CatchAsync(async (req, res)=>{

    const {blogId} = req.params;
    const blog = await Blog.findById(blogId);
    if(!blog){
        req.flash('error', "Blog doesn't exists")
        return res.redirect('/blogs');
    }

    const comment = new Comment({...req.body, user: req.user._id, blog: blogId});
    await Blog.findByIdAndUpdate(blogId, 
        {$inc: {'stats.commentCount' : 1}}
    )
    await comment.save();

    req.flash('success', 'Comment added Successfully')
    const referer = req.get('Referer').split('/').at(-1);
       
    if(referer === 'analytics'){
        return res.redirect(`/dashboard/blogs/${blogId}/analytics`)
    }
    res.redirect(`/blogs/${blogId}/show`);

})

module.exports.delete = CatchAsync(async (req, res)=>{

        console.log('deleting comment')

        const {blogId, commentId} = req.params;
        const blog = await Blog.findById(blogId);
        if(!blog){
            req.flash('error', "Blog doesn't exists")
            return res.redirect(`/blogs`);
        }
        
        const comment = await Comment.findById(commentId);
        if(!comment || !comment.blog.equals(blogId)){
            req.flash('error', "Comment doesn't exists")
            return res.redirect(`/blogs/${blogId}/show`);
        }

        if(!comment.user.equals(req.user._id) && !blog.user.equals(req.user._id)){
            req.flash('error', 'authorized action');
            return res.redirect('/blogs')
        }
        await Blog.findByIdAndUpdate(blogId, 
            {$inc: {'stats.commentCount' : -1}}
        )
        await Comment.deleteOne({ _id: commentId })
        console.log('comment deleted')
        req.flash('success', "Comment deleted Successfully")
        const referer = req.get('Referer').split('/').at(-1);
       
        if(referer === 'analytics'){
            return res.redirect(`/dashboard/blogs/${blogId}/analytics`)
        }
        res.redirect(`/blogs/${blogId}/show`)
})