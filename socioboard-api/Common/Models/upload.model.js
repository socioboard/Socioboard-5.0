import ffmpeg from 'ffmpeg';
import moment from 'moment';
import path from 'path';
import config from 'config';
import fs from 'fs';
import logger from '../../Publish/resources/Log/logger.log.js';
import db from '../Sequelize-cli/models/index.js';
import sequelize from 'sequelize';
import TeamReportLibs from './team-report.model.js';
const teamReportLibs = new TeamReportLibs();

const userDetails = db.user_details;
const userTeamJoinTable = db.join_table_users_teams;
const userMediaDetails = db.user_media_details;
const userSSTemplatesTable = db.user_ss_template_details;
const Operator = db.Sequelize.Op;

class UploadLibs {
  isUserBelongsToTeam(userId, teamId, lang) {
    return new Promise((resolve, reject) => {
      if (!userId || !teamId) {
        reject(new Error(getMessage(4, lang)));
      } else {
        userTeamJoinTable
          .findOne({
            where: {
              team_id: teamId,
              user_id: userId,
              left_from_team: 0,
            },
          })
          .then(response => {
            if (!response)
              reject(new Error('Sorry, you are not a part of the team!'));
            resolve(true);
          })
          .catch(() => {
            reject(new Error('Sorry, you are not a part of the team!'));
          });
      }
    });
  }

  isTeamValidForUser(userId, teamId) {
    return new Promise((resolve, reject) =>
      userTeamJoinTable
        .findOne({
          where: {
            user_id: userId,
            team_id: teamId,
            left_from_team: false,
          },
          attributes: ['id', 'user_id'],
        })
        .then(result => {
          if (result) resolve();
          else throw new Error('User not belongs to the team!');
        })
        .catch(error => {
          reject(error);
        })
    );
  }

  uploadMedia(userId, teamId, privacy, files, title, lang) {
    return new Promise((resolve, reject) => {
      if (!userId || !teamId || !privacy || !title) {
        reject(new Error('Invalid Inputs'));
      } else {
        const fileExistsStatus = fs.existsSync(
          config.get('uploadService.thumbnail_path')
        );

        if (!fileExistsStatus)
          fs.mkdirSync(config.get('uploadService.thumbnail_path'));

        const mediaDetails = [];

        return this.isUserBelongsToTeam(userId, teamId, lang)
          .then(() =>
            Promise.all(
              files.map(file => {
                if (file.mimetype.includes('image')) {
                  const fileDetails = {
                    type: 0,
                    privacy_type: Number(privacy),
                    user_id: Number(userId),
                    team_id: Number(teamId),
                    media_size: file.size,
                    file_name: file.filename,
                    mime_type: file.mimetype,
                    media_url: `/images/${file.filename}`,
                    thumbnail_url: `/images/${file.filename}`,
                    title,
                  };

                  mediaDetails.push(fileDetails);
                } else {
                  let thumb_image = '';

                  return this.generateThumbnail(
                    `${config.get('uploadService.video_path')}/${file.filename}`
                  )
                    .then(thumbnail => {
                      thumb_image = thumbnail;

                      return this.generateWaterMark(thumbnail)
                        .then(waterMarkFile => {
                          const isThumbnailUrlExists = fs.existsSync(
                            String(thumb_image)
                          );

                          if (isThumbnailUrlExists) {
                            fs.unlink(String(thumb_image), error => {
                              if (error) logger.info(error);
                            });
                          }

                          return waterMarkFile;
                        })
                        .catch(error => {
                          logger.info(error.message);
                          throw error;
                        });
                    })
                    .then(thumbnailUrl => {
                      const fileDetails = {
                        type: 1,
                        privacy_type: Number(privacy),
                        user_id: Number(userId),
                        team_id: Number(teamId),
                        media_size: file.size,
                        file_name: file.filename,
                        mime_type: file.mimetype,
                        media_url: `/videos/${file.filename}`,
                        thumbnail_url: `/thumbnails${thumbnailUrl}`,
                        title,
                      };

                      mediaDetails.push(fileDetails);
                    })
                    .catch(error => {
                      logger.info(error.message);
                    });
                }
              })
            )
          )
          .then(() => {
            if (privacy == 3) {
              return userMediaDetails.bulkCreate(mediaDetails, {
                returning: true,
              });
            }

            let privateTypeSize = 0;
            let publicTypeSize = 0;
            let size = 0;

            return userMediaDetails
              .findAll({
                where: {
                  user_id: Number(userId),
                  team_id: Number(teamId),
                  privacy_type: [0, 1],
                },
                attributes: [
                  'media_size',
                  'file_name',
                  'title',
                  'mime_type',
                  'privacy_type',
                ],
                raw: true,
              })
              .then(medias =>
                Promise.all(
                  medias.map(media => {
                    if (media.privacy_type == 1) {
                      privateTypeSize += media.media_size;
                    }
                    if (media.privacy_type == 0)
                      publicTypeSize += media.media_size;
                  })
                ).then(() => {
                  privacy == 0
                    ? (size = publicTypeSize)
                    : (size = privateTypeSize);
                  let totalSize = 0;

                  privacy == 0
                    ? (totalSize = config.get('uploadService.max_size_public'))
                    : (totalSize = config.get(
                        'uploadService.max_size_private'
                      ));
                  if (size < totalSize) {
                    return userMediaDetails.bulkCreate(mediaDetails, {
                      returning: true,
                    });
                  }

                  return reject({
                    error: true,
                    message: 'Sorry! You reached maximum size of upload data.',
                  });
                })
              )
              .catch(error => {
                throw error;
              });
          })
          .then(details => {
            resolve(details);
          })
          .catch(error => {
            reject(error);
          });
      }
    });
  }

  getUserMediaDetails(userId, teamId, privacy, pageId) {
    return new Promise((resolve, reject) => {
      if (privacy >= 3 || privacy < 0)
        reject(new Error('Please check the privacy type whether between 0-2.'));
      else if (pageId < 0)
        reject(new Error('Please check pageId greater than 0'));
      else {
        const conditions = {user_id: Number(userId)};
        let usedSpace = 0;
        const data = [];

        privacy = Number(privacy);
        pageId = Number(pageId);
        if (teamId && teamId != -1) conditions.team_id = Number(teamId);
        const offset = Number((pageId - 1) * config.get('perPageLimit'));
        const limit = config.get('perPageLimit');

        return this.isTeamValidForUser(userId, teamId)
          .then(() =>
            userMediaDetails.findAll({
              where: conditions,
              raw: true,
            })
          )
          .then(result =>
            Promise.all(
              result.map(element => {
                if (privacy == 2) {
                  usedSpace += element.media_size;
                } else if (element.privacy_type == privacy) {
                  usedSpace += element.media_size;
                }
              })
            ).catch(error => {
              throw error;
            })
          )
          .then(() => {
            if (privacy == 0 || privacy == 1)
              conditions.privacy_type = Number(privacy);

            return userMediaDetails.findAll({
              where: conditions,
              offset,
              limit,
              raw: true,
            });
          })
          .then(result =>
            Promise.all(
              result.map(element => {
                if (privacy == 2) {
                  data.push(element);
                } else if (element.privacy_type == privacy) {
                  data.push(element);
                }
              })
            )
              .then(() => {
                let totalSize = 0;

                privacy == 0
                  ? (totalSize = config.get('uploadService.max_size_public'))
                  : (totalSize = config.get('uploadService.max_size_private'));
                privacy == 2
                  ? (totalSize =
                      config.get('uploadService.max_size_public') +
                      config.get('uploadService.max_size_private'))
                  : totalSize;
                resolve({totalSize, usedSize: usedSpace, data});
              })
              .catch(error => {
                throw error;
              })
          )
          .catch(error => {
            reject(error);
          });
      }
    });
  }

  getSocialGallery(userId, pageId) {
    return new Promise((resolve, reject) => {
      if (pageId < 0) reject(new Error('Please check pageId greater than 0'));
      else {
        // let conditions = { user_id: Number(userId) };
        const conditions = {
          user_id: {
            $not: Number(userId),
          },
          privacy_type: {$not: 3},
        };
        const offset = Number(
          (Number(pageId) - 1) * config.get('perPageLimit')
        );
        const limit = config.get('perPageLimit');

        return userMediaDetails
          .findAll({
            where: {
              user_id: {[Operator.not]: userId},
              privacy_type: 0,
            },
            offset,
            limit,
          })
          .then(result => {
            resolve({data: result});
          })
          .catch(error => {
            throw error;
          });
      }
    });
  }

  generateThumbnail(videoFilePath) {
    return new Promise((resolve, reject) => {
      if (!videoFilePath) {
        reject(new Error('Invalid Inputs'));
      } else {
        const ffmpegObject = new ffmpeg(videoFilePath);
        const thumbnailFileName = moment().unix();
        const thumbnailFile = `${config.get(
          'uploadService.thumbnail_path'
        )}/thumb_${thumbnailFileName}.jpg`;

        logger.info(thumbnailFile);

        return ffmpegObject
          .then(video => {
            video
              .fnExtractFrameToJPG(config.get('uploadService.thumbnail_path'), {
                frame_rate: 3,
                number: 1,
                file_name: thumbnailFile,
              })
              .then(files => {
                const thumbnail = files.filter(x =>
                  x.includes(thumbnailFileName)
                );

                resolve(thumbnail);
              })
              .catch(error => {
                logger.info('error ', error);

                throw error;
              });
          })
          .catch(error => {
            reject(error.message);
          });
      }
    });
  }

  generateWaterMark(imagefilePath) {
    return new Promise((resolve, reject) => {
      if (!imagefilePath) {
        reject(new Error('Invalid Inputs'));
      } else {
        const ffmpegWatermarkObject = new ffmpeg(String(imagefilePath));
        const waterFile = `${config.get(
          'uploadService.thumbnail_path'
        )}/wm${moment().unix()}.jpg`;

        ffmpegWatermarkObject
          .then(video => {
            video
              .fnAddWatermark(config.get('uploadService.assert'), waterFile, {
                position: 'C',
              })
              .then(() => {
                resolve(
                  waterFile.replace(
                    config.get('uploadService.thumbnail_path'),
                    ''
                  )
                );
              })
              .catch(error => {
                throw error;
              });
          })
          .catch(e => {
            reject(false);
          });
      }
    });
  }

  deleteUserMedia(isForceDelete, userId, mediaId) {
    return new Promise((resolve, reject) => {
      if (!userId || !mediaId) {
        reject(new Error('Invalid Inputs'));
      } else {
        logger.info(
          `Is Force Deleted : ${isForceDelete}  and False Condition: ${
            isForceDelete == 1
          } and True Condition: ${isForceDelete == 0}`
        );

        if (isForceDelete == 1) {
          let media_url = null;
          let thumbnail = null;
          // Checking that the user is having that media or not

          return userMediaDetails
            .findOne({
              where: {
                id: mediaId,
                user_id: userId,
              },
            })
            .then(data => {
              if (!data) throw new Error('No such media found!');

              if (data.dataValues.mime_type == 'video/mp4')
                media_url = `${config.get('uploadService.basePath')}/${
                  data.dataValues.media_url
                }`;
              else
                media_url = `${config.get('uploadService.basePath')}/${
                  data.dataValues.media_url
                }`;

              // var media_url = `${ config.get('uploadService.video_path') } / ${ data.dataValues.media_url }`;
              thumbnail = `${config.get('uploadService.thumbnail_path')}/${
                data.dataValues.thumbnail_url
              }`;

              const isMediaUrlExists = fs.existsSync(media_url);

              if (isMediaUrlExists) {
                fs.unlink(media_url, error => {
                  if (error) logger.info(error.message);
                });
              }
              const isThumbnailUrlExists = fs.existsSync(thumbnail);

              if (isThumbnailUrlExists) {
                // Deleting media from the Folder(storage)
                fs.unlink(thumbnail, error => {
                  if (error) logger.info(error.message);
                });
              }
            })
            .then(() =>
              // Deleting the data from DB
              userMediaDetails
                .destroy({
                  where: {
                    id: mediaId,
                    user_id: userId,
                  },
                })
                .then(data => {
                  if (!data) throw new Error('No such media found!');
                  else resolve('Image has been deleted successfully');
                })
                .catch(error => {
                  throw new Error(error.message);
                })
            )
            .catch(error => {
              reject(error);
            });
        }
        if (isForceDelete == 0) {
          // Deteling data from DB
          return userMediaDetails
            .destroy({
              where: {
                id: mediaId,
                user_id: userId,
              },
            })
            .then(data => {
              if (!data) throw new Error('No such media found!');
              resolve('Image has been deleted successfully');
            })
            .catch(error => {
              reject(error);
            });
        }
        reject(new Error('Invalid isForceDelete value!'));
      }
    });
  }

  uploadSSTemplate(userId, title, fileData) {
    return new Promise((resolve, reject) => {
      if (!userId || !fileData) {
        reject(new Error('Invalid Inputs'));
      } else {
        const fileExistsStatus = fs.existsSync(
          config.get('uploadService.ss_template_path')
        );

        if (!fileExistsStatus)
          fs.mkdirSync(config.get('uploadService.ss_template_path'));
        const mediaDetails = [];

        //  save the base64 in image format in the folder.
        const optionalObj = {fileName: moment().unix(), type: 'png'};

        return this.base64ToPNG(fileData.media, optionalObj)
          .then(response => {
            const fileDetails = {
              user_id: userId,
              title,
              file_name: optionalObj.fileName,
              media_size: 0,
              mime_type: optionalObj.type,
              media_url: `/ssTemplates/${optionalObj.fileName}.${optionalObj.type}`,
              createdAt: moment.now(),
              updatedAt: moment.now(),
            };

            mediaDetails.push(fileDetails);
          })
          .then(() =>
            userSSTemplatesTable.bulkCreate(mediaDetails, {returning: true})
          )
          .then(details => {
            resolve(details);
          })
          .catch(error => {
            reject(error);
          });
      }
    });
  }

  base64ToPNG(data, optionalObj) {
    return new Promise((resolve, reject) => {
      data = data.toString().replace(/^data:image\/png;base64,/, '');
      fs.writeFile(
        path.resolve(
          config.get('uploadService.ss_template_path'),
          `${optionalObj.fileName}.${optionalObj.type}`
        ),
        data,
        'base64',
        (err, data) => {
          if (err) reject(err);
          else {
            resolve(true);
          }
        }
      );
    });
  }

  getSSTemplates(userId) {
    return new Promise((resolve, reject) => {
      const data = [];

      return userSSTemplatesTable
        .findAll({
          where: {user_id: Number(userId)},
        })
        .then(result => {
          if (result.length > 0) {
            return Promise.all(
              result.map(element => {
                data.push(element);
              })
            )
              .then(() => {
                resolve(data);
              })
              .catch(error => {
                throw error;
              });
          }
          resolve('No Data found');
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  deleteSSTemplates(userId) {
    return new Promise((resolve, reject) => {
      let media_url = null;

      return userSSTemplatesTable
        .findAll({
          where: {
            user_id: Number(userId),
          },
        })
        .then(data => {
          // const filteredSSTemplates = data.dataValues;
          Promise.all(
            data.map(template => {
              media_url = `${config.get('uploadService.basePath')}/${
                template.media_url
              }`;
              const isMediaUrlExists = fs.existsSync(media_url);

              if (isMediaUrlExists) {
                fs.unlink(media_url, error => {
                  if (error) logger.info(error.message);
                });
              }
            })
          );
        })
        .then(() =>
          userSSTemplatesTable
            .destroy({
              where: {
                user_id: userId,
              },
            })
            .then(data => {
              if (!data) return reject(new Error('No such templates found!'));
              resolve('Templates successfully deleted!');
            })
            .catch(error => {
              throw new Error(error.message);
            })
        )
        .catch(error => {
          reject(error);
        });
    });
  }

  deleteParticularTemplate(userId, templateId) {
    return new Promise((resolve, reject) => {
      if (!userId || !templateId) {
        reject(new Error('Invalid Inputs'));
      } else {
        return userSSTemplatesTable
          .findOne({
            where: {
              id: templateId,
              user_id: userId,
            },
          })
          .then(data => {
            if (!data) return reject(new Error('No such media found!'));
            const media_url = `${config.get('uploadService.basePath')}/${
              data.dataValues.media_url
            }`;

            const isMediaUrlExists = fs.existsSync(media_url);

            if (isMediaUrlExists) {
              fs.unlink(media_url, error => {
                if (error) logger.info(error.message);
              });
            }
          })
          .then(() =>
            userSSTemplatesTable
              .destroy({
                where: {
                  id: templateId,
                  user_id: userId,
                },
              })
              .then(data => {
                if (!data) return reject(new Error('No such media found!'));
                resolve('Media has been deleted successfully!');
              })
              .catch(error => {
                throw new Error(error.message);
              })
          )
          .catch(error => {
            reject(error);
          });
      }
    });
  }

  /**
   * TODO To search user media with all filtration
   * Route To search user media with all filtration
   * @param  {object} SocialImageInfo -User rating and title
   * @param  {string} teamId -User team id
   * @param  {number} filterPeriod -Date filter
   * @param  {string} sortBy sort by default 'desc'
   * @param  {number} pageId Pagination id
   * @param  {number} userId User scope id
   * @param  {date} since -Starting date
   * @param  {date} until -End date
   * @return {object} Returns user media details
   */
  async searchUserMediaDetails(
    SocialImageInfo,
    teamId,
    sortBy = 'desc',
    pageId,
    userId,
    filterPeriod,
    since,
    until
  ) {
    try {
      await this.isTeamValidForUser(userId, teamId);
      let totalSize;
      const conditions = {user_id: Number(userId)};
      if (teamId && teamId != -1) conditions.team_id = Number(teamId);
      if (SocialImageInfo?.imagePrivacyType.length !== 0)
        conditions.privacy_type = {
          [Operator.or]: SocialImageInfo?.imagePrivacyType?.map(x => Number(x)),
        };
      let usedSize = await userMediaDetails.findOne({
        attributes: [
          [sequelize.fn('sum', sequelize.col('media_size')), 'usedSize'],
        ],
        where: conditions,
        raw: true,
      });
      if (SocialImageInfo?.rating?.length !== 0)
        conditions.rating = {
          [Operator.or]: SocialImageInfo?.rating?.map(x => Number(x)),
        };
      if (filterPeriod) {
        let date = await teamReportLibs.getFilteredPeriod(
          filterPeriod,
          since,
          until
        );
        conditions.created_date = {
          [Operator.gt]: date.since,
          [Operator.lt]: date.untill,
        };
      }
      if (SocialImageInfo?.imageTitle)
        conditions.title = {
          [Operator.like]: `%${SocialImageInfo?.imageTitle}%`,
        };
      const offset = Number((pageId - 1) * config.get('perPageLimit'));
      const limit = config.get('perPageLimit');
      let data = await userMediaDetails.findAll({
        where: conditions,
        offset,
        limit,
        raw: true,
        order: [['created_date', sortBy]],
      });

      if (SocialImageInfo?.imagePrivacyType.length !== 0)
        SocialImageInfo?.imagePrivacyType?.includes('1')
          ? (totalSize = config.get('uploadService.max_size_public'))
          : (totalSize = config.get('uploadService.max_size_private'));

      if (
        SocialImageInfo?.imagePrivacyType.length == 0 ||
        (SocialImageInfo?.imagePrivacyType?.includes('0') &&
          SocialImageInfo?.imagePrivacyType?.includes('1'))
      )
        totalSize =
          config.get('uploadService.max_size_public') +
          config.get('uploadService.max_size_private');

      return {usedSize: usedSize.usedSize, totalSize, data};
    } catch (e) {
      throw new Error(e);
    }
  }

  /**
   * TODO To update rating and title of media file
   * Route To update rating and title of media file
   * @param  {object} data -User rating and title
   * @param  {number} id -Media id
   * @param  {number} userId User scope id
   * @return {object} Returns user media details
   */
  async updateMedia(user_id, id, data) {
    let res = await userMediaDetails.update({...data}, {where: {id, user_id}});
    return res;
  }
}
export default UploadLibs;
