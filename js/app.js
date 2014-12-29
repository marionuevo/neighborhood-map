// custom binding handler required for Google Maps API
ko.bindingHandlers.googlemap = {
    init: function (element, valueAccessor) {
        var value = valueAccessor();
        var mapOptions = {
			zoom: 15,
            center: new google.maps.LatLng(value.centerLat, value.centerLon),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(element, mapOptions);
          
        for (var i in value.locations()) {
            var latLng = new google.maps.LatLng (value.locations()[i].latitude, value.locations()[i].longitude);
            var marker = new google.maps.Marker ({position: latLng, map: map});
        }
    }
};

var viewModel =  {
    locations: ko.observableArray([
        {name: "Ayuntamiento de Adeje", latitude: 28.1217968, longitude: -16.7339215},
        {name: "CDTCA", latitude: 28.11559, longitude: -16.730122}
    ])
};
    
ko.applyBindings(viewModel);