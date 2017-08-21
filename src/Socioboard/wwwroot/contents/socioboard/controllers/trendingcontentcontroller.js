'use strict';

SocioboardApp.controller('TrendingContentController', function ($rootScope, $scope, $http, $timeout, apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   
    
        TrendingContent();
        $('.modal-trigger').leanModal();

    var lastreach = false;
    
        
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
        $scope.twitter = function (abc) {
            if (!ReachLast) {
               // var abc = "twitter";
            var abcd = 0;
                $http.get(apiDomain + '/api/ContentStudio/GetYTAdvanceSearchData?network=' + abc + '&skip=' + startData + '&count=30')
                              .then(function (response) {
                                  $scope.lstData = response.data;
                                  $scope.funt();
                                  console.log($scope.lstData);
                                  startData = response.data.length;
                                  $scope.lastreach = true;
                                  $('.modal-trigger').leanModal();
                                 // $scope.funt();
                                  if (response.data == null) {
                                      ReachLast = true;
                                  }
                              }, function (reason) {
                                  $scope.error = reason.data;
                                  $('.modal-trigger').leanModal();
                              });
            }
        }


        $scope.sortclick = function () {
            $('#ShareathonModal').openModal();
        }
        //$('#ShareathonModal').leanModal();
        //var composeImagedropify = $('#composeImage').parents('.dropify-wrapper');
        //$(composeImagedropify).find('.dropify-render').html('<img src="' + schedulemessage.imageurl + '">');
        //$(composeImagedropify).find('.dropify-preview').attr('style', 'display: block;');
        //$('select').material_select();

        $scope.dailyMotion = function (abc) {
            if (!ReachLast) {
                // var abc = "twitter";
                var abcd = 0;
                $http.get(apiDomain + '/api/ContentStudio/GetYTAdvanceSearchData?network=' + abc + '&skip=' + startData + '&count=30')
                                  .then(function (response) {
                                      $scope.lstData = response.data;
                                      $scope.funt();
                                      console.log($scope.lstData);
                                      startData = response.data.length;
                                      $scope.lastreach = true;
                                      $('.modal-trigger').leanModal();
                                      // $scope.funt();
                                      if (response.data == null) {
                                          ReachLast = true;
                                          $('.modal-trigger').leanModal();
                                      }
                                  }, function (reason) {
                                      $scope.error = reason.data;
                                      $('.modal-trigger').leanModal();
                                  });
            }
        }

        $scope.youtube = function (abc) {
            if (!ReachLast) {
                // var abc = "twitter";
                var abcd = 0;
                $http.get(apiDomain + '/api/ContentStudio/GetYTAdvanceSearchData?network=' + abc + '&skip=' + startData + '&count=30')
                                  .then(function (response) {
                                      $scope.lstData = response.data;
                                      $scope.funt();
                                      console.log($scope.lstData);
                                      startData = response.data.length;
                                      $scope.lastreach = true;
                                       $('.modal-trigger').leanModal();
                                      // $scope.funt();
                                      if (response.data == null) {
                                          ReachLast = true;
                                          $('.modal-trigger').leanModal();
                                      }
                                  }, function (reason) {
                                      $scope.error = reason.data;
                                       $('.modal-trigger').leanModal();
                                  });
            }
        }


        $scope.instagram = function (abc) {
            if (!ReachLast) {
                // var abc = "twitter";
                var abcd = 0;
                $http.get(apiDomain + '/api/ContentStudio/GetYTAdvanceSearchData?network=' + abc + '&skip=' + startData + '&count=30')
                                  .then(function (response) {
                                      $scope.lstData = response.data;
                                      $scope.funt();
                                      console.log($scope.lstData);
                                      startData = response.data.length;
                                      $scope.lastreach = true;
                                      $('.modal-trigger').leanModal();
                                      // $scope.funt();
                                      if (response.data == null) {
                                          ReachLast = true;
                                          $('.modal-trigger').leanModal();
                                      }
                                  }, function (reason) {
                                      $scope.error = reason.data;
                                       $('.modal-trigger').leanModal();
                                  });
            }
        }


        $scope.flickr = function (abc) {
            if (!ReachLast) {
                // var abc = "twitter";
                var abcd = 0;
                $http.get(apiDomain + '/api/ContentStudio/GetYTAdvanceSearchData?network=' + abc + '&skip=' + startData + '&count=30')
                                  .then(function (response) {
                                      $scope.lstData = response.data;
                                      $scope.funt();
                                      console.log($scope.lstData);
                                      startData = response.data.length;
                                      $scope.lastreach = true;
                                      $('.modal-trigger').leanModal();
                                      // $scope.funt();
                                      if (response.data == null) {
                                          ReachLast = true;
                                          $('.modal-trigger').leanModal();
                                      }
                                  }, function (reason) {
                                      $scope.error = reason.data;
                                       $('.modal-trigger').leanModal();
                                  });
            }
        }


        $scope.globeSearch = function (abc) {
            if (!ReachLast) {
                // var abc = "twitter";
                var abcd = 0;
                $http.get(apiDomain + '/api/ContentStudio/GetYTAdvanceSearchData?network=' + abc + '&skip=' + startData + '&count=30')
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
        


        $scope.imgur = function (abc) {
            if (!ReachLast) {
                // var abc = "twitter";
                var abcd = 0;
                $http.get(apiDomain + '/api/ContentStudio/GetYTAdvanceSearchData?network=' + abc + '&skip=' + startData + '&count=10')
                                  .then(function (response) {
                                      $scope.lstData = response.data;
                                      $scope.funt();
                                      console.log($scope.lstData);
                                      startData = response.data.length;
                                      $scope.lastreach = true;
                                      $('.modal-trigger').leanModal();
                                      // $scope.funt();
                                      if (response.data == null) {
                                          ReachLast = true;
                                          $('.modal-trigger').leanModal();
                                      }
                                  }, function (reason) {
                                      $scope.error = reason.data;
                                      $('.modal-trigger').leanModal();
                                  });
            }
        }


        $scope.Loaddata = function (key) {
            //codes to load Data
            $http.get(apiDomain + '/api/ContentStudio/GetAdvanceSearchData?keywords=' + key)
                              .then(function (response) {
                                  $scope.lstData = response.data;
                                  $scope.funt();
                              }, function (reason) {
                                  $scope.error = reason.data;
                                 
                              });
            // end codes to load Data
        }

        $scope.SearchData = function () {
            var tempTextSearch = $('#textSearch').val();
            $scope.Loaddata(tempTextSearch);
            $('.modal-trigger').leanModal();
        }


        $(document).ready(function () {
            $('#waterfall').NewWaterfall();
            $('.modal-trigger').leanModal();
        });

        // ??????
        function random(min, max) {
            return min + Math.floor(Math.random() * (max - min + 1))
        }
        var loading = false;
        var dist = 300;
        var num = 1;

        setInterval(function () {
            if ($(window).scrollTop() >= $(document).height() - $(window).height() - dist && !loading) {
                loading = true;
                //$("#test").clone().appendTo('#waterfall');
                // $("#waterfall").append("<li><div style='height:" + random(50,500) +  "px'>" + num + "</div></li>");
                num++;

                loading = false;
            }
        }, 60);
        //$scope.funt = function () {
        //    var $containerProducts = $("#products");
        //    $containerProducts.imagesLoaded(function () {
        //        $containerProducts.masonry({
        //            itemSelector: ".product_content",
        //            columnWidth: ".product_content-sizer",
        //        });
        //    });
        //}
        //funt();
       

        $scope.sortBy = function (sortType) {
            
            $http.get(apiDomain + '/api/ContentStudio/GetSortByData?sortType=' + sortType + '&skip=' + startData + '&count=70')
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


        $scope.topic = function (networkType) {
           
            $http.get(apiDomain + '/api/ContentStudio/QuickTopics?networkType=' + networkType + '&skip=' + startData + '&count=30')
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

        $scope.getOnPageLoadReports = function () {
            var abcd = 'general';
            $scope.globeSearch(abcd);
            $('.modal-trigger').leanModal();
        }

        $scope.getOnPageLoadReports();
        $('.modal-trigger').leanModal();


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
