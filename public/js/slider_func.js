var rangeText = document.getElementById("text");
var distanceSlider = document.getElementById("distance-slider");
rangeText.innerHTML = distanceSlider.value + " feet";

distanceSlider.onmouseup = function()
{
  rangeText.innerHTML = distanceSlider.value + " feet";
}
