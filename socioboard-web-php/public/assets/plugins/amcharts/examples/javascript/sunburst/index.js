am4core.useTheme(am4themes_animated);

// create chart
var chart = am4core.create("chartdiv", am4plugins_sunburst.Sunburst);

chart.data = [{
  name: "First",
  children: [
    { name: "A1", value: 100 },
    { name: "A2", value: 60 }
  ]
},
{
  name: "Second",
  children: [
    { name: "B1", value: 135 },
    { name: "B2", value: 98 }
  ]
},
{
  name: "Third",
  children: [
    {
      name: "C1",
      children: [
        { name: "EE1", value: 130 },
        { name: "EE2", value: 87 },
        { name: "EE3", value: 55 }
      ]
    },
    { name: "C2", value: 148 },
    {
      name: "C3", children: [
        { name: "CC1", value: 53 },
        { name: "CC2", value: 30 }
      ]
    },
    { name: "C4", value: 26 }
  ]
},
{
  name: "Fourth",
  children: [
    { name: "D1", value: 415 },
    { name: "D2", value: 148 },
    { name: "D3", value: 89 }
  ]
},
{
  name: "Fifth",
  children: [
    {
      name: "E1",
      children: [
        { name: "EE1", value: 33 },
        { name: "EE2", value: 40 },
        { name: "EE3", value: 89 }
      ]
    },
    {
      name: "E2",
      value: 148
    }
  ]
}];

chart.colors.step = 2;
chart.fontSize = 11;
chart.innerRadius = am4core.percent(10);

// define data fields
chart.dataFields.value = "value";
chart.dataFields.name = "name";
chart.dataFields.children = "children";

var level1SeriesTemplate = new am4plugins_sunburst.SunburstSeries();
chart.seriesTemplates.setKey("1", level1SeriesTemplate)
level1SeriesTemplate.fillOpacity = 0.75;
level1SeriesTemplate.hiddenInLegend = true;

var level2SeriesTemplate = new am4plugins_sunburst.SunburstSeries();
chart.seriesTemplates.setKey("2", level2SeriesTemplate)
level2SeriesTemplate.fillOpacity = 0.5;
level2SeriesTemplate.hiddenInLegend = true;

chart.legend = new am4charts.Legend();