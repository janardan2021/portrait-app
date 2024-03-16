const {loginSchema, reviewSchema, contactSchema} = require('./joiSchemas.js');

const AppError = require('./utils/ExpressError.js');
const Admin = require('./models/admins.js');
const Review = require('./models/reviews.js');

// Joi validation of an admin
module.exports.validateUser = (req, res, next) => {
    const validatedResult = loginSchema.validate(req.body);
    if (validatedResult.error) {
        console.log(validatedResult)
        const message = validatedResult.error.details.map(el => el.message).join(' , ');
        req.flash('error', message);
        // res.redirect('/reviews');
        throw new AppError(message, 400, req.originalUrl);
    } else {
        next();
    }
    // console.log(result);
}

// module.exports.validateLogin = (req, res, next) => {
//     const validatedResult = loginSchema.validate(req.body);
//     if (validatedResult.error) {
//         console.log(validatedResult)
//         const message = validatedResult.error.details.map(el => el.message).join(' , ');
//         throw new AppError(message, 400);
//     } else {
//         next();
//     }
    // console.log(result);
// }

// Joi validation of a review
module.exports.validateReview = (req, res, next) => {
    const validatedResult = reviewSchema.validate(req.body);
    if (validatedResult.error) {
        const message = validatedResult.error.details.map(el => el.message).join(' , ');
        throw new AppError(message, 400, req.originalUrl);
    } else {
        next();
    }
}

module.exports.validateContact = (req, res, next) => {
    const validatedResult = contactSchema.validate(req.body);
    if (validatedResult.error) {
        const message = validatedResult.error.details.map(el => el.message).join(' , ');
        throw new AppError(message, 400, req.originalUrl);
    } else {
        next();
    }
}