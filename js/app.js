var map;
function initialize() {
 	var mapOptions = {
		zoom: 15,
		center: new google.maps.LatLng(28.1217968, -16.7339215)
 	};
  	map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
}
google.maps.event.addDomListener(window, 'load', initialize);