window.addEventListener('load', function() {

	var map;
	var infowindow;
	initMap();
	function initMap() {
		infowindow = new google.maps.InfoWindow();
		var uw = new google.maps.LatLng(47.6553, -122.3035);
		map = new google.maps.Map($('.map_canvas')[0], {
			center: uw,
			zoom: 16
		});
		var service = new google.maps.places.PlacesService(map);
		
		service.nearbySearch({
			location: uw,
			radius: '800',
			type: ['school']
		}, callback);

	}

	function callback(results, status) {
		if (status === google.maps.places.PlacesServiceStatus.OK) {
			for (var i = 0; i < results.length; i++) {
				createMarker(results[i]);
			}
		}
	}
	//need location of departments? -- are we gonna specify which proposals come from which departments
	//currently using nearby radius for location.
	// HUB: 47.655464, -122.305131
	
	// This query is limited to 20 places
	function createMarker(place) {
		var placeLoc = place.geometry.location;
		var marker = new google.maps.Marker({
			map: map,
			animation: google.maps.Animation.DROP,
			position: place.geometry.location
		});

		google.maps.event.addListener(marker, 'click', function() {
			infowindow.setContent(place.name);
			infowindow.open(map, this);
		});
	}
});