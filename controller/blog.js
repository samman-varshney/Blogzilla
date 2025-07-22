const Blog = require('../models/blog')
const CatchAsync = require('../utils/catchAsync')
const User = require('../models/user')
const {cloudinary} = require('../cloudinary')
const Like = require('../models/like')
const AppError = require('../utils/AppError')

module.exports.index = CatchAsync(async (req, res)=>{

    const blogs = await Blog.find().sort({updatedAt:1});
    const popularBlogs = await Blog.aggregate([
        {
            $addFields : {
                score :{
                    $add: [
                        {$multiply: ['$stats.likeCount', 3]},
                        { $multiply: ['$stats.viewCount', 1]}
                    ]
                },
                readTime: {
                    $ceil: {
                        $divide: ['$stats.wordCount', 200]
                    }
                }
                
            }
        },
        {$sort: {score: -1}},
        {$limit: 5}
    ]);
    // console.log(popularBlogs)
    res.render('blog/index', {blogs: blogs, currentPage: 1, popularBlogs: popularBlogs, totalPages: 1});

})

module.exports.createForm = CatchAsync(async (req, res)=>{
    res.render('blog/create');
})

module.exports.editForm = CatchAsync(async (req, res)=>{

    const {blogId} = req.params
    const blog = await Blog.findById(blogId);
    if(!blog || !blog.user.equals(req.user._id)){
        req.flash('error', "blog doesn't exists")
        return res.redirect('/blogs');
    }
    res.render('blog/edit', {blog: blog})
})

module.exports.show = CatchAsync(async (req, res)=>{
    const {blogId} = req.params

    const blog = await Blog.findByIdAndUpdate(
                    blogId,
                    { $inc: { 'stats.viewCount': 1 } },
                    { new: true }
                ).populate('user');
            
    if(!blog){
        req.flash('error', "blog doesn't exists")
        return res.redirect('/blogs');
    }

    const comments = await blog.getCommentsWithUsers();
    
    const recommended = await Blog.find({
                    _id: { $ne: blogId }, // exclude current blog
                    $or: [
                        { category: blog.category }
                    ]
                    }).limit(10).sort({'stats.likes': 1});

    let isLiked = false;
    if(req.user){
        isLiked = await Like.isLikesByUser(req.user._id, blogId);
    }
    // console.log(blog.stats.views)

    res.render('blog/show', {comments: comments,
                            blog: blog, 
                            recommended: recommended,
                            isLiked: isLiked});
})

module.exports.create = CatchAsync(async (req, res)=>{
    console.log('creating a post...')
    
    const blog = new Blog({...req.body,
                            thumbnail: {url: req.file.path, filename: req.file.filename},
                            user: req.user._id})
    
    
    await User.findByIdAndUpdate(req.user._id,
                                {$inc: {'stats.blogCount': 1}}
                                );
    
    await blog.save();
    
    console.log('post created')
    req.flash('success', 'Blog created Successfully')
    res.redirect(`/blogs/${blog._id}/show`);
})


module.exports.edit = CatchAsync(async (req, res) => {
    console.log('Updating a post...');

    const { blogId } = req.params;
    const blog = await Blog.findById(blogId);

    if (!blog || !blog.user.equals(req.user._id)) {
        req.flash('error', "Blog doesn't exist");
        return res.redirect('/blogs');
    }


    blog.title = req.body.title;
    blog.category = req.body.category;
    blog.content = req.body.content;
    blog.stats.wordCount = req.body.stats.wordCount;
    blog.stats.charCount = req.body.stats.charCount;

    
    if (req.file) {
        try {
            await cloudinary.uploader.destroy(blog.thumbnail.filename);
            blog.thumbnail = {
                url: req.file.path,
                filename: req.file.filename
            };
        } catch (err) {
            console.error("Cloudinary Deletion Error:", err.message);
            throw new AppError("Failed to delete old image from Cloudinary", 500);
        }
    }

    await blog.save();
    console.log('Post is updated');

    req.flash('success', 'Blog updated successfully');
    res.redirect(`/blogs/${blogId}/show`);
});


module.exports.delete = CatchAsync(async (req, res)=>{
    console.log('deleting a post...')

    // checking is the request to delete a blog is valid or not
    const {blogId} = req.params;
    const blog = await Blog.findById(blogId);
    if(!blog || !blog.user.equals(req.user._id)){
        req.flash('error', "Blog doesn't exists");
        return res.redirect('/blogs')
    }

    //deleting the reference from user model
    await User.findByIdAndUpdate(req.user._id,
        {$inc: {'stats.blogCount': -1}}
    );
    
    //deleting the blog finally this will call a query middleware that will
    // // delete all the comments amade on this blog and also the likes and cloudinary images
    await Blog.findByIdAndDelete(blogId);

    console.log('post deleted')
    req.flash('success', "Blog deleted Successfully")
    res.redirect('/dashboard/myblogs')
})