function viewModel() {
	var adeje = new google.maps.LatLng(28.1217968, -16.7339215);
	var self = this;
	var map;
	var infoWindow;
	var service;
	var request;

	markers = ko.observableArray([]);
	markers.subscribe (function (markers) {
		createMarker(markers[markers.length-1]);        // last item added       
	});

    self.showdata = function (place) {
        console.log(place);
        google.maps.event.trigger(place, 'click');
        //map.panTo(place.position);
        //infoWindow.setContent(place.name);
        //infoWindow.open(map, this);
    }

	function mapInit(argument) {
		var mapOptions = {
			zoom: 15,
			center: adeje,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		map = new google.maps.Map(document.getElementById('mapCanvas'), mapOptions);
		  
		// add markers to the map
		for (var i in markers()) {
			var latLng = new google.maps.LatLng (markers()[i].latitude, markers()[i].longitude);
			var marker = new google.maps.Marker ({position: latLng, map: map});
		}

		// infoWindow
		var infoWindowElement = document.getElementById('infoWindow');
		var infoOptions = {
			content: infoWindowElement
		};
		infoWindow = new google.maps.InfoWindow (infoOptions);
		infoWindow.open(map);

		// search places service
		request = {
			location: adeje,
			radius: 500,
			types: ['store']
		};

		service = new google.maps.places.PlacesService(map);
		service.nearbySearch(request, callback);
	}

	

	function callback(results, status) {
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			for (var i = 0; i < results.length; i++) {
				//createMarker(results[i]);
				markers.push(results[i]);
			}
		}
	}

	function createMarker(place) {
		var placeLoc = place.geometry.location;
		var marker = new google.maps.Marker({
			map: map,
			position: place.geometry.location
		});

		google.maps.event.addListener(marker, 'click', function() {
			infoWindow.setContent(place.name);
			infoWindow.open(map, this);
			console.log(this);
		});
	}

	mapInit ();

	// search box provided by Google API
	var input = document.getElementById('input');
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
	var searchBox = new google.maps.places.SearchBox(input);


	
};

ko.applyBindings (new viewModel ());