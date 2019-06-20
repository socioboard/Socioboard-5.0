am4core.useTheme(am4themes_animated);

var chart = am4core.create("chartdiv", am4charts.PieChart);


chart.data = [{
	"country": "Lithuania",
	"value": 401
}, {
	"country": "Estonia",
	"value": 300
}, {
	"country": "Ireland",
	"value": 200
}, {
	"country": "Germany",
	"value": 165
}, {
	"country": "Australia",
	"value": 139
}, {
	"country": "Austria",
	"value": 128
}];


var series = chart.series.push(new am4charts.PieSeries());
series.dataFields.value = "value";
series.dataFields.radiusValue = "value";
series.dataFields.category = "country";

// this makes initial animation
series.hiddenState.properties.opacity = 1;
series.hiddenState.properties.endAngle = -90;
series.hiddenState.properties.startAngle = -90;

chart.legend = new am4charts.Legend();