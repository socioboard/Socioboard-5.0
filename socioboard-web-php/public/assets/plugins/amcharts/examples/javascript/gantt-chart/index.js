/**
 * ---------------------------------------
 * This demo was created using amCharts 4.
 * 
 * For more information visit:
 * https://www.amcharts.com/
 * 
 * Documentation is available at:
 * https://www.amcharts.com/docs/v4/
 * ---------------------------------------
 */

// Themes begin
am4core.useTheme(am4themes_animated);
// Themes end

var chart = am4core.create("chartdiv", am4charts.XYChart);
chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

chart.paddingRight = 30;
chart.dateFormatter.inputDateFormat = "yyyy-MM-dd HH:mm";

var colorSet = new am4core.ColorSet();
colorSet.saturation = 0.4;

chart.data = [ {
  "category": "Module #1",
  "start": "2016-01-01",
  "end": "2016-01-14",
  "color": colorSet.getIndex(0).brighten(0),
  "task": "Gathering requirements"
}, {
  "category": "Module #1",
  "start": "2016-01-16",
  "end": "2016-01-27",
  "color": colorSet.getIndex(0).brighten(0.4),
  "task": "Producing specifications"
}, {
  "category": "Module #1",
  "start": "2016-02-05",
  "end": "2016-04-18",
  "color": colorSet.getIndex(0).brighten(0.8),
  "task": "Development"
}, {
  "category": "Module #1",
  "start": "2016-04-18",
  "end": "2016-04-30",
  "color": colorSet.getIndex(0).brighten(1.2),
  "task": "Testing and QA"
}, {
  "category": "Module #2",
  "start": "2016-01-08",
  "end": "2016-01-10",
  "color": colorSet.getIndex(2).brighten(0),
  "task": "Gathering requirements"
}, {
  "category": "Module #2",
  "start": "2016-01-12",
  "end": "2016-01-15",
  "color": colorSet.getIndex(2).brighten(0.4),
  "task": "Producing specifications"
}, {
  "category": "Module #2",
  "start": "2016-01-16",
  "end": "2016-02-05",
  "color": colorSet.getIndex(2).brighten(0.8),
  "task": "Development"
}, {
  "category": "Module #2",
  "start": "2016-02-10",
  "end": "2016-02-18",
  "color": colorSet.getIndex(2).brighten(1.2),
  "task": "Testing and QA"
}, {
  "category": "Module #3",
  "start": "2016-01-02",
  "end": "2016-01-08",
  "color": colorSet.getIndex(4).brighten(0),
  "task": "Gathering requirements"
}, {
  "category": "Module #3",
  "start": "2016-01-08",
  "end": "2016-01-16",
  "color": colorSet.getIndex(4).brighten(0.4),
  "task": "Producing specifications"
}, {
  "category": "Module #3",
  "start": "2016-01-19",
  "end": "2016-03-01",
  "color": colorSet.getIndex(4).brighten(0.8),
  "task": "Development"
}, {
  "category": "Module #3",
  "start": "2016-03-12",
  "end": "2016-04-05",
  "color": colorSet.getIndex(4).brighten(1.2),
  "task": "Testing and QA"
}, {
  "category": "Module #4",
  "start": "2016-01-01",
  "end": "2016-01-19",
  "color": colorSet.getIndex(6).brighten(0),
  "task": "Gathering requirements"
}, {
  "category": "Module #4",
  "start": "2016-01-19",
  "end": "2016-02-03",
  "color": colorSet.getIndex(6).brighten(0.4),
  "task": "Producing specifications"
}, {
  "category": "Module #4",
  "start": "2016-03-20",
  "end": "2016-04-25",
  "color": colorSet.getIndex(6).brighten(0.8),
  "task": "Development"
}, {
  "category": "Module #4",
  "start": "2016-04-27",
  "end": "2016-05-15",
  "color": colorSet.getIndex(6).brighten(1.2),
  "task": "Testing and QA"
}, {
  "category": "Module #5",
  "start": "2016-01-01",
  "end": "2016-01-12",
  "color": colorSet.getIndex(8).brighten(0),
  "task": "Gathering requirements"
}, {
  "category": "Module #5",
  "start": "2016-01-12",
  "end": "2016-01-19",
  "color": colorSet.getIndex(8).brighten(0.4),
  "task": "Producing specifications"
}, {
  "category": "Module #5",
  "start": "2016-01-19",
  "end": "2016-03-01",
  "color": colorSet.getIndex(8).brighten(0.8),
  "task": "Development"
}, {
  "category": "Module #5",
  "start": "2016-03-08",
  "end": "2016-03-30",
  "color": colorSet.getIndex(8).brighten(1.2),
  "task": "Testing and QA"
} ];

chart.dateFormatter.dateFormat = "yyyy-MM-dd";
chart.dateFormatter.inputDateFormat = "yyyy-MM-dd";

var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
categoryAxis.dataFields.category = "category";
categoryAxis.renderer.grid.template.location = 0;
categoryAxis.renderer.inversed = true;

var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
dateAxis.renderer.minGridDistance = 70;
dateAxis.baseInterval = { count: 1, timeUnit: "day" };
// dateAxis.max = new Date(2018, 0, 1, 24, 0, 0, 0).getTime();
//dateAxis.strictMinMax = true;
dateAxis.renderer.tooltipLocation = 0;

var series1 = chart.series.push(new am4charts.ColumnSeries());
series1.columns.template.width = am4core.percent(80);
series1.columns.template.tooltipText = "{task}: [bold]{openDateX}[/] - [bold]{dateX}[/]";

series1.dataFields.openDateX = "start";
series1.dataFields.dateX = "end";
series1.dataFields.categoryY = "category";
series1.columns.template.propertyFields.fill = "color"; // get color from data
series1.columns.template.propertyFields.stroke = "color";
series1.columns.template.strokeOpacity = 1;

chart.scrollbarX = new am4core.Scrollbar();