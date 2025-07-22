const Joi = require('joi');
const Blog = require('../models/blog');

const categories = Blog.schema.path('category').enumValues;

const blogSchema = Joi.object({
  blog: Joi.object({
    title: Joi.string().trim().min(1).required().messages({
      'string.base': 'Title must be a string.',
      'string.empty': 'Title cannot be empty.',
      'any.required': 'Title is required.'
    }),
    category: Joi.string().valid(...categories).required().messages({
      'any.only': `Category must be one of: ${categories.join(', ')}`,
      'string.base': 'Category must be a string.',
      'string.empty': 'Category cannot be empty.',
      'any.required': 'Category is required.'
    }),
    content: Joi.string().trim().min(100).required().messages({
      'string.base': 'Content must be a string.',
      'string.empty': 'Content cannot be empty.',
      'any.required': 'Content is required.'
    }),
    stats: Joi.object({
      wordCount: Joi.number().min(100).required().messages({
        'number.base': 'Word count must be a number.',
        'number.min': 'Word count must be at least 100.',
        'any.required': 'Word count is required.'
      }),
      charCount: Joi.number().min(200).required().messages({
        'number.base': 'Character count must be a number.',
        'number.min': 'Character count must be at least 100.',
        'any.required': 'Character count is required.'
      })
    })
  }).required().messages({
    'any.required': 'Blog object is required.',
    'object.base': 'Blog must be a valid object.'
  })
});

module.exports = blogSchema