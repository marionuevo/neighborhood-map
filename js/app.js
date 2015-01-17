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
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			panControl: false,
			zoomControl: true,
			zoomControlOptions: {
				position: google.maps.ControlPosition.LEFT_BOTTOM
			},
			mapTypeControl: false,
			scaleControl: true,
			streetViewControl: false,
			overviewMapControl: false
		};
		map = new google.maps.Map($('#mapCanvas')[0], mapOptions);
	

		$('#mapCanvas').css('height', $(window).height());
		$('.scrollable-menu').css('max-height', $(window).height()-36);
		$('.scrollable-menu').css('max-width', $(window).width());

		$(window).resize(function() {
			$('#mapCanvas').css('height', $(window).height());
			$('.scrollable-menu').css('max-height', $(window).height()-36);
			$('.scrollable-menu').css('max-width', $(window).width());
			//google.maps.event.trigger(map, 'resize');

		});
		  
		// add locations to the map
		/*for (var i in locations()) {
			var latLng = new google.maps.LatLng (locations()[i].latitude, locations()[i].longitude);
			var marker = new google.maps.Marker ({position: latLng, map: map});
		}*/

		// infoWindow
		var infoWindowElement = $('#infoWindow')[0];
		var infoOptions = {
			content: infoWindowElement
		};
		infoWindow = new google.maps.InfoWindow (infoOptions);
		//infoWindow.open(map);

		// search places service
		var request = {
			location: adeje,
			radius: 1500,
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
			var streetviewURL = 'https://maps.googleapis.com/maps/api/streetview?size=240x160&location=' + place.geometry.location;
    		//$body.append('<img class="bgimg" src="' + streetviewURL + '">');

			infoWindow.setContent('<h4>' + place.name+ '</h4>' + '<div>' + place.vicinity + '</div>' + 
				'<span><img class="img-responsive img-thumbnail" alt="Responsive image" src="' + streetviewURL + '"></span>' );
			infoWindow.open(map, this);
			map.panTo(marker.position);
		});
	}

	mapInit ();

	// search box provided by Google API
	var input = $('#input')[0];
	map.controls[google.maps.ControlPosition.TOP_RIGHT].push(input);
	var searchBox = new google.maps.places.SearchBox(input);
};

ko.applyBindings (new viewModel ());