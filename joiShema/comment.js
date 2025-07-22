const Joi = require('joi');

const commentSchema = Joi.object({
    comment: Joi.object({
        body: Joi.string().trim().required().messages({
            'string.base': 'comment boby must be a string',
            'string.empty': 'comment boby cannot be empty',
            'any.required': 'comment boby is required'
        })
    }).required().messages({
        'any.required': 'comment object is missing'
    })
})

module.exports = commentSchema;