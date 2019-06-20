/**
 * This is a demo for MapChart.
 *
 * Refer to the following link(s) for reference:
 * @see {@link https://www.amcharts.com/docs/v4/chart-types/map/}
 */

// Set themes
am4core.useTheme(am4themes_animated);

// Create the map chart
var chart = am4core.create("chartdiv", am4maps.MapChart);


// Chech if proper geodata is loaded
try {
	chart.geodata = am4geodata_worldLow;
}
catch (e) {
	chart.raiseCriticalError(new Error("Map geodata could not be loaded. Please download the latest <a href=\"https://www.amcharts.com/download/download-v4/\">amcharts geodata</a> and extract its contents into the same directory as your amCharts files."));
}

// Set projection to be used
// @see {@link https://www.amcharts.com/docs/v4/reference/mapchart/#projection_property}
chart.projection = new am4maps.projections.Miller();

// Create polygon series
var polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
polygonSeries.useGeodata = true;
polygonSeries.exclude = ["AQ"]; // Exclude Antractica
polygonSeries.tooltip.fill = am4core.color("#000000");

var colorSet = new am4core.ColorSet();

// Configure polygons
var polygonTemplate = polygonSeries.mapPolygons.template;
polygonTemplate.tooltipText = "{name}";
polygonTemplate.togglable = true;

// Set events to apply "active" state to clicked polygons
var currentActive;
polygonTemplate.events.on("hit", function (event) {
	// if we have some country selected, set default state to it
	if (currentActive) {
		currentActive.setState("default");
	}

	chart.zoomToMapObject(event.target);
	currentActive = event.target;
})

// Configure states
// @see {@link https://www.amcharts.com/docs/v4/concepts/states/}

// Configure "hover" state
var hoverState = polygonTemplate.states.create("hover");
hoverState.properties.fill = colorSet.getIndex(0);

// Configure "active" state
var activeState = polygonTemplate.states.create("active");
activeState.properties.fill = colorSet.getIndex(4);

// Create a Small map control
/*
var smallMap = new maps.SmallMap();
chart.smallMap = smallMap;

var smallMapPolygonSeries = smallMap.series.push(new maps.MapPolygonSeries());
smallMapPolygonSeries.copyFrom(polygonSeries);
*/

// Create a zoom control
var zoomControl = new am4maps.ZoomControl();
chart.zoomControl = zoomControl;
zoomControl.slider.height = 100;
