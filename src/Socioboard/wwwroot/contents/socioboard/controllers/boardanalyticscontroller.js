'use strict';

SocioboardApp.controller('BoardAnalyticsController', function ($rootScope, $scope, $stateParams, $http, $timeout, apiDomain) {
    $scope.$on('$viewContentLoaded', function () {
        $scope.analytics = {};
            //codes to load  board analytics
        $http.get(apiDomain + '/api/BoardMe/getAnalytics?boardId=' + $stateParams.boardName)
                      .then(function (response) {
                         
                          $scope.analytics = response.data;
                          var chart = AmCharts.makeChart("chartdiv", {
                              "type": "serial",
                              "theme": "any",
                              "marginRight": 80,
                              "dataProvider": response.data.pageViewsGraphData,
                              "balloon": {
                                  "cornerRadius": 6,
                                  "horizontalPadding": 15,
                                  "verticalPadding": 10
                              },
                              
                              "graphs": [{
                                  "bullet": "square",
                                  "bulletBorderAlpha": 1,
                                  "bulletBorderThickness": 1,
                                  "fillAlphas": 0.3,
                                  "fillColorsField": "lineColor",
                                  "legendValueText": "[[value]]",
                                 // "lineColorField": "lineColor",
                                  "title": "count",
                                  "valueField": "viewsCount"
                              }],
                              "chartScrollbar": {

                              },
                              "chartCursor": {
                                  "categoryBalloonDateFormat": "YYYY MMM DD",
                                  "cursorAlpha": 0,
                                  "fullWidth": true
                              },
                              "dataDateFormat": "DD-MM-YYYY",
                              "categoryField": "date",
                              "categoryAxis": {
                                  "dateFormats": [{
                                      "period": "DD",
                                      "format": "DD"
                                  }, {
                                      "period": "WW",
                                      "format": "MMM DD"
                                  }, {
                                      "period": "MM",
                                      "format": "MMM"
                                  }, {
                                      "period": "YYYY",
                                      "format": "YYYY"
                                  }],
                                  "parseDates": true,
                                  "autoGridCount": false,
                                  "axisColor": "#555555",
                                  "gridAlpha": 0,
                                  "gridCount": 50
                              },
                              "export": {
                                  "enabled": true
                              }
                          });
                      }, function (reason) {
                          $scope.error = reason.data;
                      });
        // end codes to load board analytics.
    
        boardAnalytics();


      



		//chart.addListener("dataUpdated", zoomChart);

		//function zoomChart() {
		//    chart.zoomToDates(new Date(2012, 0, 3), new Date(2012, 0, 11));
		//}

  });

});