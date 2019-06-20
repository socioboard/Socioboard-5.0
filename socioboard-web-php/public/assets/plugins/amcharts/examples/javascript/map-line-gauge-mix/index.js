am4core.useTheme(am4themes_animated);
am4core.useTheme(am4themes_dark);

// times of events
var startTime = new Date(2018, 0, 13, 6).getTime();
var endTime = new Date(2018, 0, 13, 11, 59).getTime();
var launchTime = new Date(2018, 0, 13, 7, 0).getTime();
var alertTime = new Date(2018, 0, 13, 8, 7).getTime();
var cancelTime = new Date(2018, 0, 13, 8, 45).getTime();

var colorSet = new am4core.ColorSet();
var currentTime;

var container = am4core.create("chartdiv", am4core.Container);
container.width = am4core.percent(100);
container.height = am4core.percent(100);

// map chart ////////////////////////////////////////////////////////
var mapChart = container.createChild(am4maps.MapChart);

try {
    mapChart.geodata = am4geodata_continentsLow;
}
catch (e) {
    mapChart.raiseCriticalError(new Error("Map geodata could not be loaded. Please download the latest <a href=\"https://www.amcharts.com/download/download-v4/\">amcharts geodata</a> and extract its contents into the same directory as your amCharts files."));
}

mapChart.projection = new am4maps.projections.Miller();
mapChart.deltaLongitude = 145;
mapChart.seriesContainer.draggable = false;

var polygonSeries = mapChart.series.push(new am4maps.MapPolygonSeries());
polygonSeries.useGeodata = true;
polygonSeries.exclude = ["Antarctica"];

var mapImageSeries = mapChart.series.push(new am4maps.MapImageSeries());
var pyongyang = mapImageSeries.mapImages.create();
pyongyang.longitude = 125.739708;
pyongyang.latitude = 39.034333;
pyongyang.nonScaling = true;

var pyongyangCircle = pyongyang.createChild(am4core.Circle);
pyongyangCircle.fill = colorSet.getIndex(5);
pyongyangCircle.stroke = pyongyangCircle.fill;
pyongyangCircle.radius = 4;

pyongyangCircle.tooltip = new am4core.Tooltip();
pyongyangCircle.tooltip.filters.clear();
pyongyangCircle.tooltip.background.cornerRadius = 20;
pyongyangCircle.tooltip.label.padding(15, 20, 15, 20);
pyongyangCircle.tooltip.background.strokeOpacity = 0;
pyongyangCircle.tooltipY = -5;


var koreaText = pyongyang.createChild(am4core.Label);
koreaText.text = "North Korea";
koreaText.fillOpacity = 0.2;
koreaText.fontSize = 20;
koreaText.verticalCenter = "middle";
koreaText.horizontalCenter = "right";
koreaText.paddingRight = 15;

var bomb = mapImageSeries.mapImages.create();
bomb.longitude = 125.739708;
bomb.latitude = 39.034333;
bomb.nonScaling = true;
bomb.opacity = 0;

var bombImage = bomb.createChild(am4core.Image);
bombImage.width = 32;
bombImage.height = 32;
bombImage.href = "rocket.svg";
bombImage.verticalCenter = "middle";
bombImage.horizontalCenter = "middle";


var honolulu = mapImageSeries.mapImages.create();
honolulu.longitude = -157.887841;
honolulu.latitude = 21.368213;
honolulu.nonScaling = true;


var bulletAlertCircle = honolulu.createChild(am4core.Circle);
bulletAlertCircle.fill = am4core.color();
bulletAlertCircle.stroke = colorSet.getIndex(2);
bulletAlertCircle.strokeOpacity = 1;
bulletAlertCircle.radius = 5;
bulletAlertCircle.strokeWidth = 2;
bulletAlertCircle.visible = false;
var bulletAlertAnimation = bulletAlertCircle.animate([{ property: "radius", to: 50 }, { property: "strokeOpacity", to: 0, from: 1 }], 600).loop().pause();

var honoluluCircle = honolulu.createChild(am4core.Circle);
honoluluCircle.fill = colorSet.getIndex(2);
honoluluCircle.stroke = honoluluCircle.fill;
honoluluCircle.radius = 4;
honoluluCircle.tooltipY = -5;

honoluluCircle.tooltip = new am4core.Tooltip();
honoluluCircle.tooltip.filters.clear();
honoluluCircle.tooltip.background.cornerRadius = 20;
honoluluCircle.tooltip.label.padding(15, 20, 15, 20);
honoluluCircle.tooltip.background.strokeOpacity = 0;


var hawaiiText = honolulu.createChild(am4core.Label);
hawaiiText.text = "Hawaii, USA";
hawaiiText.fillOpacity = 0.1;
hawaiiText.fontSize = 35;
hawaiiText.verticalCenter = "middle";
hawaiiText.paddingLeft = 30;


var bang = mapImageSeries.mapImages.create();
bang.longitude = -177;
bang.latitude = 24;
bang.nonScaling = true;
var bangImage = bang.createChild(am4core.Image);
bangImage.width = 50;
bangImage.height = 50;
bangImage.verticalCenter = "middle";
bangImage.horizontalCenter = "middle";
bangImage.href = "bang.png";
bang.opacity = 0;

var mapLineSeries = mapChart.series.push(new am4maps.MapLineSeries());
var line = mapLineSeries.mapLines.create();
line.imagesToConnect = [pyongyang, bang];
line.line.strokeOpacity = 0; // it's invisible, we use it for a bomb image to follow it

mapChart.homeGeoPoint = { longitude: -175, latitude: 15 };
mapChart.homeZoomLevel = 2.2;

// clock chart //////////////////////////////////////////////////////////////////
var clock = mapChart.chartContainer.createChild(am4charts.GaugeChart);
clock.align = "right";
clock.width = 250;
clock.height = 250;
clock.align = "right";
clock.zIndex = 10;

clock.startAngle = -90;
clock.endAngle = 270;

var axis = clock.xAxes.push(new am4charts.ValueAxis());
axis.min = 0;
axis.max = 12;
axis.strictMinMax = true;

axis.renderer.line.strokeWidth = 1;
axis.renderer.line.strokeOpacity = 0.2;
axis.renderer.minLabelPosition = 0.05; // hides 0 label
axis.renderer.inside = true;
axis.renderer.labels.template.radius = 23;
axis.renderer.grid.template.disabled = true;
axis.renderer.minGridDistance = 20;
axis.renderer.ticks.template.length = 4;
axis.renderer.ticks.template.strokeOpacity = 0.2;

// clock hands
var hourHand = clock.hands.push(new am4charts.ClockHand());
hourHand.radius = am4core.percent(60);
hourHand.startWidth = 5;
hourHand.endWidth = 5;
hourHand.rotationDirection = "clockWise";
hourHand.pin.radius = 5;
hourHand.zIndex = 0;

var minutesHand = clock.hands.push(new am4charts.ClockHand());
minutesHand.rotationDirection = "clockWise";
minutesHand.startWidth = 2;
minutesHand.endWidth = 2;
minutesHand.radius = am4core.percent(78);
minutesHand.zIndex = 1;


function updateHands(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();

    // set hours
    hourHand.showValue(hours + minutes / 60, 0);
    // set minutes
    minutesHand.showValue(12 * (minutes + seconds / 60) / 60, 0);
}

/// end of clock

var exploded = false;

var honoluluTexts = [
    { time: new Date(2018, 0, 13, 6, 7).getTime(), text: "I wonder what's on youtube..." },
    { time: new Date(2018, 0, 13, 6, 30).getTime(), text: "... oooh a kitty video ..." },
    { time: new Date(2018, 0, 13, 7, 10).getTime(), text: "... LOL funny ..." },
    { time: new Date(2018, 0, 13, 8, 7).getTime(), text: "Huh?!?" },
    { time: new Date(2018, 0, 13, 8, 15).getTime(), text: "OMG!!!" },
    { time: new Date(2018, 0, 13, 8, 49).getTime(), text: "Phew!" },
    { time: new Date(2018, 0, 13, 8, 59).getTime(), text: "OK, where were we?" },
    { time: new Date(2018, 0, 13, 9, 20).getTime(), text: "" }
];

var pyongyangTexts = [
    { time: new Date(2018, 0, 13, 6, 5).getTime(), text: "Great comrade..." },
    { time: new Date(2018, 0, 13, 6, 20).getTime(), text: "WHAT!?" },
    { time: new Date(2018, 0, 13, 6, 40).getTime(), text: "Please, push this button..." },
    { time: new Date(2018, 0, 13, 7, 0).getTime(), text: "O.K." },
    { time: new Date(2018, 0, 13, 7, 30).getTime(), text: "" },
];

// updates all elements
function setTime() {
    var time = new Date(startTime + (endTime - startTime) * slider.start).getTime();;
    var roundedTime = am4core.time.round(new Date(time), "minute").getTime();

    if (roundedTime != currentTime) {
        currentTime = roundedTime;
        var count = lineSeries.dataItems.length;
        if (slider) {
            for (var i = 0; i < count; i++) {
                var dataItem = lineSeries.dataItems.getIndex(i);

                if (i < slider.start * count) {
                    dataItem.show(500, 0, ["valueY"]);
                }
                else {
                    dataItem.hide(500, 0, 0, ["valueY"]);
                }
            }
        }
    }

    // add some drama by zooming the map
    updateHands(new Date(time));

    var bombFlyDuration = cancelTime - launchTime;
    var bombPosition = (time - launchTime) / bombFlyDuration;
    bombPosition = Math.min(1, bombPosition);
    bombPosition = Math.max(0, bombPosition);

    var oPoint = line.positionToPoint(bombPosition);
    var geoPoint = mapChart.seriesPointToGeo(oPoint);
    bomb.latitude = geoPoint.latitude;
    bomb.longitude = geoPoint.longitude;
    bomb.rotation = oPoint.angle + 90;

    if (bombPosition > 0 && bombPosition < 1) {
        bomb.opacity = 1;
    }

    if ((bombPosition >= 1 && !exploded)) {
        bomb.opacity = 0;
        bang.opacity = 1;
        bang.animate({ property: "opacity", to: 0, from: 1 }, 1000);
        exploded = true;
    }

    if (exploded && bombPosition < 1) {
        exploded = false;
        bang.opacity = 0;
        bomb.opacity = 1;
    }

    if (bombPosition <= 0.001) {
        bomb.opacity = 0;
    }

    if (time > alertTime && time < cancelTime) {
        if (!bulletAlertCircle.visible) {
            bulletAlertCircle.visible = true;
            bulletAlertAnimation.resume();
        }
    }
    else {
        bulletAlertCircle.visible = false;
    }

    for (var i = 0; i < honoluluTexts.length; i++) {
        var honoluluText = honoluluTexts[i];
        if (time > honoluluText.time) {
            honoluluCircle.tooltipText = honoluluText.text;
        }
    }

    if (honoluluCircle.tooltipText) {
        honoluluCircle.showTooltip();
    }
    else {
        honoluluCircle.hideTooltip();
    }

    for (var i = 0; i < pyongyangTexts.length; i++) {
        var pyongyangText = pyongyangTexts[i];
        if (time > pyongyangText.time) {
            pyongyangCircle.tooltipText = pyongyangText.text;
        }
    }

    if (pyongyangCircle.tooltipText) {
        pyongyangCircle.showTooltip();
    }
    else {
        pyongyangCircle.hideTooltip();
    }
}


var chart = container.createChild(am4charts.XYChart);
chart.padding(0, 50, 50, 50);
var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
dateAxis.tooltip.background.pointerLength = 4;
dateAxis.tooltip.background.fillOpacity = 1;
dateAxis.tooltip.background.fill = am4core.color("#666666");
dateAxis.tooltip.background.stroke = dateAxis.tooltip.background.fill;


chart.height = 300;
chart.valign = "bottom";

var gradientFill = new am4core.LinearGradient();
gradientFill.addColor(am4core.color("#000000"), 0, 0);
gradientFill.addColor(am4core.color("#000000"), 1, 1);
gradientFill.rotation = 90;

chart.background.fill = gradientFill;

//dateAxis.renderer.inside = true;
dateAxis.renderer.ticks.template.disabled = true;
dateAxis.renderer.grid.template.strokeDasharray = "3,3";
dateAxis.renderer.grid.template.strokeOpacity = 0.2;
dateAxis.renderer.line.disabled = true;
dateAxis.tooltip.dateFormatter.dateFormat = "YYYY-MM-dd HH:mm";
dateAxis.renderer.inside = false;
dateAxis.renderer.labels.template.fillOpacity = 0.4;
dateAxis.renderer.minLabelPosition = 0.03;

var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
valueAxis.renderer.ticks.template.disabled = true;
valueAxis.min = -90;
valueAxis.max = 90;
valueAxis.renderer.minGridDistance = 20;
valueAxis.renderer.grid.template.disabled = true;
valueAxis.renderer.line.disabled = true;
valueAxis.tooltip.disabled = true;
valueAxis.strictMinMax = true;
valueAxis.renderer.labels.template.fillOpacity = 0.4;
valueAxis.renderer.inside = true;

var lineSeries = chart.series.push(new am4charts.LineSeries());
lineSeries.dataFields.valueY = "value";
lineSeries.dataFields.dateX = "time";
lineSeries.tooltipText = "{valueY.workingValue}%";
lineSeries.stroke = am4core.color("#3f2698");
lineSeries.tooltip.background.fillOpacity = 0;
lineSeries.tooltip.autoTextColor = false;
lineSeries.tooltip.label.fill = am4core.color("#ffffff");
lineSeries.tooltip.filters.clear();
lineSeries.tooltip.pointerOrientation = "vertical";
lineSeries.strokeWidth = 2;
lineSeries.tensionX = 0.7;

var negativeRange = valueAxis.createSeriesRange(lineSeries);
negativeRange.value = 0;
negativeRange.endValue = - 100;
negativeRange.contents.stroke = am4core.color("#84279a");
negativeRange.contents.fill = negativeRange.contents.stroke;

chart.dateFormatter.inputDateFormat = "yyyy-MM-dd HH:mm";

chart.cursor = new am4charts.XYCursor();
chart.cursor.behavior = "none";
chart.cursor.xAxis = dateAxis;
chart.cursor.lineX.strokeOpacity = 0;

chart.events.on("ready", function () {
    createSlider();
})

var slider;

var alertStart = dateAxis.axisRanges.create();
alertStart.date = new Date(alertTime);
alertStart.grid.stroke = am4core.color("#ffffff");
alertStart.grid.strokeWidth = 1;
alertStart.grid.strokeOpacity = 0.5;
alertStart.grid.strokeDasharray = undefined;
alertStart.label.text = "Citizens alerted";
alertStart.label.horizontalCenter = "right";
alertStart.label.fillOpacity = 0.7;
alertStart.label.dy = -215;

var alertCanceled = dateAxis.axisRanges.create();
alertCanceled.date = new Date(cancelTime);
alertCanceled.grid.stroke = am4core.color("#ffffff");
alertCanceled.grid.strokeOpacity = 0.5;
alertCanceled.grid.strokeDasharray = undefined;
alertCanceled.label.text = "Alert canceled";
alertCanceled.label.dy = -215;
alertCanceled.label.fillOpacity = 0.7;
alertCanceled.label.horizontalCenter = "left";

var playButton;

function createSlider() {
    var sliderContainer = container.createChild(am4core.Container);

    sliderContainer.width = am4core.percent(100);
    sliderContainer.valign = "bottom";
    sliderContainer.padding(0, 50, 25, 50);
    sliderContainer.layout = "horizontal";
    sliderContainer.height = 50;


    playButton = sliderContainer.createChild(am4core.PlayButton);
    playButton.valign = "middle";
    playButton.events.on("toggled", function (event) {
        if (event.target.isActive) {
            play();
        }
        else {
            stop();
        }
    })

    slider = sliderContainer.createChild(am4core.Slider);
    slider.valign = "middle";
    slider.margin(0, 0, 0, 0);
    slider.marginLeft = 30;
    slider.height = 15;
    slider.events.on("rangechanged", function () {
        setTime();
    });

    slider.startGrip.events.on("drag", function () {
        stop();
        sliderAnimation.setProgress(slider.start);
    });

    sliderAnimation = slider.animate({ property: "start", to: 1 }, 50000, am4core.ease.linear).pause();
    sliderAnimation.events.on("animationended", function () {
        playButton.isActive = false;
    })
}


var sliderAnimation;

function play() {
    if (slider) {
        if (slider.start >= 1) {
            slider.start = 0;
            sliderAnimation.start();
        }
        sliderAnimation.resume();
        playButton.isActive = true;
    }
}

function stop() {
    sliderAnimation.pause();
    playButton.isActive = false;
}

setTimeout(function () {
    play()
}, 2000);

var label = container.createChild(am4core.Label);
label.text = "Website traffic in Hawaii during January 13, 2018 false ballistic missile alert";
label.valign = "bottom";
label.padding(0, 50, 10, 0);
label.align = "right";

chart.data = [{ "time": "2018-01-13 06:00", "value": 0 },
{ "time": "2018-01-13 06:01", "value": -4 },
{ "time": "2018-01-13 06:02", "value": -16 },
{ "time": "2018-01-13 06:03", "value": -5 },
{ "time": "2018-01-13 06:04", "value": 12 },
{ "time": "2018-01-13 06:05", "value": -4 },
{ "time": "2018-01-13 06:06", "value": -5 },
{ "time": "2018-01-13 06:07", "value": -8 },
{ "time": "2018-01-13 06:08", "value": -2 },
{ "time": "2018-01-13 06:09", "value": -14 },
{ "time": "2018-01-13 06:10", "value": 15 },
{ "time": "2018-01-13 06:11", "value": 0 },
{ "time": "2018-01-13 06:12", "value": -14 },
{ "time": "2018-01-13 06:13", "value": -13 },
{ "time": "2018-01-13 06:14", "value": 2 },
{ "time": "2018-01-13 06:15", "value": 10 },
{ "time": "2018-01-13 06:16", "value": 11 },
{ "time": "2018-01-13 06:17", "value": 13 },
{ "time": "2018-01-13 06:18", "value": -11 },
{ "time": "2018-01-13 06:19", "value": 0 },
{ "time": "2018-01-13 06:20", "value": -10 },
{ "time": "2018-01-13 06:21", "value": 0 },
{ "time": "2018-01-13 06:22", "value": -21 },
{ "time": "2018-01-13 06:23", "value": -9 },
{ "time": "2018-01-13 06:24", "value": -11 },
{ "time": "2018-01-13 06:25", "value": -7 },
{ "time": "2018-01-13 06:26", "value": -14 },
{ "time": "2018-01-13 06:27", "value": 0 },
{ "time": "2018-01-13 06:28", "value": -9 },
{ "time": "2018-01-13 06:29", "value": 12 },
{ "time": "2018-01-13 06:30", "value": 7 },
{ "time": "2018-01-13 06:31", "value": 10 },
{ "time": "2018-01-13 06:32", "value": 5 },
{ "time": "2018-01-13 06:33", "value": 12 },
{ "time": "2018-01-13 06:34", "value": 13 },
{ "time": "2018-01-13 06:35", "value": 10 },
{ "time": "2018-01-13 06:36", "value": -14 },
{ "time": "2018-01-13 06:37", "value": -12 },
{ "time": "2018-01-13 06:38", "value": -8 },
{ "time": "2018-01-13 06:39", "value": -13 },
{ "time": "2018-01-13 06:40", "value": -13 },
{ "time": "2018-01-13 06:41", "value": -12 },
{ "time": "2018-01-13 06:42", "value": -11 },
{ "time": "2018-01-13 06:43", "value": 9 },
{ "time": "2018-01-13 06:44", "value": 0 },
{ "time": "2018-01-13 06:45", "value": -4 },
{ "time": "2018-01-13 06:46", "value": -6 },
{ "time": "2018-01-13 06:47", "value": -7 },
{ "time": "2018-01-13 06:48", "value": -12 },
{ "time": "2018-01-13 06:49", "value": -8 },
{ "time": "2018-01-13 06:50", "value": -7 },
{ "time": "2018-01-13 06:51", "value": 9 },
{ "time": "2018-01-13 06:52", "value": 10 },
{ "time": "2018-01-13 06:53", "value": 12 },
{ "time": "2018-01-13 06:54", "value": -4 },
{ "time": "2018-01-13 06:55", "value": 3 },
{ "time": "2018-01-13 06:56", "value": 9 },
{ "time": "2018-01-13 06:57", "value": -2 },
{ "time": "2018-01-13 06:58", "value": 7 },
{ "time": "2018-01-13 06:59", "value": 5 },
{ "time": "2018-01-13 07:00", "value": 8 },
{ "time": "2018-01-13 07:01", "value": -1 },
{ "time": "2018-01-13 07:02", "value": 1 },
{ "time": "2018-01-13 07:03", "value": -6 },
{ "time": "2018-01-13 07:04", "value": 0 },
{ "time": "2018-01-13 07:05", "value": -7 },
{ "time": "2018-01-13 07:06", "value": 3 },
{ "time": "2018-01-13 07:07", "value": 7 },
{ "time": "2018-01-13 07:08", "value": 2 },
{ "time": "2018-01-13 07:09", "value": -6 },
{ "time": "2018-01-13 07:10", "value": 2 },
{ "time": "2018-01-13 07:11", "value": -3 },
{ "time": "2018-01-13 07:12", "value": -8 },
{ "time": "2018-01-13 07:13", "value": -15 },
{ "time": "2018-01-13 07:14", "value": -3 },
{ "time": "2018-01-13 07:15", "value": -17 },
{ "time": "2018-01-13 07:16", "value": -8 },
{ "time": "2018-01-13 07:17", "value": -4 },
{ "time": "2018-01-13 07:18", "value": 0 },
{ "time": "2018-01-13 07:19", "value": -6 },
{ "time": "2018-01-13 07:20", "value": -5 },
{ "time": "2018-01-13 07:21", "value": -16 },
{ "time": "2018-01-13 07:22", "value": -8 },
{ "time": "2018-01-13 07:23", "value": -23 },
{ "time": "2018-01-13 07:24", "value": -9 },
{ "time": "2018-01-13 07:25", "value": -9 },
{ "time": "2018-01-13 07:26", "value": -11 },
{ "time": "2018-01-13 07:27", "value": -12 },
{ "time": "2018-01-13 07:28", "value": -13 },
{ "time": "2018-01-13 07:29", "value": -11 },
{ "time": "2018-01-13 07:30", "value": -14 },
{ "time": "2018-01-13 07:31", "value": -10 },
{ "time": "2018-01-13 07:32", "value": -4 },
{ "time": "2018-01-13 07:33", "value": -17 },
{ "time": "2018-01-13 07:34", "value": 0 },
{ "time": "2018-01-13 07:35", "value": 12 },
{ "time": "2018-01-13 07:36", "value": -11 },
{ "time": "2018-01-13 07:37", "value": 5 },
{ "time": "2018-01-13 07:38", "value": -4 },
{ "time": "2018-01-13 07:39", "value": 4 },
{ "time": "2018-01-13 07:40", "value": 1 },
{ "time": "2018-01-13 07:41", "value": -3 },
{ "time": "2018-01-13 07:42", "value": 4 },
{ "time": "2018-01-13 07:43", "value": -1 },
{ "time": "2018-01-13 07:44", "value": 0 },
{ "time": "2018-01-13 07:45", "value": 1 },
{ "time": "2018-01-13 07:46", "value": 1 },
{ "time": "2018-01-13 07:47", "value": 0 },
{ "time": "2018-01-13 07:48", "value": -5 },
{ "time": "2018-01-13 07:49", "value": 8 },
{ "time": "2018-01-13 07:50", "value": 7 },
{ "time": "2018-01-13 07:51", "value": -1 },
{ "time": "2018-01-13 07:52", "value": 10 },
{ "time": "2018-01-13 07:53", "value": 10 },
{ "time": "2018-01-13 07:54", "value": -10 },
{ "time": "2018-01-13 07:55", "value": -6 },
{ "time": "2018-01-13 07:56", "value": 0 },
{ "time": "2018-01-13 07:57", "value": 2 },
{ "time": "2018-01-13 07:58", "value": -10 },
{ "time": "2018-01-13 07:59", "value": 0 },
{ "time": "2018-01-13 08:00", "value": -12 },
{ "time": "2018-01-13 08:01", "value": -1 },
{ "time": "2018-01-13 08:02", "value": 0 },
{ "time": "2018-01-13 08:03", "value": 0 },
{ "time": "2018-01-13 08:04", "value": 0 },
{ "time": "2018-01-13 08:05", "value": 0 },
{ "time": "2018-01-13 08:06", "value": 0 },
{ "time": "2018-01-13 08:07", "value": 0 },
{ "time": "2018-01-13 08:08", "value": -47 },
{ "time": "2018-01-13 08:09", "value": -48 },
{ "time": "2018-01-13 08:10", "value": -54 },
{ "time": "2018-01-13 08:11", "value": -60 },
{ "time": "2018-01-13 08:12", "value": -44 },
{ "time": "2018-01-13 08:13", "value": -55 },
{ "time": "2018-01-13 08:14", "value": -56 },
{ "time": "2018-01-13 08:15", "value": -62 },
{ "time": "2018-01-13 08:16", "value": -62 },
{ "time": "2018-01-13 08:17", "value": -58 },
{ "time": "2018-01-13 08:18", "value": -56 },
{ "time": "2018-01-13 08:19", "value": -63 },
{ "time": "2018-01-13 08:20", "value": -58 },
{ "time": "2018-01-13 08:21", "value": -63 },
{ "time": "2018-01-13 08:22", "value": -62 },
{ "time": "2018-01-13 08:23", "value": -77 },
{ "time": "2018-01-13 08:24", "value": -69 },
{ "time": "2018-01-13 08:25", "value": -62 },
{ "time": "2018-01-13 08:26", "value": -68 },
{ "time": "2018-01-13 08:27", "value": -68 },
{ "time": "2018-01-13 08:28", "value": -63 },
{ "time": "2018-01-13 08:29", "value": -55 },
{ "time": "2018-01-13 08:30", "value": -54 },
{ "time": "2018-01-13 08:31", "value": -58 },
{ "time": "2018-01-13 08:32", "value": -61 },
{ "time": "2018-01-13 08:33", "value": -64 },
{ "time": "2018-01-13 08:34", "value": -53 },
{ "time": "2018-01-13 08:35", "value": -52 },
{ "time": "2018-01-13 08:36", "value": -47 },
{ "time": "2018-01-13 08:37", "value": -55 },
{ "time": "2018-01-13 08:38", "value": -48 },
{ "time": "2018-01-13 08:39", "value": -47 },
{ "time": "2018-01-13 08:40", "value": -32 },
{ "time": "2018-01-13 08:41", "value": -42 },
{ "time": "2018-01-13 08:42", "value": -41 },
{ "time": "2018-01-13 08:43", "value": -34 },
{ "time": "2018-01-13 08:44", "value": -40 },
{ "time": "2018-01-13 08:45", "value": -49 },
{ "time": "2018-01-13 08:46", "value": -38 },
{ "time": "2018-01-13 08:47", "value": -33 },
{ "time": "2018-01-13 08:48", "value": -39 },
{ "time": "2018-01-13 08:49", "value": -28 },
{ "time": "2018-01-13 08:50", "value": -38 },
{ "time": "2018-01-13 08:51", "value": -39 },
{ "time": "2018-01-13 08:52", "value": -35 },
{ "time": "2018-01-13 08:53", "value": -30 },
{ "time": "2018-01-13 08:54", "value": -13 },
{ "time": "2018-01-13 08:55", "value": -15 },
{ "time": "2018-01-13 08:56", "value": -17 },
{ "time": "2018-01-13 08:57", "value": -17 },
{ "time": "2018-01-13 08:58", "value": -14 },
{ "time": "2018-01-13 08:59", "value": -5 },
{ "time": "2018-01-13 09:00", "value": 13 },
{ "time": "2018-01-13 09:01", "value": 48 },
{ "time": "2018-01-13 09:02", "value": 33 },
{ "time": "2018-01-13 09:03", "value": 32 },
{ "time": "2018-01-13 09:04", "value": 22 },
{ "time": "2018-01-13 09:05", "value": 38 },
{ "time": "2018-01-13 09:06", "value": 9 },
{ "time": "2018-01-13 09:07", "value": 28 },
{ "time": "2018-01-13 09:08", "value": 21 },
{ "time": "2018-01-13 09:09", "value": 32 },
{ "time": "2018-01-13 09:10", "value": 16 },
{ "time": "2018-01-13 09:11", "value": 22 },
{ "time": "2018-01-13 09:12", "value": 17 },
{ "time": "2018-01-13 09:13", "value": 32 },
{ "time": "2018-01-13 09:14", "value": 12 },
{ "time": "2018-01-13 09:15", "value": 11 },
{ "time": "2018-01-13 09:16", "value": 18 },
{ "time": "2018-01-13 09:17", "value": 19 },
{ "time": "2018-01-13 09:18", "value": 15 },
{ "time": "2018-01-13 09:19", "value": -7 },
{ "time": "2018-01-13 09:20", "value": 6 },
{ "time": "2018-01-13 09:21", "value": 7 },
{ "time": "2018-01-13 09:22", "value": 13 },
{ "time": "2018-01-13 09:23", "value": 14 },
{ "time": "2018-01-13 09:24", "value": 11 },
{ "time": "2018-01-13 09:25", "value": 15 },
{ "time": "2018-01-13 09:26", "value": -5 },
{ "time": "2018-01-13 09:27", "value": 6 },
{ "time": "2018-01-13 09:28", "value": 10 },
{ "time": "2018-01-13 09:29", "value": 24 },
{ "time": "2018-01-13 09:30", "value": -11 },
{ "time": "2018-01-13 09:31", "value": -8 },
{ "time": "2018-01-13 09:32", "value": -13 },
{ "time": "2018-01-13 09:33", "value": 3 },
{ "time": "2018-01-13 09:34", "value": -1 },
{ "time": "2018-01-13 09:35", "value": 6 },
{ "time": "2018-01-13 09:36", "value": 7 },
{ "time": "2018-01-13 09:37", "value": 7 },
{ "time": "2018-01-13 09:38", "value": 8 },
{ "time": "2018-01-13 09:39", "value": 10 },
{ "time": "2018-01-13 09:40", "value": -12 },
{ "time": "2018-01-13 09:41", "value": -6 },
{ "time": "2018-01-13 09:42", "value": -10 },
{ "time": "2018-01-13 09:43", "value": 2 },
{ "time": "2018-01-13 09:44", "value": -6 },
{ "time": "2018-01-13 09:45", "value": -5 },
{ "time": "2018-01-13 09:46", "value": -9 },
{ "time": "2018-01-13 09:47", "value": -12 },
{ "time": "2018-01-13 09:48", "value": -6 },
{ "time": "2018-01-13 09:49", "value": -10 },
{ "time": "2018-01-13 09:50", "value": 2 },
{ "time": "2018-01-13 09:51", "value": -6 },
{ "time": "2018-01-13 09:52", "value": -5 },
{ "time": "2018-01-13 09:53", "value": -9 },
{ "time": "2018-01-13 09:54", "value": -12 },
{ "time": "2018-01-13 09:55", "value": -6 },
{ "time": "2018-01-13 09:56", "value": -16 },
{ "time": "2018-01-13 09:57", "value": 2 },
{ "time": "2018-01-13 09:58", "value": -6 },
{ "time": "2018-01-13 09:59", "value": -5 },
{ "time": "2018-01-13 10:00", "value": -20 },
{ "time": "2018-01-13 10:01", "value": -12 },
{ "time": "2018-01-13 10:02", "value": 8 },
{ "time": "2018-01-13 10:03", "value": -10 },
{ "time": "2018-01-13 10:04", "value": -20 },
{ "time": "2018-01-13 10:05", "value": -6 },
{ "time": "2018-01-13 10:06", "value": -5 },
{ "time": "2018-01-13 10:07", "value": -9 },
{ "time": "2018-01-13 10:08", "value": -5 },
{ "time": "2018-01-13 10:09", "value": 9 },
{ "time": "2018-01-13 10:10", "value": 2 },
{ "time": "2018-01-13 10:11", "value": -8 },
{ "time": "2018-01-13 10:12", "value": 10 },
{ "time": "2018-01-13 10:13", "value": 4 },
{ "time": "2018-01-13 10:14", "value": -1 },
{ "time": "2018-01-13 10:15", "value": 3 },
{ "time": "2018-01-13 10:16", "value": -5 },
{ "time": "2018-01-13 10:17", "value": -1 },
{ "time": "2018-01-13 10:18", "value": -4 },
{ "time": "2018-01-13 10:19", "value": 0 },
{ "time": "2018-01-13 10:20", "value": 4 },
{ "time": "2018-01-13 10:21", "value": 5 },
{ "time": "2018-01-13 10:22", "value": 6 },
{ "time": "2018-01-13 10:23", "value": 20 },
{ "time": "2018-01-13 10:24", "value": 12 },
{ "time": "2018-01-13 10:25", "value": 8 },
{ "time": "2018-01-13 10:26", "value": 3 },
{ "time": "2018-01-13 10:27", "value": 2 },
{ "time": "2018-01-13 10:28", "value": 0 },
{ "time": "2018-01-13 10:29", "value": -3 },
{ "time": "2018-01-13 10:30", "value": 0 },
{ "time": "2018-01-13 10:31", "value": 4 },
{ "time": "2018-01-13 10:32", "value": 5 },
{ "time": "2018-01-13 10:33", "value": 3 },
{ "time": "2018-01-13 10:34", "value": 13 },
{ "time": "2018-01-13 10:35", "value": 16 },
{ "time": "2018-01-13 10:36", "value": 12 },
{ "time": "2018-01-13 10:37", "value": 11 },
{ "time": "2018-01-13 10:38", "value": 3 },
{ "time": "2018-01-13 10:39", "value": 13 },
{ "time": "2018-01-13 10:40", "value": 16 },
{ "time": "2018-01-13 10:41", "value": 12 },
{ "time": "2018-01-13 10:42", "value": 11 },
{ "time": "2018-01-13 10:43", "value": 3 },
{ "time": "2018-01-13 10:44", "value": 13 },
{ "time": "2018-01-13 10:45", "value": 22 },
{ "time": "2018-01-13 10:46", "value": 18 },
{ "time": "2018-01-13 10:47", "value": 22 },
{ "time": "2018-01-13 10:48", "value": 3 },
{ "time": "2018-01-13 10:49", "value": 13 },
{ "time": "2018-01-13 10:50", "value": 6 },
{ "time": "2018-01-13 10:51", "value": 12 },
{ "time": "2018-01-13 10:52", "value": 11 },
{ "time": "2018-01-13 10:53", "value": 3 },
{ "time": "2018-01-13 10:54", "value": 24 },
{ "time": "2018-01-13 10:55", "value": 2 },
{ "time": "2018-01-13 10:56", "value": -1 },
{ "time": "2018-01-13 10:57", "value": 2 },
{ "time": "2018-01-13 10:58", "value": -10 },
{ "time": "2018-01-13 10:59", "value": -5 },
{ "time": "2018-01-13 11:00", "value": -11 },
{ "time": "2018-01-13 11:01", "value": 4 },
{ "time": "2018-01-13 11:02", "value": 0 },
{ "time": "2018-01-13 11:03", "value": 5 },
{ "time": "2018-01-13 11:04", "value": -4 },
{ "time": "2018-01-13 11:05", "value": -19 },
{ "time": "2018-01-13 11:06", "value": 4 },
{ "time": "2018-01-13 11:07", "value": -1 },
{ "time": "2018-01-13 11:08", "value": 3 },
{ "time": "2018-01-13 11:09", "value": -5 },
{ "time": "2018-01-13 11:10", "value": -3 },
{ "time": "2018-01-13 11:11", "value": -10 },
{ "time": "2018-01-13 11:12", "value": -8 },
{ "time": "2018-01-13 11:13", "value": -10 },
{ "time": "2018-01-13 11:14", "value": 2 },
{ "time": "2018-01-13 11:15", "value": -10 },
{ "time": "2018-01-13 11:16", "value": 14 },
{ "time": "2018-01-13 11:17", "value": 16 },
{ "time": "2018-01-13 11:18", "value": 8 },
{ "time": "2018-01-13 11:19", "value": 12 },
{ "time": "2018-01-13 11:20", "value": 6 },
{ "time": "2018-01-13 11:21", "value": 17 },
{ "time": "2018-01-13 11:22", "value": 14 },
{ "time": "2018-01-13 11:23", "value": -15 },
{ "time": "2018-01-13 11:24", "value": -14 },
{ "time": "2018-01-13 11:25", "value": -8 },
{ "time": "2018-01-13 11:26", "value": -6 },
{ "time": "2018-01-13 11:27", "value": -3 },
{ "time": "2018-01-13 11:28", "value": -16 },
{ "time": "2018-01-13 11:29", "value": -8 },
{ "time": "2018-01-13 11:30", "value": 10 },
{ "time": "2018-01-13 11:31", "value": -8 },
{ "time": "2018-01-13 11:32", "value": -6 },
{ "time": "2018-01-13 11:33", "value": -3 },
{ "time": "2018-01-13 11:34", "value": 0 },
{ "time": "2018-01-13 11:35", "value": 4 },
{ "time": "2018-01-13 11:36", "value": -11 },
{ "time": "2018-01-13 11:37", "value": -8 },
{ "time": "2018-01-13 11:38", "value": -3 },
{ "time": "2018-01-13 11:39", "value": -2 },
{ "time": "2018-01-13 11:40", "value": -15 },
{ "time": "2018-01-13 11:41", "value": 9 },
{ "time": "2018-01-13 11:42", "value": 0 },
{ "time": "2018-01-13 11:43", "value": -1 },
{ "time": "2018-01-13 11:44", "value": -5 },
{ "time": "2018-01-13 11:45", "value": -1 },
{ "time": "2018-01-13 11:46", "value": -7 },
{ "time": "2018-01-13 11:47", "value": -4 },
{ "time": "2018-01-13 11:48", "value": -7 },
{ "time": "2018-01-13 11:49", "value": -8 },
{ "time": "2018-01-13 11:50", "value": -7 },
{ "time": "2018-01-13 11:51", "value": -6 },
{ "time": "2018-01-13 11:52", "value": -5 },
{ "time": "2018-01-13 11:53", "value": -6 },
{ "time": "2018-01-13 11:54", "value": 1 },
{ "time": "2018-01-13 11:55", "value": -3 },
{ "time": "2018-01-13 11:56", "value": 10 },
{ "time": "2018-01-13 11:57", "value": 15 },
{ "time": "2018-01-13 11:58", "value": 0 },
{ "time": "2018-01-13 11:59", "value": 0 }];
