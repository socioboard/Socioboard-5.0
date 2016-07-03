//SIMPLE LINE CHART
new Chartist.Line('#ct1-chart', {
  labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  series: [
    [12, 9, 7, 8, 5],
    [2, 1, 3.5, 7, 3],
    [1, 3, 4, 5, 6]
  ]
}, {
  fullWidth: true,
  chartPadding: {
    right: 40
  }
});


//LINE CHART WITH AREA
new Chartist.Line('#ct2-chart-bar', {
  labels: [1, 2, 3, 4, 5, 6, 7, 8],
  series: [
    [5, 9, 7, 8, 5, 3, 5, 4]
  ]
}, {
  low: 0,
  showArea: true
});


//BI-POLAR LINE CHART WITH AREA ONLY
new Chartist.Line('#ct3-chart', {
  labels: [1, 2, 3, 4, 5, 6, 7, 8],
  series: [
    [1, 2, 3, 1, -2, 0, 1, 0],
    [-2, -1, -2, -1, -2.5, -1, -2, -1],
    [0, 0, 0, 1, 2, 2.5, 2, 1],
    [2.5, 2, 1, 0.5, 1, 0.5, -1, -2.5]
  ]
}, {
  high: 3,
  low: -3,
  showArea: true,
  showLine: false,
  showPoint: false,
  fullWidth: true,
  axisX: {
    showLabel: false,
    showGrid: false
  }
});


//ADVANCED SMIL ANIMATIONS
var chart = new Chartist.Line('#ct4-chart', {
  labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  series: [
    [12, 9, 7, 8, 5, 4, 6, 2, 3, 3, 4, 6],
    [4,  5, 3, 7, 3, 5, 5, 3, 4, 4, 5, 5],
    [5,  3, 4, 5, 6, 3, 3, 4, 5, 6, 3, 4],
    [3,  4, 5, 6, 7, 6, 4, 5, 6, 7, 6, 3]
  ]
}, {
  low: 0
});

// Let's put a sequence number aside so we can use it in the event callbacks
var seq = 0,
  delays = 80,
  durations = 500;

// Once the chart is fully created we reset the sequence
chart.on('created', function() {
  seq = 0;
});

// On each drawn element by Chartist we use the Chartist.Svg API to trigger SMIL animations
chart.on('draw', function(data) {
  seq++;

  if(data.type === 'line') {
    // If the drawn element is a line we do a simple opacity fade in. This could also be achieved using CSS3 animations.
    data.element.animate({
      opacity: {
        // The delay when we like to start the animation
        begin: seq * delays + 1000,
        // Duration of the animation
        dur: durations,
        // The value where the animation should start
        from: 0,
        // The value where it should end
        to: 1
      }
    });
  } else if(data.type === 'label' && data.axis === 'x') {
    data.element.animate({
      y: {
        begin: seq * delays,
        dur: durations,
        from: data.y + 100,
        to: data.y,
        // We can specify an easing function from Chartist.Svg.Easing
        easing: 'easeOutQuart'
      }
    });
  } else if(data.type === 'label' && data.axis === 'y') {
    data.element.animate({
      x: {
        begin: seq * delays,
        dur: durations,
        from: data.x - 100,
        to: data.x,
        easing: 'easeOutQuart'
      }
    });
  } else if(data.type === 'point') {
    data.element.animate({
      x1: {
        begin: seq * delays,
        dur: durations,
        from: data.x - 10,
        to: data.x,
        easing: 'easeOutQuart'
      },
      x2: {
        begin: seq * delays,
        dur: durations,
        from: data.x - 10,
        to: data.x,
        easing: 'easeOutQuart'
      },
      opacity: {
        begin: seq * delays,
        dur: durations,
        from: 0,
        to: 1,
        easing: 'easeOutQuart'
      }
    });
  } else if(data.type === 'grid') {
    // Using data.axis we get x or y which we can use to construct our animation definition objects
    var pos1Animation = {
      begin: seq * delays,
      dur: durations,
      from: data[data.axis.units.pos + '1'] - 30,
      to: data[data.axis.units.pos + '1'],
      easing: 'easeOutQuart'
    };

    var pos2Animation = {
      begin: seq * delays,
      dur: durations,
      from: data[data.axis.units.pos + '2'] - 100,
      to: data[data.axis.units.pos + '2'],
      easing: 'easeOutQuart'
    };

    var animations = {};
    animations[data.axis.units.pos + '1'] = pos1Animation;
    animations[data.axis.units.pos + '2'] = pos2Animation;
    animations['opacity'] = {
      begin: seq * delays,
      dur: durations,
      from: 0,
      to: 1,
      easing: 'easeOutQuart'
    };

    data.element.animate(animations);
  }
});

// For the sake of the example we update the chart every time it's created with a delay of 10 seconds
chart.on('created', function() {
  if(window.__exampleAnimateTimeout) {
    clearTimeout(window.__exampleAnimateTimeout);
    window.__exampleAnimateTimeout = null;
  }
  window.__exampleAnimateTimeout = setTimeout(chart.update.bind(chart), 12000);
});

//MULTI-LINE LABELS
new Chartist.Bar('#ct5-chart', {
  labels: ['First quarter of the year', 'Second quarter of the year', 'Third quarter of the year', 'Fourth quarter of the year'],
  series: [
    [60000, 40000, 80000, 70000],
    [40000, 30000, 70000, 65000],
    [8000, 3000, 10000, 6000]
  ]
}, {
  seriesBarDistance: 10,
  axisX: {
    offset: 60
  },
  axisY: {
    offset: 80,
    labelInterpolationFnc: function(value) {
      return value + ' CHF'
    },
    scaleMinSpace: 15
  }
});
//STACKED BAR CHART
new Chartist.Bar('#ct6-chart', {
  labels: ['Q1', 'Q2', 'Q3', 'Q4'],
  series: [
    [800000, 1200000, 1400000, 1300000],
    [200000, 400000, 500000, 300000],
    [100000, 200000, 400000, 600000]
  ]
}, {
  stackBars: true,
  axisY: {
    labelInterpolationFnc: function(value) {
      return (value / 1000) + 'k';
    }
  }
}).on('draw', function(data) {
  if(data.type === 'bar') {
    data.element.attr({
      style: 'stroke-width: 30px'
    });
  }
});


//SIMPLE PIE CHART
var data = {
  series: [5, 3, 4]
};

var sum = function(a, b) { return a + b };

new Chartist.Pie('#ct7-chart', data, {
  labelInterpolationFnc: function(value) {
    return Math.round(value / data.series.reduce(sum) * 100) + '%';
  }
});

//GAUGE CHART
new Chartist.Pie('#ct8-chart', {
  series: [20, 10, 30, 40]
}, {
  donut: true,
  donutWidth: 60,
  startAngle: 270,
  total: 200,
  showLabel: false
});