const mongoose = require('mongoose');
const { Schema } = mongoose;

const followSchema = new Schema({
    follow: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    following: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

// Prevent duplicate follow relationships
followSchema.index({ follow: 1, following: 1 }, { unique: true });
followSchema.index({ following: 1 });

/**
 * Check if a user is already following another user
 */
followSchema.statics.isFollow = async function (follow, following) {
    return await this.findOne({ follow, following });
};


/**
 * Toggle follow/unfollow
 * If already following: unfollow
 * If not following: follow
 * Returns true if followed, false if unfollowed
 */
followSchema.statics.toggle = async function (follow, following) {
    const existing = await this.findOne({ follow, following });

    if (existing) {
        await this.deleteOne({ follow, following });
        return false; // unfollowed
    } else {
        await this.create({ follow, following });
        return true; // followed
    }
};

module.exports = mongoose.model('Follow', followSchema);
