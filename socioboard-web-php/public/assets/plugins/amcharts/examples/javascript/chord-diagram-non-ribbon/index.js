am4core.useTheme(am4themes_animated);

var chart = am4core.create("chartdiv", am4charts.ChordDiagram);


var data = [];
var letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

function randomLetter(except) {
    var letter = letters[Math.floor(Math.random() * letters.length - 1)];
    if (letter == except) {
        return randomLetter(except);
    }
    else {
        return letter;
    }
}

for (var i = 0; i < letters.length; i++) {
    var fromLetter = letters[i];
    for (var o = 0; o < 3; o++) {
        data.push({ from: fromLetter, to: randomLetter(fromLetter), value: Math.round(Math.random() * 100) });
    }
}

chart.data = data;

chart.dataFields.fromName = "from";
chart.dataFields.toName = "to";
chart.dataFields.value = "value";
chart.nonRibbon = true;
chart.sortBy = "name";
chart.startAngle = 90;
chart.endAngle = 450;

var nodeTemplate = chart.nodes.template;
nodeTemplate.fill = am4core.color("#222222");
nodeTemplate.fillOpacity = 0.4;
nodeTemplate.slice.disabled = true;
nodeTemplate.setStateOnChildren = true;
nodeTemplate.label.disabled = true;

nodeTemplate.readerTitle = "Drag to rearrange";
nodeTemplate.showSystemTooltip = true;

var hoverState = nodeTemplate.states.create("hover");
hoverState.properties.fillOpacity = 1;

var linkTemplate = chart.links.template;
linkTemplate.opacity = 0.1;
linkTemplate.defaultState.properties.opacity = 0.1;
linkTemplate.tooltipText = "";

var linkHoverState = linkTemplate.states.create("hover");
linkHoverState.properties.opacity = 1;

nodeTemplate.events.on("over", function (event) {
    var node = event.target;
    node.outgoingDataItems.each(function (dataItem) {
        dataItem.link.isHover = true;
    })
})

nodeTemplate.events.on("out", function (event) {
    var node = event.target;
    node.outgoingDataItems.each(function (dataItem) {
        dataItem.link.isHover = false;
    })
})

var circleBullet = nodeTemplate.createChild(am4charts.CircleBullet);
circleBullet.setStateOnChildren = true;
circleBullet.circle.radius = 15;

var circleHoverState = circleBullet.states.create("hover");
circleHoverState.properties.scale = 1.5;

// we create a separate label as node.label ispositioned differently and doesn't fit perfectly for one-letter labels
var label = circleBullet.createChild(am4core.Label);
label.text = "{fromName}";
label.horizontalCenter = "middle";
label.verticalCenter = "middle";

var labelHoverState = label.states.create("hover");
labelHoverState.properties.fill = am4core.color("#ffffff");