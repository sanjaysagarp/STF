window.addEventListener('load', function() {

	var map;
	initMap();
	function initMap() {
		map = new google.maps.Map($('.map_canvas')[0], {
			center: {lat: 47.6553, lng: -122.3035},
			zoom: 16
		});
	}

	//need location of equipment? -- what do we want to show!

	function createMarker(place) {
		var placeLoc = place.geometry.location;
		var marker = new google.maps.Marker({
			map: map,
			position: place.geometry.location
		});

		google.maps.event.addListener(marker, 'click', function() {
			infowindow.setContent(place.name);
			infowindow.open(map, this);
		});
	}
});