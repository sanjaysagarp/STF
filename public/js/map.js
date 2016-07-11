window.addEventListener('load', function() {

	var map;

	function initMap() {
		map = new google.maps.Map($('.map_canvas'), {
			center: {lat: -34.397, lng: 150.644},
			zoom: 8
		});
	}
});