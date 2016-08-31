$(document).ready(function(){
	//gets proposals
	var proposals = JSON.parse($('#proposals').val());
	var departments = JSON.parse($('#allDepartments').val());
	var categories = JSON.parse($('#allCategories').val());
	var type = "line";
	var cat = "All";
	var dept = "All";
	var chart;
	var totalProposals = 0;
	var fundedProposals = 0;
	var partialFunded = 0;
	var funded = 0.0;
	var requested = 0.0;
	var departmentArr = [];

	//initializes year axis
	var yearAxis = ['x'];
	for(year in proposals) {
		var format = proposals[year][0].Year + '-01-01';
		yearAxis.push(format);
	}

	refreshTable();

	$('#addDepartment').on('click', function() {
		dept = $('#department').val();
		refreshTable();
	});

	$("#category").change(function() {
		cat = $(this).val();
		refreshTable();
	});

	$("#endYear").change(function() {
		adjustAxis();
	});

	$("#startYear").change(function() {
		adjustAxis();
	});

	$("#clearAll").on('click', function() {
		departmentArr = [];
		initializeChart();
	});

	$("#chartType").change(function() {
		type = $(this).val();
		initializeChart();

		for(var i = 0; i < departmentArr.length; i++) {
			chart.load({
				unload: [
					yearAxis,
					departmentArr[i]
				],
				columns:[
					yearAxis,
					departmentArr[i]
				]
			});
		}
	});

	
	function refreshTable() {
		totalProposals = 0;
		fundedProposals = 0;
		partialFunded = 0;
		funded = 0.0;
		requested = 0.0;

		if(chart == undefined) {
			initializeChart();
		}
		
		var startYear = $('#startYear').val();
		var endYear = $('#endYear').val();
		if(dept == "All") {
			currArray = [dept];
		} else {
			currArray = [departments[dept]];
		}
		

		// TODO - only get dollar amounts for comparisons
		for(year in proposals) {
			if(proposals[year][0].Year >= startYear && proposals[year][0].Year <= endYear) {
				for(num in proposals[year]) {
					if((cat == "All" || ( categories[proposals[year][num].Category] != null && categories[proposals[year][num].Category].name == categories[cat].name)) && (dept == "All" || proposals[year][num].Department == departments[dept])) {
						if(proposals[year][num].Decision != "Not Funded") {
							funded += proposals[year][num].Award;
						}
						totalProposals++;
					}
				}
				currArray.push(funded);
				funded = 0;
			}
		}
		departmentArr.push(currArray);


		for(var i = 0; i < departmentArr.length; i++) {
			chart.load({
				unload: [
					yearAxis,
					departmentArr[i]
				],
				columns:[
					yearAxis,
					departmentArr[i]
				]
			});
		}
	}

	function contains(depts, curr) {
		for(var i = 0; i < depts.length; i++) {
			if(depts[i][0] == curr[0] && depts[i].length == curr.length) {
				return true;
			}
		}
		return false;
	}

	function initializeChart() {
		chart = c3.generate({
				bindto: '#chart',
				data: {
					x: 'x',
					columns: [
						yearAxis
					],
					type : type,
				},
				size: {
					height: 600,
					width: 800
				},
				padding: {
					top: 50
				},
				tooltip: {
					format: {
						value: function (value, ratio, id) {
							return "$" + value.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
						}
					}
				},
				axis : {
					x : {
						type : 'timeseries',
						tick: {
							format: function (x) { return x.getFullYear(); }
						}
					},
					y : {
						tick: {
							format: d3.format("$,")
						}
					}
				}
			});
	}

	function adjustAxis() {
		yearAxis = ['x'];
		for(year in proposals) {
			if(proposals[year][0].Year <= $("#endYear").val() && proposals[year][0].Year >= $("#startYear").val()) {
				var format = proposals[year][0].Year + '-01-01';
				yearAxis.push(format);
			}
		}

		var startYear = $('#startYear').val();
		var endYear = $('#endYear').val();
		funded = 0;

		departmentRefresh = [];
		for(index in departmentArr) {
			currArray = [departmentArr[index][0]];
			for(year in proposals) {
				if(proposals[year][0].Year >= startYear && proposals[year][0].Year <= endYear) {
					for(num in proposals[year]) {
						if((cat == "All" || ( categories[proposals[year][num].Category] != null && categories[proposals[year][num].Category].name == categories[cat].name)) && (departmentArr[index][0] == "All" || proposals[year][num].Department == departmentArr[index][0])) {
							if(proposals[year][num].Decision != "Not Funded") {
								funded += proposals[year][num].Award;
							}
						}
					}
					currArray.push(funded);
					funded = 0;
				}
			}
			departmentRefresh.push(currArray);
			chart.load({
				unload:[
					yearAxis,
					departmentArr[index]
				]
			});
		}
		departmentArr = departmentRefresh;
		for(var i = 0; i < departmentRefresh.length; i++) {
			chart.load({
				unload: [
					yearAxis,
					departmentRefresh[i]
				],
				columns:[
					yearAxis,
					departmentRefresh[i]
				]
			});
		}
	}
});