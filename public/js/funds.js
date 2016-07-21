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

var data = [4, 8, 15, 16, 23, 42];
var grid = d3.range(25).map(function(i){
			return {'x1':0,'y1':0,'x2':0,'y2':480};
		});

var width = 420,
	barHeight = 20;

var x = d3.scaleLinear()
	.domain([0, d3.max(data)])
	.range([0, width]);

var chart = d3.select(".data-chart")
	.append('svg')
	.attr("width", width)
	.attr("height", barHeight * data.length);

var grids = chart.append('g')
					.attr('id','grid')
					.attr('transform','translate(150,10)')
					.selectAll('line')
					.data(grid)
					.enter()
					.append('line')
					.attr({'x1':function(d,i){ return i*30; },
							'y1':function(d){ return d.y1; },
							'x2':function(d,i){ return i*30; },
							'y2':function(d){ return d.y2; },
					})
					.style({'stroke':'#adadad','stroke-width':'1px'});

var bar = chart.selectAll("g")
	.data(data)
	.enter()
	.append("g")
	.attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });

bar.append("rect")
	.attr("width", x)
	.attr("height", barHeight - 1);

bar.append("text")
	.attr("x", function(d) { return x(d) - 3; })
	.attr("y", barHeight / 2)
	.attr("dy", ".35em")
	.text(function(d) { return d; });
