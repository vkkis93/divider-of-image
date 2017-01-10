'use strict';
const fs = require('fs'),
    path = require('path'),
    sharp = require('sharp'),
    Promise = require('bluebird'),
    imageModel = require('./model');

module.exports.getImage = (name) => {
    let query = {};
    if (name) { //if exists query search - we will look image by using regex
        query = {name: new RegExp(`^${name}`, 'i')};
    } // else find the last one saved image
    return imageModel.findOne(query).sort({createdAt: -1}).lean()
        .then((image) => {
            if (!image) {
                throw {http_code: 400, message: 'image not found'};
            }
            return new Promise((resolve, reject) => {
                fs.readFile(`${image.path}${image.name}`, (err, data) => { // read image in filesystem
                    if (err) {return reject(err);}
                    image.buffer = new Buffer(data).toString('base64'); // and convert to base64 for client side
                    resolve(image);
                });
            });
            // if need code which getting all part of sliced image
            // in task anything said about it, but I wrote
            //
            // const fillArr = [...Array(parseInt(image.division)).keys()];
            // const extension = path.extname(image.name);
            // image.slicedImage = [];
            // return Promise.each(fillArr, (item, index) => {
            //     return new Promise((resolve, reject) => {
            //         fs.readFile(`${image.path}${index+1}${extension}`, (err, data) => { // read image in filesystem
            //             if (err) {return reject(err);}
            //             image.slicedImage.push(new Buffer(data).toString('base64')); // and convert to base64 for client side
            //             resolve();
            //         });
            //     });
            // }).then(() => { })

        }).catch(err => {
            console.log('get image', err);
            throw err;
        });
};

module.exports.processImage = (data) => {
    const folderPath = process.cwd() + `/${data.file.destination}`;
    const image = sharp(`${folderPath}${data.file.originalname}`);
    return image //get metadata about image
        .metadata()
        .then(info => {
            const extension = path.extname(data.file.originalname);
            const step = parseInt(info.width / data.arr.length); // get step of division
            return Promise.map(data.arr, (item, index) => { // async cropping process of image
                return image.extract({left: index * step, top: 0, height: info.height, width: step})
                    .toFile(`${folderPath}${index + 1}${extension}`);
            });
        }).then(() =>
            imageModel.update(
                {name: data.file.originalname},
                {
                    $set: {
                        description: data.description,
                        name: data.file.originalname,
                        path: data.file.destination,
                        division: data.arr.length
                    }
                },
                {upsert: true}) //save image and info in Mongo
        ).catch(err => {
            throw err;
        });
};
