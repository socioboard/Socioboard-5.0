/**
 * This is a demo for PieChart.
 *
 * Demo uses JSON-based config.
 *
 * Refer to the following link(s) for reference:
 * @see {@link https://www.amcharts.com/docs/v4/chart-types/pie-chart/}
 * @see {@link https://www.amcharts.com/docs/v4/concepts/json-config/}
 */

// Set theme
am4core.useTheme(am4themes_animated);

// Create chart
var chart = am4core.createFromConfig({
  // Set inner radius
  "innerRadius": "40%",

  // Set data
  "data": [{
    "country": "Lithuania",
    "value": 401
  }, {
    "country": "Czech Republic",
    "value": 300
  }, {
    "country": "Ireland",
    "value": 200
  }, {
    "country": "Germany",
    "value": 165
  }, {
    "country": "Australia",
    "value": 139
  }, {
    "country": "Austria",
    "value": 128
  }],

  // Create series
  "series": [{
    "type": "PieSeries",
    "dataFields": {
      "value": "value",
      "category": "country"
    },
    "slices": {
      "cornerRadius": 10,
      "innerCornerRadius": 7
    },
    "hiddenState": {
      "properties": {
        // this creates initial animation
        "opacity": 1,
        "endAngle": -90,
        "startAngle": -90
      }
    }
  }],

  // Add legend
  "legend": {}
}, "chartdiv", "PieChart");
