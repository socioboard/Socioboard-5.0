import rssChannelLinksSchema from '../schemas/rss-channel-links.schema.js';

class RssChannelLinks {
  schema = rssChannelLinksSchema;

  getLinkByUrl(url) {
    return rssChannelLinksSchema.findOne({ url });
  }

  getLastBackupLink(url) {
    return rssChannelLinksSchema.findOne({ url }).sort({ url: -1, snapshotDate: -1 });
  }

  findLinks(urls) {
    return rssChannelLinksSchema.find({
      url: { $in: urls },
    });
  }

  getBackupLinksByUrlsFromDate(urls, date) {
    return rssChannelLinksSchema.find({
      url: { $in: urls },
      snapshotDate: {
        $gt: date,
      },
    });
  }

  getBackupLinksByUrls({ urls, skip = 0, limit = 10 }) {
    const page = skip * limit;

    return rssChannelLinksSchema.aggregate([
      { $match: { url: { $in: urls } } },
      { $sort: { url: -1, snapshotDate: -1 } },
      {
        $group: {
          _id: '$url',
          backups: {
            $push: {
              id: '$_id',
              snapshotDate: '$snapshotDate',
            },
          },
        },
      },
      { $project: { url: '$_id', _id: 0, backups: { $slice: ['$backups', page, limit] } } },
    ]);
  }

  getBackupLinkById(linkId) {
    return rssChannelLinksSchema.findOne({ _id: linkId });
  }

  createBackupLink(args) {
    return rssChannelLinksSchema.create(args);
  }
}

export default new RssChannelLinks();
