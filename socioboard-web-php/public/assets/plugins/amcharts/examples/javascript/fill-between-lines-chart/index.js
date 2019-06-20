am4core.useTheme(am4themes_animated);

var chart = am4core.create("chartdiv", am4charts.XYChart);


var data = [];
var open = 100;
var close = 250;

for (var i = 1; i < 366; i++) {
	open += Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 50);
	close += Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 50);
	data.push({ date: new Date(2018, 0, i), open: open, close: close });
}

chart.data = data;

var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
dateAxis.renderer.grid.template.location = 0;

var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
valueAxis.tooltip.disabled = true;

var series = chart.series.push(new am4charts.LineSeries());
series.dataFields.dateX = "date";
series.dataFields.openValueY = "open";
series.dataFields.valueY = "close";
series.tooltipText = "open: {openValueY.value} close: {valueY.value}";
series.sequencedInterpolation = true;
series.fillOpacity = 0.3;

var series2 = chart.series.push(new am4charts.LineSeries());
series2.dataFields.dateX = "date";
series2.dataFields.valueY = "open";
series2.sequencedInterpolation = true;
series2.stroke = chart.colors.getIndex(6);

chart.cursor = new am4charts.XYCursor();
chart.cursor.xAxis = dateAxis;
chart.scrollbarX = new am4core.Scrollbar();
