function viewModel() {
	var adeje = new google.maps.LatLng(28.1217968, -16.7339215);
	var self = this;
	var map;
	var infoWindow;
	var service;

	// Location class that store a place and the corresponding marker in the locations array
	var Location = function (place, marker) {
		this.place = place,
		this.marker = marker
	}

	locations = ko.observableArray([]);
/*	locations.subscribe (function (locations) {
		createMarker(locations[locations.length-1]);        // last item added       
	});*/

	self.showdata = function (location) {
		google.maps.event.trigger(location.marker, 'click');
		//map.panTo(location.marker.position);
		//infoWindow.setContent(marker.name);
		//infoWindow.open(map, this);
	}

	function mapInit(argument) {
		var mapOptions = {
			zoom: 15,
			center: adeje,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		map = new google.maps.Map(document.getElementById('mapCanvas'), mapOptions);
		  
		// add locations to the map
		/*for (var i in locations()) {
			var latLng = new google.maps.LatLng (locations()[i].latitude, locations()[i].longitude);
			var marker = new google.maps.Marker ({position: latLng, map: map});
		}*/

		// infoWindow
		var infoWindowElement = document.getElementById('infoWindow');
		var infoOptions = {
			content: infoWindowElement
		};
		infoWindow = new google.maps.InfoWindow (infoOptions);
		//infoWindow.open(map);

		// search places service
		var request = {
			location: adeje,
			radius: 500,
			types: ['store']
		};

		service = new google.maps.places.PlacesService(map);
		service.nearbySearch(request, callback);
	}

	function callback(places, status) {
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			for (var i = 0; i < places.length; i++) {
				createMarker (places[i]);
			}
		}
	}

	function createMarker(place) {
		var placeLoc = place.geometry.location;
		var marker = new google.maps.Marker({
			map: map,
			position: place.geometry.location
		});
		locations.push(new Location(place, marker));

		google.maps.event.addListener(marker, 'click', function() {
			infoWindow.setContent('<h3>'+place.name+'</h3>'+'<div>'+place.vicinity+'</div>');
			infoWindow.open(map, this);
			map.panTo(marker.position);
			console.dir(place);
		});
	}

	mapInit ();

	// search box provided by Google API
	var input = document.getElementById('input');
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
	var searchBox = new google.maps.places.SearchBox(input);
};

ko.applyBindings (new viewModel ());