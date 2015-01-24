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

	self.showdata = function (location) {
		google.maps.event.trigger(location.marker, 'click');
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
		$('.scrollable-menu').css('max-height', $(window).height()-70);
		$('.scrollable-menu').css('max-width', $(window).width());

		$(window).resize(function() {
			$('#mapCanvas').css('height', $(window).height());
			$('.scrollable-menu').css('max-height', $(window).height()-70);
			$('.scrollable-menu').css('max-width', $(window).width());

		});

		// infoWindow
		var infoWindowElement = $('#infoWindow')[0];
		var infoOptions = {
			content: infoWindowElement
		};
		infoWindow = new google.maps.InfoWindow (infoOptions);

		// search places service
		var request = {
			location: adeje,
			radius: 800
			/*types: ['store']*/
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
		// For each place, get the icon, place name, and location.
		var placeLoc = place.geometry.location;
		var image = {
				url: place.icon,
				size: new google.maps.Size(71, 71),
				origin: new google.maps.Point(0, 0),
				anchor: new google.maps.Point(17, 34),
				scaledSize: new google.maps.Size(25, 25)
			};
		var marker = new google.maps.Marker({
			map: map,
			icon: image,
			title: place.name,
			position: place.geometry.location
		});
		locations.push(new Location(place, marker));

		google.maps.event.addListener(marker, 'click', function() {
			var request = {
				placeId: place.place_id
			};
			service.getDetails(request, function(place, status) {
			    if (status == google.maps.places.PlacesServiceStatus.OK) {
			    	var streetviewURL = 'https://maps.googleapis.com/maps/api/streetview?size=128x128&location=' + place.geometry.location;

					infoWindow.setContent('<div class="media"><div class="pull-left" href="#"><img class="media-object img-thumbnail" src="' + streetviewURL +
											 '" alt="streetview image"></div><div class="media-body"><h4 class="media-heading">' + place.name +
											 '</h4>' + place.vicinity + '<br>'+ place.formatted_phone_number +'<br><a href="' + place.url + '">Google+</a>' +'</div></div>');
					
			    }
			  });
			infoWindow.open(map, this);
			map.panTo(marker.position);
		});
	}

	mapInit ();

	// search box provided by Google API
	var input = $('#input')[0];
	map.controls[google.maps.ControlPosition.TOP_RIGHT].push(input);
	var searchBox = new google.maps.places.SearchBox(input);

	// Listen for the event fired when the user selects an item from the
	// pick list. Retrieve the matching places for that item.
	google.maps.event.addListener(searchBox, 'places_changed', function() {
		var places = searchBox.getPlaces();
		if (places.length == 0) {
			return;
		}

		for (var i = 0; i < locations().length; i++) {
			locations()[i].marker.setMap(null);
		}
	
		locations([]);
		var bounds = new google.maps.LatLngBounds();
		for (var i = 0; i < places.length; i++) {
			createMarker (places[i]);
			bounds.extend(places[i].geometry.location);
		}
		map.fitBounds(bounds);
	});

	// Bias the SearchBox results towards places that are within the bounds of the
	// current map's viewport.
	google.maps.event.addListener(map, 'bounds_changed', function() {
		var bounds = map.getBounds();
		searchBox.setBounds(bounds);
	});

};

ko.applyBindings (new viewModel ());

