const Joi = require('joi');

const userSchema = Joi.object({
    user: Joi.object({
        firstname: Joi
            .string()
            .trim()
            .min(1)
            .required()
            .messages({
                'string.base': 'firstname can be string only',
                'string.empty': 'firstname cannot be empty',
                'any.required': 'firstname is required'
            }),
        lastname: Joi
            .string()
            .trim()
            .min(1)
            .required()
            .messages({
                'string.base': 'lastname can be string only',
                'string.empty': 'lastname cannot be empty',
                'any.required': 'lastname is required'
            }),
        bio: Joi.string(),
        socials: Joi.object({
           twitter: Joi.string().pattern(/^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[A-Za-z0-9_]{1,15}$/
            ).messages({
                'string.pattern.base': 'Twitter URL must be a valid twitter.com or x.com profile link'
            }),
            linkedin: Joi.string().pattern(/^https?:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9-_%]+\/?$/).messages({
                'string.pattern.base': 'LinkedIn URL must be a valid linkedin.com/in/ profile link'
            }),
            github: Joi.string().pattern(/^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9-]+\/?$/).messages({
                'string.pattern.base': 'GitHub URL must be a valid github.com profile link'
            }),
            instagram: Joi.string().pattern(/^https?:\/\/(www\.)?instagram\.com\/[A-Za-z0-9_.]+\/?$/).messages({
                'string.pattern.base': 'Instagram URL must be a valid instagram.com profile link'
            })
        })
    }).required().messages({
        'any.required': 'user profile is required'
    })
});

module.exports = userSchema;
