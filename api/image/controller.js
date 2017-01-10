'use strict';
const imageService = require('./service');

module.exports.getImage = (req, res, next) => {
    const name = req.query.name;
    imageService.getImage(name)
        .then((image) => res.render('loadImage', {image: image}))
        .catch(err => res.render('error', {error: err}));
};

module.exports.processImage = (req, res, next) => {
    const number = parseInt(req.body.number) || 1,
        description = req.body.description,
        file = req.file,
        fillArr = [...Array(number).keys()];
    if (number >= 1000) {
        return res.render('error', {error: {http_code: 400, message: 'max number is 999'}});
    }
    if (!req.file) {
        return res.render('error', {error: {http_code: 400, message: 'Please choose image'}});
    }
    imageService.processImage({file: file, arr: fillArr, description: description})
        .then((image) => res.render('goBack'))
        .catch(err => res.render('error', {error: err}));
};
