'use strict';

SocioboardApp.controller('FacebookpagereportController', function ($rootScope, $scope, $http, $timeout, apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   
    
        facebookpagereport();
        $scope.deleteProfile = function(profileId){
        	// console.log(profileId);
        	swal({   
	        title: "Are you sure?",   
	        text: "You will not be able to send any message via this account!",
	        type: "warning",   
	        showCancelButton: true,   
	        confirmButtonColor: "#DD6B55",   
	        confirmButtonText: "Yes, delete it!",   
	        closeOnConfirm: false }, 
	        function(){   
	            //todo: code to delete profile
	            swal("Deleted!", "Your profile has been deleted.", "Success");
	            });
        }

$scope.sparkGraph = [5, 6, 7, 9, 9, 5, 3, 2, 2, 4, 6, 7, 5, 6, 7, 9, 9, 5, 3, 2, 2, 4, 6, 7];
         // Project Line chart ( Project Box )
	    $(".project-line-1").sparkline($scope.sparkGraph, {
	        type: 'line',
	        width: '100%',
	        height: '30',
	        lineWidth: 2,
	        lineColor: '#00bcd4',
	        fillColor: 'rgba(0, 188, 212, 0.5)',
	    });

        // FacebookPagesLikes
var chart = AmCharts.makeChart("FacebookPagesLikes", {
    "theme": "light",
    "type": "serial",
    "dataProvider": [{
        "country": "USA",
        "year2004": 3.5,
        "year2005": 4.2,
        "year2006": 4.2
    }, {
        "country": "UK",
        "year2004": 1.7,
        "year2005": 3.1
    }, {
        "country": "Canada",
        "year2004": 2.8,
        "year2005": 2.9
    }, {
        "country": "Japan",
        "year2004": 2.6,
        "year2005": 2.3
    }, {
        "country": "France",
        "year2004": 1.4,
        "year2005": 2.1
    }, {
        "country": "Brazil",
        "year2004": 2.6,
        "year2005": 4.9
    }],
    "valueAxes": [{
        "unit": "%",
        "position": "left",
        "title": "Page Like rate",
    }],
    "startDuration": 1,
    "graphs": [{
        "balloonText": "GDP grow in [[category]] (2004): <b>[[value]]</b>",
        "fillAlphas": 0.9,
        "lineAlpha": 0.2,
        "title": "2004",
        "type": "column",
        "valueField": "year2004"
    }, {
        "balloonText": "GDP grow in [[category]] (2005): <b>[[value]]</b>",
        "fillAlphas": 0.9,
        "lineAlpha": 0.2,
        "title": "2005",
        "type": "column",
        "clustered":false,
        "columnWidth":0.5,
        "valueField": "year2005"
    }],
    "plotAreaFillAlphas": 0.1,
    "categoryField": "country",
    "categoryAxis": {
        "gridPosition": "start"
    },
    "export": {
    	"enabled": true
     }

});


// FacebookPagesPosts
var chart = AmCharts.makeChart("FacebookPagesPosts", {
    "theme": "light",
    "type": "serial",
    "dataProvider": [{
        "country": "USA",
        "year2004": 3.5,
        "year2005": 4.2
    }, {
        "country": "UK",
        "year2004": 1.7,
        "year2005": 3.1
    }, {
        "country": "Canada",
        "year2004": 2.8,
        "year2005": 2.9
    }, {
        "country": "Japan",
        "year2004": 2.6,
        "year2005": 2.3
    }, {
        "country": "France",
        "year2004": 1.4,
        "year2005": 2.1
    }, {
        "country": "Brazil",
        "year2004": 2.6,
        "year2005": 4.9
    }],
    "valueAxes": [{
        "unit": "%",
        "position": "left",
        "title": "Page Post rate",
    }],
    "startDuration": 1,
    "graphs": [{
        "balloonText": "GDP grow in [[category]] (2004): <b>[[value]]</b>",
        "fillAlphas": 0.9,
        "lineAlpha": 0.2,
        "title": "2004",
        "type": "column",
        "valueField": "year2004"
    }, {
        "balloonText": "GDP grow in [[category]] (2005): <b>[[value]]</b>",
        "fillAlphas": 0.9,
        "lineAlpha": 0.2,
        "title": "2005",
        "type": "column",
        "clustered":false,
        "columnWidth":0.5,
        "valueField": "year2005"
    }],
    "plotAreaFillAlphas": 0.1,
    "categoryField": "country",
    "categoryAxis": {
        "gridPosition": "start"
    },
    "export": {
    	"enabled": true
     }

});


// FacebookPagesShares
var chart = AmCharts.makeChart("FacebookPagesShares", {
    "theme": "light",
    "type": "serial",
    "dataProvider": [{
        "country": "USA",
        "year2004": 3.5,
        "year2005": 4.2
    }, {
        "country": "UK",
        "year2004": 1.7,
        "year2005": 3.1
    }, {
        "country": "Canada",
        "year2004": 2.8,
        "year2005": 2.9
    }, {
        "country": "Japan",
        "year2004": 2.6,
        "year2005": 2.3
    }, {
        "country": "France",
        "year2004": 1.4,
        "year2005": 2.1
    }, {
        "country": "Brazil",
        "year2004": 2.6,
        "year2005": 4.9
    }],
    "valueAxes": [{
        "unit": "%",
        "position": "left",
        "title": "Page Share rate",
    }],
    "startDuration": 1,
    "graphs": [{
        "balloonText": "GDP grow in [[category]] (2004): <b>[[value]]</b>",
        "fillAlphas": 0.9,
        "lineAlpha": 0.2,
        "title": "2004",
        "type": "column",
        "valueField": "year2004"
    }, {
        "balloonText": "GDP grow in [[category]] (2005): <b>[[value]]</b>",
        "fillAlphas": 0.9,
        "lineAlpha": 0.2,
        "title": "2005",
        "type": "column",
        "clustered":false,
        "columnWidth":0.5,
        "valueField": "year2005"
    }],
    "plotAreaFillAlphas": 0.1,
    "categoryField": "country",
    "categoryAxis": {
        "gridPosition": "start"
    },
    "export": {
    	"enabled": true
     }

});


// FacebookPagesComments
var chart = AmCharts.makeChart("FacebookPagesComments", {
    "theme": "light",
    "type": "serial",
    "dataProvider": [{
        "country": "USA",
        "year2004": 3.5,
        "year2005": 4.2
    }, {
        "country": "UK",
        "year2004": 1.7,
        "year2005": 3.1
    }, {
        "country": "Canada",
        "year2004": 2.8,
        "year2005": 2.9
    }, {
        "country": "Japan",
        "year2004": 2.6,
        "year2005": 2.3
    }, {
        "country": "France",
        "year2004": 1.4,
        "year2005": 2.1
    }, {
        "country": "Brazil",
        "year2004": 2.6,
        "year2005": 4.9
    }],
    "valueAxes": [{
        "unit": "%",
        "position": "left",
        "title": "Page Comment rate",
    }],
    "startDuration": 1,
    "graphs": [{
        "balloonText": "GDP grow in [[category]] (2004): <b>[[value]]</b>",
        "fillAlphas": 0.9,
        "lineAlpha": 0.2,
        "title": "2004",
        "type": "column",
        "valueField": "year2004"
    }, {
        "balloonText": "GDP grow in [[category]] (2005): <b>[[value]]</b>",
        "fillAlphas": 0.9,
        "lineAlpha": 0.2,
        "title": "2005",
        "type": "column",
        "clustered":false,
        "columnWidth":0.5,
        "valueField": "year2005"
    }],
    "plotAreaFillAlphas": 0.1,
    "categoryField": "country",
    "categoryAxis": {
        "gridPosition": "start"
    },
    "export": {
    	"enabled": true
     }

});



$scope.getReports = function (days) {
    //codes to load  fb page profiles start
    $http.get(apiDomain + '/api/FacaebookPageReports/GetFacebookPublicPageReport?daysCount=' + days)
                  .then(function (response) {
                      $scope.dailyReportsList = response.data;
                      $scope.getData(days);
                  }, function (reason) {
                      $scope.error = reason.data;
                  });
    // end codes to load fb page profiles

}

$scope.getData = function (days) {
    $scope.chartData = [];
    var startDate = new Date((Date.now() - (days * 86400000))) / 1000;
    var endDate = Date.now() / 1000;
    angular.forEach($scope.dailyReportsList, function (value, key) {
        $scope.fbpublicreports = value.fbpublicpagedailyreports;
        $scope.chartData.push({
            name: value.facebookAccount.fbUserName,
            date: angular.forEach($scope.fbpublicreports, function (value1, key) {
                if (value1.date > startDate) {
                    $scope.chartData.push({
                        date: new Date((value.date * 1000)),
                        like: value1.likescount,
                    });
                }

            }),

        });
        $scope.fromDate = moment(new Date((startDate * 1000))).format('YYYY/MM/DD');
        $scope.toDate = moment(new Date((endDate * 1000))).format('YYYY/MM/DD');
    });
}

$scope.getOnPageLoadReports = function () {
    $scope.getReports(90)

}

$scope.getOnPageLoadReports();

  });







  });

