am4core.useTheme(am4themes_animated);

var chart = am4core.create("chartdiv", am4charts.XYChart);


var data = [];
var price = 1000;
var quantity = 30000;
for (var i = 0; i < 300; i++) {
	price += Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 100);
	quantity += Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 1000);
	data.push({ date: new Date(2000, 1, i), price: price, quantity: quantity });
}

chart.data = data;

var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
dateAxis.renderer.grid.template.location = 0;
dateAxis.renderer.ticks.template.length = 8;
dateAxis.renderer.ticks.template.strokeOpacity = 0.1;

var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
valueAxis.tooltip.disabled = true;

var series = chart.series.push(new am4charts.LineSeries());
series.dataFields.dateX = "date";
series.dataFields.valueY = "price";
series.tooltipText = "{valueY.value}";
series.name = "Series 1";
series.sequencedInterpolation = true;

var valueAxis2 = chart.yAxes.push(new am4charts.ValueAxis());
valueAxis2.tooltip.disabled = true;
valueAxis2.renderer.opposite = true;
valueAxis2.renderer.grid.template.disabled = true;

var series2 = chart.series.push(new am4charts.LineSeries());
series2.dataFields.dateX = "date";
series2.dataFields.valueY = "quantity";
series2.yAxis = valueAxis2;
series2.tooltipText = "{valueY.value}";
series2.name = "Series 2";
series2.sequencedInterpolation = true;

chart.cursor = new am4charts.XYCursor();
chart.cursor.xAxis = dateAxis;

var scrollbarX = new am4charts.XYChartScrollbar();
scrollbarX.series.push(series);
chart.scrollbarX = scrollbarX;

chart.legend = new am4charts.Legend();
chart.legend.parent = chart.plotContainer;
chart.legend.zIndex = 100;
chart.legend.valueLabels.template.text = "{valueY.value.formatNumber('$#.')}";