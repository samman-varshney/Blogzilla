const multer = require("multer");
const path = require('path');
const blogSchema = require("./joiShema/blog");
const { cloudinary } = require("./cloudinary");
const AppError = require("./utils/AppError");
const commentSchema = require("./joiShema/comment");
const userSchema = require("./joiShema/user");


module.exports.isLoggedIn = (req, res, next)=>{
    if(req.isAuthenticated() && req.user.isVerified){
        return next();
    }
    req.flash('error', "You need to signin first")
    res.redirect('/login');
}

module.exports.apiAuth = (req, res, next)=>{
    if(req.isAuthenticated() && req.user.isVerified){
        return next();
    }
    res.status(404).json({message: 'unAuthorised user'})
}

module.exports.getClientIp = (req) => {
    let ip = req.headers['x-forwarded-for'] || 
             req.ip || 
             req.connection.remoteAddress || 
             req.socket.remoteAddress ||
             req.connection.socket.remoteAddress;
    
    // Handle multiple IPs in x-forwarded-for
    if (ip && ip.includes(',')) {
        ip = ip.split(',')[0].trim();
    }
    
    // Handle IPv6 format
    if (ip && ip.includes('::ffff:')) {
        ip = ip.replace('::ffff:', '');
    }
    
    return ip;
};

module.exports.getHandle = (email)=>{
    return email.split('@')[0]+Math.floor(Math.random()*10000 + 1);
}


//we can add support for object or arrays as field in future for more complex uploads
module.exports.uploadMiddleware = (storage, field, fileSize, option = {}) => {
    return function (req, res, next) {
        const upload = multer({
            storage: storage,
            limits: {
                fileSize: (fileSize || 2) * 1024 * 1024,
            },
            fileFilter: (req, file, cb) => {
                const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
                const allowedExts = ['.jpeg', '.jpg', '.png', '.webp'];
                const ext = path.extname(file.originalname).toLowerCase();

                if (allowedTypes.includes(file.mimetype) && allowedExts.includes(ext)) {
                    cb(null, true);
                } else {
                    cb(new Error(`Invalid file type: ${file.mimetype}, ext: ${ext}`));
                }
            }
        });

        const uploadHandler = option.multiple
            ? upload.array(field, option.maxCount || 4)
            : upload.single(field);

        uploadHandler(req, res, err => {
            if (err) {
                console.log(err.message);
                req.flash('error', `Upload error: ${err.message}`);
                return res.redirect(option.redirectTo || '/blogs');
            }
            next();
        });
    };
};


module.exports.validateBlog = async (req, res, next) => {
    console.log('Validating blog content');

    const { error, value } = blogSchema.validate({blog: req.body}); // or wrap in { blog: req.body } if schema expects

    if (error) {
        // Attempt to clean up uploaded files if validation fails
        try {
            if (req.file) {
                await cloudinary.uploader.destroy(req.file.filename);
            } 
        } catch (err) {
            console.error('Deletion failed for invalid blog upload:', err);
        }

        const message = error.details.map(el => el.message).join(', ');
        return next(new AppError(message, 400));
    }

    // You can attach validated data to a new key if you prefer
    req.validBlog = value; 
    return next();
};

module.exports.validateComment = (req, res, next)=>{
    console.log('validating the comment');
    const {error, value} = commentSchema.validate({comment: req.body});
    if(error){
        console('invalid comment');
        const message = error.details.map(el => el.message).join(', ');
        return next(new AppError(message, 400));
    }
    req.validComment = value;
    next();
}
module.exports.validateUser = (req, res, next)=>{
    console.log('validating the user profile');
    for( let key in req.body.socials){
        if(req.body.socials[key] === ''){
            delete req.body.socials[key];
        }
    }
    const {error, value} = userSchema.validate({user: req.body});
    if(error){
        console.log('invalid user profile');
        const message = error.details.map(el => el.message).join(', ');
        return next(new AppError(message, 400));
    }
    req.validUser = value;
    next();
}