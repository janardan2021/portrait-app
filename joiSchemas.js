const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML or Scripts!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)

module.exports.loginSchema = Joi.object({
    
            username: Joi.string().required(),
            password: Joi.string().required().min(3).max(30)
 
});

// Joi schema for a review
module.exports.reviewSchema = Joi.object({

            rating: Joi.number().required().min(1).max(5),
            comment: Joi.string().required().escapeHTML()
   
});

module.exports.contactSchema = Joi.object({
    
    name: Joi.string().required().escapeHTML(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    subject: Joi.string().required().escapeHTML()

});