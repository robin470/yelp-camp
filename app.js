if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}
//console.log(process.env.SECRET)
const express = require('express');
const path = require('path');
const ejsMate = require('ejs-mate')
const mongoose = require('mongoose');
const methodOverride = require('method-override')
const ExpressError = require('./utils/ExpressError')
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

const helmet = require('helmet');
const sanitizeV5 = require('./utils/mongoSanitizeV5.js');

const reviewRoutes = require('./routes/reviews')
const campgroundRoutes = require('./routes/campgrounds')
const userRoutes = require('./routes/users');

const MongoDBStore = require('connect-mongo')(session);
//const dbUrl = process.env.DB_URL
const dbUrl = 'mongodb://127.0.0.1:27017/yelp-camp';
//console.log("DB_URL:", process.env.DB_URL);

mongoose.connect(dbUrl);
//mongoose.connect(dbUrl)
const db = mongoose.connection;
db.on('error', console.error.bind(console,"connection error"));
db.once("open", ()=>{
    console.log("Database connected")
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views') )

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')))

app.use(sanitizeV5({ replaceWith: '_' }));

const store = new MongoDBStore({
    url: dbUrl,
    secret: 'thisshouldbeabettersecret!',
    touchAfter: 24 * 60 * 60
})

store.on('error',function(e){
    console.log("session store error", e);
})

const sessionConfig = {
    store,
    name: 'session',
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie:{
        httpOnly: true,
        //secure: true,
        expires: Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet({ contentSecurityPolicy: false }));


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/da84l8ko6/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    //console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

//app.get('')

app.use('/', userRoutes)
app.use('/campgrounds',campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.get('/',(req,res)=>{
    res.render('home')
})

app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError('Page not found', 404))
})

app.use((err,req,res,next) =>{
    const{statusCode=500, message='Someth wrng'} = err; 
    if(!err.message) err.message='Oh no Somthng wrong!'
    res.status(statusCode).render('error',{err});
    //res.send('oh boy somth wrng');
})

app.listen(3000, ()=>{
    console.log('Listening to port 3000')
})

/*
npm install cloudinary@1.41.3

npm install multer-storage-cloudinary@4.0.0

npm install multer@1.4.5-lts.1
*/