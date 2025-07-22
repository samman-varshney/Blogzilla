const cron = require('node-cron');
const Draft = require('../models/draft'); // adjust path as needed
const mongoose = require('mongoose');

// Runs every day at 2 AM
cron.schedule('0 2 * * *', async () => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const deletedDrafts = await Draft.deleteMany({
      isAutoSaved: true,
      updatedAt: { $lt: sevenDaysAgo }
    });

    console.log(`🗑️ Auto-cleaned ${deletedDrafts.deletedCount} old auto-saved drafts.`);
  } catch (err) {
    console.error('❌ Error cleaning old drafts:', err);
  }
});
