'use strict';

SocioboardApp.controller('TrendingContentController', function ($rootScope, $scope, $http, $timeout, apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   
    

    

    var lastreach = false;
    
        TrendingContent();
        $scope.deleteProfile = function(profileId){
        	// console.log(profileId);
        	swal({   
	        title: "Are you sure?",   
	        text: "You will not be able to send message via this account!",   
	        type: "warning",   
	        showCancelButton: true,   
	        confirmButtonColor: "#DD6B55",   
	        confirmButtonText: "Yes, delete it!",   
	        closeOnConfirm: false }, 
	        function(){   
	            //todo: code to delete profile
	            swal("Deleted!", "Your profile has been deleted.", "success"); 
	            });
        }

        var startData = 0; // where to start data
        var endingData = startData + 30; // how much data need to add on each function call
        var ReachLast = false; // to check the page ends last or not
        $scope.youtubeSearch = function (abc) {
            if (!ReachLast) {
               // var abc = "twitter";
            var abcd = 0;
            $http.get(apiDomain + '/api/AdvanceSearch/GetYTAdvanceSearchData?network=' + abc + '&skip=' + startData + '&count=10')
                              .then(function (response) {
                                  $scope.lstData = response.data;
                                  $scope.funt();
                                  console.log($scope.lstData);
                                  startData = response.data.length;
                                  $scope.lastreach = true;
                                 // $scope.funt();
                                  if (response.data == null) {
                                      ReachLast = true;
                                  }
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
            }
        }

        $scope.funt = function () {
            var $containerProducts = $("#products");
            $containerProducts.imagesLoaded(function () {
                $containerProducts.masonry({
                    itemSelector: ".product_content",
                    columnWidth: ".product_content-sizer",
                });
            });
        }
        //funt();

  });

});

//SocioboardApp.controller('TrendingContentController', function ($timeout) {
//    return function (scope, element, attrs) {
//        if (scope.$last === true) {
//            $timeout(function () {
//                console.log("TrendingContentController Called");
//                var $containerProducts = $("#products");
//                //$containerProducts.imagesLoaded(function () {
//                $containerProducts.masonry({
//                    itemSelector: ".product_content",
//                    columnWidth: ".product_content-sizer",
//                });
//            });


//        };
//    }
//});
