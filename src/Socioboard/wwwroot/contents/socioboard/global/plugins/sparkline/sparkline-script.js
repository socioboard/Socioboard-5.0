// Bar chart ( New Clients)
$("#clients-bar").sparkline([70, 80, 65, 78, 58, 80, 78, 80, 70, 50, 75, 65, 80, 70, 65, 90], {
    type: 'bar',
    height: '25',
    width: '100%',
    barWidth: 10,
    barSpacing: 4,
    barColor: '#C7FCC9',
    negBarColor: '#81d4fa',
    zeroColor: '#81d4fa',
    //tooltipFormat: $.spformat('{{value}}', 'tooltip-class')
});

// Line chart ( New Invoice)
$("#invoice-line").sparkline([5, 6, 7, 9, 9, 5, 3, 2, 2, 4, 6, 7, 5, 6, 7, 9, 9, 5, 3, 2, 2, 4, 6, 7], {
    type: 'line',
    width: '100%',
    height: '25',
    lineWidth: 2,
    lineColor: '#E1D0FF',
    fillColor: 'rgba(103, 58, 183, 0.5)',
    highlightSpotColor: '#E1D0FF',
    highlightLineColor: '#E1D0FF',
    minSpotColor: '#f44336',
    maxSpotColor: '#4caf50',
    spotColor: '#E1D0FF',
    spotRadius: 4,
    
   // //tooltipFormat: $.spformat('{{value}}', 'tooltip-class')
});


// Tristate chart (Today Profit)
$("#profit-tristate").sparkline([2, 3, 0, 4, -5, -6, 7, -2, 3, 0, 2, 3, -1, 0, 2, 3], {
    type: 'tristate',
    width: '100%',
    height: '25',
    posBarColor: '#B9DBEC',
    negBarColor: '#C7EBFC',
    barWidth: 10,
    barSpacing: 4,
    zeroAxis: false,
    //tooltipFormat: $.spformat('{{value}}', 'tooltip-class')
});

// Bar + line composite charts (Total Sales)
$('#sales-compositebar').sparkline([4, 6, 7, 7, 4, 3, 2, 3, 1, 4, 6, 5, 9, 4, 6, 7, 7, 4], {
    type: 'bar',
    barColor: '#F6CAFD',
    height: '25',
    width: '100%',
    barWidth: '10',
    barSpacing: 2,
    //tooltipFormat: $.spformat('{{value}}', 'tooltip-class')
});
$('#sales-compositebar').sparkline([4, 1, 5, 7, 9, 9, 8, 8, 4, 2, 5, 6, 7], {
    composite: true,
    type: 'line',
    width: '100%',
    lineWidth: 2,
    lineColor: '#fff3e0',
    fillColor: 'rgba(153,114,181,0.3)',
    highlightSpotColor: '#fff3e0',
    highlightLineColor: '#fff3e0',
    minSpotColor: '#f44336',
    maxSpotColor: '#4caf50',
    spotColor: '#fff3e0',
    spotRadius: 4,
    //tooltipFormat: $.spformat('{{value}}', 'tooltip-class')
});


// Project Line chart ( Project Box )
$("#project-line-1").sparkline([5, 6, 7, 9, 9, 5, 3, 2, 2, 4, 6, 7, 5, 6, 7, 9, 9, 5, 3, 2, 2, 4, 6, 7], {
    type: 'line',
    width: '100%',
    height: '30',
    lineWidth: 2,
    lineColor: '#00bcd4',
    fillColor: 'rgba(0, 188, 212, 0.5)',
});

$("#project-line-2").sparkline([6, 7, 5, 6, 7, 9, 9, 5, 3, 2, 2, 4, 6, 7, 5, 6, 7, 9, 9, 5, 3, 2, 2, 4], {
    type: 'line',
    width: '100%',
    height: '30',
    lineWidth: 2,
    lineColor: '#00bcd4',
    fillColor: 'rgba(0, 188, 212, 0.5)',
    //tooltipFormat: $.spformat('{{value}}', 'tooltip-class')
});

$("#project-line-3").sparkline([2, 4, 6, 7, 5, 6, 7, 9, 5, 6, 7, 9, 9, 5, 3, 2, 9, 5, 3, 2, 2, 4, 6, 7], {
    type: 'line',
    width: '100%',
    height: '30',
    lineWidth: 2,
    lineColor: '#00bcd4',
    fillColor: 'rgba(0, 188, 212, 0.5)',
    //tooltipFormat: $.spformat('{{value}}', 'tooltip-class')
});

$("#project-line-4").sparkline([9, 5, 3, 2, 2, 4, 6, 7, 5, 6, 7, 9, 5, 6, 7, 9, 9, 5, 3, 2, 2, 4, 6, 7], {
    type: 'line',
    width: '100%',
    height: '30',
    lineWidth: 2,
    lineColor: '#00bcd4',
    fillColor: 'rgba(0, 188, 212, 0.5)',
    //tooltipFormat: $.spformat('{{value}}', 'tooltip-class')
});




// Sales chart (Sider Bar Chat)
$("#sales-line-1").sparkline([5, 6, 7, 9, 9, 5, 3, 2, 2, 4, 6], {
    type: 'line',
    height: '30',
    lineWidth: 2,
    lineColor: '#00bcd4',
    fillColor: 'rgba(0, 188, 212, 0.5)',
    //tooltipFormat: $.spformat('{{value}}', 'tooltip-class')
});

$("#sales-line-2").sparkline([6, 7, 5, 6, 7, 9, 9, 5, 3, 2, 2], {
    type: 'line',
    height: '30',
    lineWidth: 2,
    lineColor: '#00bcd4',
    fillColor: 'rgba(0, 188, 212, 0.5)',
    //tooltipFormat: $.spformat('{{value}}', 'tooltip-class')
});

$("#sales-bar-1").sparkline([2, 4, 6, 7, 5, 6, 7, 9, 5, 6, 7], {
    type: 'bar',
    height: '25',
    barWidth: 2,
    barSpacing: 1,
    barColor: '#4CAF50',
    //tooltipFormat: $.spformat('{{value}}', 'tooltip-class')
});

$("#sales-bar-2").sparkline([9, 5, 3, 2, 2, 4, 6, 7, 5, 6, 7], {
    type: 'bar',
    height: '25',
    barWidth: 2,
    barSpacing: 1,
    barColor: '#FF4081',
    //tooltipFormat: $.spformat('{{value}}', 'tooltip-class')
});


/*
Sparkline sample charts
*/


$("#bar-chart-sample").sparkline([70, 80, 65, 78, 58, 80, 78, 80, 70, 50, 75, 65, 80, 70], {
    type: 'bar',
    height: '100',
    width: '50%',
    barWidth: 20,
    barSpacing: 10,
    barColor: '#00BCD4',
    //tooltipFormat: $.spformat('{{value}}', 'tooltip-class')
});


$("#line-chart-sample").sparkline([5, 6, 7, 9, 9, 5, 3, 2, 2, 4, 6, 7, 5, 6, 7, 9, 9], {
    type: 'line',
    width: '50%',
    height: '100',
    lineWidth: 2,
    lineColor: '#ffcc80',
    fillColor: 'rgba(255, 152, 0, 0.5)',
    highlightSpotColor: '#ffcc80',
    highlightLineColor: '#ffcc80',
    minSpotColor: '#f44336',
    maxSpotColor: '#4caf50',
    spotColor: '#ffcc80',
    spotRadius: 4,
    //tooltipFormat: $.spformat('{{value}}', 'tooltip-class')
});


$("#pie-chart-sample").sparkline([50,60,80,110], {
    type: 'pie',
    width: '150',
    height: '150',
    //tooltipFormat: $.spformat('{{value}}', 'tooltip-class'),
    sliceColors: ['#f4511e','#ffea00','#c6ff00','#00e676','#1de9b6','#00e5ff','#651fff','#f50057']
});