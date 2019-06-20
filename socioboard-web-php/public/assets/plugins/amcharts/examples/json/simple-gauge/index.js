// Set themes
am4core.useTheme(am4themes_animated);

// Create chart
var chart = am4core.createFromConfig({
  // Set inner radius
  "innerRadius": -15,

  // Add axis
  "xAxes": [{
    // Set axis type and settings
    "type": "ValueAxis",
    "min": 0,
    "max": 100,
    "strictMinMax": true,

    // Add axis ranges
    "axisRanges": [{
      "value": 0,
      "endValue": 50,
      "axisFill": {
        "fillOpacity": 1,
        "fill": "#67b7dc"
      }
    }, {
      "value": 50,
      "endValue": 80,
      "axisFill": {
        "fillOpacity": 1,
        "fill": "#6771dc"
      }
    }, {
      "value": 80,
      "endValue": 100,
      "axisFill": {
        "fillOpacity": 1,
        "fill": "#a367dc"
      }
    }]
  }],

  // Add hand
  "hands": [{
    "type": "ClockHand",
    "id": "h1"
  }]
}, "chartdiv", "GaugeChart");

// Change hand position
setInterval(function () {
  var hand = chart.hands.getIndex(0);
  hand.showValue(Math.random() * 100, 1000, am4core.ease.cubicOut);
}, 2000);
