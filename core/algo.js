module.exports = new function() {

	var computeValueHelper = function(ImageWidth, ImageHeight, FocalLength, FocalLengthIn35mmFilm, Orientation, Distance, ObjectHeight) {
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
	};

	this.computeValue = function(ImageWidth, ImageHeight, FocalLength, FocalLengthIn35mmFilm, Orientation, Distance, ObjectWidth, ObjectHeight) {
		var w = computeValueHelper(ImageWidth, ImageHeight, FocalLength, FocalLengthIn35mmFilm, Orientation, Distance, ObjectWidth);
		var h = computeValueHelper(ImageWidth, ImageHeight, FocalLength, FocalLengthIn35mmFilm, Orientation, Distance, ObjectHeight);
		return {'rw' : w, 'rh' : h};
	};
};