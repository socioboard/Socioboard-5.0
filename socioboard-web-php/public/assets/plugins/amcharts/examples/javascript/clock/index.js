am4core.useTheme(am4themes_animated);

// create chart
var chart = am4core.create("chartdiv", am4charts.GaugeChart);


chart.exporting.menu = new am4core.ExportMenu();

chart.startAngle = -90;
chart.endAngle = 270;

var axis = chart.xAxes.push(new am4charts.ValueAxis());
axis.min = 0;
axis.max = 12;
axis.strictMinMax = true;

axis.renderer.line.strokeWidth = 8;
axis.renderer.line.strokeOpacity = 1;
axis.renderer.minLabelPosition = 0.05; // hides 0 label
axis.renderer.inside = true;
axis.renderer.labels.template.radius = 30;
axis.renderer.grid.template.disabled = true;
axis.renderer.ticks.template.length = 12;
axis.renderer.ticks.template.strokeOpacity = 1;

// serves as a clock face fill
var range = axis.axisRanges.create();
range.value = 0;
range.endValue = 12;
range.grid.visible = false;
range.tick.visible = false;
range.label.visible = false;

var axisFill = range.axisFill;
axisFill.fillOpacity = 0.8;
axisFill.disabled = false;
axisFill.fill = am4core.color("#FFFFFF");

// hands
var hourHand = chart.hands.push(new am4charts.ClockHand());
hourHand.radius = am4core.percent(60);
hourHand.startWidth = 10;
hourHand.endWidth = 10;
hourHand.rotationDirection = "clockWise";
hourHand.pin.radius = 8;
hourHand.zIndex = 1;

var minutesHand = chart.hands.push(new am4charts.ClockHand());
minutesHand.rotationDirection = "clockWise";
minutesHand.startWidth = 7;
minutesHand.endWidth = 7;
minutesHand.radius = am4core.percent(78);
minutesHand.zIndex = 2;

var secondsHand = chart.hands.push(new am4charts.ClockHand());
secondsHand.fill = am4core.color("#DD0000");
secondsHand.stroke = am4core.color("#DD0000");
secondsHand.radius = am4core.percent(85);
secondsHand.rotationDirection = "clockWise";
secondsHand.zIndex = 3;
secondsHand.startWidth = 1;

updateHands();

setInterval(function () {
	updateHands();
}, 1000)

function updateHands() {
	// get current date
	var date = new Date();
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var seconds = date.getSeconds();

	// set hours
	hourHand.showValue(hours + minutes / 60, 0);
	// set minutes
	minutesHand.showValue(12 * (minutes + seconds / 60) / 60, 0);
	// set seconds
	secondsHand.showValue(12 * date.getSeconds() / 60, 300);
}
