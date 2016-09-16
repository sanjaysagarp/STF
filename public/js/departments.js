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

		if(deptIndex != "default") {
			//console.log(departments[deptIndex]);

			if(departments[deptIndex].Lat == null || departments[deptIndex].Lng == null) {
				$('#notification').html('Location not set for this department.');
				$('#notification').css('color', 'red');
			} else {
				$('#notification').html('Default location is set to ' + departments[deptIndex].Address);
				$('#notification').css('color', '#737373'); //default help-block text color
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
		}
	});

	// ajax call for updating department location
	$("#departmentForm").submit(function(e) {
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
					$('#notification').html('Default location has been updated to ' + $('#address').val());
					//console.log(departments[$('#department').val()]);
					departments[$('#department').val()].Address = $('#address').val();
					departments[$('#department').val()].Lat = parseFloat($('#latitude').val());
					departments[$('#department').val()].Lng = parseFloat($('#longitude').val());
					//console.log(departments[$('#department').val()]);
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