am4core.useTheme(am4themes_animated);

// chart design inspired by Nicolas Rapp: https://nicolasrapp.com/studio/portfolio/cash-hoarders/
var chart = am4core.create("chartdiv", am4charts.SankeyDiagram);


chart.data = [
  { from: "Cash in the U.S.", color: "#00aea0"},
  { from: "Cash Overseas", color: "#000000"},

  { from: "Source", to: "Total non financial companies", value: 1768, color: "#5ea9e1", labelText: "[font-size:1.5em]2016 BREAKDOWN OF\nTHE U.S.CORPORATE CASH PILE\n\n[/]NON-FINANCIAL COMPANIES \n [bold]$1,768 Trillion[/b]", zIndex: 100 },

  { from: "Total non financial companies", to: "Non-tech companies", value: 907, color: "#5ea9e1", labelText: "NON-TECH COMPANIES\n [bold]$907 Billion[/]" },
  { from: "Total non financial companies", to: "Tech companies", value: 861, color: "#5ea9e1", labelText: "TECH COMPANIES\n [bold]861 Billion[/]" },

  { from: "Non-tech companies", to: "Cash in the U.S.", value: 324, color: "#5ea9e1", zIndex: 101 },
  { from: "Non-tech companies", to: "Cash Overseas", value: 584, color: "#5ea9e1" },

  { from: "Tech companies", to: "Rest of tech", value: 274, color: "#5ea9e1", labelText: "REST OF TECH\n[bold]$274 Billion[/]" },
  { from: "Tech companies", to: "Top 5 tech companies", value: 587, color: "#5ea9e1", labelText: "TOP 5 TECH COMPANIES\n[bold]$587 Billion[/]" },

  { from: "Rest of tech", to: "Cash in the U.S.", value: 74, color: "#5ea9e1", zIndex: 100 },
  { from: "Rest of tech", to: "Cash Overseas", value: 200, color: "#5ea9e1" },

  { from: "Top 5 tech companies", to: "Joytechs", value: 67, color: "#5ea9e1" },
  { from: "Joytechs", to: "Cash in the U.S.", value: 10, color: "#5ea9e1" },
  { from: "Joytechs", to: "Cash Overseas", value: 57, color: "#5ea9e1", center: "right", dy: -50, labelText: "JOYTECHS [bold]$67[/]B", labelLocation: 0, labelRotation: 0 },

  { from: "Top 5 tech companies", to: "Fireex", value: 68, color: "#5ea9e1" },
  { from: "Fireex", to: "Cash in the U.S.", value: 8, color: "#5ea9e1" },
  { from: "Fireex", to: "Cash Overseas", value: 60, color: "#5ea9e1", center: "right", dy: -50, labelText: "FIREEX [bold]$68[/]B", labelLocation: 0, labelRotation: 0 },

  { from: "Top 5 tech companies", to: "Globalworld", value: 85, color: "#5ea9e1" },
  { from: "Globalworld", to: "Cash in the U.S.", value: 10, color: "#5ea9e1" },
  { from: "Globalworld", to: "Cash Overseas", value: 75, color: "#5ea9e1", center: "right", dy: -50, labelText: "GLOBALWORLD [bold]$85[/]B", labelLocation: 0, labelRotation: 0 },

  { from: "Top 5 tech companies", to: "Betagate", value: 115, color: "#5ea9e1" },
  { from: "Betagate", to: "Cash in the U.S.", value: 10, color: "#5ea9e1" },
  { from: "Betagate", to: "Cash Overseas", value: 105, color: "#5ea9e1", center: "right", dy: -50, labelText: "BETAGATE [bold]$115[/]B", labelLocation: 0, labelRotation: 0 },

  { from: "Top 5 tech companies", to: "Apexi", value: 253, color: "#5ea9e1" },
  { from: "Apexi", to: "Cash in the U.S.", value: 23, color: "#5ea9e1" },
  { from: "Apexi", to: "Cash Overseas", value: 230, color: "#5ea9e1", center: "right", dy: -50, labelText: "APEXI [bold]$253[/]B", labelLocation: 0, labelRotation: 0 },

  { from: "Cash in the U.S.", color: "#00aea0", labelText: "CASH IN THE U.S.\n[bold]$460 BILLION", labelLocation: 0, value: 460, zIndex: 102, dy: -30 },
  { from: "Cash Overseas", color: "#000000", labelText: "[#5ea9e1 font-size:1.5em]CASH OVERSEAS\n[bold #5ea9e1 font-size:1.5em]$1,31 TRILLION", labelLocation: 0, value: 1310, dy: -30 }
];

chart.minNodeSize = 0.001;
chart.nodeAlign = "bottom";
chart.paddingLeft = 80;
chart.paddingRight = 80;
chart.dataFields.fromName = "from";
chart.dataFields.toName = "to";
chart.dataFields.value = "value";
chart.dataFields.color = "color";

chart.orientation = "vertical";
chart.sortBy = "none";

chart.nodes.template.clickable = false;

var linkTemplate = chart.links.template;
linkTemplate.colorMode = "gradient";
linkTemplate.fillOpacity = 0.95;

linkTemplate.cursorOverStyle = am4core.MouseCursorStyle.pointer;
linkTemplate.readerTitle = "drag me!";
linkTemplate.showSystemTooltip = true;
linkTemplate.tooltipText = "";
linkTemplate.propertyFields.zIndex = "zIndex";
linkTemplate.tension = 0.6;

//dragging
chart.links.template.events.on("down", function (event) {
  var fromNode = event.target.dataItem.fromNode;
  var toNode = event.target.dataItem.toNode;

  var distanceToFromNode = am4core.math.getDistance(event.pointer.point, { x: fromNode.pixelX, y: fromNode.pixelY });
  var distanceToToNode = Infinity;
  if (toNode) {
    distanceToToNode = am4core.math.getDistance(event.pointer.point, { x: toNode.pixelX, y: toNode.pixelY });
  }

  if (distanceToFromNode < distanceToToNode) {
    fromNode.dragStart(event.pointer);
  }
  else {
    toNode.dragStart(event.pointer);
  }
})

chart.nodes.template.draggable = true;
chart.nodes.template.inert = true;
chart.nodes.template.width = 0;
chart.nodes.template.height = 0;
chart.nodes.template.nameLabel.disabled = true;

var labelBullet = chart.links.template.bullets.push(new am4charts.LabelBullet());
labelBullet.label.propertyFields.text = "labelText";
labelBullet.propertyFields.locationX = "labelLocation";
labelBullet.propertyFields.rotation = "labelRotation";
labelBullet.label.rotation = -90;
labelBullet.propertyFields.dy = "dy";
labelBullet.label.propertyFields.horizontalCenter = "center";
labelBullet.label.textAlign = "middle";