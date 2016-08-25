$(document).ready(function(){
	//gets proposals
	var proposals = JSON.parse($('#proposals').val());
	var departments = JSON.parse($('#allDepartments').val());
	var categories = JSON.parse($('#allCategories').val());
	var fundedArr = ["Funded"];
	var partiallyFunded = ["Partially Funded"];
	var notFunded = ["Not Funded"];
	var type = "pie";
	var cat = "All";
	var dept = "All";
	var chart;
	var totalProposals = 0;
	var fundedProposals = 0;
	var partialFunded = 0;
	var funded = 0.0;
	var requested = 0.0;
	//initializes year axis
	var yearAxis = ['x'];
	for(year in proposals) {
		var format = proposals[year][0].Year + '-01-01';
		yearAxis.push(format);
	}

	refreshTable();

	//change functions update table and chart
	$("#department").change(function() {
		dept = $(this).val();
		refreshTable();
	});

	$("#category").change(function() {
		cat = $(this).val();
		refreshTable();
	});
	$("#endYear").change(function() {
		yearAxis = ['x'];
		for(year in proposals) {
			if(proposals[year][0].Year <= $("#endYear").val() && proposals[year][0].Year >= $("#startYear").val()) {
				var format = proposals[year][0].Year + '-01-01';
				yearAxis.push(format);
			}
		}
		refreshTable();
	});
	$("#startYear").change(function() {
		yearAxis = ['x'];
		for(year in proposals) {
			if(proposals[year][0].Year <= $("#endYear").val() && proposals[year][0].Year >= $("#startYear").val()) {
				var format = proposals[year][0].Year + '-01-01';
				yearAxis.push(format);
			}
		}
		refreshTable();
	});

	$("#chartType").change(function() {
		type = $(this).val();
		if(type == "pie") {
			chart = c3.generate({
				bindto: '#chart',
				data: {
					columns: [
						["Not Funded", (totalProposals - (fundedProposals+partialFunded))],
						["Partially Funded", partialFunded],
						["Funded", fundedProposals],
					],
					type : "pie",
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
							return value + " Proposals";
						}
					}
				},
				pie: {
					expand: true
				}
			});
		} else {
			chart = c3.generate({
					bindto: '#chart',
					data: {
						x: 'x',
						columns: [
							yearAxis,
							notFunded,
							partiallyFunded,
							fundedArr,
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
	});

	
	function refreshTable() {
		totalProposals = 0;
		fundedProposals = 0;
		partialFunded = 0;
		funded = 0.0;
		requested = 0.0;

		if(chart == undefined) {
			//initialize pie
			chart = c3.generate({
				bindto: '#chart',
				data: {
					columns: [],
					type : "pie",
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
							return value + " Proposals";
						}
					}
				},
				pie: {
					expand: true
				}
			});
		}
		
		var startYear = $('#startYear').val();
		var endYear = $('#endYear').val();
		fundedArr = ["Funded"];
		partiallyFunded = ["Partially Funded"];
		notFunded = ["Not Funded"];

		for(year in proposals) {
			var currFund = 0, currPartial = 0, currNotFund = 0;
			if(proposals[year][0].Year >= startYear && proposals[year][0].Year <= endYear) {
				for(num in proposals[year]) {
					if((cat == "All" || ( categories[proposals[year][num].Category] != null && categories[proposals[year][num].Category].name == categories[cat].name)) && (dept == "All" || proposals[year][num].Department == departments[dept])) {
						if(proposals[year][num].Decision != "Not Funded") {
							if(proposals[year][num].Decision == "Funded") {
								fundedProposals++;
								currFund += proposals[year][num].Award;
							} else {
								partialFunded++;
								currPartial += proposals[year][num].Award;
							}
							funded += proposals[year][num].Award;
						} else {
							currNotFund += proposals[year][num].Requested;
						}
						requested += proposals[year][num].Requested;
						totalProposals++;
					}
				}
				fundedArr.push(currFund);
				partiallyFunded.push(currPartial);
				notFunded.push(currNotFund);
			}
			//gives that loading effect
			//if bar, pie, line
			if(type == 'pie') {
				chart.load({
					unload: ["Not Funded", "Partially Funded", "Funded"],
					columns: [
						["Not Funded", (totalProposals - (fundedProposals+partialFunded))],
						["Partially Funded", partialFunded],
						["Funded", fundedProposals],
					]
				});
			} 
		}
		if(type != 'pie') {
			chart = c3.generate({
					bindto: '#chart',
					data: {
						x: 'x',
						columns: [
							yearAxis,
							notFunded,
							partiallyFunded,
							fundedArr,
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

		$('#requested').html("$" + requested.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
		$('#funded').html("$" + funded.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
		if(totalProposals != 0) {
			$('#percent').html((100*((fundedProposals + partialFunded)/totalProposals)).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "%");
		} else {
			$('#percent').html("0%");
		}
		var catName = cat;
		var deptName = dept + " Departments";
		if(cat != "All") {
			catName = categories[cat].name;
		}
		if(dept != "All") {
			deptName = departments[dept];
		}
		
		$('#title').html(deptName + ", Category: " + catName);
	}
});