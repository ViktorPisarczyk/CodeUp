const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinaryConfig.js');
const { uploadImage, getImages, deleteImage } = require('../controllers/imageController.js');

router.post('/', upload.single('image'), uploadImage);
router.get('/', getImages);

module.exports = router;