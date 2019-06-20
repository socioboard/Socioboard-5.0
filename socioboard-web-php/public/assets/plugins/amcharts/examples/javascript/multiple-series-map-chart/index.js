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

// Series for World map
var worldSeries = chart.series.push(new am4maps.MapPolygonSeries());
worldSeries.exclude = ["AQ"];
worldSeries.useGeodata = true;

var polygonTemplate = worldSeries.mapPolygons.template;
polygonTemplate.tooltipText = "{name}";
polygonTemplate.fill = chart.colors.getIndex(0);
polygonTemplate.nonScalingStroke = true;

// Hover state
var hs = polygonTemplate.states.create("hover");
hs.properties.fill = am4core.color("#367B25");

// Series for United States map
var usaSeries = chart.series.push(new am4maps.MapPolygonSeries());

// Chech if proper geodata is loaded
try {
	usaSeries.geodata = am4geodata_usaLow;
}
catch (e) {
	chart.raiseCriticalError(new Error("Map geodata could not be loaded. Please download the latest <a href=\"https://www.amcharts.com/download/download-v4/\">amcharts geodata</a> and extract its contents into the same directory as your amCharts files."));
}

var usPolygonTemplate = usaSeries.mapPolygons.template;
usPolygonTemplate.tooltipText = "{name}";
usPolygonTemplate.fill = chart.colors.getIndex(1);
usPolygonTemplate.nonScalingStroke = true;

// Hover state
var hs2 = usPolygonTemplate .states.create("hover");
hs2.properties.fill = am4core.color("#367B25");