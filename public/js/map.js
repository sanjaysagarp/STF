window.addEventListener('load', function() {

	var map;
	var infowindow;
	var items = JSON.parse($('#itemLocations').val());
	initMap();

	$("#searchButton").on('click', function() {
		//on search click, form ajax post - return list of itemnames from search terms
	});

	function initMap() {
		infowindow = new google.maps.InfoWindow();
		var uw = new google.maps.LatLng(47.6553, -122.3035);
		map = new google.maps.Map($('.map_canvas')[0], {
			center: uw,
			zoom: 16
		});
		for(item in items) {
			//have a limit? showing all would be overwhelming
			console.log(items[item]);
			createMarker(items[item]);
		}
	}
	
	function createMarker(item) {
		var marker = new google.maps.Marker({
			map: map,
			animation: google.maps.Animation.DROP,
			position: {lat: item.Lat, lng: item.Lng}
		});

		google.maps.event.addListener(marker, 'click', function() {
			if (item.Description) {
				infowindow.setContent(
					'<h3>' + item.ItemName + '</h3>'
					+ '<p>' + item.Description + '</p>'
				);
			} else {
				infowindow.setContent(
				'<h3>' + item.ItemName + '</h3>'
				);
			}
			//  put some jquery here for the sidewindow?
			//$('#itemList')
			infowindow.open(map, this);
		});
	}
});