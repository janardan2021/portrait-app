const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviews');
const {validateUser, validateReview} = require('../joiMiddlewares');

const { storeReturnTo , isAdmin, isLoggedIn} = require('../middlewares');

router.get('/register',  isLoggedIn, isAdmin, (req, res) => {
    // req.flash('error', err.message);
    // console.log(res.locals.error);
    req.flash('error', res.locals.error[0])
    res.redirect('/admin');
    // res.render('templates/reviews');
})

// Create a review token for the customer
router.post('/register', isLoggedIn, isAdmin, validateUser, catchAsync(async (req, res, next) => {
    const { username, password } = req.body;
    const review = new Review({ username });
    // console.log(req.session);
    const registeredReview = await Review.register(review, password);
    // console.log(req.session);
    req.flash('success', 'Review token for customer successfully created!');
    res.redirect('/admin/workspace');
     
}));

router.post('/comment', isLoggedIn, validateReview, catchAsync(async (req, res, next) => {
    const { rating, comment } = req.body;
    await Review.updateOne({ _id: req.user.id }, { rating: rating , comment: comment });
    res.redirect('/reviews')
    // const  review = await Review.findById(req.user.id);
    // res.send(review)
         
}));  

router.get('/login', (req, res) => {
    // req.flash('error', err.message);
    req.flash('error', res.locals.error[0])
    res.redirect('/reviews');
    // res.render('templates/reviews');
})

router.post('/login', validateUser, passport.authenticate('review', {failureFlash: true, failureRedirect: '/reviews/login'}),
    (req, res) => {
        req.flash('success', 'Hi, you can now post your review');
        res.redirect('/reviews');
    });



router.use ((err, req, res, next) => {
    req.flash('error', err.message);
    // console.log('from review route js')
    // console.log(err.redirectURL);
    res.redirect(err.redirectURL);
    
})

// Render review Page
// router.get('/', (req, res) => {
//     res.render('templates/reviews/reviewPage');
// });


// Render registration form to create a review token to the admin
// router.get('/register', (req, res) => {
//     res.render('templates/reviews/register');
// });



// router.get('/login', (req, res) => {
//     res.render('templates/reviews/login');
// })


  


// router.post('/login', passport.authenticate('review', {failureFlash: true, failureRedirect: '/reviews/login'}),
//     (req, res) => {
//         // console.log('LOGGED IN')
//         // console.log(req.user)
//         // req.session.activeUser = req.user.username;
//         // console.log(req.session);
//         // console.log(req.isAuthenticated())
//         // res.locals.username = req.user.username;
//         req.flash('success', `Hi ${req.user.username}, you are successfully logged in! `);
//         res.redirect('/reviews');
//     });

    // router.get('/comment', (req, res) => {
    //     res.render('templates/reviews/comment');
    // })


  

// router.get('/logout', (req, res, next) => {
//     req.logout(function (err) {
//         if (err) {
//             return next(err);
//         }
//         req.flash('success', 'Successfully logged out!');
//         res.redirect('/reviews');
//     });
// }); 


module.exports = router;