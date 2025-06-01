const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: './src/common/uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
module.exports = multer({ storage });