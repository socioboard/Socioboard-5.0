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
  // Set data
  data: [{
    "country": "Lithuania",
    "litres": 501.9
  }, {
    "country": "Czech Republic",
    "litres": 301.9
  }, {
    "country": "Ireland",
    "litres": 201.1
  }, {
    "country": "Germany",
    "litres": 165.8
  }, {
    "country": "Australia",
    "litres": 139.9
  }, {
    "country": "Austria",
    "litres": 128.3
  }, {
    "country": "UK",
    "litres": 99
  }, {
    "country": "Belgium",
    "litres": 60
  }, {
    "country": "The Netherlands",
    "litres": 50
  }],

  // Create series
  "series": [{
    "type": "PieSeries",
    "dataFields": {
      "value": "litres",
      "category": "country"
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
