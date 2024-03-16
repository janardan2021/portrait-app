const Admin = require('./models/admins');
const Review = require('./models/reviews');
const Message = require('./models/messages');
const Portrait = require('./models/portraits');

// this saves the requested url to session if not logged in, then redirects to login route
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl; // add this line
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}
// call this middleware before passport.authenticate() middleware in login route
// Afterpassport.authenticate() is successfull, redirect to res.locals.return inside the login route handler function
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

module.exports.isAdmin = async (req, res, next) => {
    const admin = await Admin.findOne();
    if (!admin._id.equals(req.user._id)){
        req.flash('error', 'Permission denied');
        return res.redirect('/');
    }
    next();
}
