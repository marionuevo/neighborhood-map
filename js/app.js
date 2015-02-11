/** Neighborhood-map application.
  * It uses Google Maps API, Google Maps Places Service API and Google Streeview API.
  * Developed by Mario Nuevo.
  *
  * @returns nothing.
  */
function viewModel() {
	if (typeof google === "undefined") {
	   $('#alert-modal').modal();
	   return;
	}
	var adeje = new google.maps.LatLng(28.1217968, -16.7339215); // initial location
	var self = this;
	var map;
	var infoWindow;
	var service;

	// Location class that store a place and the corresponding marker in the locations array
	var Location = function (place, marker) {
		this.place = place,
		this.marker = marker,
		this.active = ko.observable(false)
	}

	// Observable knockout array where we store locations
	locations = ko.observableArray([]);

	/** Invoke click trigger when user clicks over a location list item.
	  * Also close the list if the screen is in "mobile" mode.
	  * 
	  * @param {Location} location: The location object that we want to show info.
	  * @returns nothing.
	  */
	self.showdata = function (location) {
		google.maps.event.trigger(location.marker, 'click');
		if ($(".navbar").css('display') === 'block') {
			$("#menu-button").trigger('click');
		}	
	}

	/** Reset active locations on the list to inactive state.
	  *
	  * @returns nothing.
	  */
	function resetActiveLocations() {
		for (var i=0; i < locations().length; i++) {
			locations()[i].active(false);
		}
	}

	/** Initialize the google maps API map
	  *
	  * @returns nothing.
	  */
	function mapInit() {
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
	
		// set map to full size and places list to full height
		$('#mapCanvas').css('height', $(window).height());
		$('.scrollable-menu').css('max-height', $(window).height()-70);
		$('.scrollable-menu').css('max-width', $(window).width());

		// ensure the map is full size and places list to full height after a window resize event
		$(window).resize(function() {
			$('#mapCanvas').css('height', $(window).height());
			$('.scrollable-menu').css('max-height', $(window).height()-70);
			$('.scrollable-menu').css('max-width', $(window).width());
		});

		// Google API infoWindow
		var infoWindowElement = $('#infoWindow')[0];
		var infoOptions = {
			content: infoWindowElement
		};
		infoWindow = new google.maps.InfoWindow (infoOptions);

		// Google API search places service
		var request = {
			location: adeje,
			radius: 800
		};
		service = new google.maps.places.PlacesService(map);
		service.nearbySearch(request, placesCallback);
	}

	/** Create markers with places returned by places service
	  * 
	  * @returns nothing.
	  */
	function placesCallback(places, status) {
		// error check
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			for (var i = 0; i < places.length; i++) {
				createMarker (places[i]);
			}
		}
	}

	/** Create a marker and add it corresponding click listener 
	  *	for getting place details.
	  * 
	  * @param place: one of each places returned by the search
	  * @returns nothing.
	  */
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
		var location = new Location(place, marker);
		locations.push(location);

		google.maps.event.addListener(marker, 'click', function() {
			var request = {
				placeId: place.place_id
			};
			service.getDetails(request, callBack_createInfoWindow);
			infoWindow.open(map, this);
			resetActiveLocations();
			location.active(true);
			map.panTo(marker.position);
		});
	}

	/** Function called when details requested are given.
	  * It creates the infowindow html content.

	  * @returns nothing.
	  */
	function callBack_createInfoWindow(place, status) {
		// error check
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			var streetviewURL = 'https://maps.googleapis.com/maps/api/streetview?size=128x128&location=' + place.geometry.location;
			var contentString = '<div class="media"><div class="pull-left" href="#"><img class="media-object img-thumbnail" src="' 
									+ streetviewURL + '" alt="streetview image"></div><div class="media-body"><h4 class="media-heading">' 
									+ place.name + '</h4>' + place.vicinity + '<br>';

			if (place.formatted_phone_number) contentString += place.formatted_phone_number +'<br>';
			if (place.url) contentString += '<a href="' + place.url + '">Google+</a>';
			contentString += '</div></div>';

			infoWindow.setContent(contentString);
		}
	};

	mapInit ();

	// search box provided by Google API
	// the following line selects the htmlinput with "input" id element form the DOM using jQuery
	var input = $('#input')[0];
	
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
	var searchBox = new google.maps.places.SearchBox(input);

	// Listen for the event fired when the user selects an item from the search box
	// pick list. Retrieve the matching places for that item.
	google.maps.event.addListener(searchBox, 'places_changed', searchBoxCallback);
	searchBox.setBounds(map.getBounds());

	/** Function called when searchbox results are given.
	  * Updates markers and locations array with new results
	  *
	  * @returns nothing.
	  */
	function searchBoxCallback() {
		var places = searchBox.getPlaces();
		// error check
		if (places.length == 0) {
			return;
		}

		// clear old markers from map
		for (var i = 0; i < locations().length; i++) {
			locations()[i].marker.setMap(null);
		}
	
		// clear main locations array
		locations([]);

		// create new markers and adjust map bounds to new results
		var bounds = new google.maps.LatLngBounds();
		for (var i = 0; i < places.length; i++) {
			createMarker (places[i]);
			bounds.extend(places[i].geometry.location);
		}
		map.fitBounds(bounds);
	}

	// Bias the SearchBox results towards places that are within the bounds of the
	// current map's viewport.
	google.maps.event.addListener(map, 'bounds_changed', function() {
		searchBox.setBounds(map.getBounds());
	});

};

ko.applyBindings (new viewModel ());