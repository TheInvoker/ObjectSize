var state = 0;
var c1x, c1y, c2x, c2y;

function computeValue(ImageWidth, ImageHeight, FocalLength, FocalLengthIn35mmFilm, Orientation, Distance, ObjectHeight) {
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

function drawBox(context, canvas, c1x, c1y, c2x, c2y) {
	context.beginPath();
	context.strokeStyle="red";
	context.rect(Math.min(c1x, c2x), Math.min(c1y, c2y), Math.max(c1x, c2x)-Math.min(c1x, c2x), Math.max(c1y, c2y)-Math.min(c1y, c2y)); 
	context.stroke();
	context.closePath();
}

function f(canvas, context, exifData, tw, th) {
	context.clearRect(0, 0, canvas.width, canvas.height);

	var feet = $("#slider")[0].value;
	var distance = parseFloat(feet) * 304.8;
	
	var rw = computeValue(exifData.ImageWidth, exifData.ImageHeight, exifData.FocalLength, exifData.FocalLengthIn35mmFilm, exifData.Orientation, distance, tw);
	var rh = computeValue(exifData.ImageWidth, exifData.ImageHeight, exifData.FocalLength, exifData.FocalLengthIn35mmFilm, exifData.Orientation, distance, th);
	
	context.fillStyle="red";
	context.font = "15px Arial";
	context.fillText("Target distance: " + feet + "feet",10,20);
	context.fillText((rw/10).toPrecision(5) + "cm x " + (rh/10).toPrecision(5) + "cm",10,40);
}

function drawCircle(context, centerX, centerY, radius) {
	context.beginPath();
	context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
	context.fillStyle = 'yellow';
	context.fill();
	context.closePath();
}

function canvasClick(canvas2, context2, canvas3, context3, event, x_scale, y_scale, exifData) {
	var x = event.offsetX, y = event.offsetY;

	if (state == 0) {
		c1x = x;
		c1y = y;
		drawCircle(context3, x, y, 4);
	} else if (state == 1) {
		c2x = x;
		c2y = y;
		drawCircle(context3, x, y, 4);
		
		drawBox(context3, canvas3, c1x, c1y, c2x, c2y);
		
		var bw = Math.max(c1x, c2x)-Math.min(c1x, c2x);
		var bh = Math.max(c1y, c2y)-Math.min(c1y, c2y);
		
		var tw = x_scale * bw;
		var th = y_scale * bh;
		
		$("#controls_container").css("display", "inline-block");
		$("#slider").on("input", function(){
			$("#sliderVal").html(this.value);
			f(canvas2, context2, exifData, tw, th);
		}).trigger("input");
	}
	
	state += 1;
	return false;
}

function resetClick(canvas2, context2, canvas3, context3) {
	context2.clearRect(0, 0, canvas2.width, canvas2.height);
	context3.clearRect(0, 0, canvas3.width, canvas3.height);
	state = 0;
	$("#controls_container").hide();
	$("#slider").unbind("input");
	return false;
}
	
function saveClick(link, canvas, context, canvas2, context2, canvas3, context3) {
	var newCanvas = $('<canvas width="' + canvas.width + '" height="' + canvas.height + '"></canvas>');
	newCanvas = newCanvas[0];
	var newContext = newCanvas.getContext('2d');
	var newImageData = newContext.createImageData(canvas.width, canvas.height);
	
	var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
	var data = imageData.data;
	var imageData2 = context2.getImageData(0, 0, canvas2.width, canvas2.height);
	var data2 = imageData2.data;
	var imageData3 = context3.getImageData(0, 0, canvas3.width, canvas3.height);
	var data3 = imageData3.data;
	
	for(var i = 0, n = data.length; i < n; i += 4) {
		var red = data[i], green = data[i + 1], blue = data[i + 2], alpha = data[i + 3];
		var red2 = data2[i], green2 = data2[i + 1], blue2 = data2[i + 2], alpha2 = data2[i + 3];
		var red3 = data3[i], green3 = data3[i + 1], blue3 = data3[i + 2], alpha3 = data3[i + 3];
		
		newImageData.data[i+0] = red;
		newImageData.data[i+1] = green;
		newImageData.data[i+2] = blue;
		newImageData.data[i+3] = alpha;
		
		if (alpha2 > 0) {
			newImageData.data[i+0] = (red2 * alpha2/255) + (newImageData.data[i+0] * (1.0 - alpha2/255));
			newImageData.data[i+1] = (green2 * alpha2/255) + (newImageData.data[i+1] * (1.0 - alpha2/255));
			newImageData.data[i+2] = (blue2 * alpha2/255) + (newImageData.data[i+2] * (1.0 - alpha2/255));
			newImageData.data[i+3] = 255;
		}
		
		if (alpha3 > 0) {
			newImageData.data[i+0] = (red3 * alpha3/255) + (newImageData.data[i+0] * (1.0 - alpha3/255));
			newImageData.data[i+1] = (green3 * alpha3/255) + (newImageData.data[i+1] * (1.0 - alpha3/255));
			newImageData.data[i+2] = (blue3 * alpha3/255) + (newImageData.data[i+2] * (1.0 - alpha3/255));
			newImageData.data[i+3] = 255;
		}
	}
	
	newContext.putImageData(newImageData, 0, 0); // at coords 0,0


	link.href = newCanvas.toDataURL();
	link.download = 'canvas.png';
}

function loadedExif(image) {		
	var ImageWidth = EXIF.getTag(image, "ImageWidth");
	var ImageHeight = EXIF.getTag(image, "ImageHeight");
	var FocalLength = EXIF.getTag(image, "FocalLength");
	var FocalLengthIn35mmFilm = EXIF.getTag(image, "FocalLengthIn35mmFilm");
	var Orientation = EXIF.getTag(image, "Orientation");
	
	var w = ImageWidth, h = ImageHeight;
	var sw = document.body.clientWidth, sh = document.body.clientHeight;

	
	// if you took the image sideways
	if (Orientation >= 5) {
		var t = ImageWidth;
		ImageWidth = ImageHeight;
		ImageHeight = t;
	}
		
	var canvas = $('<canvas id="myCanvas" width="' + sw + 'px" height="' + sh + 'px"></canvas>');
	var canvas2 = $('<canvas id="myCanvas2" width="' + sw + 'px" height="' + sh + 'px"></canvas>');
	var canvas3 = $('<canvas id="myCanvas3" width="' + sw + 'px" height="' + sh + 'px"></canvas>');
	$("#content_container").html(canvas).append(canvas2).append(canvas3);
	
	canvas = canvas[0];
	canvas2 = canvas2[0];
	canvas3 = canvas3[0];
	
	var context = canvas.getContext('2d');
	var context2 = canvas2.getContext('2d');
	var context3 = canvas3.getContext('2d');
	
	if (Orientation == 6) {
		var rotate = Math.PI/2;
		context.translate($(document).width(), 0); 
		context.rotate(rotate); 
		context.drawImage(image, 0, 0, w, h, 0, 0, sh, sw);
	} else {
		context.drawImage(image, 0, 0, w, h, 0, 0, sw, sh);
	}
	
	var x_scale = ImageWidth/sw;
	var y_scale = ImageHeight/sh;
	
	var exifData = {
		'ImageWidth' : ImageWidth,
		'ImageHeight' : ImageHeight,
		'FocalLength' : FocalLength,
		'FocalLengthIn35mmFilm' : FocalLengthIn35mmFilm,
		'Orientation' : Orientation
	};
	
	$('#myCanvas3').click(function(event) {
		canvasClick(canvas2, context2, canvas3, context3, event, x_scale, y_scale, exifData);
	});
	
	$('#reset').click(function() {
		resetClick(canvas2, context2, canvas3, context3);
	});
	
	$('#save').click(function() {
		saveClick(this, canvas, context, canvas2, context2, canvas3, context3);
	});
}

function loadedImage(result) {
	var image = document.getElementById("cameraOutput");
	image.onload = function() {
		EXIF.getData(image, function() {
			loadedExif(image);
		});
	};
	image.src = result;
}

$(document).ready(function() {
	$("#cameraSelectImage").click(function() {
		$("#cameraSelect").click();
		return false;
	});
	
	document.getElementById('cameraSelect').onchange = function (evt) {
		var tgt = evt.target || window.event.srcElement, files = tgt.files;

		// FileReader support
		if (FileReader && files && files.length) {
			var fr = new FileReader();
			fr.onload = function() {
				loadedImage(fr.result);
			};
			fr.readAsDataURL(files[0]);
		} else {
			// Not supported
			// fallback -- perhaps submit the input to an iframe and temporarily store
			// them on the server until the user's session ends.
		}
	}
});