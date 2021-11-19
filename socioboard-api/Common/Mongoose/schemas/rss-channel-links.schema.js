import mongoose from 'mongoose';

const rssChannelLinks = new mongoose.Schema({
  url: { type: String, required: true },
  content: { type: String, required: true },
  snapshotDate: { type: String, required: true },
}, {
  timestamps: true,
});

rssChannelLinks.index({ url: 1, snapshotDate: 1 }, { unique: true });

export default mongoose.model('rsschannellinks', rssChannelLinks);
