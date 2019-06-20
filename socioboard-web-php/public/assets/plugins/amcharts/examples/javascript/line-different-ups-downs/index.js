am4core.useTheme(am4themes_animated);

var chart = am4core.create("chartdiv", am4charts.XYChart);
chart.paddingRight = 20;

var data = [];
var visits = 10;
var previousValue;

for (var i = 0; i < 100; i++) {
    visits += Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 10);

    if(i > 0){
        // add color to previous data item depending on whether current value is less or more than previous value
        if(previousValue <= visits){
            data[i - 1].color = chart.colors.getIndex(0);
        }
        else{
            data[i - 1].color = chart.colors.getIndex(5);
        }
    }    
    
    data.push({ date: new Date(2018, 0, i + 1), value: visits });
    previousValue = visits;
}

chart.data = data;

var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
dateAxis.renderer.grid.template.location = 0;

var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
valueAxis.tooltip.disabled = true;
valueAxis.renderer.minWidth = 35;

var series = chart.series.push(new am4charts.LineSeries());
series.dataFields.dateX = "date";
series.dataFields.valueY = "value";
series.strokeWidth = 2;
series.tooltipText = "{valueY} (valueY.change}";

// set stroke property field
series.propertyFields.stroke = "color";

chart.cursor = new am4charts.XYCursor();

var scrollbarX = new am4core.Scrollbar();
chart.scrollbarX = scrollbarX;