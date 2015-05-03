var barChart = svg.append('g').classed('barChart', true);

function renderStrategies() {
    var rects = barChart.selectAll('rect.strategy').data(strategies);

	rects.enter()
		.append('rect')
			.classed('strategy', true)
			.attr("x", 0)
   			.attr("y", 0)
			.attr('fill',function(d){return d.color});

	rects.attr('height',100).attr('width',100);
}
