const Campground = require('./models/campground');
const Review = require('./models/review');
const{campgroundSchema, reviewSchema} = require('./schemas')
const ExpressError = require('./utils/ExpressError');

const middleware = {};

middleware.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in');
        return res.redirect('/login');
    }
    next();
};

middleware.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
};

middleware.validateCampground = (req,res,next)=>{
    //console.log(req.body);
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg,400)
    } else{
        next();
    }
    //const result = campgroundSchema.validate(req.body || {});
    //console.log(result)
}

middleware.isAuthor = async(req,res,next)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){
        req.flash('error','you dont have permission for that');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}
middleware.isReviewAuthor = async(req,res,next)=>{
    const {id, reviewId} = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash('error','you dont have permission for that');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

middleware.validateReview = (req,res,next)=>{
    const{error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg,400)
    } else{
        next();
    }
}


module.exports = middleware;
