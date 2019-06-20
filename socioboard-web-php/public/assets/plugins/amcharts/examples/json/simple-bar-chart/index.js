am4core.useTheme(am4themes_animated);

var chart = am4core.createFromConfig({
  // Reduce saturation of colors to make them appear as toned down
  "colors": {
    "saturation": 0.4
  },

  // Setting data
  "data": [{
    "country": "USA",
    "visits": 3025
  }, {
    "country": "China",
    "visits": 1882
  }, {
    "country": "Japan",
    "visits": 1809
  }, {
    "country": "Germany",
    "visits": 1322
  }, {
    "country": "UK",
    "visits": 1122
  }, {
    "country": "France",
    "visits": 1114
  }, {
    "country": "India",
    "visits": 984
  }, {
    "country": "Spain",
    "visits": 711
  }, {
    "country": "Netherlands",
    "visits": 665
  }, {
    "country": "Russia",
    "visits": 580
  }, {
    "country": "South Korea",
    "visits": 443
  }, {
    "country": "Canada",
    "visits": 441
  }],

  // Add Y axis
  "yAxes": [{
    "type": "CategoryAxis",
    "renderer": {
      "minGridDistance": 20,
      "grid": {
        "location": 0
      }
    },
    "dataFields": {
      "category": "country"
    }
  }],

  // Add X axis
  "xAxes": [{
    "type": "ValueAxis",
    "renderer": {
      "maxLabelPosition": 0.98
    }
  }],

  // Add series
  "series": [{
    // Set type
    "type": "ColumnSeries",

    // Define data fields
    "dataFields": {
      "categoryY": "country",
      "valueX": "visits"
    },

    // Modify default state
    "defaultState": {
      "ransitionDuration": 1000
    },

    // Set animation options
    "sequencedInterpolation": true,
    "sequencedInterpolationDelay": 100,

    // Modify color appearance
    "columns": {
      // Disable outline
      "strokeOpacity": 0,

      // Add adapter to apply different colors for each column
      "adapter": {
        "fill": function (fill, target) {
          return chart.colors.getIndex(target.dataItem.index);
        }
      }
    }
  }],

  // Enable chart cursor
  "cursor": {
    "type": "XYCursor",
    "behavior": "zoomY"
  }
}, "chartdiv", "XYChart");
