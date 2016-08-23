//use this temporary to identify colors -- other option is to make a giant array of colors so department color is consistent
var randomColor = (function(){
	var golden_ratio_conjugate = 0.618033988749895;
	var h = Math.random();

	var hslToRgb = function (h, s, l){
		var r, g, b;

		if(s == 0){
			r = g = b = l; // achromatic
		}else{
			function hue2rgb(p, q, t){
				if(t < 0) t += 1;
				if(t > 1) t -= 1;
				if(t < 1/6) return p + (q - p) * 6 * t;
				if(t < 1/2) return q;
				if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
				return p;
			}

			var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			var p = 2 * l - q;
			r = hue2rgb(p, q, h + 1/3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1/3);
		}

		return '#'+Math.round(r * 255).toString(16)+Math.round(g * 255).toString(16)+Math.round(b * 255).toString(16);
	};
});

$(document).ready(function(){
	//gets proposals
	var proposals = JSON.parse($('#proposals').val());
	var departments = JSON.parse($('#allDepartments').val());
	var categories = JSON.parse($('#allCategories').val());
	var cat = "All";
	var dept = "All";
	refreshTable();
	$("#department").change(function() {
		dept = $(this).val();
		refreshTable();
	});

	$("#category").change(function() {
		cat = $(this).val();
		refreshTable();
	});

	$("#refreshButton").click(function() {
		$("#pieChart").empty();
	});
	function refreshTable() {
		var totalProposals = 0;
		var fundedProposals = 0;
		var partialFunded = 0;
		var funded = 0.0;
		var requested = 0.0;
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
		var pie = new d3pie("pieChart", {
			header: {
				title: {
					text: deptName,
					fontSize: 12,
					font: "open sans"
				},
				subtitle: {
					text: "Category: " + catName +", Total Proposals: " + totalProposals,
					color: "#999999",
					fontSize: 10,
					font: "open sans"
				},
				location: "top-center",
				titleSubtitlePadding: 7
			},
			size: {
				canvasHeight: 400,
				canvasWidth: 500,
				pieOuterRadius: "88%"
			},
			labels: {
				inner: {
					format: "none"
				}
			},
			effects: {
				load: {
					effect: "default", // none / default
					speed: 1000
				},
				pullOutSegmentOnClick: {
					effect: "bounce", // none / linear / bounce / elastic / back
					speed: 300,
					size: 10
				},
				highlightSegmentOnMouseover: true,
				highlightLuminosity: -0.2
			},
			data: {
				content: [
					{ label: "Partially Funded", value: partialFunded, color: "#333F74" },
					{ label: "Funded", value: fundedProposals, color: "#2D7E45"},
					{ label: "Not Funded", value: (totalProposals - (fundedProposals + partialFunded)), color: "#285B6A"},
				]
			},
			tooltips: {
				enabled: true,
				type: "placeholder",
				string: "{label}, Proposals: {value}, {percentage}%"
			}
		});
	}
});