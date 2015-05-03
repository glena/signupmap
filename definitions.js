
function renderData()
{
	var circles = svg.selectAll("circle").data(data);

	var now = Date.now();
	var limit = 5 * 60 * 1000

	circles.enter().append("circle")
        .attr("fill", function(d){
			return d.color;
		});

    circles.exit().transition()
        .attr("r", 0)
        .remove();


    circles
        .attr("cx", function(d) { return d.projection[0]; })
        .attr("cy", function(d) { return d.projection[1]; })
        .attr("fill-opacity", function(t){
			return 1 - (now - t.created_at) / limit;
        })
        .attr("r", function(t){
			return 3;
        });
}

function setTimeZone()
{
	var now = new Date();

	lat_tz.forEach(function(d) {
		var hour = now.getHours() - (-1*now.getTimezoneOffset()/60) + d.tz;
		if (hour >= 24) hour -= 24;
		if (hour < 0) hour += 24;
    	d.hour = hour;
		d.day = (hour > 8 && hour < 20);
    });

	var tzs = svg.selectAll("rect").data(lat_tz);
	tzs.enter().append("rect")
		.attr('x',function(e){
			return e.x;
		})
		.attr('y',0)
		.attr('width',function(e){
			return e.width;
		})
		.attr('height',height)
		.attr('stroke-width','1')
		.attr('stroke','#ccc');

	tzs.attr("fill-opacity", 1)
		.attr('fill','#b5f8ff');

	var tz_labels = svg.selectAll("text.tz").data(lat_tz);
	tz_labels.enter().append("text")
		.attr('class','tz')
		.style("text-anchor", "middle")
		.style("font-size", "10px")
		.attr('fill', '#FFFFFF')
		.attr("x", function(e){
			return e.x + e.width / 2;
		})
		.attr("y", 20);

	tz_labels.text(function(e){return e.tz;});

	var tz_hours = svg.selectAll("text.tzh").data(lat_tz);
	tz_hours.enter().append("text")
		.attr('class','tzh')
		.style("text-anchor", "middle")
		.style("font-size", "10px")
		.attr('fill', '#FFFFFF')
		.attr("x", function(e){
			return e.x + e.width / 2;
		})
		.attr("y", 40);

	tz_hours.text(function(e){return e.hour;});

	svg.selectAll("path").moveToFront();
	svg.selectAll("text").moveToFront();
	svg.selectAll("circle").moveToFront();
}

function loadPoint(point)
{
	if (!strategies[point.strategy]) {
		strategies[point.strategy] = {
			color:colors(lastColorIndex),
			count:0,
			name:point.strategy
		};
		lastColorIndex++;
	}

	strategies[point.strategy].count++;

	point.color = strategies[point.strategy].color
	point.created_at = Date.now();

	point.projection = projection([point.geo.lng, point.geo.lat]);
	data.push(point);
	renderData();
	//renderStrategies();
}


function antipode(position) {
  return [position[0] + 180, -position[1]];
}

function solarPosition(time) {
  var centuries = (time - Date.UTC(2000, 0, 1, 12)) / 864e5 / 36525, // since J2000
      longitude = (d3.time.day.utc.floor(time) - time) / 864e5 * 360 - 180;
  return [
    longitude - equationOfTime(centuries) * degrees,
    solarDeclination(centuries) * degrees
  ];
}

// Equations based on NOAA’s Solar Calculator; all angles in radians.
// http://www.esrl.noaa.gov/gmd/grad/solcalc/

function equationOfTime(centuries) {
  var e = eccentricityEarthOrbit(centuries),
      m = solarGeometricMeanAnomaly(centuries),
      l = solarGeometricMeanLongitude(centuries),
      y = Math.tan(obliquityCorrection(centuries) / 2);
  y *= y;
  return y * Math.sin(2 * l)
      - 2 * e * Math.sin(m)
      + 4 * e * y * Math.sin(m) * Math.cos(2 * l)
      - 0.5 * y * y * Math.sin(4 * l)
      - 1.25 * e * e * Math.sin(2 * m);
}

function solarDeclination(centuries) {
  return Math.asin(Math.sin(obliquityCorrection(centuries)) * Math.sin(solarApparentLongitude(centuries)));
}

function solarApparentLongitude(centuries) {
  return solarTrueLongitude(centuries) - (0.00569 + 0.00478 * Math.sin((125.04 - 1934.136 * centuries) * radians)) * radians;
}

function solarTrueLongitude(centuries) {
  return solarGeometricMeanLongitude(centuries) + solarEquationOfCenter(centuries);
}

function solarGeometricMeanAnomaly(centuries) {
  return (357.52911 + centuries * (35999.05029 - 0.0001537 * centuries)) * radians;
}

function solarGeometricMeanLongitude(centuries) {
  var l = (280.46646 + centuries * (36000.76983 + centuries * 0.0003032)) % 360;
  return (l < 0 ? l + 360 : l) / 180 * π;
}

function solarEquationOfCenter(centuries) {
  var m = solarGeometricMeanAnomaly(centuries);
  return (Math.sin(m) * (1.914602 - centuries * (0.004817 + 0.000014 * centuries))
      + Math.sin(m + m) * (0.019993 - 0.000101 * centuries)
      + Math.sin(m + m + m) * 0.000289) * radians;
}

function obliquityCorrection(centuries) {
  return meanObliquityOfEcliptic(centuries) + 0.00256 * Math.cos((125.04 - 1934.136 * centuries) * radians) * radians;
}

function meanObliquityOfEcliptic(centuries) {
  return (23 + (26 + (21.448 - centuries * (46.8150 + centuries * (0.00059 - centuries * 0.001813))) / 60) / 60) * radians;
}

function eccentricityEarthOrbit(centuries) {
  return 0.016708634 - centuries * (0.000042037 + 0.0000001267 * centuries);
}
