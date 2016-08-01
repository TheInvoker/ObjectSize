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