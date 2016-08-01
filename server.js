var express = require('express');
var app = express();
var fs = require('fs');
var formidable = require('formidable');


app.use(express.static(__dirname + '/public'));

var LATEST_UPLOAD_LOCATION;


// check if on mobile
function isMobile(req) {
    var ua = req.headers['user-agent'];
    return /mobile/i.test(ua);
}

function computeValueHelper(ImageWidth, ImageHeight, FocalLength, FocalLengthIn35mmFilm, Orientation, Distance, ObjectHeight) {
	var d = Distance; // in mm or 92 inches
	var ph = ObjectHeight; // height in image in pixels 
	var fl = FocalLength; // focal length in mm
	
	var sf = FocalLengthIn35mmFilm/fl; // scale factor
	var full_frame_diagonal = Math.sqrt(24*24 + 36*36); // 35mm full frame (24mm x 36mm)
	var sensor_diagonal = full_frame_diagonal/sf;
	var ratio_angle = Math.atan(ImageHeight/ImageWidth);
	var sh = sensor_diagonal * Math.sin(ratio_angle); // sensor height
	
	var rh = (d*ph*sh)/(fl*ImageHeight); // real height in mm
	
	return rh;
}

function computeValue(ImageWidth, ImageHeight, FocalLength, FocalLengthIn35mmFilm, Orientation, Distance, ObjectWidth, ObjectHeight) {
	var w = computeValueHelper(ImageWidth, ImageHeight, FocalLength, FocalLengthIn35mmFilm, Orientation, Distance, ObjectWidth);
	var h = computeValueHelper(ImageWidth, ImageHeight, FocalLength, FocalLengthIn35mmFilm, Orientation, Distance, ObjectHeight);
	return {'rw' : w, 'rh' : h};
}









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
	});

	form.on('end', function(fields, files) {
		if (this.openedFiles[0].size > 0) {
		
			/* Temporary location of our uploaded file */
			var temp_path = this.openedFiles[0].path;
			/* The file name of the uploaded file */
			var file_name = this.openedFiles[0].name;
			/* Location where we want to copy the uploaded file */
			var new_location = __dirname + '/images/uploads/' + file_name;

			fs.rename(temp_path, new_location, function(err) {  
				if (err) {
					return console.log('ERROR', err);
				} else {
					console.log("success!");
					LATEST_UPLOAD_LOCATION = new_location;
					res.writeHead(200); 
					res.end(JSON.stringify({
						'status':'ok'
					}));
				}
			});
		} else {	
			res.writeHead(200); 
			res.end(JSON.stringify({
				'status':'missing'
			}));
		}
	});
});

/*
 * Handle dimensions upload
 */
app.post('/dimensions', function (req, res, next) {
	next();
}, function(req, res) {
	var form = new formidable.IncomingForm();
	var ImageWidth, ImageHeight, FocalLength, FocalLengthIn35mmFilm, Orientation, Distance, ObjectWidth, ObjectHeight;
	
	
	form.parse(req, function(err, fields, files) {
		if (err) {
			return console.log('ERROR', err);
		}

		ImageWidth = fields.ImageWidth;
		ImageHeight = fields.ImageHeight;
		FocalLength = fields.FocalLength;
		FocalLengthIn35mmFilm = fields.FocalLengthIn35mmFilm;
		Orientation = fields.Orientation;
		Distance = fields.Distance;
		ObjectWidth = fields.ObjectWidth;
		ObjectHeight = fields.ObjectHeight;
	});

	form.on('end', function(fields, files) {
		var data = computeValue(ImageWidth, ImageHeight, FocalLength, FocalLengthIn35mmFilm, Orientation, Distance, ObjectWidth, ObjectHeight);
		
		res.writeHead(200); 
		res.end(JSON.stringify({
			'status':'ok',
			'data' : data
		}));
	});
});

function processImage(res, s_width, s_height) {
	
}







var server = app.listen(process.env.PORT || 3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Object Height started at http://%s:%s', host, port);
});