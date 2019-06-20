//am4core.useTheme(am4themes_animated);

var container = am4core.create("chartdiv", am4core.Container);
container.width = am4core.percent(100);
container.height = am4core.percent(100);
container.layout = "vertical";

container.events.on("up", function(event) {
  for (var i = 0; i < charts.length; i++) {
    var chart = charts[i];
    var cursor = chart.cursor;
    cursor.selection.hide(0);
  }
});


var chartCount = 3;
var charts = [];
var cursorShowDisposers = [];

// create chart instances
for (var i = 0; i < chartCount; i++) {
  makeChart();
}

initCursorListeners();

// after the charts are made, add scrollbar to the first one
var firstChart = charts[0];
firstChart.scrollbarX = new am4core.Scrollbar();
firstChart.zoomOutButton.disabled = false;

// enable date axis labels for the last one
var lastChart = charts[charts.length - 1];
var lastDateAxis = lastChart.xAxes.getIndex(0);
lastDateAxis.renderer.labels.template.disabled = false;
lastDateAxis.cursorTooltipEnabled = true;


// generate data (although it would be possible to use one data provider for all of the charts, we would need to use different field name for each value)
function generateData() {
  var data = [];
  var value = 10;
  for (var i = 1; i < 366; i++) {
    value += Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 10);
    data.push({ date: new Date(2018, 0, i), name: "name" + i, value: value });
  }
  return data;
}

// create chart
function makeChart() {
  var chart = container.createChild(am4charts.XYChart);
  charts.push(chart);

  chart.data = generateData();
  chart.zoomOutButton.disabled = true;
  chart.padding(10, 15, 10, 15);

  var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
  dateAxis.renderer.grid.template.location = 0;
  dateAxis.renderer.labels.template.disabled = true;
  dateAxis.tooltip.animationDuration = 0;
  dateAxis.cursorTooltipEnabled = false;

  var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
  valueAxis.tooltip.disabled = true;
  valueAxis.tooltip.disabled = true;
  valueAxis.renderer.minWidth = 60;

  var series = chart.series.push(new am4charts.LineSeries());
  series.dataFields.dateX = "date";
  series.dataFields.valueY = "value";
  series.interpolationDuration = 0;

  series.tooltipText = "{valueY.value}";

  var cursor = new am4charts.XYCursor();
  cursor.lineY.disabled = true;
  cursor.xAxis = dateAxis;
  chart.cursor = cursor;


  // whenever any of the charts is zoomed, we should zoom all other charts
  dateAxis.events.on("selectionextremeschanged", function (event) {
    syncDateAxes(event.target);
  })
}


function initCursorListeners() {
  cursorShowDisposers = [];
  for (var i = 0; i < charts.length; i++) {
    var chart = charts[i];
    var cursor = chart.cursor;
    cursor.interactionsEnabled = true;

    cursorShowDisposers.push(cursor.events.on("shown", function (event) {
      handleShowCursor(event.target);
    }));
  }
}

var shownCursorChangeDisposer;
var shownCursorZoomStartedDisposer;
var shownCursorZoomEndedDisposer;

function handleShowCursor(shownCursor) {
  // disable mouse for all other cursors
  for (var i = 0; i < charts.length; i++) {
    var chart = charts[i];
    var cursor = chart.cursor;
    if (cursor != shownCursor) {
      cursor.interactionsEnabled = false;
    }
    // remove show listener
    cursorShowDisposers[i].dispose();
  }

  // add change disposer to the hovered chart cursor
  shownCursorChangeDisposer = shownCursor.lineX.events.on("positionchanged", function (event) {
    syncCursors(shownCursor);
  });


  shownCursorZoomStartedDisposer = shownCursor.events.on("zoomstarted", function (event) {

    for (var i = 0; i < charts.length; i++) {
      var chart = charts[i];
      var cursor = chart.cursor;
      if (cursor != event.target) {
        var point = { x: event.target.point.x, y: 0 };
        cursor.triggerDown(point);
      }
    }
  });

  shownCursorZoomEndedDisposer = shownCursor.events.on("zoomended", function (event) {
    for (var i = 0; i < charts.length; i++) {
      var chart = charts[i];
      var cursor = chart.cursor;
      if (cursor != event.target) {
        var point = { x: event.target.point.x, y: 0 };
        cursor.triggerUp(point);
      }
    }
  });


  shownCursor.events.once("hidden", function (event) {
    shownCursorChangeDisposer.dispose();
    shownCursorZoomStartedDisposer.dispose();
    shownCursorZoomEndedDisposer.dispose();

    for (var i = 0; i < charts.length; i++) {
      var chart = charts[i];
      var cursor = chart.cursor;
      cursor.hide(0);

      cursorShowDisposers[i].dispose();
    }

    initCursorListeners();
  });
}

function syncCursors(syncWithCursor) {
  for (var i = 0; i < charts.length; i++) {
    var chart = charts[i];
    var cursor = chart.cursor;

    var point = { x: syncWithCursor.point.x, y: 0 };

    if (cursor != syncWithCursor) {
      cursor.triggerMove(point);
    }
  }
}


function syncDateAxes(syncWithAxis) {
  for (var i = 0; i < charts.length; i++) {
    var chart = charts[i];
    var dateAxis = chart.xAxes.getIndex(0);
    if (dateAxis != syncWithAxis) {
      dateAxis.events.disableType("selectionextremeschanged");
      dateAxis.start = syncWithAxis.start;
      dateAxis.end = syncWithAxis.end;
      dateAxis.events.enableType("selectionextremeschanged");
    }
  }
}
