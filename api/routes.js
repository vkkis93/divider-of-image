'use strict';
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const imagesController = require('./image/controller');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const image = file.originalname;
        var folderName = path.parse(image).name;
        folderName = folderName.replace(/\s/g, '');
        const folderPath = `uploads/${folderName}/`;
        // fs.statSync need to wrap in try catch block, because if dir exists 'fs' will throw error
        try {
            var stat = fs.statSync(folderPath); // if dir exists move on
            cb(null, folderPath);
        } catch (err) {
            fs.mkdir(folderPath, err => cb(err, folderPath)); // in another case need to create dir
        }

    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({storage: storage});

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/image', imagesController.getImage);

router.post('/image/modular', upload.single('image'), imagesController.processImage);
//upload middleware for handling multipart/form-data , which is primarily used for uploading files
module.exports = router;
