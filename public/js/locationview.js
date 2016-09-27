"use strict";

$(document).ready(function(){

	var item = JSON.parse($('#item').val());

	var location = JSON.parse($('#location').val());
	var proposal = JSON.parse($('#proposal').val());
	if($("#location-picker").length) {
		if(location != null) {
			$('#notification').html('Location for item is set to ' + location.Address);
			$('#notification').css('color', '#737373');
			$("#location-picker").locationpicker({
				location: {latitude: location.Lat, longitude: location.Lng},
				radius: 0,
				zoom: 17,
				inputBinding: {
					locationNameInput: $('#address'),
					latitudeInput: $('#latitude'),
					longitudeInput: $('#longitude')
				},
				enableAutocomplete: true,
				onchanged: function(currentLocation, radius, isMarkerDropped) {
					console.log("Location changed to (" + currentLocation.latitude + ", " + currentLocation.longitude + ")");
				}
			});
		} else {
			$('#notification').html('Location has not been set for this item');
			$('#notification').css('color', 'red');
			$("#location-picker").locationpicker({
			location: {latitude: 47.655381783443865, longitude: -122.30515264816285},
				radius: 0,
				zoom: 17,
				inputBinding: {
					locationNameInput: $('#address'),
					latitudeInput: $('#latitude'),
					longitudeInput: $('#longitude')
				},
				enableAutocomplete: true,
				onchanged: function(currentLocation, radius, isMarkerDropped) {
					console.log("Location changed to (" + currentLocation.latitude + ", " + currentLocation.longitude + ")");
				}
			});
		}
	} else {
		if(location != null) {
			$('#locationDescription').html(location.Description);
			$("#location-picker-disabled").locationpicker({
				location: {latitude: 47.655381783443865, longitude: -122.30515264816285},
					radius: 0,
					zoom: 17,
					inputBinding: {
						locationNameInput: $('#address'),
						latitudeInput: $('#latitude'),
						longitudeInput: $('#longitude')
					},
					markerDraggable: false,
			});
		} else {
			$('#locationDescription').html('This location has yet to be set');
			$('#locationDescription').css('color', 'red');
			$("#location-picker-disabled").locationpicker({
				location: {latitude: 47.655381783443865, longitude: -122.30515264816285},
					radius: 0,
					zoom: 17,
					inputBinding: {
						locationNameInput: $('#address'),
						latitudeInput: $('#latitude'),
						longitudeInput: $('#longitude')
					},
					markerDraggable: false,
					markerVisible : false
			});
		}
	}
	


	// ajax call for updating item location
	$("#editLocationForm").submit(function(e) {
		e.preventDefault();
		submitForm(e);
	});

	// save button will work the same as a form submit
	$('#save').on('click', function(e) {
		e.preventDefault();
		submitForm(e);
	});

	function submitForm(e) {
		$.ajax({
			method: 'POST',
			url: "/v1/update/location",
			data: {
				itemId: item.id,
				proposalId: proposal.id,
				longitude: $('#longitude').val(),
				latitude: $('#latitude').val(),
				address: $('#address').val(),
				description: $('#description').val()
			},
			dataType: 'json',
			success: function(data) {
				if(data) {
					$('#notification').html('Default location has been updated to ' + $('#address').val());
					$('#notification').css('color', 'green');
				} else {
					$('#notification').html('Something went wrong. Try again');
					$('#notification').css('color', 'red');
				}
			},
			failure: function(err) {
				console.log(err);
			}
		});
	}

	
});