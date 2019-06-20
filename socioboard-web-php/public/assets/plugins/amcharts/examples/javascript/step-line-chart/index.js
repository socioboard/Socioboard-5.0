am4core.useTheme(am4themes_animated);

var chart = am4core.create("chartdiv", am4charts.XYChart);


chart.paddingRight = 20;

var data = [];
var visits = 10;
for (var i = 1; i < 366; i++) {
    visits += Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 10);
    data.push({ date: new Date(2018, 0, i), value: visits });
}

chart.data = data;

var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
dateAxis.renderer.grid.template.location = 0;

var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
valueAxis.tooltip.disabled = true;
valueAxis.renderer.minWidth = 35;

var series = chart.series.push(new am4charts.StepLineSeries());
series.dataFields.dateX = "date";
series.dataFields.valueY = "value";

series.tooltipText = "{valueY.value}";
chart.cursor = new am4charts.XYCursor();

var scrollbarX = new am4charts.XYChartScrollbar();
scrollbarX.series.push(series);
chart.scrollbarX = scrollbarX;
