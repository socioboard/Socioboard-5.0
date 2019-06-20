am4core.useTheme(am4themes_animated);
var chart = am4core.create("chartdiv", am4charts.XYChart);

var data = [];
var open = 100;
var close = 120;

var names = ["Raina",
  "Demarcus",
  "Carlo",
  "Jacinda",
  "Richie",
  "Antony",
  "Amada",
  "Idalia",
  "Janella",
  "Marla",
  "Curtis",
  "Shellie",
  "Meggan",
  "Nathanael",
  "Jannette",
  "Tyrell",
  "Sheena",
  "Maranda",
  "Briana",
  "Rosa",
  "Rosanne",
  "Herman",
  "Wayne",
  "Shamika",
  "Suk",
  "Clair",
  "Olivia",
  "Hans",
  "Glennie",
];

for (var i = 0; i < names.length; i++) {
  open += Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 5);
  close = open + Math.round(Math.random() * 10) + 3;
  data.push({ category: names[i], open: open, close: close });
}

chart.data = data;

var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
categoryAxis.renderer.grid.template.location = 0;
categoryAxis.dataFields.category = "category";
categoryAxis.renderer.minGridDistance = 15;
categoryAxis.renderer.grid.template.location = 0.5;
categoryAxis.renderer.grid.template.strokeDasharray = "1,3";
categoryAxis.renderer.labels.template.rotation = -90;
categoryAxis.renderer.labels.template.horizontalCenter = "left";
categoryAxis.renderer.labels.template.verticalCenter = "middle";
categoryAxis.renderer.labels.template.location = 0.5;
categoryAxis.renderer.inside = true;

var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
valueAxis.tooltip.disabled = true;

var series = chart.series.push(new am4charts.ColumnSeries());
series.dataFields.categoryX = "category";
series.dataFields.openValueY = "open";
series.dataFields.valueY = "close";
series.tooltipText = "open: {openValueY.value} close: {valueY.value}";
series.sequencedInterpolation = true;
series.fillOpacity = 0;
series.strokeOpacity = 1;
series.columns.template.width = 0.01;
series.tooltip.pointerOrientation = "horizontal";

var openBullet = series.bullets.create(am4charts.CircleBullet);
openBullet.locationY = 1;

var closeBullet = series.bullets.create(am4charts.CircleBullet);

closeBullet.fill = chart.colors.getIndex(4);
closeBullet.stroke = closeBullet.fill;

chart.cursor = new am4charts.XYCursor();

chart.scrollbarX = new am4core.Scrollbar();
chart.scrollbarY = new am4core.Scrollbar();
