am4core.useTheme(am4themes_animated);

var chart = am4core.create("chartdiv", am4charts.SlicedChart);


chart.data = [{
    "name": "The first",
    "value": 854
}, {
    "name": "The second",
    "value": 245
}, {
    "name": "The third",
    "value": 187
}, {
    "name": "The fourth",
    "value": 123
}, {
    "name": "The fifth",
    "value": 87
}, {
    "name": "The sixth",
    "value": 45
}, {
    "name": "The seventh",
    "value": 7
}].reverse();

var series = chart.series.push(new am4charts.PyramidSeries());
series.colors.step = 2;
series.dataFields.value = "value";
series.dataFields.category = "name";
series.alignLabels = true;
series.labelsContainer.width = 200;
series.labelsContainer.paddingLeft = 15;

chart.legend = new am4charts.Legend();
chart.legend.padding(20,20,20,20);