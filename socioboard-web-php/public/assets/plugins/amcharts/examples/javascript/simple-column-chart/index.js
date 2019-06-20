am4core.useTheme(am4themes_animated);

var chart = am4core.create("chartdiv", am4charts.XYChart);


chart.data = [{
	"country": "USA",
	"visits": 3025
}, {
	"country": "China",
	"visits": 1882
}, {
	"country": "Japan",
	"visits": 1809
}, {
	"country": "Germany",
	"visits": 1322
}, {
	"country": "UK",
	"visits": 1122
}, {
	"country": "France",
	"visits": 1114
}, {
	"country": "India",
	"visits": 984
}, {
	"country": "Spain",
	"visits": 711
}, {
	"country": "Netherlands",
	"visits": 665
}, {
	"country": "Russia",
	"visits": 580
}, {
	"country": "South Korea",
	"visits": 443
}, {
	"country": "Canada",
	"visits": 441
}];

chart.padding(40, 40, 40, 40);

var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
categoryAxis.renderer.grid.template.location = 0;
categoryAxis.dataFields.category = "country";
categoryAxis.renderer.minGridDistance = 60;

var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

var series = chart.series.push(new am4charts.ColumnSeries());
series.dataFields.categoryX = "country";
series.dataFields.valueY = "visits";
series.tooltipText = "{valueY.value}"
series.columns.template.strokeOpacity = 0;

chart.cursor = new am4charts.XYCursor();

// as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
series.columns.template.adapter.add("fill", function (fill, target) {
	return chart.colors.getIndex(target.dataItem.index);
});