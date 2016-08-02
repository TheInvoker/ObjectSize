var index = 0;
var IMAGES = [{
	'c' : '../images/download.jpg',
	't' : '../images/mockups3.png'
}, {
	'c' : '../images/download2.jpg',
	't' : '../images/mockups2.png'
}, {
	'c' : '../images/download3.jpg',
	't' : '../images/mockups1.png'
}];

$(document).ready(function() {
	$(".menu .menu-collapse-button").click(function() {
		$(".menu").toggleClass("open");
		return false;
	});
	$(".menu .menu-header").on('click', '.menu-item', function() {
		$(".menu").removeClass("open");
		$(".menu-item.selected").removeClass("selected");
		$(this).addClass("selected");
		return false;
	});
	
	var interval = -1;
	for(var i=0; i<IMAGES.length; i+=1) {
		$(".carousel-pages").append("<div class='carousel-pages-item' data-id='" + i + "'></div>");
	}
	$(".carousel-pages-item").click(function() {
		index = parseInt($(this).attr("data-id"), 10);
		setImage(index);
		clearInterval(interval);
		interval = setInterval(caraSwitch, 6000);
		return false;
	});
	$(".carousel-pages-item").eq(0).click();
	
	
	
	
	
	
	$("#cameraSelectImage").click(function() {
		$("#cameraSelect").click();
		return false;
	});
	document.getElementById('cameraSelect').onchange = function (evt) {
		//$('#image_upload_form').trigger('submit', evt.target || window.event.srcElement);
		$(".menu, .content, #demo_page").toggleClass("close");
		handleImage(evt.target || window.event.srcElement);
	}
});

function caraSwitch() {
	index = (index + 1) % 3;
	setImage(index);
}

function setImage(index) {
	var data = IMAGES[index];
	$(".carousel").css('background-image', "url('" + data.c + "')");
	$(".phone-template").css('background-image', "url('" + data.t + "')");
	
	$(".carousel-pages-item.selected").removeClass("selected");
	$(".carousel-pages-item").eq(index).addClass("selected");
}
























var state = 0;
var c1x, c1y, c2x, c2y;
function computeValue(ImageWidth, ImageHeight, FocalLength, FocalLengthIn35mmFilm, Orientation, Distance, ObjectWidth, ObjectHeight, success){
	var formData = {
		'ImageWidth':ImageWidth,
		'ImageHeight':ImageHeight,
		'FocalLength':FocalLength,
		'FocalLengthIn35mmFilm':FocalLengthIn35mmFilm,
		'Orientation':Orientation,
		'Distance':Distance,
		'ObjectWidth':ObjectWidth,
		'ObjectHeight':ObjectHeight
	};

	$.ajax({
		url : "/dimensions",
		type: "POST",
		data : formData,
		success: function(data, textStatus, jqXHR) {
			var data = JSON.parse(data);
			if (data.status === 'ok') {
				success(data.data);
			} else {
				alert(data.msg);
			}
		},
		error: function (jqXHR, textStatus, errorThrown) {
			alert("Error Occured!");
		}
	});
}
function drawBox(context, canvas, c1x, c1y, c2x, c2y) {
	context.beginPath();
	context.strokeStyle="red";
	context.rect(Math.min(c1x, c2x), Math.min(c1y, c2y), Math.max(c1x, c2x)-Math.min(c1x, c2x), Math.max(c1y, c2y)-Math.min(c1y, c2y)); 
	context.stroke();
	context.closePath();
}
function f(canvas, context, exifData, tw, th) {
	var feet = $("#slider")[0].value;
	var distance = parseFloat(feet) * 304.8;
	
	var rw = computeValue(exifData.ImageWidth, exifData.ImageHeight, exifData.FocalLength, exifData.FocalLengthIn35mmFilm, exifData.Orientation, distance, tw, th, function(data) {
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.fillStyle="red";
		context.font = "15px Raleway";
		context.fillText("Target distance: " + feet + " feet",10,20);
		context.fillText((data.rw/10).toPrecision(5) + " cm x " + (data.rh/10).toPrecision(5) + " cm",10,40);
	});
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
		resetClick(canvas2, context2, canvas3, context3);
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
	
	state = (state + 1) % 2;
}
function resetClick(canvas2, context2, canvas3, context3) {
	context2.clearRect(0, 0, canvas2.width, canvas2.height);
	context3.clearRect(0, 0, canvas3.width, canvas3.height);
	state = 0;
	$("#controls_container").hide();
	$("#slider").unbind("input");
}



function uploadImage(dataURL) {
	$.ajax({
		url : "/upload",
		type: "POST",
		data : {
			'data' : dataURL
		},
		success: function(data, textStatus, jqXHR) {
			var data = JSON.parse(data);
			if (data.status === 'ok') {
				alert("Saved!");
			} else {
				alert(data.msg);
			}
		},
		error: function (jqXHR, textStatus, errorThrown) {
			alert("Error Occured!");
		}
	});
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
	
	newContext.putImageData(newImageData, 0, 0); // at coords 0,0\
	
	var href = newCanvas.toDataURL();
	uploadImage(href);
	
	//link.href = href;
	//link.download = 'canvas.png';
}
function loadedExif(sw, sh, image) {		
	var ImageWidth = EXIF.getTag(image, "ImageWidth");
	var ImageHeight = EXIF.getTag(image, "ImageHeight");
	var FocalLength = EXIF.getTag(image, "FocalLength");
	var FocalLengthIn35mmFilm = EXIF.getTag(image, "FocalLengthIn35mmFilm");
	var Orientation = EXIF.getTag(image, "Orientation");
	
	var w = ImageWidth, h = ImageHeight;
	
	// if you took the image sideways
	if (Orientation >= 5) {
		var t = ImageWidth;
		ImageWidth = ImageHeight;
		ImageHeight = t;
	}
		
	var canvas = $('<canvas id="myCanvas" width="' + sw + 'px" height="' + sh + 'px"></canvas>');
	var canvas2 = $('<canvas id="myCanvas2" width="' + sw + 'px" height="' + sh + 'px"></canvas>');
	var canvas3 = $('<canvas id="myCanvas3" width="' + sw + 'px" height="' + sh + 'px"></canvas>');
	$("#content_container").empty().append(canvas).append(canvas2).append(canvas3);
	
	canvas = canvas[0];
	canvas2 = canvas2[0];
	canvas3 = canvas3[0];
	
	var context = canvas.getContext('2d');
	var context2 = canvas2.getContext('2d');
	var context3 = canvas3.getContext('2d');
	
	var Orientation = 6;
	if (Orientation == 6) {
		var rotate = Math.PI/2;
		context.translate(sw, 0); 
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
		return false;
	});
	
	$('#save').click(function() {
		saveClick(this, canvas, context, canvas2, context2, canvas3, context3);
		return false;
	});
	
	$('#back').click(function() {
		window.location = ''
		return false;
	});
}
function loadedImage(sw, sh, result) {
	var image = document.getElementById("cameraOutput");
	image.onload = function() {
		EXIF.getData(image, function() {
			loadedExif(sw, sh, image);
		});
	};
	image.src = result;
}
function handleImage(tgt) {
	
	var files = tgt.files;
	var sw = document.body.clientWidth, sh = document.body.clientHeight;
	
	// FileReader support
	if (FileReader && files && files.length) {
		var fr = new FileReader();
		fr.onload = function() {
			loadedImage(sw, sh, fr.result);
		};
		fr.readAsDataURL(files[0]);
	} else {
		// Not supported
		// fallback -- perhaps submit the input to an iframe and temporarily store
		// them on the server until the user's session ends.
	}
}