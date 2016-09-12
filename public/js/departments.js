"use strict";

$(document).ready(function(){

	var departments = JSON.parse($('#allDepartments').val());

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

	$('#department').change(function() {
		//on department change, update location picker
		var deptIndex = $(this).val();

		console.log(departments[deptIndex]);

		if(departments[deptIndex].Lat == null || departments[deptIndex].Lng == null) {
			$('#location').html('Location not found for this department.');
			$('#location').css('color', 'red');
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
		} else {
			$('#location').html('Default location is set to ' + departments[deptIndex].Address);
			$('#location').css('color', 'green');
			$("#location-picker").locationpicker({
				location: {latitude: departments[deptIndex].Lat, longitude: departments[deptIndex].Lng},
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
	});

	// save button will work the same as a form submit -- need a form submit function
	$('#save').on('click', function(e) {
		e.preventDefault();
		$.ajax({
				method: 'POST',
				url: "/v1/update/department",
				data: {
					longitude: $('#longitude').val(),
					latitude: $('#latitude').val(),
					address: $('#address').val(),
					department: departments[$('#department').val()].Department
				},
				dataType: 'json',
				success: function(data) {
					if(data) {
						$("#quarterNotification").css("display", "block");
						$("#quarterNotification").addClass("alert alert-success");
						$("#quarterNotification").html(data.message);
						$("#quarterNotification").fadeOut( 3000 );
					} else {
						$("#quarterNotification").css("display", "block");
						$("#quarterNotification").addClass("alert alert-danger");
						$("#quarterNotification").html("Something went wrong");
						$("#quarterNotification").fadeOut( 3000 );
					}
					
				},
				failure: function(err) {
					console.log(err);
				}
		});
	});

	
});