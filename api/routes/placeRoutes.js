const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const imageDownloader = require('image-downloader');
const Place = require('../models/Place');
const {jwtSecret} = require('../utils');

const uploadDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

router.post('/upload-by-link', async (req, res) => {
    const { link } = req.body;
    const newName = 'photo' + Date.now() + '.jpg';
    const destPath = path.join(uploadDir, newName);
    try {
        await imageDownloader.image({
            url: link,
            dest: destPath,
        });
        res.json(newName);
    } catch (error) {
        console.error('Error downloading image:', error);
        res.status(500).json({ error: 'Failed to download image' });
    }
});

const photosMiddleware = multer({dest:'uploads/'});
router.post('/upload', photosMiddleware.array('photos', 100), (req,res) => {
    const uploadedFiles = [];
    for (let i = 0; i < req.files.length; i++) {
        const {path, originalname} = req.files[i];
        const parts = originalname.split('.')
        const ext = parts[parts.length - 1]
        const newPath = path + '.' + ext;
        fs.renameSync(path, newPath);
        uploadedFiles.push(newPath.replace('uploads/',''));
    }
    res.json(uploadedFiles);
});
 
router.post('/places', (req,res) => {
    const {token} = req.cookies;
    const {
        title,address,addedPhotos,description,
        perks,extraInfo,checkIn,checkOut,maxGuests,price
    } = req.body;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) throw err;
        const placeDoc = await Place.create({
            owner:userData.id,
            title,address,photos:addedPhotos,description,
            perks,extraInfo,checkIn,checkOut,maxGuests,price
        });
        res.json(placeDoc);
    });
}); 

router.get('/user-places', (req,res) => {
    const {token} = req.cookies;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => { 
        const {id} = userData;
        res.json(await Place.find({owner:id}));
    });
});

router.get('/places/:id', async (req,res) => {
    const {id} = req.params;  
    res.json(await Place.findById(id));
});

router.put('/places', async (req,res) => {
    const {token} = req.cookies;
    const {
        id,title,address,addedPhotos,description,
        perks,extraInfo,checkIn,checkOut,maxGuests,price
    } = req.body;
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {  
        if (err) throw err;  
        const placeDoc = await Place.findById(id);
        if (userData.id === placeDoc.owner.toString()) {
            placeDoc.set({
                title,address,photos:addedPhotos,description,
                perks,extraInfo,checkIn,checkOut,maxGuests,price 
            })
            await placeDoc.save();
            res.json('ok');
        } 
    });
}); 

router.get('/places', async (req,res) => {
   res.json( await Place.find() );
});

module.exports = router;
