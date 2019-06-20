am4core.useTheme(am4themes_animated);

// Define icons
var icon1 = "data:image/svg+xml;charset=utf-8;base64,PHN2ZyB3aWR0aD0iMTc2IiBoZWlnaHQ9Ijg4OSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNODcuODIuMDY2djc2LjQzNmwtNC4wNjUgMi45ODR2NjUuNDE4bC0yLjkwNCAzLjQ0My0uNzc0IDYzLjEyMy01LjIyOCA1LjczOHY2MS45NzVsLTIuMzIzIDQuODItLjc3NCAxNzguNTgtOS42OCAyLjI5Ni0uNzc1IDEyOC41NC05LjEgMy4yMTR2MTE5LjU4OWwtNS42MTQgMS4xNDgtLjc3NCA4NC4wMS03LjU1IDEuMTQ4djQ5LjM1aC04LjMyNnYxMS4wMThoLTYuOTd2OC4yNjRILjd2MjAuNjU4aDE3NC40MzdWODcxLjE2aC0xNy40MjR2LTguMjY0aC0xMS4yM3YtOS42NGwtNy4zNTYtLjIzLS45NjgtNzMuNjgxLTcuNTUtLjkxOC45NjctOTguOTMtNy45MzgtMS44MzctLjc3NC0xMjIuMTE0LTYuOTctMS44MzYtMS4zNTUtMTM4LjE4Mi01LjYxNC03LjU3NFYzMDcuMTg3bC02LjAwMi05LjQxMXYuMjMtMzkuOTRsLTQuMjYtMy42NzMtLjc3NC0zNi45NTVoLS45Njh2LTQ2LjU5NmwtMy44NzItNi44ODZ2LTYwLjEzOWwtMy42NzgtMi45ODQtLjM4OC0yMS4xMTdWLjA2NmgtMS4xNjF6IiBmaWxsPSIjMDAwMDAwIiBmaWxsLXJ1bGU9Im5vbnplcm8iLz48L3N2Zz4=";

var icon2 = "data:image/svg+xml;charset=utf-8;base64,PHN2ZyB3aWR0aD0iMTAzIiBoZWlnaHQ9IjU3NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTAzIDU3Ny45VjI4OC41YzAtMS4xLTEuMi0yLjEtMi4yLTIuMWgtOFYxODIuMWMwLTEtMS4xLTIuMS0yLjEtMi4xSDc0LjRWOTguNWMwLTEtMS0yLTIuMS0ySDU5LjJzLjEtMS45LjEtMy0xLjEtMS4xLTEuMS0xLjFWNDIuN2gtMi4xVjhoLTN2ODQuNGgtMlY0Ni44aC0xLjl2NDUuOEgzNC45di00N2gtMS4ydjQ2LjloLTIuOVYuNWgtNC4ydjkyaC01LjF2NGgtOC4xYy0xLjEgMC0yIDEtMiAydjE4OEgyLjJjLTEuMSAwLTIuMSAxLTIuMSAydjI4OS40SDEwM3oiIGZpbGw9IiMwMDAwMDAiIGZpbGwtcnVsZT0ibm9uemVybyIvPjwvc3ZnPg==";

var icon3 = "data:image/svg+xml;charset=utf-8;base64,PHN2ZyB3aWR0aD0iODMiIGhlaWdodD0iNTU2IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0zOS44Ljh2NTYuNWwtNS4xIDEuM3Y1aDN2M2gxLjh2MmgtMy44Yy0uOSAwLTIuMSAxLTIuMSAydjE2LjloLTRzLjkgMTUuOS45IDE2LjljMCAxIDEuMSAyIDIuMSAyaDF2MTYuOWgtNy4xYy0xIDAtMiAxLTIgMnY5aC04LjFjLTEuMSAwLTIgMS0yIDJ2MS45aC0ybDQuMSAzOC43aC0zbDMuOSAzNy45aC0zLjlsMy43IDM3LjdoLTMuOWw0LjQgMzcuN2gtNC4zbDMuOSAzNi44aC00bDQuMiAzNi45aC00LjNsNC40IDM4LjdoLTQuM2w0IDM5LjhzLTEuNy0uMS0yLjUgMGMtLjggMC0xLjEgMS4xLTEuMyAxLjgtLjIuNy0xMy4xIDExNS0xMy4xIDExNWw0MS0uMmguN2w0MSAuMlM3MC4yIDQ0NC45IDcwIDQ0NC4yYy0uMi0uNy0uNS0xLjgtMS4zLTEuOC0uOC0uMS0yLjUgMC0yLjUgMGw0LTM5LjhoLTQuM2w0LjQtMzguN0g2Nmw0LjItMzYuOWgtNGwzLjktMzYuOGgtNC4zbDQuNC0zNy43aC0zLjlsMy43LTM3LjdoLTMuOWwzLjktMzcuOWgtM2w0LjEtMzguN2gtMnYtMS45YzAtMS4xLS45LTItMi0ySDU5di05YzAtMS0xLTItMi0yaC03LjF2LTE2LjloMWMxIDAgMi4xLTEgMi4xLTJzLjktMTYuOS45LTE2LjloLTRWNzAuNmMwLTEtMS4xLTItMi4xLTJINDR2LTJoMS44di0zaDN2LTVsLTUuMS0xLjNWLjhoLTMuOXoiIGZpbGw9IiMwMDAwMDAiIGZpbGwtcnVsZT0ibm9uemVybyIvPjwvc3ZnPg==";

var icon4 = "data:image/svg+xml;charset=utf-8;base64,PHN2ZyB3aWR0aD0iMTgwIiBoZWlnaHQ9IjQ5MyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMzAuNy40djQwLjhoLTJ2NmgydjIuNWwtMSAzLjVoLTFjLTEgMC0yIDEtMiAydjJoLTFjLS45IDAtMiAxLTIgMnY1LjloLTFjLTEuMSAwLTIuMSAxLTIuMSAydjhoLTFjLTEgMC0yIDEtMiAyVjg2aC0xYy0xIDAtMi4xIDEtMi4xIDJ2MTYuOWgtMi4xYy0xIDAtMiAuOS0yIDJ2MjMuOWgtMmMtMSAwLTIgMS0yIDJ2NDAuN2gtMmMtMSAwLTIgMS0yIDJ2NTEuN2MwIC45LTIuMSAxLjItMi4xIDJ2MjY2LjJsMzEuOCAxaDFsMjguOC0uOWg1Ni4ybDI4LjguOWgxbDMxLjgtMVYyMjkuMmMwLS44LTIuMS0xLjEtMi4xLTJ2LTUxLjdjMC0xLTEtMi0yLTJoLTJ2LTQwLjdjMC0uOS0xLjEtMi0yLjEtMmgtMnYtMjMuOWMwLTEtMS4xLTItMi0yaC0yLjFWODhjMC0xLTEtMi0yLjEtMmgtMXYtOC45YzAtMS0xLTItMi0yaC0xdi04YzAtMS0xLTItMi0yaC0xLjF2LTUuOWMwLTEtMS4xLTItMi0yaC0xdi0yYzAtMS0xLTItMi0yaC0xbC0xLTMuNXYtMi41aDJ2LTZoLTJWLjRoLTMuOHY0MC44aC0ydjZoMnYyLjVsLTEgMy41aC0xYy0xIDAtMiAxLTIgMnYyaC0xYy0uOSAwLTIgMS0yIDJ2NS45aC0xYy0xLjEgMC0yLjEgMS0yLjEgMnY4aC0xYy0xIDAtMiAxLTIgMlY4NmgtMWMtMSAwLTIuMSAxLTIuMSAydjE2LjloLTIuMWMtMSAwLTIgLjktMiAydjIzLjloLTJjLTEgMC0yIDEtMiAydjQwLjdoLTJjLTEgMC0yIDEtMiAydjUxLjdjMCAuOS0yLjEgMS4yLTIuMSAydjczLjVINjV2LTczLjVjMC0uOC0yLjEtMS4xLTIuMS0ydi01MS43YzAtMS0xLTItMi0yaC0ydi00MC43YzAtLjktMS4xLTItMi4xLTJoLTJ2LTIzLjljMC0xLTEuMS0yLTItMmgtMi4xVjg4YzAtMS0xLTItMi4xLTJoLTF2LTguOWMwLTEtMS0yLTItMmgtMXYtOGMwLTEtMS0yLTItMmgtMS4xdi01LjljMC0xLTEuMS0yLTItMmgtMXYtMmMwLTEtMS0yLTItMmgtMWwtMS0zLjV2LTIuNWgydi02aC0yVi40aC0zLjh6TTY1IDMxMy42aDIzLjRsLjEuMUw2NSAzNTkuMXYtNDUuNXptMjYuNyAwaDIzLjZ2NDUuOGwtMjMuNi00NS44em0tMS43IDMuM2wyNS4yIDQ5Ljd2MTA2LjNINjVWMzY2LjJsMjUtNDkuM3oiIGZpbGw9IiMwMDAwMDAiIGZpbGwtcnVsZT0ibm9uemVybyIvPjwvc3ZnPg==";

var icon5 = "data:image/svg+xml;charset=utf-8;base64,PHN2ZyB3aWR0aD0iMTQ0IiBoZWlnaHQ9IjQ4NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNjkuOS4zdjQwSDY5Yy0uOCAwLTIuMSAxLjEtMi4xIDIuMXYyOC43YzAgMS4xLTEuMi45LTEuMiAyLjF2MjUuOWMwIC45LTEgMS4xLTEgMnY5LjRsLTcuMiAxOS40aC00Yy0xIDAtMi4xIDEtMi4xIDJ2NWgtM2MtMSAwLTIuMSAxLTIuMSAydjI3LjhoLTNjLTEgMC0yLjEuOS0yLjEgMnYzMy44YzAgMS40LTMgMi4xLTMgM3YxNjIuMWgtNWMtMSAwLTIuMSAxLTIuMSAydjM1LjhIMjBjLTEgMC0yLjEgMS0yLjEgMnY1My43SDIuN2MtMSAwLTIgMS0yIDJ2MjQuNWw3MS4xLjdoLjZsNzEuMS0uN3YtMjQuNWMwLTEtMS0yLTItMmgtMTUuMnYtNTMuN2MwLTEtMS0yLTIuMS0yaC0xMS4xdi0zNS44YzAtMS0xLTItMi4xLTJoLTVWMjA1LjVjMC0xLTMuMS0xLjYtMy4xLTN2LTMzLjhjMC0xLTEtMi0yLTJoLTN2LTI3LjhjMC0uOS0xLTItMi4xLTJoLTN2LTVjMC0xLTEtMi0yLTJoLTRsLTcuMi0xOS40di05LjRjMC0uOS0xLTEuMS0xLTJWNzMuMmMwLTEuMi0xLjItMS0xLjItMi4xVjQyLjRjMC0xLTEuMi0yLjEtMi4xLTIuMWgtLjlWLjNoLTQuNXoiIGZpbGw9IiMwMDAwMDAiIGZpbGwtcnVsZT0ibm9uemVybyIvPjwvc3ZnPg==";

// Create chart instance
var chart = am4core.create("chartdiv", am4charts.XYChart);


// Add data
chart.data = [{
  "category": "Burj Khalifa",
  "height": 828,
  "ratio": 1 / 5.12,
  "icon": icon1
}, {
  "category": "Willis Tower",
  "height": 527,
  "ratio": 1 / 5.06,
  "icon": icon2
}, {
  "category": "Taipei 101",
  "height": 508,
  "ratio": 1 / 6.73,
  "icon": icon3
}, {
  "category": "Petronas Towers",
  "height": 452,
  "ratio": 1 / 2.76,
  "icon": icon4
}, {
  "category": "Empire State Building",
  "height": 449,
  "ratio": 1 / 3.41,
  "icon": icon5
}];

// Create axes
var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
categoryAxis.dataFields.category = "category";
categoryAxis.renderer.grid.template.location = 0;
categoryAxis.renderer.grid.template.disabled = true;
categoryAxis.renderer.labels.template.fill = am4core.color("#ffffff");
categoryAxis.renderer.labels.template.fillOpacity = 0.5;
categoryAxis.renderer.inside = true;

chart.paddingBottom = 0;

//categoryAxis.renderer.minGridDistance = 30;

var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
valueAxis.min = 0;
valueAxis.max = 1000;
valueAxis.strictMinMax = true;
valueAxis.renderer.grid.template.strokeDasharray = "4,4";
valueAxis.renderer.minLabelPosition = 0.05;

// Create series
var series = chart.series.push(new am4charts.ColumnSeries());
series.dataFields.valueY = "height";
series.dataFields.categoryX = "category";
series.columns.template.disabled = true;

var bullet = series.bullets.push(new am4charts.Bullet());
bullet.defaultState.properties.opacity = 0.5;

var image = bullet.createChild(am4core.Image);
image.horizontalCenter = "middle";
image.verticalCenter = "top";

image.propertyFields.href = "icon";
image.height = am4core.percent(100);
image.propertyFields.widthRatio = "ratio";

bullet.events.on("positionchanged", function (event) {
    event.target.deepInvalidate();
});

var label = series.bullets.push(new am4charts.LabelBullet());
label.label.text = "{height} metres";
label.dy = -15;

var gradient = new am4core.LinearGradient();
gradient.addColor(am4core.color("#f0b24f"));
gradient.addColor(am4core.color("#ca6c46"));
gradient.addColor(am4core.color("#0c0524"));
gradient.rotation = 90;
chart.background.fill = gradient;
