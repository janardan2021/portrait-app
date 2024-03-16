const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const Admin = require('../models/admins');
const Review = require('../models/reviews');
const Message = require('../models/messages');
const Portrait = require('../models/portraits');
const multer  = require('multer')
const {validateUser, validateReview} = require('../joiMiddlewares');

const {storage} = require('../cloudinary')
const { cloudinary } = require("../cloudinary");
// const upload = multer({ dest: 'uploads/' })
const upload = multer({ storage })
const { storeReturnTo , isAdmin, isLoggedIn} = require('../middlewares');
const { Template } = require('ejs');


// ------------------------Register Admin Start-----------------------------------
router.get('/register', (req, res) => {
    // console.log('Register an admin')
    res.render('templates/admins/register');
});

router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const admin = new Admin({ email, username });
        const registeredAdmin = await Admin.register(admin, password);
        req.login(registeredAdmin, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to your portrait website!');
            res.redirect('/');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/admin/register');
    }
}));
// --------------------------Register Admin End-----------------------------------


router.get('/', isLoggedIn, isAdmin, (req, res) => {
    res.render('templates/admins/workspace');
});

router.get('/workspace', isLoggedIn, isAdmin, (req, res) => {
        res.render('templates/admins/workspace');
})   



router.get('/viewPortraits', isLoggedIn, isAdmin,  async (req, res) => {
    // const allImages = await Portrait.find({})
    const allPortraits = await Portrait.find({}, { url: 1, filename: 1, _id: 0 })
    res.render('templates/admins/allPortraits', {allPortraits})
})

router.get('/uploadToGallery' , isLoggedIn , isAdmin,  (req, res) => {
    res.render('templates/admins/uploadForm')
})

router.post('/uploadToGallery' , isLoggedIn , isAdmin,  upload.array('portraits'), async (req, res) => {
    const portraitArray = req.files.map(file => ({url: file.path, filename: file.filename}));
    await Portrait.insertMany(portraitArray);
    // console.log(req.files);
    // console.log(portraitArray);
    // res.send('IT WORKED');
    req.flash('success', 'Successfully uploaded to the gallery');
    res.redirect('/admin/workspace');
})

router.get('/deletePortraits', isLoggedIn , isAdmin, async (req, res) => {
    // const allImages = await Portrait.find({})
    const allImages = await Portrait.find({}, { url: 1, filename: 1, _id: 0 })
    res.render('templates/admins/deletePortraits', {allImages})
})

router.post('/deletePortraits', isLoggedIn , isAdmin, async (req, res) => {

    // console.log(req.body);
    const beforeDelete = await Portrait.find({});
    // console.log(beforeDelete)

    if (req.body.deletePortraits) {
        for (let filename of req.body.deletePortraits) {
            await cloudinary.uploader.destroy(filename);
        }
         await Portrait.deleteMany({ filename: { $in: req.body.deletePortraits }  }); 
      }

    const afterDelete = await Portrait.find({});
    // console.log(afterDelete)
    req.flash('success', 'Successfully deleted the portraits');
    res.redirect('/admin/workspace');
    // res.send('SUCCESSFULLY DELETED PORTRAITS')
})


router.get('/viewMessages', isLoggedIn , isAdmin, async (req, res) => {
   // const allImages = await Portrait.find({})
   const allMessages = await Message.find({}, { name: 1, email: 1, subject: 1, _id: 1 })
   res.render('templates/admins/allMessages', {allMessages})
})

router.delete('/deleteMessage/:id' , isLoggedIn , isAdmin, async (req, res) => {
    const {id} = req.params;
    await Message.findByIdAndDelete(id);
    req.flash('success', 'Sucessfully deleted the message!');
    res.redirect('/admin/viewMessages');
})

router.use ((err, req, res, next) => {
    req.flash('error', err.message);
    res.redirect('/admin');
    
})

module.exports = router;