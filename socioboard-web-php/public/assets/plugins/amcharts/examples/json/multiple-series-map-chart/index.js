// Set theme
am4core.useTheme(am4themes_animated);

var chart = am4core.createFromConfig({
  "geodata": "worldLow",
  "projection": "Miller",

  "series": [{
    "type": "MapPolygonSeries",
    "exclude": ["AQ"],
    "useGeodata": true,
    "mapPolygons": {
      "tooltipText": "{name}",
      "fill": "#67b7dc",
      "nonScalingStroke": true
    },
    "states": {
      "hover": {
        "properties": {
          "fill": "#367B25"
        }
      }
    }
  }, {
    "type": "MapPolygonSeries",
    "geodata": "usaLow",
    "useGeodata": true,
    "mapPolygons": {
      "tooltipText": "{name}",
      "fill": "#6794dc",
      "nonScalingStroke": true
    },
    "states": {
      "hover": {
        "properties": {
          "fill": "#367B25"
        }
      }
    }
  }]
}, "chartdiv", "MapChart");