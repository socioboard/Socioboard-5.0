am4core.useTheme(am4themes_animated);

var chart = am4core.create("chartdiv", am4charts.RadarChart);


chart.data = [
  {
    category: "One",
    value1: 8,
    value2: 2,
    value3: 4,
    value4: 3
  },
  {
    category: "Two",
    value1: 11,
    value2: 4,
    value3: 2,
    value4: 4
  },
  {
    category: "Three",
    value1: 7,
    value2: 6,
    value3: 6,
    value4: 2
  },
  {
    category: "Four",
    value1: 13,
    value2: 8,
    value3: 3,
    value4: 2
  },
  {
    category: "Five",
    value1: 12,
    value2: 10,
    value3: 5,
    value4: 1
  },
  {
    category: "Six",
    value1: 15,
    value2: 12,
    value3: 4,
    value4: 4
  },
  {
    category: "Seven",
    value1: 9,
    value2: 14,
    value3: 6,
    value4: 2
  },
  {
    category: "Eight",
    value1: 6,
    value2: 16,
    value3: 5,
    value4: 1
  }
];


var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
categoryAxis.dataFields.category = "category";
categoryAxis.renderer.labels.template.location = 0.5;
categoryAxis.renderer.tooltipLocation = 0.5;
categoryAxis.renderer.grid.template.strokeOpacity = 0.1;

var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
valueAxis.tooltip.disabled = true;
valueAxis.renderer.grid.template.strokeOpacity = 0.05;
valueAxis.min = 0;

var series1 = chart.series.push(new am4charts.RadarColumnSeries());
series1.columns.template.width = am4core.percent(80);
series1.columns.template.tooltipText = "{name}: {valueY.value}";
series1.name = "Series 1";
series1.dataFields.categoryX = "category";
series1.dataFields.valueY = "value2";
series1.stacked = true;
series1.cursorHoverEnabled = false;

var series2 = chart.series.push(new am4charts.RadarColumnSeries());
series2.columns.template.width = am4core.percent(80);
series2.columns.template.tooltipText = "{name}: {valueY.value}";
series2.name = "Series 2";
series2.dataFields.categoryX = "category";
series2.dataFields.valueY = "value2";
series2.stacked = true;
series2.cursorHoverEnabled = false;

var series3 = chart.series.push(new am4charts.RadarColumnSeries());
series3.columns.template.width = am4core.percent(80);
series3.columns.template.tooltipText = "{name}: {valueY.value}";
series3.name = "Series 3";
series3.dataFields.categoryX = "category";
series3.dataFields.valueY = "value3";
series3.stacked = true;
series3.cursorHoverEnabled = false;

var series4 = chart.series.push(new am4charts.RadarColumnSeries());
series4.columns.template.width = am4core.percent(80);
series4.columns.template.tooltipText = "{name}: {valueY.value}";
series4.name = "Series 4";
series4.dataFields.categoryX = "category";
series4.dataFields.valueY = "value4";
series4.stacked = true;
series4.cursorHoverEnabled = false;

// put it behind axes
chart.seriesContainer.zIndex = -1;

chart.scrollbarX = new am4core.Scrollbar();
chart.scrollbarY = new am4core.Scrollbar();

// add cursor
chart.cursor = new am4charts.RadarCursor();
chart.cursor.xAxis = categoryAxis;
chart.cursor.fullWidthLineX = true;
chart.cursor.lineX.strokeOpacity = 0;
chart.cursor.lineX.fillOpacity = 0.1;
chart.cursor.lineX.fill = am4core.color("#000000");

// add legend
chart.legend = new am4charts.Legend();