am4core.useTheme(am4themes_animated);

var data = [{
	"country": "Lithuania",
	"units": 500,
	"pie": [{
		"value": 250,
		"title": "Cat #1"
	}, {
		"value": 150,
		"title": "Cat #2"
	}, {
		"value": 100,
		"title": "Cat #3"
	}]
}, {
	"country": "Czech Republic",
	"units": 300,
	"pie": [{
		"value": 80,
		"title": "Cat #1"
	}, {
		"value": 130,
		"title": "Cat #2"
	}, {
		"value": 90,
		"title": "Cat #3"
	}]
}, {
	"country": "Ireland",
	"units": 200,
	"pie": [{
		"value": 75,
		"title": "Cat #1"
	}, {
		"value": 55,
		"title": "Cat #2"
	}, {
		"value": 70,
		"title": "Cat #3"
	}]
}];


// Create chart instance
var chart = am4core.create("chartdiv", am4charts.XYChart);


// Add data
chart.data = data;

// Create axes
var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
categoryAxis.dataFields.category = "country";
categoryAxis.renderer.grid.template.location = 0;

var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
valueAxis.title.text = "Units sold (M)";
valueAxis.min = 0;

// Create series
var series = chart.series.push(new am4charts.ColumnSeries());
series.dataFields.valueY = "units";
series.dataFields.categoryX = "country";
series.tooltip.pointerOrientation = "vertical";


var columnTemplate = series.columns.template;
// add tooltip on column, not template, so that slices could also have tooltip
columnTemplate.column.tooltipText = "Series: {name}\nCategory: {categoryX}\nValue: {valueY}";
columnTemplate.column.tooltipY = 0;
columnTemplate.column.cornerRadiusTopLeft = 20;
columnTemplate.column.cornerRadiusTopRight = 20;
columnTemplate.strokeOpacity = 0;


// as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
columnTemplate.adapter.add("fill", function (fill, target) {
	var gradient = new am4core.LinearGradient();
	var color = chart.colors.getIndex(target.dataItem.index * 2);
	gradient.addColor(color, 0);
	gradient.addColor(color, 1);
	gradient.rotation = -90;
	return gradient;
});

// create pie chart as a column child
var pieChart = series.columns.template.createChild(am4charts.PieChart);
pieChart.width = am4core.percent(80);
pieChart.height = am4core.percent(80);
pieChart.align = "center";
pieChart.valign = "middle";
pieChart.dataFields.data = "pie";

var pieSeries = pieChart.series.push(new am4charts.PieSeries());
pieSeries.dataFields.value = "value";
pieSeries.dataFields.category = "title";
pieSeries.labels.template.disabled = true;
pieSeries.ticks.template.disabled = true;
pieSeries.slices.template.stroke = am4core.color("#ffffff");
pieSeries.slices.template.strokeWidth = 2;

pieSeries.hiddenState.properties.startAngle = -90;
pieSeries.hiddenState.properties.endAngle = 270;