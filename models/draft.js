const mongoose = require('mongoose');
const { Schema } = mongoose;
const { JSDOM } = require('jsdom');

const {cloudinary} = require('../cloudinary')
//we make evry thing optional so that we can implement auto save yet to handle empty drafts we will have server side validations 
//and corn job to delete empty drafts if any after some priod of time

const thumbnailSchema = new Schema({
    url: {
        type: String
  
    },
    filename: {
        type: String
    }
}, { _id: false });  // Prevent creating a separate _id for subdoc

const draftSchema = new Schema({
    title: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        enum: ['Technology', 'Health', 'Lifestyle',
            'Travel', 'Food', 'Entertainment',
            'Literature', 'Religion', 'Science',
            'Astronomy', 'Photography', 'Cooking', '']
       
    },
    thumbnail: {
        type: thumbnailSchema
    },
    content: {
        type: String,
        default: '' //so that on preview it wonn't throw error
    },
    summary: {
        type: String,
        default: '', //same for this too but it will not throw error if not defined but for future cautions
        trim: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isAutoSaved:{ // this is to track if the draft was savd manually by the user, and in future delete those draft which are autosaved
        type: Boolean,
        default: true,
    },
    tags: [String]
}, { timestamps: true });


draftSchema.index({user: 1, createdAt: -1});



draftSchema.post('findOneAndDelete', async function (data) {
    if (!data) return //if no blog is delete then return 
    if(data.thumbnail && data.thumbnail.url && data.thumbnail.filename){
        await cloudinary.uploader.destroy(data.thumbnail.filename);//deleting associated cloudinary files
    }
})


draftSchema.virtual('preview').get(function () {
    try {
        if (this.summary) return this.summary;

        const html = `<!DOCTYPE html><html><body>${this.content}</body></html>`;
        const dom = new JSDOM(html);
        const doc = dom.window.document;

        const firstP = doc.querySelector('p');
        return firstP
            ? firstP.textContent.trim().substring(0, 50)
            : doc.body.textContent.trim().substring(0, 50);
    } catch (err) {
        console.error('Preview error:', err.message);
        return 'error';
    }
});



draftSchema.set('toObject', { virtuals: true });
draftSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Draft', draftSchema);
