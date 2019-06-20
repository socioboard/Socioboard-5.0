/**
 * --------------------------------------------------------
 * This demo was created using amCharts V4 preview release.
 * 
 * V4 is the latest installement in amCharts data viz
 * library family, to be released in the first half of
 * 2018.
 *
 * For more information and documentation visit:
 * https://www.amcharts.com/docs/v4/
 * --------------------------------------------------------
 */


am4core.useTheme(am4themes_animated);
var chart = am4core.create("chartdiv", am4charts.ChordDiagram);


// colors of main characters
chart.colors.saturation = 0.45;
chart.colors.step = 3;
var colors = {
    Rachel:chart.colors.next(),
    Monica:chart.colors.next(),
    Phoebe:chart.colors.next(),
    Ross:chart.colors.next(),
    Joey:chart.colors.next(),
    Chandler:chart.colors.next()
}

// data was provided by: https://www.reddit.com/user/notrudedude

chart.data = [
// node property fields take data from data items where they are first mentioned, that's 
// why we add empty data items at the beginning and set colors here
{"from":"Monica", "image":"monica.png", "color":colors.Monica},
{"from":"Rachel", "image":"rachel.png", "color":colors.Rachel},
{"from":"Chandler", "image":"chandler.png", "color":colors.Chandler},
{"from":"Ross", "image":"ross.png", "color":colors.Ross},
{"from":"Joey", "color":colors.Joey, "image":"joey.png",},
{"from":"Phoebe", "image":"phoebe.png", "color":colors.Phoebe},

// real data
{"from":"Monica","to":"Rachel","value":4},
{"from":"Monica","to":"Chandler","value":113},
{"from":"Monica","to":"Ross","value":16},
{"from":"Monica","to":"Joey","value":9},
{"from":"Monica","to":"Phoebe","value":3},
{"from":"Monica","to":"Paul the wine guy","value":1},
{"from":"Monica","to":"Mr Geller","value":6},
{"from":"Monica","to":"Mrs Geller","value":5},
{"from":"Monica","to":"Aunt Lilian","value":1},
{"from":"Monica","to":"Nana","value":1},
{"from":"Monica","to":"Young Ethan","value":5},
{"from":"Monica","to":"Ben","value":3},
{"from":"Monica","to":"Fun Bobby","value":3},
{"from":"Monica","to":"Richard","value":16},
{"from":"Monica","to":"Mrs Green","value":1},
{"from":"Monica","to":"Paolo2","value":1},
{"from":"Monica","to":"Pete","value":10},
{"from":"Monica","to":"Chip","value":1},
{"from":"Monica","to":"Timothy (Burke)","value":1},
{"from":"Monica","to":"Emily","value":1},
{"from":"Monica","to":"Dr. Roger","value":3},
{"from":"Rachel","to":"Chandler","value":7},
{"from":"Rachel","to":"Ross","value":80},
{"from":"Rachel","to":"Joey","value":30},
{"from":"Rachel","to":"Phoebe","value":6},
{"from":"Rachel","to":"Paolo","value":5},
{"from":"Rachel","to":"Mr Geller","value":2},
{"from":"Rachel","to":"Mrs Geller","value":1},
{"from":"Rachel","to":"Barry","value":1},
{"from":"Rachel","to":"Dr Green","value":3},
{"from":"Rachel","to":"Mark3","value":1},
{"from":"Rachel","to":"Josh","value":2},
{"from":"Rachel","to":"Gunther","value":1},
{"from":"Rachel","to":"Joshua","value":3},
{"from":"Rachel","to":"Danny","value":1},
{"from":"Rachel","to":"Mr. Zelner","value":1},
{"from":"Rachel","to":"Paul Stevens","value":3},
{"from":"Rachel","to":"Tag","value":4},
{"from":"Rachel","to":"Melissa","value":1},
{"from":"Rachel","to":"Gavin","value":2},
{"from":"Chandler","to":"Joey","value":1},
{"from":"Chandler","to":"Phoebe","value":7},
{"from":"Chandler","to":"Aurora","value":2},
{"from":"Chandler","to":"Jill Goodacre","value":1},
{"from":"Chandler","to":"Janice","value":11},
{"from":"Chandler","to":"Mrs Bing","value":3},
{"from":"Chandler","to":"Nina","value":1},
{"from":"Chandler","to":"Susie","value":5},
{"from":"Chandler","to":"Mary Theresa","value":1},
{"from":"Chandler","to":"Ginger","value":2},
{"from":"Chandler","to":"Joanna","value":5},
{"from":"Chandler","to":"Kathy","value":7},
{"from":"Chandler","to":"Mr Bing","value":1},
{"from":"Ross","to":"Joey","value":3},
{"from":"Ross","to":"Phoebe","value":18},
{"from":"Ross","to":"Carol","value":10},
{"from":"Ross","to":"Mrs Geller","value":8},
{"from":"Ross","to":"Aunt Lilian","value":1},
{"from":"Ross","to":"Mrs Bing","value":3},
{"from":"Ross","to":"Celia","value":2},
{"from":"Ross","to":"Julie","value":6},
{"from":"Ross","to":"Ben","value":6},
{"from":"Ross","to":"Mrs Green","value":2},
{"from":"Ross","to":"Chloe","value":1},
{"from":"Ross","to":"Bonnie","value":4},
{"from":"Ross","to":"Messy Girl (Cheryl)","value":5},
{"from":"Ross","to":"Emily","value":12},
{"from":"Ross","to":"Jill","value":1},
{"from":"Ross","to":"Elizabeth","value":8},
{"from":"Ross","to":"Aunt Millie","value":2},
{"from":"Ross","to":"Mona","value":11},
{"from":"Ross","to":"Emma","value":7},
{"from":"Ross","to":"Charlie","value":10},
{"from":"Joey","to":"Phoebe","value":6},
{"from":"Joey","to":"Janice","value":1},
{"from":"Joey","to":"Lorraine","value":2},
{"from":"Joey","to":"Melanie","value":2},
{"from":"Joey","to":"Erica","value":2},
{"from":"Joey","to":"Mrs Green","value":1},
{"from":"Joey","to":"Kate","value":4},
{"from":"Joey","to":"Lauren","value":2},
{"from":"Joey","to":"Estelle","value":1},
{"from":"Joey","to":"Kathy","value":2},
{"from":"Joey","to":"Emily","value":4},
{"from":"Joey","to":"Katie","value":2},
{"from":"Joey","to":"Janine","value":9},
{"from":"Joey","to":"Erin","value":1},
{"from":"Joey","to":"Cecilia","value":3},
{"from":"Joey","to":"Charlie","value":3},
{"from":"Phoebe","to":"David","value":14},
{"from":"Phoebe","to":"Roger","value":1},
{"from":"Phoebe","to":"Duncan","value":1},
{"from":"Phoebe","to":"Rob Dohnen","value":2},
{"from":"Phoebe","to":"Ryan","value":5},
{"from":"Phoebe","to":"Malcom","value":1},
{"from":"Phoebe","to":"Robert","value":1},
{"from":"Phoebe","to":"Sergei","value":1},
{"from":"Phoebe","to":"Vince","value":2},
{"from":"Phoebe","to":"Jason","value":1},
{"from":"Phoebe","to":"Rick","value":2},
{"from":"Phoebe","to":"Gunther","value":1},
{"from":"Phoebe","to":"Gary","value":7},
{"from":"Phoebe","to":"Jake","value":2},
{"from":"Phoebe","to":"Eric","value":3},
{"from":"Phoebe","to":"Mike","value":18},
{"from":"Carol","to":"Ben","value":1},
{"from":"Carol","to":"Susan","value":1},
{"from":"Mr Geller","to":"Mrs Geller","value":3},
{"from":"Frank","to":"Alice","value":5}]



chart.dataFields.fromName = "from";
chart.dataFields.toName = "to";
chart.dataFields.value = "value";


chart.nodePadding = 0.5;
chart.minNodeSize = 0.01;
chart.startAngle = 80;
chart.endAngle = chart.startAngle + 360;
chart.sortBy = "value";

var nodeTemplate = chart.nodes.template;
nodeTemplate.readerTitle = "Click to show/hide or drag to rearrange";
nodeTemplate.showSystemTooltip = true;
nodeTemplate.propertyFields.fill = "color";
nodeTemplate.tooltipText = "{name}'s kisses: {total}";

// when rolled over the node, make all the links rolled-over
nodeTemplate.events.on("over", function (event) {    
    var node = event.target;
    node.outgoingDataItems.each(function (dataItem) {
        if(dataItem.toNode){
            dataItem.link.isHover = true;
            dataItem.toNode.label.isHover = true;
        }
    })
    node.incomingDataItems.each(function (dataItem) {
        if(dataItem.fromNode){
            dataItem.link.isHover = true;
            dataItem.fromNode.label.isHover = true;
        }
    }) 

    node.label.isHover = true;   
})

// when rolled out from the node, make all the links rolled-out
nodeTemplate.events.on("out", function (event) {
    var node = event.target;
    node.outgoingDataItems.each(function (dataItem) {        
        if(dataItem.toNode){
            dataItem.link.isHover = false;                
            dataItem.toNode.label.isHover = false;
        }
    })
    node.incomingDataItems.each(function (dataItem) {
        if(dataItem.fromNode){
            dataItem.link.isHover = false;
           dataItem.fromNode.label.isHover = false;
        }
    })

    node.label.isHover = false;
})

var label = nodeTemplate.label;
label.relativeRotation = 90;

label.fillOpacity = 0.25;
var labelHS = label.states.create("hover");
labelHS.properties.fillOpacity = 1;

nodeTemplate.cursorOverStyle = am4core.MouseCursorStyle.pointer;
// this adapter makes non-main character nodes to be filled with color of the main character which he/she kissed most
nodeTemplate.adapter.add("fill", function (fill, target) {
    var node = target;
    var counters = {};
    var mainChar = false;
    node.incomingDataItems.each(function (dataItem) {
        if(colors[dataItem.toName]){
            mainChar = true;
        }

        if(isNaN(counters[dataItem.fromName])){
            counters[dataItem.fromName] = dataItem.value;
        }
        else{
            counters[dataItem.fromName] += dataItem.value;
        }
    })
    if(mainChar){
        return fill;
    }

    var count = 0;
    var color;
    var biggest = 0;
    var biggestName;

    for(var name in counters){
        if(counters[name] > biggest){
            biggestName = name;
            biggest = counters[name]; 
        }        
    }
    if(colors[biggestName]){
        fill = colors[biggestName];
    }
  
    return fill;
})

// link template
var linkTemplate = chart.links.template;
linkTemplate.strokeOpacity = 0;
linkTemplate.fillOpacity = 0.1;
linkTemplate.tooltipText = "{fromName} & {toName}:{value.value}";

var hoverState = linkTemplate.states.create("hover");
hoverState.properties.fillOpacity = 0.7;
hoverState.properties.strokeOpacity = 0.7;

// data credit label
var creditLabel = chart.chartContainer.createChild(am4core.TextLink);
creditLabel.text = "Data source: notrudedude";
creditLabel.url = "https://www.reddit.com/user/notrudedude";
creditLabel.y = am4core.percent(99);
creditLabel.x = am4core.percent(99);
creditLabel.horizontalCenter = "right";
creditLabel.verticalCenter = "bottom";

var titleImage = chart.chartContainer.createChild(am4core.Image);
titleImage.href = "whokissed.png";
titleImage.x = 30
titleImage.y = 30;
titleImage.width = 200;
titleImage.height = 200;