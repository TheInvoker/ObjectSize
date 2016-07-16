var express = require('express');
var app = express();
var fs = require('fs');
var formidable = require('formidable');





app.use(express.static(__dirname + '/public'));



// check if on mobile
function isMobile(req) {
    var ua = req.headers['user-agent'];
    return /mobile/i.test(ua);
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
	var caption = '';
	
	
	form.parse(req, function(err, fields, files) {
		if (err) {
			return console.log('ERROR', err);
		}
		caption = fields.caption;
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

					processImageRecognition(res, new_location, caption);
				}
			});
		} else {	
			res.writeHead(200); 
			res.end(JSON.stringify({
				'status':'ok'
			}));
		}
	});
});









var server = app.listen(process.env.PORT || 3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Object Height started at http://%s:%s', host, port);
});