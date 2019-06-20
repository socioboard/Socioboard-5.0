am4core.useTheme(am4themes_animated);

var chart = am4core.create("chartdiv", am4charts.XYChart);

chart.data = [{
  "country": "USA",
  "visits": 3025,
  "error":100
}, {
  "country": "China",
  "visits": 1882,
  "error":180
}, {
  "country": "Japan",
  "visits": 1809,
  "error":130
}, {
  "country": "Germany",
  "visits": 1322,
  "error":200
}, {
  "country": "UK",
  "visits": 1122,
  "error":150
}, {
  "country": "France",
  "visits": 1114,
  "error":110
}, {
  "country": "India",
  "visits": 984,
  "error":120
}];

chart.padding(40, 40, 40, 40);

var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
categoryAxis.renderer.grid.template.location = 0;
categoryAxis.dataFields.category = "country";
categoryAxis.renderer.minGridDistance = 60;

var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

var series = chart.series.push(new am4charts.LineSeries());
series.dataFields.categoryX = "country";
series.dataFields.valueY = "visits";
series.tooltipText = "{valueY.value} error:{error}"

var errorBullet = series.bullets.create(am4charts.ErrorBullet);
errorBullet.isDynamic = true;
errorBullet.strokeWidth = 2;

var circle = errorBullet.createChild(am4core.Circle);
circle.radius = 3;
circle.fill = am4core.color("#ffffff");

// adapter adjusts height of a bullet
errorBullet.adapter.add("pixelHeight", function (pixelHeight, target) {
  var dataItem = target.dataItem;

  if(dataItem){
    var value = dataItem.valueY;
    var errorTopValue = value + dataItem.dataContext.error / 2;
    var errorTopY = valueAxis.valueToPoint(errorTopValue).y;

    var errorBottomValue = value - dataItem.dataContext.error / 2;
    var errorBottomY = valueAxis.valueToPoint(errorBottomValue).y;

    return Math.abs(errorTopY - errorBottomY);
   }
   return pixelHeight;
})

chart.cursor = new am4charts.XYCursor();