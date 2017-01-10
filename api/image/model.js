'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var imageSchema = new Schema({
    name: {type: String, required: true},
    description: {type: String},
    division: {type: Number, required: true},
    path: {type: String, required: true}
}, {
    timestamps: true
});

module.exports = mongoose.model('Image', imageSchema, 'Image');
