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
	var proposals = $('#proposals').val();
	var totalProposals = 0;
	var fundedProposals = 0;
	var funded = 0.0;
	console.log(proposals);
	for(year in proposals) {
		for (proposal in proposals[year]) {
			if(proposal.Award != 0) {
				fundedProposals++;
			}
			funded += proposal.Award;
		}
		totalProposals += proposals[year].length;
	}
	$('#requested').html("NOOO");
	$('#funded').html(funded);
	$('#percent').html(fundedProposals + "/" + totalProposals);
});