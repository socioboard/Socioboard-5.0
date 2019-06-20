// Themes begin
am4core.useTheme(am4themes_animated);
// Themes end

var chart = am4core.create("chartdiv", am4charts.RadarChart);
chart.hiddenState.properties.opacity = 0; // this creates initial fade-in
chart.innerRadius = am4core.percent(50);
chart.startAngle = -80;
chart.endAngle = 260;

chart.data = [
  {
    country: "USA",
    visits: 23725
  },
  {
    country: "China",
    visits: 1882
  },
  {
    country: "Japan",
    visits: 1809
  },
  {
    country: "Germany",
    visits: 1322
  },
  {
    country: "UK",
    visits: 1122
  },
  {
    country: "France",
    visits: 1114
  },
  {
    country: "India",
    visits: 984
  },
  {
    country: "Spain",
    visits: 711
  },
  {
    country: "Netherlands",
    visits: 665
  },
  {
    country: "Russia",
    visits: 580
  },
  {
    country: "South Korea",
    visits: 443
  },
  {
    country: "Canada",
    visits: 441
  }
];

var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
categoryAxis.renderer.grid.template.location = 0;
categoryAxis.dataFields.category = "country";
categoryAxis.renderer.labels.template.location = 0.5;
categoryAxis.renderer.grid.template.strokeOpacity = 0.08;
categoryAxis.renderer.tooltipLocation = 0.5;
categoryAxis.tooltip.disabled = true;
categoryAxis.renderer.labels.template.bent = true;
categoryAxis.renderer.labels.template.padding(0,0,0,0);
categoryAxis.renderer.labels.template.radius = 7;

var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
valueAxis.min = 0;
valueAxis.max = 24000;
valueAxis.strictMinMax = true;
valueAxis.renderer.minGridDistance = 30;
valueAxis.renderer.grid.template.strokeOpacity = 0.08;
valueAxis.tooltip.disabled = true;

// axis break
var axisBreak = valueAxis.axisBreaks.create();
axisBreak.startValue = 2100;
axisBreak.endValue = 22900;
axisBreak.breakSize = 0.02;

// make break expand on hover
var hoverState = axisBreak.states.create("hover");
hoverState.properties.breakSize = 1;
hoverState.properties.opacity = 0.1;
hoverState.transitionDuration = 1500;

axisBreak.defaultState.transitionDuration = 1000;

var series = chart.series.push(new am4charts.RadarColumnSeries());
series.dataFields.categoryX = "country";
series.dataFields.valueY = "visits";
series.columns.template.tooltipText = "{valueY.value}";
series.columns.template.tooltipY = 0;
series.columns.template.strokeOpacity = 0;

chart.seriesContainer.zIndex = -1;

// as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
series.columns.template.adapter.add("fill", function (fill, target) {
  return chart.colors.getIndex(target.dataItem.index);
});

var cursor = new am4charts.RadarCursor();
cursor.innerRadius = am4core.percent(50);
cursor.lineY.disabled = true;

cursor.xAxis = categoryAxis;
chart.cursor = cursor;