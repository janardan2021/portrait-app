if (process.env.NODE_ENV != "production") {
  require('dotenv').config();
} 

const express = require('express');
const path = require('path'); 
const ejsMate = require('ejs-mate');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const Joi = require('joi');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const {validateUser, validateReview, validateContact} = require('./joiMiddlewares');
const Admin = require('./models/admins');
const Review = require('./models/reviews');
const Portrait = require('./models/portraits');
const Message = require('./models/messages');
const { storeReturnTo , isAdmin, isLoggedIn} = require('./middlewares');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const multer  = require('multer')
const nodemailer = require("nodemailer");

const adminRoutes = require('./routes/admin');
// const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/review');

// ----------connect mongoose to the database-------------
const dbUrl = process.env.DB_URL || process.env.DB_URL_DEV;
mongoose.connect(dbUrl)
   .then(() => {
    console.log('MONGO CONNECTION OPEN')
   })
   .catch( err => {
    console.log('Connection to mongo serve not possible')
    console.log('MONGO CONNECTION ERROR!!!')
    console.log(err);
   })
// To handle errors after initial connection was established, you should listen for error events on the connection. 
const db = mongoose.connection;
db.on('error', err => {
    console.log(err);
  });
// ----------mongoose connection----------------


const app = express();


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('ejs', ejsMate);


app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());
app.use(helmet());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net/",
  "https://cdnjs.cloudflare.com/",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = [
  "https://cdnjs.cloudflare.com/"
];
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
              "https://res.cloudinary.com/dre4mtxri/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
              "https://images.unsplash.com/",
          ],
          fontSrc: ["'self'", ...fontSrcUrls],
      },
  })
);

const secret = process.env.SECRET

const sessionConfig = {
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    }
}

app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use('admin', new LocalStrategy(Admin.authenticate()));
passport.use('review', new LocalStrategy(Review.authenticate()));

async function getDocument(model, id) {
    const document = await model.findById(id);
    return document;
  }

passport.serializeUser((obj, done) => {
    if (obj instanceof Admin) {
      done(null, { id: obj.id, type: 'Admin' });
    } else {
      done(null, { id: obj.id, type: 'Review' });
    }
  });
  
  passport.deserializeUser(async (obj, done) => {
    if (obj.type === 'Admin') {
    const document = await Admin.findById(obj.id);
       done(null, document);
    //   Admin.get(obj.id).then((admin) => done(null, admin));
    } else {
        const document = await Review.findById(obj.id);
        done(null, document);
    //   Review.get(obj.id).then((review) => done(null, review));
    }
  });

// passport.serializeUser(Admin.serializeUser());
// passport.serializeUser(Review.serializeUser());

// passport.deserializeUser(Admin.deserializeUser());
// passport.deserializeUser(Review.deserializeUser());



app.use((req, res, next) => {
    // console.log(req.session)
    // console.log(req.query)
    res.locals.activeUser = req.user;
    res.locals.isAdmin = req.user instanceof Admin;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


// app.get('/review', (req, res) => {
//     res.render('templates/users/review')
// })
// app.get('/gallery', (req, res) => {
//     res.render('templates/gallery/gallery')
// })
app.use('/admin', adminRoutes);
app.use('/reviews', reviewRoutes);




app.get('/', (req,res) => {
    res.render('templates/home');
})

app.get('/gallery', async (req,res) => {
  const portraits = await Portrait.find({}, { url: 1, filename: 1, _id: 0 })
  res.render('templates/gallery', {portraits});
})

app.get('/reviews', async (req,res) => {
  const reviews = await Review.find({}, { username: 1, rating: 1, comment: 1, _id: 0 })
  // res.render('templates/gallery/gallery', {portraits});
  res.render('templates/reviews', {reviews})
})

app.get('/prices', (req,res) => {
  res.render('templates/prices');
})

app.get('/FAQ', (req,res) => {
  res.render('templates/FAQ');
})

app.get('/contact', (req,res) => {
  res.render('templates/contact');
})



app.post('/contact', validateContact,  catchAsync(async (req, res, next) => {
  const { name, email, subject } = req.body;
  const count = await Message.countDocuments()
  // console.log(count)
  if (count <=5) {
    const message = new Message({ name, email, subject });
    message.save(); 
    req.flash('success', 'I got your message. You will hear from me soon!');
    return res.redirect('/contact');
  } else {
    req.flash('error', 'Sorry, the artist is busy. Please try agian in few hours!');
    return res.redirect('/contact');
  }
  
}));

app.get('/login', (req,res) => {
  res.render('templates/login');
})

app.post('/login', storeReturnTo, validateUser, passport.authenticate(['admin', 'review'], {failureFlash: true, failureRedirect: '/login'}), 
    (req, res,) => {
        // console.log(req.session);
        const redirectUrl = res.locals.returnTo || '/'; 
        delete res.locals.returnTo;
        // res.redirect(redirectUrl);
        // console.log(req.user);
        if (req.user instanceof Admin) {
            req.flash('success', 'Welcome back to your workspace!');
            return res.redirect(redirectUrl);
        } else if (req.user instanceof Review) {
            req.flash('success', 'Welcome, you can now submit the review!');
            return res.redirect(redirectUrl);
        }
        
 });

 app.get('/logout', (req, res, next) => {
  req.logout(function (err) {
      if (err) {
          return next(err);
      }
      req.flash('success', 'Goodbye!');
      res.redirect('/');
  });
}); 

app.get('/*', (req,res) => {
  res.render('templates/home');
})

// ---------Throw AppError for all unvalid routes---------
// app.get('/*', async (req, res, next) => {
//     console.log('star route hit')
//     next (new ExpressError('Page not found', 404))
// })


// ----------Custom error haandler---------------------
app.use ((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'Some unknown error occured!!!';
    // console.log('**************ERROR*******************')
    // console.log(statusCode + ' ===> '+ err.message);
    // console.log('**************ERROR*******************')
    // res.status(statusCode).send(err.message);
    // res.status(statusCode).render('error', {err})

    req.flash('error', err.message);
    // console.log(err.redirectURL)
    res.redirect(err.redirectURL)
    // res.redirect('/');
    
})
// -----------Running the app--------------
app.listen(2000, () => {
    console.log('App running on port 2000')
});


