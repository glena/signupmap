d3.selection.prototype.moveToFront = function() {
	return this.each(function(){
		this.parentNode.appendChild(this);
	});
};

var tweetsCount = d3.select('#tweetsCount')
, data = []
, socket = null
, realWidth = 0
, width = null
, originalWidth = null
, height = 0
, π = Math.PI
, radians = π / 180
, degrees = 180 / π
, tweetsWrapper = d3.select('.tweets')
, about = d3.select('.about')
, pusher;

var circle = d3.geo.circle().angle(90);

var svgEl = d3.select(".map svg");
var svg = svgEl.append('g');

function resizeGraph(){
   	realWidth = document.body.clientWidth;
   	width = realWidth - 400;
	height = width;

	svgEl.attr("width", width).attr("height", height);
}
resizeGraph();

var projection = d3.geo.mercator()
    .scale(135 * height / 847)
    .translate([width / 2, height / 2]);
/*
var projection = d3.geo.equirectangular()
    .translate([width / 2, height / 2])
    .scale(135 * height / 847)
    .precision(.1);
*/
var path = d3.geo.path().projection(projection);


var lat_tz = d3.range(-180,180,15).map(function (lat){
	var tz = Math.floor(lat / 15)+1;
	var from = projection([lat,0]);
	var to = projection([lat+15,0]);
	return {
		tz: tz,
		latitude: lat,
		width: to[0] - from[0],
		x: from[0]
	};
});


d3.json("world.json", function(error, world) {
	svg.append("path")
		.classed('world', true)
		.datum( topojson.feature(world, world.objects.land) )
		.attr("d", path);

	var night = svg.append("path")
      .attr("class", "night")
      .attr("d", path);

	redraw();
	setInterval(redraw, 5 * 60 * 1000);

	function redraw() {
		night.datum(circle.origin(antipode(solarPosition(new Date)))).attr("d", path);
		setTimeZone();
	}


	Pusher.log = function(message) {
	//console.log(message);
	};

	pusher = new Pusher('54da1f9bddbf14929983');
	var channel = pusher.subscribe('world_map');

	channel.bind('login', function(data) {
		var geo = data.geo;

		console.log(geo);

		loadTweets(geo);
	});

});

d3.select(self.frameElement).style("height", height + "px");

window.onresize = resizeGraph;
