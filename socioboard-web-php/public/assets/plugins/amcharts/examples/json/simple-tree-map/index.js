/**
 * This is a demo for Treemap.
 *
 * Demo uses JSON-based config.
 *
 * Refer to the following link(s) for reference:
 * @see {@link https://www.amcharts.com/docs/v4/chart-types/treemap/}
 * @see {@link https://www.amcharts.com/docs/v4/concepts/json-config/}
 */

// Set theme
am4core.useTheme(am4themes_animated);

// create chart
var chart = am4core.createFromConfig({
  // Set data
  "data": [{
    "name": "First",
    "children": [{
      "name": "A1",
      "value": 100
    }, {
      "name": "A2",
      "value": 60
    }, {
      "name": "A3",
      "value": 30
    }]
  }, {
    "name": "Second",
    "children": [ {
      "name": "B1",
      "value": 135
    }, {
      "name": "B2",
      "value": 98
    }, {
      "name": "B3",
      "value": 56
    }]
  }, {
    "name": "Third",
    "children": [{
      "name": "C1",
      "value": 335
    }, {
      "name": "C2",
      "value": 148
    }, {
      "name": "C3",
      "value": 126
    }, {
      "name": "C4",
      "value": 26
    }]
  }, {
    "name": "Fourth",
    "children": [{
      "name": "D1",
      "value": 415
    }, {
      "name": "D2",
      "value": 148
    }, {
      "name": "D3",
      "value": 89
    }, {
      "name": "D4",
      "value": 64
    }, {
      "name": "D5",
      "value": 16
    }]
  }, {
    "name": "Fifth",
    "children": [{
      "name": "E1",
      "value": 687
    }, {
      "name": "E2",
      "value": 148
    }]
  }],

  // Set settings
  "colors": {
    "step": 2,
  },
  "zoomable": false,
  "maxLevels": 2,

  // Set up data fields
  "dataFields": {
    "value": "value",
    "name": "name",
    "children": "children"
  },

  // Disable tooltip animation
  "tooltip": {
    "animationDuration": 0
  },

  // Set up series templates by level
  "seriesTemplates": {
    "0": {
      "columns": {
        "column": {
          "cornerRadiusTopLeft": 10,
          "cornerRadiusTopRight": 10,
          "cornerRadiusBottomLeft": 10,
          "cornerRadiusBottomRight": 10,
        },
        "fillOpacity": 0,
        "strokeWidth": 4,
        "strokeOpacity": 0
      }
    },
    "1": {
      "columns": {
        "strokeOpacity": 1,
        "column": {
          "cornerRadiusTopLeft": 10,
          "cornerRadiusTopRight": 10,
          "cornerRadiusBottomLeft": 10,
          "cornerRadiusBottomRight": 10,
        },
        "fillOpacity": 1,
        "strokeWidth": 4,
        "stroke": "#ffffff"
      },
      "bullets": [{
        "type": "LabelBullet",
        "locationX": 0.5,
        "locationY": 0.5,
        "label": {
          "text": "{name}",
          "fill": "#ffffff"
        }
      }]
    }
  }
}, "chartdiv", "TreeMap");
