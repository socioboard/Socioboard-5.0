import multer from 'multer';
import moment from 'moment';
import fs from 'fs';

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
        const fileArray = file.originalname.split('.');
        const extension = fileArray.pop();
        const fileName = `${moment().unix()}.${extension}`;

        cb(null, fileName);

        // cb(null, `${file.originalname}`);
      },
    });

    this.videoStorage = multer.diskStorage({
      destination: (req, file, cb) => {
        if (!fs.existsSync(this.uploadService.video_path)) {
          fs.mkdirSync(this.uploadService.video_path);
        }
        cb(null, this.uploadService.video_path);
      },
      filename: (req, file, cb) => {
        const fileArray = file.originalname.split('.');
        const extension = fileArray.pop();
        const fileName = `${moment().unix()}.${extension}`;

        cb(null, fileName);
      },
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
        const fileArray = file.originalname.split('.');
        const extension = fileArray.pop();
        const fileName = `${moment().unix()}.${extension}`;

        cb(null, fileName);
      },
    });

    this.uploadSSTemplate = multer.diskStorage({
      destination: (req, file, cb) => {
        if (file.mimetype.includes('image')) {
          if (!fs.existsSync(this.uploadService.ss_template_path)) {
            fs.mkdirSync(this.uploadService.ss_template_path);
          }
          cb(null, this.uploadService.ss_template_path);
        }
      },
      filename: (req, file, cb) => {
        const fileArray = file.originalname.split('.');
        const extension = fileArray.pop();
        const fileName = `${moment().unix()}.${extension}`;

        cb(null, fileName);
      },
    });

    this.imageUpload = multer({ storage: this.imageStorage });
    this.videoUpload = multer({ storage: this.videoStorage });
    this.mediaUpload = multer({ storage: this.mediaStorage });
    this.uploadSSTemplate = multer({ storage: this.uploadSSTemplate });
  }
}

export default UpdloadMedia;
