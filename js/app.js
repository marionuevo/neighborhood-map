function viewModel () {
    var self = this;
    var map;

    function mapInit (argument) {
        var mapOptions = {
            zoom: 15,
            center: new google.maps.LatLng(28.1217968, -16.7339215),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
          
        for (var i in locations()) {
            var latLng = new google.maps.LatLng (locations()[i].latitude, locations()[i].longitude);
            var marker = new google.maps.Marker ({position: latLng, map: map});
        }
    }

    locations = ko.observableArray([
        {name: "Ayuntamiento de Adeje", latitude: 28.1217968, longitude: -16.7339215},
        {name: "CDTCA", latitude: 28.11559, longitude: -16.730122},
    ]);

    mapInit ();

    // search box
    var input = document.getElementById('input');
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    var searchBox = new google.maps.places.SearchBox(input);
    
};

ko.applyBindings (new viewModel ());