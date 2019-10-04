const multer = require('multer');
const moment = require('moment');
const fs = require('fs');

class UpdloadMedia {

    constructor(uploadService) {

        this.uploadService = uploadService;

        this.imageStorage = multer.diskStorage({
            destination: (req, file, cb) => {
                if (!fs.existsSync(this.uploadService.image_path)) {
                    fs.mkdirSync(this.uploadService.image_path);
                }
                cb(null, this.uploadService.image_path);
            },
            filename: (req, file, cb) => {

                var fileArray = file.originalname.split('.');
                var extension = fileArray.pop();
                var fileName = `${moment().unix()}.${extension}`;

                cb(null, fileName);

                // cb(null, `${file.originalname}`);
            }
        });

        this.videoStorage = multer.diskStorage({
            destination: (req, file, cb) => {
                if (!fs.existsSync(this.uploadService.video_path)) {
                    fs.mkdirSync(this.uploadService.video_path);
                }
                cb(null, this.uploadService.video_path);
            },
            filename: (req, file, cb) => {
                var fileArray = file.originalname.split('.');
                var extension = fileArray.pop();
                var fileName = `${moment().unix()}.${extension}`;

                cb(null, fileName);
            }
        });

        this.mediaStorage = multer.diskStorage({
            destination: (req, file, cb) => {
                if (file.mimetype.includes('image')) {
                    if (!fs.existsSync(this.uploadService.image_path)) {
                        fs.mkdirSync(this.uploadService.image_path);
                    }
                    cb(null, this.uploadService.image_path);
                } else {
                    if (!fs.existsSync(this.uploadService.video_path)) {
                        fs.mkdirSync(this.uploadService.video_path);
                    }
                    cb(null, this.uploadService.video_path);
                }
            },
            filename: (req, file, cb) => {
                var fileArray = file.originalname.split('.');
                var extension = fileArray.pop();
                var fileName = `${moment().unix()}.${extension}`;

                cb(null, fileName);
            }
        });

        this.imageUpload = multer({ storage: this.imageStorage });
        this.videoUpload = multer({ storage: this.videoStorage });
        this.mediaUpload = multer({ storage: this.mediaStorage });
    }
}

module.exports = UpdloadMedia;
