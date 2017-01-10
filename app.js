const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const app = express();
const server = require('http').createServer(app);

process.env.ENV = process.env.ENV || 'development';
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(bodyParser.raw());

app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({extended: false, limit: '5mb'}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'views')));

app.use('/', require('./api/routes'));
mongoose.Promise = Promise;
mongoose.connect(process.env.MONGO_URL);
mongoose.connection.on('error', function (err) {
  console.error('MongoDB connection error: ' + err);
  process.exit(-1);
});

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  mongoose.set('debug', true);
}

app.use(function (err, req, res, next) {
  console.log('caught you', err);
  res.status(err.http_code || 500).json(err);
});


server.listen(5000, function () {
  console.log('Express server listening on %d, in %s mode', 5000, process.env.ENV);
});

module.exports = app;
