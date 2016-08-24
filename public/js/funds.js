$(document).ready(function(){
	//gets proposals
	var proposals = JSON.parse($('#proposals').val());
	var departments = JSON.parse($('#allDepartments').val());
	var categories = JSON.parse($('#allCategories').val());
	var cat = "All";
	var dept = "All";
	var chart;
	refreshTable();
	$("#department").change(function() {
		dept = $(this).val();
		refreshTable();
	});

	$("#category").change(function() {
		cat = $(this).val();
		refreshTable();
	});
	function refreshTable() {
		var totalProposals = 0;
		var fundedProposals = 0;
		var partialFunded = 0;
		var funded = 0.0;
		var requested = 0.0;

		//unload current chart if exists
		if(chart == undefined) {
			chart = c3.generate({
				bindto: '#chart',
				data: {
					columns: [],
					type : 'pie',
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
		
		for(year in proposals) {
			for(num in proposals[year]) {
				if((cat == "All" || ( categories[proposals[year][num].Category] != null && categories[proposals[year][num].Category].name == categories[cat].name)) && (dept == "All" || proposals[year][num].Department == departments[dept])) {
					if(proposals[year][num].Decision != "Not Funded") {
						if(proposals[year][num].Decision == "Funded") {
							fundedProposals++;
						} else {
							partialFunded++;
						}
						funded += proposals[year][num].Award;
					}
					requested += proposals[year][num].Requested;
					totalProposals++;
				}
			}
			//gives that loading effect
			//if bar, pie, line
			chart.load({
				unload: ["Not Funded", "Partially Funded", "Funded"],
				columns: [
					["Not Funded", (totalProposals - (fundedProposals+partialFunded))],
					["Partially Funded", partialFunded],
					["Funded", fundedProposals],
				]
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