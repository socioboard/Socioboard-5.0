/**
 * This is a demo for MapChart.
 *
 * Demo uses JSON-based config.
 *
 * Refer to the following link(s) for reference:
 * @see {@link https://www.amcharts.com/docs/v4/chart-types/map/}
 * @see {@link https://www.amcharts.com/docs/v4/concepts/json-config/}
 */

// Set theme
am4core.useTheme(am4themes_animated);

// Create map chart
var chart = am4core.createFromConfig({
  // Set map to use
  "geodata": "worldLow",

  // Set map projection
  "projection": "Miller",

  // Create polygon series
  "series": [{
    "id": "s1",
    "type": "MapPolygonSeries",
    "useGeodata": true,
    "exclude": ["AQ"], // exclude Antarctica

    // Configure tooltip
    "tooltip": {
      "fill": "#000000"
    },

    // Configure appearance of polygons
    "mapPolygons": {
      "tooltipText": "{name}",
      "togglable": true,

      // Configure states
      "states": {
        "hover": {
          "properties": {
            "fill": "#67b7dc"
          }
        },
        "active": {
          "properties": {
            "fill": "#a367dc"
          }
        }
      },

      // Set click events
      "events": {
        "hit": function (event) {
          // if we have some country selected, set default state to it
          if (this.currentActive) {
            this.currentActive.setState("default");
          }

          chart.zoomToMapObject(event.target);
          this.currentActive = event.target;
        }
      }
    }
  }],

  // Create a small map control
  "smallMap": {
    "series": ["s1"]
  },

  // Add zoom control
  "zoomControl": {
    "slider": {
      "height": 100
    }
  }

}, "chartdiv", "MapChart");
