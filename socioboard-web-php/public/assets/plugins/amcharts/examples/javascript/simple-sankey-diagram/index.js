am4core.useTheme(am4themes_animated);

var chart = am4core.create("chartdiv", am4charts.SankeyDiagram);


chart.data = [
    { from: "A", to: "D", value: 10 },
    { from: "B", to: "D", value: 8 },
    { from: "B", to: "E", value: 4 },
    { from: "C", to: "E", value: 3 },
    { from: "D", to: "G", value: 5 },
    { from: "D", to: "I", value: 2 },
    { from: "D", to: "H", value: 3 },
    { from: "E", to: "H", value: 6 },
    { from: "G", to: "J", value: 5 },
    { from: "I", to: "J", value: 1 },
    { from: "H", to: "J", value: 9 }
];

chart.dataFields.fromName = "from";
chart.dataFields.toName = "to";
chart.dataFields.value = "value";

// for right-most label to fit
chart.paddingRight = 30;

// make nodes draggable
var nodeTemplate = chart.nodes.template;
nodeTemplate.draggable = true;
nodeTemplate.inert = true;
nodeTemplate.readerTitle = "Drag to rearrange or click to show&hide";
nodeTemplate.showSystemTooltip = true;
nodeTemplate.width = 30;

var defaultState = nodeTemplate.background.defaultState;
var defaultDropShadow = defaultState.filters.push(new am4core.DropShadowFilter());
defaultDropShadow.opacity = 0;

var hoverState = nodeTemplate.background.states.create("hover");
var hoverDropShadow = hoverState.filters.push(new am4core.DropShadowFilter());
hoverDropShadow.dy = 0;