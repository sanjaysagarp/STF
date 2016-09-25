window.addEventListener('load', function() {

	var map;
	var infowindow;
	var items = JSON.parse($('#itemLocations').val());
	var markers = [];
	initMap();

	$('#searchInput').keypress(function (e) {
		if (e.which == 13) {
			$('#searchForm').submit();
			return false;
		}
	});

	$("#searchForm").submit(function(e) {
		e.preventDefault();
		$.ajax({
				method: 'get',
				url: "/api/v1/get/items",
				data: {
					searchTerm: $('#searchInput').val()
				},
				dataType: 'json',
				success: function(data) {
					if(data) {
						items = data.data;
					} else {
						//display feedback that no items found?
						items = null;
					}
					refreshItems(items);
				},
				failure: function(err) {
					console.log(err);
				}
		});
	});

	$('#searchButton').on('click', function(e) {
		e.preventDefault();
		$("#searchForm").submit();
	});

	$('.listItem').on('click', function() {
		console.log(this.val());
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
			createMarker(items[item]);
		}
	}

	function refreshItems(items) {
		//need to empty map markers and place new items
		for(i=0; i<markers.length; i++){
			markers[i].setMap(null);
		}
		$('#itemList').empty();
		for(item in items) {
			//add anything additional with item name here
			$('#itemList').append('<p><button class="listItem" onclick="highlightMarker(' + item +')">' + items[item].ItemName + '</button><br><i>Found in <a href="https://uwstf.org/proposals/' + items[item].Year + '/' + items[item].Number +  '" target="_blank">Proposal ' + items[item].Year + '-' + items[item].Number + '</a></i></p>');
			createMarker(items[item]);
		}
	}

	//triggers a click for the selected marker from the item list
	highlightMarker = function(index) {
		var latLng = markers[index].getPosition();
		map.setCenter(latLng);
		google.maps.event.trigger(markers[index], 'click');
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
					+ '<p>' + item.Description + '</p>' +
					'<p>Address: ' + item.Address + '</p>'
				);
			} else {
				infowindow.setContent(
				'<h3>' + item.ItemName + '</h3>'
				);
			}
			infowindow.open(map, this);
		});
		markers.push(marker);
	}
});