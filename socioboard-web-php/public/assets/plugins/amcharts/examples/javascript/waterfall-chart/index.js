am4core.useTheme(am4themes_animated);
am4core.useTheme(am4themes_dark);

var chart = am4core.create("chartdiv", am4charts.XYChart);

// using math in the data instead of final values just to illustrate the idea of Waterfall chart
// a separate data field for step series is added because we don't need last step (notice, the last data item doesn't have stepValue)
chart.data = [
    { category: "Net revenue", value: 8786, open: 0, stepValue: 8786, color:chart.colors.getIndex(13), displayValue:8786},
    { category: "Cost of sales", value: 8786 - 2786, open: 8786, stepValue: 8786 - 2786, color:chart.colors.getIndex(8), displayValue:2786},
    { category: "Operating expenses", value: 8786 - 2786 - 1786, open: 8786 - 2786, stepValue: 8786 - 2786 - 1786, color:chart.colors.getIndex(9), displayValue:1786 },
    { category: "Amortisation", value: 8786 - 2786 - 1786 - 453, open: 8786 - 2786 - 1786, stepValue: 8786 - 2786 - 1786 - 453, color:chart.colors.getIndex(10), displayValue:453},
    { category: "Income from equity", value: 8786 - 2786 - 1786 - 453 + 1465, open: 8786 - 2786 - 1786 - 453, stepValue: 8786 - 2786 - 1786 - 453 + 1465, color:chart.colors.getIndex(16), displayValue:1465 },
    { category: "Operating income", value: 8786 - 2786 - 1786 - 453 + 1465, open: 0, color:chart.colors.getIndex(17), displayValue:8786 - 2786 - 1786 - 453 + 1465}
];

var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
categoryAxis.dataFields.category = "category";

var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

var columnSeries = chart.series.push(new am4charts.ColumnSeries());
columnSeries.dataFields.categoryX = "category";
columnSeries.dataFields.valueY = "value";
columnSeries.dataFields.openValueY = "open";
columnSeries.fillOpacity = 0.8;
columnSeries.sequencedInterpolation = true;
columnSeries.interpolationDuration = 1500;

var columnTemplate = columnSeries.columns.template;
columnTemplate.strokeOpacity = 0;
columnTemplate.propertyFields.fill = "color";

var label = columnTemplate.createChild(am4core.Label);
label.text = "{displayValue.formatNumber('$#,## a')}";
label.align = "center";
label.valign = "middle";


var stepSeries = chart.series.push(new am4charts.StepLineSeries());
stepSeries.dataFields.categoryX = "category";
stepSeries.dataFields.valueY = "stepValue";
stepSeries.noRisers = true;
stepSeries.stroke = am4core.color("#ffffff");
stepSeries.strokeDasharray = "3,3";
stepSeries.interpolationDuration = 3000;
stepSeries.sequencedInterpolation = true;

// because column width is 80%, we modify start/end locations so that step would start with column and end with next column
stepSeries.startLocation = 0.1;
stepSeries.endLocation = 1.1;

chart.cursor = new am4charts.XYCursor();
chart.cursor.behavior = "none";