history.replaceState(null, "", "/main/(menu:menu1)");

am4core.useTheme(am4themes_animated);


var chart = am4core.create('chartdiv', am4charts.XYChart);
// STYLING
chart.fontFamily = 'MaisonNeue';
chart.fontSize = '0.75rem';
chart.paddingRight = 10;
// DATA

// ZOOM
chart.zoomOutButton.disabled = true;
// AXIS
var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
dateAxis.renderer.grid.template.location = 0;
dateAxis.renderer.grid.template.disabled = true;
dateAxis.tooltip.disabled = true;
var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
valueAxis.tooltip.disabled = true;
valueAxis.renderer.opposite = true;

// MAIN SERIES
var series = chart.series.push(new am4charts.LineSeries());
series.data = [{"value":9.384615384615385,"timestamp":1551807000000},{"value":8.728813559322035,"timestamp":1551807300000},{"value":9.35820895522388,"timestamp":1551807600000},{"value":8.934426229508198,"timestamp":1551807900000},{"value":null,"timestamp":1551808200000},{"value":9.066666666666666,"timestamp":1551808500000},{"value":9.159420289855072,"timestamp":1551808800000},{"value":null,"timestamp":1551809100000},{"value":9.181818181818182,"timestamp":1551809400000}];
series.dataFields.dateX = 'timestamp';
series.dataFields.valueY = 'value';
series.fillOpacity = 1;
series.tensionX = 0.9;
series.tensionY = 1;
series.strokeWidth = 2;
series.stroke = am4core.color('#51589A');



series.fill = am4core.color('#4D5CF2', 0.12);
var fillModifier = new am4core.LinearGradientModifier();
fillModifier.opacities = [1, 0, 0];
fillModifier.offsets = [0, 0.4, 1];
fillModifier.gradient.rotation = 90;
series.segments.template.fillModifier = fillModifier;

series.connect = false;

// MOVEMENT SERIES
var series2 = chart.series.push(new am4charts.LineSeries());
series2.data = [{"value":6.384615384615385,"timestamp":1551807000000},{"value":5.728813559322035,"timestamp":1551807300000},{"value":6.35820895522388,"timestamp":1551807600000},{"value":5.934426229508198,"timestamp":1551807900000},{"value":6.253968253968255,"timestamp":1551808200000},{"value":6.066666666666666,"timestamp":1551808500000},{"value":6.159420289855072,"timestamp":1551808800000},{"value":5.932203389830509,"timestamp":1551809100000},{"value":6.181818181818182,"timestamp":1551809400000}];
series2.dataFields.dateX = 'timestamp';
series2.dataFields.valueY = 'value';
series2.strokeWidth = 0;
series2.fillOpacity = 1;
series2.tensionX = 0.9;
series2.tensionY = 1;


series2.fill = am4core.color('#4D5CF2', 0.12);
series2.segments.template.fillModifier = fillModifier;

series2.connect = false;

// TOOLTIP
series.tooltipText = '{valueY.value}';
series.tooltip.getFillFromObject = false;
series.tooltip.background.fill = am4core.color('white');
series.tooltip.autoTextColor = false;
series.tooltip.background.filters.clear();
series.tooltip.background.strokeOpacity = 0;
series.tooltip.pointerOrientation = 'horizontal';
series.tooltip.animationDuration = 0;
series.adapter.add('tooltipHTML', function (text, target) {
	var data = target.tooltipDataItem.dataContext;
	if (data) {
		var value = parseInt(data.value, 10);
		return '' +
			'' + value + ' ' +
			' ' + 'BPM' + '';
	} else {
		return text;
	}
});

// BULLETS
var bullet = series.bullets.push(new am4charts.CircleBullet());
bullet.circle.strokeWidth = 14;
bullet.circle.radius = 12;
bullet.circle.stroke = am4core.color('#C9CDFB');
bullet.circle.fill = am4core.color('#fff');
bullet.properties.scale = 0;
bullet.defaultState.transitionDuration = 0;
var bulletHover = bullet.states.create('hover');
bulletHover.transitionDuration = 0;
bulletHover.properties.scale = 1;
//
var bullet2 = series.bullets.push(new am4charts.CircleBullet());
bullet2.circle.strokeWidth = 2;
bullet2.circle.radius = 4;
bullet2.circle.stroke = am4core.color('#51589A');
bullet2.circle.fill = am4core.color('#fff');
bullet2.properties.scale = 0;
bullet2.defaultState.transitionDuration = 0;
var bulletHover2 = bullet2.states.create('hover');
bulletHover2.transitionDuration = 0;
bulletHover2.properties.scale = 1;

// CURSOR
chart.cursor = new am4charts.XYCursor();
chart.cursor.lineY.strokeWidth = 0;
chart.cursor.lineX.strokeWidth = 0;


var scrollbarX = new am4charts.XYChartScrollbar();

scrollbarX.background.fill = am4core.color('#4D5CF2', 0.12);

{
	var fillModifier = new am4core.LinearGradientModifier();
	fillModifier.opacities = [1, 0, 0];
	fillModifier.offsets = [0, 0.6, 1];
	fillModifier.gradient.rotation = 90;
	scrollbarX.background.fillModifier = fillModifier;
}

scrollbarX.series.push(chart.series.getIndex(0));
scrollbarX.scrollbarChart.series.getIndex(0).strokeWidth = 2;
scrollbarX.scrollbarChart.series.getIndex(0).fillOpacity = 0;
scrollbarX.scrollbarChart.series.getIndex(0).stroke = am4core.color('#51589A');
(scrollbarX.scrollbarChart.series.getIndex(0).filters.getIndex(0)).saturation = 1;
chart.scrollbarX = scrollbarX;
chart.scrollbarX.parent = chart.bottomAxesContainer;
