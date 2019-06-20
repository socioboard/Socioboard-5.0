/**
 * This is a demo for Treemap.
 *
 * Demo uses JSON-based config.
 *
 * Refer to the following link(s) for reference:
 * @see {@link https://www.amcharts.com/docs/v4/chart-types/xychart/}
 * @see {@link https://www.amcharts.com/docs/v4/concepts/series/}
 * @see {@link https://www.amcharts.com/docs/v4/concepts/json-config/}
 */

// Set theme
am4core.useTheme(am4themes_animated);

// create chart
var chart = am4core.createFromConfig({
    // Data
    "data": [
      {
        "year": "2014",
        "income": 23.5,
        "expenses": 21.1
      },
      {
        "year": "2015",
        "income": 26.2,
        "expenses": 30.5
      },
      {
        "year": "2016",
        "income": 30.1,
        "expenses": 34.9
      },
      {
        "year": "2017",
        "income": 20.5,
        "expenses": 23.1
      },
      {
        "year": "2018",
        "income": 30.6,
        "expenses": 28.2,
        "lineStroke": "3,3",
        "lineOpacity": 0.5
      },
      {
        "year": "2019",
        "income": 34.1,
        "expenses": 31.9,
        "stroke": "3,3",
        "opacity": 0.5
      }
    ],

    // Category axis
    "xAxes": [
      {
        "type": "CategoryAxis",
        "renderer": {
          "grid": {
            "location": 0,
            "disabled": true
          }
        },
        "dataFields": {
          "category": "year"
        }
      }
    ],

    // Value axis
    "yAxes": [
      {
        "type": "ValueAxis",
        "min": 0,
        "tooltip": {
          "disabled": true
        }
      }
    ],

    // Series
    "series": [
      {
        "id": "s1",
        "type": "ColumnSeries",
        "dataFields": {
          "categoryX": "year",
          "valueY": "expenses"
        },
        "tooltipText": "expenses: {valueY.value}",
        "sequencedInterpolation": true,
        "columns": {
          "cornerRadiusTopLeft": 10,
          "cornerRadiusTopRight": 10,
          "strokeWidth": 1,
          "strokeOpacity": 1,
          "propertyFields": {
            "strokeDasharray": "stroke",
            "fillOpacity": "opacity"
          }
        }
      },
      {
        "id": "s2",
        "type": "LineSeries",
        "dataFields": {
          "categoryX": "year",
          "valueY": "income"
        },
        "tooltipText": "income: {valueY.value}",
        "sequencedInterpolation": true,
        "stroke": "#dcaf67",
        "strokeWidth": 2,

        "propertyFields": {
          "strokeDasharray": "lineStroke",
          "strokeOpacity": "lineOpacity"
        },
        "bullets": [
          {
            "type": "CircleBullet",
            "fill": "#dcaf67",
            "radius": 4
          }
        ]
      }
    ],
    "cursor": {
      "behavior": "none",
      "lineX": {
        "opacity": 0
      },
      "lineY": {
        "opacity": 0
      }
    }
  },
  "chartdiv", "XYChart"
);