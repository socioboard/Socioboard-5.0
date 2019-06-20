/**
 * This is a demo for RadarChart.
 *
 * Demo uses JSON-based config.
 *
 * Refer to the following link(s) for reference:
 * @see {@link https://www.amcharts.com/docs/v4/chart-types/radar-chart/}
 * @see {@link https://www.amcharts.com/docs/v4/concepts/json-config/}
 */

// Set theme
am4core.useTheme(am4themes_animated);

// Create chart
var chart = am4core.createFromConfig({
  // Set data
  "data": [{
    "direction": "N",
    "value": 8
  }, {
    "direction": "NE",
    "value": 9
  }, {
    "direction": "E",
    "value": 4.5
  }, {
    "direction": "SE",
    "value": 3.5
  }, {
    "direction": "S",
    "value": 9.2
  }, {
    "direction": "SW",
    "value": 8.4
  }, {
    "direction": "W",
    "value": 11.1
  }, {
    "direction": "NW",
    "value": 10
  }],

  // Padding
  "paddingTop": 10,
  "paddingRight": 10,
  "paddingBottom": 10,
  "paddingLeft": 10,

  // Add circular (X) axis
  "xAxes": [{
    "type": "CategoryAxis",
    "renderer": {
      "minGridDistance": 60,
      "grid": {
        "location": 0
      }
    },
    "dataFields": {
      "category": "direction"
    }
  }],

  // Add radial (Y) axis
  "yAxes": [{
    "type": "ValueAxis"
  }],

  // Add series
  "series": [{
    "type": "RadarSeries",
    "tooltipText": "{valueY.value}",
    "fillOpacity": 0.4,
    "dataFields": {
      "categoryX": "direction",
      "valueY": "value"
    }
  }],

  // Add cursor
  "cursor": {
    "type": "RadarCursor"
  }
}, "chartdiv", "RadarChart");
