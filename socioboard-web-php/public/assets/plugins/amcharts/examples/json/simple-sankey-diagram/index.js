/**
 * This is a demo for SankeyDiagram.
 *
 * Demo uses JSON-based config.
 *
 * Refer to the following link(s) for reference:
 * @see {@link https://www.amcharts.com/docs/v4/chart-types/sankey-diagram/}
 * @see {@link https://www.amcharts.com/docs/v4/concepts/json-config/}
 */

// Set theme
am4core.useTheme(am4themes_animated);

// Create chart
var chart = am4core.createFromConfig({
  // Set data
  "data": [
    { "from": "A", "to": "D", "value": 10 },
    { "from": "B", "to": "D", "value": 8 },
    { "from": "B", "to": "E", "value": 4 },
    { "from": "C", "to": "E", "value": 3 },
    { "from": "D", "to": "G", "value": 5 },
    { "from": "D", "to": "I", "value": 2 },
    { "from": "D", "to": "H", "value": 3 },
    { "from": "E", "to": "H", "value": 6 },
    { "from": "G", "to": "J", "value": 5 },
    { "from": "I", "to": "J", "value": 1 },
    { "from": "H", "to": "J", "value": 9 }
  ],

  // Set data fields
  "dataFields": {
    "fromName": "from",
    "toName": "to",
    "value": "value"
  },

  // Configure nodes
  "nodes": {
    "template": {
      "draggable": true,
      "inert": true,
      "readerTitle": "Drag me!",
      "showSystemTooltip": true,
      "width": 30,
      "background": {
        "defaultState": {
          "filters": [{
            "type": "DropShadowFilter",
            "opacity": 0
          }]
        },
        "hoverState": {
          "filters": [{
            "type": "DropShadowFilter",
            "dy": 0
          }]
        }
      }
    }
  }
}, "chartdiv", "SankeyDiagram");
