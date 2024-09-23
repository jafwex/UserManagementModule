const multer = require('multer');
const fs = require('fs');
const path = require('path');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/user');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now();
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({
    storage: storage,
}).single('profileImage');
module.exports = upload;
