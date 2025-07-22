if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}


const express = require('express');
const app = express();
const path = require('path');

//extension for ejs template
const ejsMate = require('ejs-mate'); // ejs-mate is a template engine that extends ejs
//it add newer functionalities to ejs like layout, partials, etc

//middleware 
const methodOverride = require('method-override');

//models
const User = require('./models/user')
const Blog = require('./models/blog')

//mongoose
const mongoose = require('mongoose');

//require connect-mongo for session store

//session and flash
const session = require('express-session')
const flash = require('connect-flash');
const MongoDBStore = require("connect-mongo");

//passport
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// routes 
const blogRoutes = require('./routes/blog')
const commentRoutes = require('./routes/comment')
const userRoutes = require('./routes/user')
const dashboardRoutes = require('./routes/dashboard');
const draftRoutes = require('./routes/draft')


//api

const searchApi = require('./apis/search');
const categoryApi = require('./apis/category');
const likeApi = require('./apis/like');
const followApi = require('./apis/follow');
const draftApi = require('./apis/draft')

//requiring utilities

require('./jobs/cleanupDrafts');

//connecting to mongodb database
const dbURL = process.env.MONGO_DB_URL || 'mongodb://127.0.0.1:27017/blogzilla';
mongoose.connect(dbURL)
    .then(() => {
        console.log('connected to  database successfully.');
    })
    .catch(err => {
        console.log("Database connection failed");
        console.log(err);
    })



app.set('view engine', 'ejs') // it set the view engine to ejs that means 
// the files we are going to render from the views directory will be ejs files
app.set('views', path.join(__dirname, 'views')); //set the views directory itself
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public'))); // it set the public directory to serve static files like css, js, images, etc
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.json());

//setting up session
const secret = process.env.SECRET || 'thisIsATopSecretKeepItSimple';
const store = MongoDBStore.create({
    mongoUrl: dbURL,
    secret: secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})
app.use(session({
    secret: secret,
    name: 'colectora',
    store: store,
    resave: false,
    secure: true,
    saveUninitialized: false,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
}))

//setting up flash
app.use(flash());

// setting up passport support 
app.use(passport.initialize());//provide passport support
app.use(passport.session());//integrat the session and passport
passport.use(new LocalStrategy({ usernameField: 'email' }, User.authenticate()))//tell passport to use local strategy fo login and define it's method too - User.authenticate()

passport.serializeUser(User.serializeUser());//tell passport what to stroe in session 
passport.deserializeUser(User.deserializeUser());//telling passport what to extract from session and attach to req object


// setting up locals
app.use((req, res, next) => {
    // console.log(req.session)
    // console.log(req.user);
    res.locals.categories = Blog.schema.path('category').enumValues;
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error')

    next()
})


// middleware to extract ip from req object
const { getClientIp } = require('./middleware');


// app.use((req, res, next)=>{
//     console.log(req.path);
//     next()
// })
// external routes 
app.use('/blogs', blogRoutes);
app.use('/blogs/:blogId/comments', commentRoutes);
app.use('/', userRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/drafts', draftRoutes)

//external apis
app.use('/api/search', searchApi);
app.use('/api/categories', categoryApi);
app.use('/api/blogs', likeApi);
app.use('/api/follow', followApi);
app.use('/api/drafts', draftApi)

// home page route 
app.get('/', (req, res) => {
    res.render('home');
});
//about route


//t&c route
app.get('/t&c', (req, res) => {
    res.render('T&C');
})

app.get('/about', (req, res) => {
    res.render('about');
})

// catch undefined endpoints 
app.use((req, res, next) => {
    const err = new Error('Page Not Found');
    err.statusCode = 404;
    next(err);
});

// custome error handler 
app.use((err, req, res, next) => {
    console.log(err)
    const { statusCode = 500, message = 'Something went wrong' } = err;
    res.status(statusCode).render('PNF', { error: err, req: { ip: getClientIp(req), path: req.path, method: req.method } });  // or render a custom error page
});

const port = process.env.PORT || 3000 ;
app.listen(port, () => {
    console.log('Server is running on http://localhost:3000');
});