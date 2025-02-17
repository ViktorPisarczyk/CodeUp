const Image = require('../models/imageModel');

// Upload image
const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image uploaded' });
        
            const newImage = new Image({
                imageUrl: req.file.path
            });
                await newImage.save();
                res.json({imageUrl: newImage.imageUrl});
            }
        } catch (error) {
            res.status(500).json({ message: 'Error uploading image' });
        }
    };
// Get all images conttroller
const getAllImages = async (req, res) => {  
    try{
        const images = await Image.find();
        res.json(images);
    } catch (error) {
        res.status(500).json({ message: 'Error getting images' });
    }
};
 module.exports = { uploadImage, getAllImages };
