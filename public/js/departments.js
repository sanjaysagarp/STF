"use strict";

$(document).ready(function(){
	$("#location-picker").locationpicker({
		location: {latitude: 47.6553, longitude: -122.3035},
		radiius: 0,
		inputBinding: {
			locationNameInput: $('#address')
		},
		enableAutocomplete: true,
		onchanged: function(currentLocation, radius, isMarkerDropped) {
			console.log("Location changed to (" + currentLocation.latitude + ", " + currentLocation.longitude + ")");
		}
	});
});