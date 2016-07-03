/*--------------------------------
         Vector maps
     --------------------------------*/
     
    $('#world-map-markers').vectorMap({
        map: 'world_mill_en',
        scaleColors: ['#1fb5ac', '#1fb5ac'],        
        normalizeFunction: 'polynomial',
        hoverOpacity: 0.7,
        hoverColor: false,
        regionsSelectable: true,
        markersSelectable: true,
        markersSelectableOne: true,
        updateSize: true,
        onRegionOver: function(event, code) {
            //console.log('region-over', code);
        },
        onRegionOut: function(event, code) {
            //console.log('region-out', code);
        },
        onRegionClick: function(event, code) {
            //console.log('region-click', code);
        },
        onRegionSelected: function(event, code, isSelected, selectedRegions) {
            //console.log('region-select', code, isSelected, selectedRegions);
            if (window.localStorage) {
                window.localStorage.setItem(
                    'jvectormap-selected-regions',
                    JSON.stringify(selectedRegions)
                );
            }
        },

        panOnDrag: true,

        focusOn: {
            x: 0.5,
            y: 0.5,
            scale: 1.2,
            animate: true
        },


        regionStyle: {
            initial: {
                fill: '#b2ebf2',
                'fill-opacity': 1,
                stroke: 'false',
                'stroke-width': 0,
                'stroke-opacity': 1
            },
            hover: {
                fill: '#e0f7fa',
                'fill-opacity': 1,
                cursor: 'pointer'
            },
            selected: {
                fill: '#80deea'
            },
            selectedHover: {}
        },

        markerStyle: {
            initial: {
                fill: '#ff4081',
                stroke: '#f8bbd0',
                r: 6
            },
            hover: {
                stroke: '#f8bbd0',
                "stroke-width": 3,
                cursor: 'pointer'
            },
            selected: {
                fill: '#f50057',
                "stroke-width": 0,
            },
        },
        backgroundColor: '#00bcd4',
        markers: [{
            latLng: [-38.41, -63.61],
            name: 'Argentina',            
        }, {
            latLng: [-25.27, 133.77],
            name: 'Australia'
        },  {
            latLng: [-14.23, -51.92],
            name: 'Brazil'
        }, {
            latLng: [56.13, -106.34],
            name: 'Canada'
        }, {
            latLng: [35.86, 104.19],
            name: 'China'
        }, {
            latLng: [46.22, 2.21],
            name: 'France'
        }, {
            latLng: [51.16, 10.45],
            name: 'Germany'
        }, {
            latLng: [20.59, 78.96],
            name: 'India'
        }, {
            latLng: [41.87, 12.56],
            name: 'Italy'
        }, {
            latLng: [4.21, 101.97],
            name: 'Malaysia'
        }, {
            latLng: [-40.90, 174.88],
            name: 'New Zealand'
        }]
    });