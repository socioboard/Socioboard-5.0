am4core.useTheme(am4themes_animated);

// create chart
var chart = am4core.create("chartdiv", am4charts.GaugeChart);


chart.innerRadius = -15;

var axis = chart.xAxes.push(new am4charts.ValueAxis());
axis.min = 0;
axis.max = 100;
axis.strictMinMax = true;

var colorSet = new am4core.ColorSet();

var range0 = axis.axisRanges.create();
range0.value = 0;
range0.endValue = 50;
range0.axisFill.fillOpacity = 1;
range0.axisFill.fill = colorSet.getIndex(0);
range0.axisFill.zIndex = - 1;

var range1 = axis.axisRanges.create();
range1.value = 50;
range1.endValue = 80;
range1.axisFill.fillOpacity = 1;
range1.axisFill.fill = colorSet.getIndex(2);
range1.axisFill.zIndex = -1;

var range2 = axis.axisRanges.create();
range2.value = 80;
range2.endValue = 100;
range2.axisFill.fillOpacity = 1;
range2.axisFill.fill = colorSet.getIndex(4);
range2.axisFill.zIndex = -1;

var hand = chart.hands.push(new am4charts.ClockHand());

setInterval(function() {
    hand.showValue(Math.random() * 100, 1000, am4core.ease.cubicOut);
}, 2000);
