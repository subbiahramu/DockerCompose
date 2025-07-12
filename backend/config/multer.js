const multer = require('multer');
const path = require('path');

// Configure multer for storing files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // Store files in 'uploads' directory
    },
    filename: function (req, file, cb) {
        // Create unique filename with timestamp
        cb(null, Date.now() + '-' + file.originalname)
    }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB max file size
    }
});

module.exports = upload; 