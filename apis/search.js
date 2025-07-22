const express = require('express');
const router = express.Router();
const Blog = require('../models/blog')
const User = require('../models/user')
const CatchAsync = require('../utils/catchAsync');

//api for search functionality
const stopWords = new Set([
    "the", "is", "are", "am", "that", "those", "this", "a", "an", "in", "on", "at", "to", "for", "of", "with", "by"
]);


function extractKeywords(query) {
    return query
        .toLowerCase()
        .replace(/[^\w\s]/g, "") // remove punctuation
        .split(/\s+/)
        .filter(word => word && !stopWords.has(word));
}

async function searchByKeywords(Model, field, keywords) {
    const rawResults = await Model.find({
        $or: keywords.map(word => ({
            [field]: { $regex: word, $options: "i" }
        }))
    });

    return rawResults
        .map(item => {
            let score = 0;
            for (const keyword of keywords) {
                if (item[field].toLowerCase().includes(keyword)) {
                    score++;
                }
            }
            return { item, score };
        })
        .sort((a, b) => b.score - a.score)
        .map(({ item }) => item);
}


router.get('/', CatchAsync(async (req, res) => {
    const { q, type } = req.query;

    if (type !== '1' && type !== '2') {
        return res.status(400).json({ message: 'Choose only blog or user as a valid type' });
    }

    if (!q || q.trim() === '') {
        return res.status(400).json({ message: 'Search for a valid query' });
    }

    const keywords = extractKeywords(q);
    if (keywords.length === 0) {
        return res.status(400).json({ message: 'make use of key words for searching' });
    }
    let response;
    if (type === '1') {
        response = await searchByKeywords(Blog, 'title', keywords);

    } else {
        response = await searchByKeywords(User, 'handle', keywords);

    }
    res.json({ response: response, count: response.length })
}));

module.exports = router