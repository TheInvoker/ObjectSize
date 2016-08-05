var express = require('express');
var app = express();
var fs = require('fs');
var formidable = require('formidable');
var uuid = require('node-uuid');
var algo = require('./core/algo.js');
var util = require('./core/util.js');

app.use(express.static(__dirname + '/public'));

/*
 * Visit the home page
 */
app.get('/', function (req, res) {
	res.sendFile(__dirname + '/public/index.html');
});

/*
 * Handle image upload
 */
app.post('/upload', function (req, res, next) {
	next();
}, function(req, res) {
	var form = new formidable.IncomingForm();
	
	form.parse(req, function(err, fields, files) {
		if (err) {
			return console.log('ERROR', err);
		}
		
		// get the base64 encoding of the image
		var dateURL = fields.data;
		// generate a new unique filename
		var filename = uuid.v4();
		// make the base64 encoding compatible, assumes its coming in base64 png encoded
		var base64Data = dateURL.replace(/^data:image\/png;base64,/, "");
		// save the image
		fs.writeFile(__dirname + '/images/uploads/' + filename + '.png', base64Data, 'base64', function(err) {
			if (err) {
				util.fail(res, 'Failed to save the image.');
				return console.log('ERROR', err);
			}
			util.success(res, 'Image saved!');
		});
	});

	form.on('end', function(fields, files) {

	});
});

/*
 * Handle dimensions upload
 */
app.post('/dimensions', function (req, res, next) {
	next();
}, function(req, res) {
	var form = new formidable.IncomingForm();
	
	form.parse(req, function(err, fields, files) {
		if (err) {
			return console.log('ERROR', err);
		}

		// get all the parameters
		var ImageWidth = fields.ImageWidth,
			ImageHeight = fields.ImageHeight,
			FocalLength = fields.FocalLength,
			FocalLengthIn35mmFilm = fields.FocalLengthIn35mmFilm,
			Orientation = fields.Orientation,
			Distance = fields.Distance,
			ObjectWidth = fields.ObjectWidth,
			ObjectHeight = fields.ObjectHeight;
		
		// compute the dimensions
		var data = algo.computeValue(ImageWidth, ImageHeight, FocalLength, FocalLengthIn35mmFilm, Orientation, Distance, ObjectWidth, ObjectHeight);
		
		util.success(res, data);
	});

	form.on('end', function(fields, files) {

	});
});

var server = app.listen(process.env.PORT || 3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Object Size started at http://%s:%s', host, port);
});