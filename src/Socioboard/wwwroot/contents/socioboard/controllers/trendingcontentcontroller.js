'use strict';

SocioboardApp.controller('TrendingContentController', function ($rootScope, $scope, $http, $timeout, apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   
    
        TrendingContent();
        $scope.query = {};
        $scope.queryBy = '$';
        var lastreach = false;     
        $scope.dispbtn = true;
        $scope.disbtncom = true;
        
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



        $scope.Toggle = function (lstforshare) {


            var index = $scope.selectedContentfeed.indexOf(lstforshare);
            if (index > -1) {
                //if already selected then removed
                $scope.selectedContentfeed.splice(index, 1);
                console.log($scope.selectedContentfeed);
            }
            else {
                $scope.selectedContentfeed.push(lstforshare);
            }
        }

        var startData = 0; // where to start data
        var endingData = startData + 30; // how much data need to add on each function call
        var ReachLast = false; // to check the page ends last or not

        $scope.twitter = function (abc) {
            if (!ReachLast) {
               // var abc = "twitter";
            var abcd = 0;
                $http.get(apiDomain + '/api/ContentStudio/GetAdvanceSearchDataTrending?network=' + abc + '&skip=' + startData + '&count=30')
                              .then(function (response) {
                                  $scope.lstData = response.data;
                                  $scope.fetchdatacomplete = true;
                                  console.log($scope.lstData);
                                  startData = response.data.length;
                                  $scope.lastreach = true;
                              
                                  if (response.data == null) {
                                      ReachLast = true;
                                  }
                              }, function (reason) {
                                  $scope.error = reason.data;
                               
                              });
            }
        }

        $scope.sorttype = function () {
            $('#ShareathonModal').openModal();
        }


        $scope.sortclick = function () {
            $('#ShareathonModal').openModal();
        }
       

        $scope.dailyMotion = function (abc) {
            if (!ReachLast) {
                // var abc = "twitter";
                var abcd = 0;
                $http.get(apiDomain + '/api/ContentStudio/GetAdvanceSearchDataTrending?network=' + abc + '&skip=' + startData + '&count=30')
                                  .then(function (response) {
                                      $scope.lstData = response.data;
                                    
                                      console.log($scope.lstData);
                                      $scope.fetchdatacomplete = true;
                                      startData = response.data.length;
                                      $scope.lastreach = true;
                                     
                                      if (response.data == null) {
                                          ReachLast = true;
                                        
                                      }
                                  }, function (reason) {
                                      $scope.error = reason.data;
                                    
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
                                      $scope.fetchdatacomplete = true;
                                      startData = response.data.length;
                                      $scope.lastreach = true;
                                     
                                     
                                      if (response.data == null) {
                                          ReachLast = true;
                                         
                                      }
                                  }, function (reason) {
                                      $scope.error = reason.data;
                                      
                                  });
            }
        }


        $scope.instagram = function (abc) {
            if (!ReachLast) {
                // var abc = "twitter";
                var abcd = 0;
                $http.get(apiDomain + '/api/ContentStudio/GetAdvanceSerachInstagramData?network=' + abc + '&skip=' + startData + '&count=30')
                                  .then(function (response) {
                                      $scope.lstData = response.data;
                                      $scope.fetchdatacomplete = true;
                                      console.log($scope.lstData);
                                      startData = response.data.length;
                                      $scope.lastreach = true;
                                   
                                     
                                      if (response.data == null) {
                                          ReachLast = true;
                                         
                                      }
                                  }, function (reason) {
                                      $scope.error = reason.data;
                                    
                                  });
            }
        }


        $scope.flickr = function (abc) {
            if (!ReachLast) {
                // var abc = "twitter";
                var abcd = 0;
                $http.get(apiDomain + '/api/ContentStudio/GetAdvanceSearchFlickerData?network=' + abc + '&skip=' + startData + '&count=30')
                                  .then(function (response) {
                                      $scope.lstData = response.data;
                                     
                                      console.log($scope.lstData);
                                      startData = response.data.length;
                                      $scope.fetchdatacomplete = true;
                                      $scope.lastreach = true;
                                  
                                      if (response.data == null) {
                                          ReachLast = true;
                                        
                                      }
                                  }, function (reason) {
                                      $scope.error = reason.data;
                                      
                                  });
            }
        }


        $scope.globeSearch = function (abc) {
            if (!ReachLast) {
                // var abc = "twitter";
                var abcd = 0;
                $http.get(apiDomain + '/api/ContentStudio/GetAdvanceSearchDataTrending?network=' + abc + '&skip=' + startData + '&count=30')
                                  .then(function (response) {
                                    
                                      $scope.lstData = response.data;
                                      console.log("single data", $scope.lstData[0].postId);
                                      //startData = response.data.length;
                                      $scope.lastreach = true;
                                      $scope.fetchdatacomplete = true;
                                    
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
                $http.get(apiDomain + '/api/ContentStudio/GetAdvanceSearchDataTrending?network=' + abc + '&skip=' + startData + '&count=10')
                                  .then(function (response) {
                                      $scope.lstData = response.data;
                                     
                                      console.log($scope.lstData);
                                      startData = response.data.length;
                                      $scope.lastreach = true;
                                      $scope.fetchdatacomplete = true;
                                    
                                      if (response.data == null) {
                                          ReachLast = true;
                                         
                                      }
                                  }, function (reason) {
                                      $scope.error = reason.data;
                                   
                                  });
            }
        }


        $scope.Loaddata = function (key) {
            //codes to load Data
            $http.get(apiDomain + '/api/ContentStudio/GetAdvanceSearchDataTrending?keywords=' + key)
                              .then(function (response) {
                                  $scope.lstData = response.data;
                                  //$scope.fetchdatacomplete = true;
                                 
                              }, function (reason) {
                                  $scope.error = reason.data;
                                 
                              });
            // end codes to load Data
        }

        $scope.SearchData = function () {
            var tempTextSearch = $('#textSearch').val();
            $scope.Loaddata(tempTextSearch);
          
        }


        $(document).ready(function () {
            $('#waterfall').NewWaterfall();
           
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
       
       

        $scope.sortBy = function (sortType) {
            
            $http.get(apiDomain + '/api/ContentStudio/GetSortByData?sortType=' + sortType + '&skip=' + startData + '&count=70')
                          .then(function (response) {
                             
                              $scope.lstData = response.data;
                           
                              console.log($scope.lstData);
                              startData = response.data.length;
                              $scope.fetchdatacomplete = true;
                              $scope.lastreach = true;
                             
                            
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
                              $scope.fetchdatacomplete = true;
                              console.log($scope.lstData);
                              startData = response.data.length;
                              $scope.lastreach = true;
                             
                           
                              if (response.data == null) {
                                  ReachLast = true;
                                 
                              }
                          }, function (reason) {
                              $scope.error = reason.data;
                             
                          });

        }

        $scope.saveshreathondata = function () {

            var pageId = $('#shraeathonfacebookpage').val();
            var timeInterval = $('#shraeathontimeinterval').val();
            if (pageId == "") {
              
                    swal("please select profile");
                    return false;
                
            }
            if (timeInterval == null) {

                swal("please select time interval");
                return false;

            }
            var formData = new FormData();
            if (pageId != null && timeInterval != null) {

                $scope.datasharethon = [];
                $scope.datasharethon = $scope.selectedContentfeed;
                var sb = $scope.datasharethon;
                var x = angular.toJson(sb);
                console.log("data");
                console.log($scope.selectedContentfeed);
                if( x!="[]")
                {
                    $scope.dispbtn = false;
                formData.append('FacebookPageId', pageId);
                var shareData = $scope.datasharethon;
                formData.append('shareData', x);

                $http({

                    method: 'POST',
                    url: apiDomain + '/api/ContentStudio/saveDataIdForShare?userId=' + $rootScope.user.Id + '&fbuserIds=' + pageId + '&timeIntervals=' + timeInterval,
                    data: formData,
                    headers: {
                        'Content-Type': undefined
                    },
                    transformRequest: angular.identity,
                }).then(function (response) {
                    $scope.lstAdvSearhDataaa = response.data;
                    $scope.dispbtn = true;
                    $('#ShareathonModal').closeModal();
                    swal("successfully scheduled");
                    closeModel();
                    //window.location.reload();
                }, function (reason) {
                    $scope.error = reason.data;
                });
                }
                else {
                    swal("Please select feeds to be schedule");
                }

                
                // end codes to add page shreathon
            }
            else {
                $scope.dispbtn = true;
                swal('Please provide all details');
            }
        }

           $scope.ComposeMessageModal = function (lstData) {
            jQuery('input:checkbox').removeAttr('checked');
            if (lstData != null) {
                var message = {
                   // "title": lstData.title,
                    "link": lstData.postUrl,
                    "image": lstData.imageUrl,
                };
                $scope.composePostdata = message;
            }
            $('#ComposePostModal').openModal();
            var composeImagedropify = $('#composeImage').parents('.dropify-wrapper');
            $(composeImagedropify).find('.dropify-render').html('<img src="' + lstData.imageUrl + '">');
            $(composeImagedropify).find('.dropify-preview').attr('style', 'display: block;');
            $('select').material_select();
        }
        $scope.ComposeMessage = function () {
            $scope.disbtncom = false;
            var profiles = new Array();
            $("#checkboxdata .subcheckbox").each(function () {
                var attrId = $(this).attr("id");
                if (document.getElementById(attrId).checked == false) {
                    var index = profiles.indexOf(attrId);
                    if (index > -1) {
                        profiles.splice(index, 1);
                    }
                } else {
                    profiles.push(attrId);
                }
            });
            var message = $('#composeMessage').val();
            var updatedmessage = "";
            message = encodeURIComponent(message);
            if (profiles.length > 0 && message != '') {
                $scope.checkfile();
                if ($scope.check == true) {
                    var formData = new FormData();
                    formData.append('files', $("#composeImage").get(0).files[0]);
                    $http({
                        method: 'POST',
                        url: apiDomain + '/api/SocialMessages/ComposeMessage?profileId=' + profiles + '&userId=' + $rootScope.user.Id + '&message=' + message + '&imagePath=' + encodeURIComponent($('#imageUrl').val()),
                        data: formData,
                        headers: {
                            'Content-Type': undefined
                        },
                        transformRequest: angular.identity,
                    }).then(function (response) {
                        if (response.data == "Posted") {
                            $scope.disbtncom = true;
                            $('#ComposePostModal').closeModal();
                            swal('Message composed successfully');
                        }
                    }, function (reason) {
                    });
                }
                else {
                    alertify.set({ delay: 3000 });
                    alertify.error("File extension is not valid. Please upload an image file");
                    $('#input-file-now').val('');
                }
            }
            else {
                $scope.disbtncom = true;
                if (profiles.length == 0) {
                    swal('Please select a profile');
                }
                else {
                    swal('Please enter some text to compose this message');
                }
            }
        }
        $scope.checkfile = function () {
            var filesinput = $('#composeImage');
            var fileExtension = ['jpeg', 'jpg', 'png', 'gif', 'bmp'];
            if (filesinput != undefined && filesinput[0].files[0] != null) {
                if ($scope.hasExtension('#composeImage', fileExtension)) {
                    $scope.check = true;
                }
                else {
                    $scope.check = false;
                }
            }
            else {
                $scope.check = true;
            }
        }
        $scope.hasExtension = function (inputID, exts) {
            var fileName = $('#composeImage').val();
            return (new RegExp('(' + exts.join('|').replace(/\./g, '\\.') + ')$')).test(fileName);
        }




        $scope.selectedContentfeed = [];
        $scope.Toggle = function (lstforshare) {


            var index = $scope.selectedContentfeed.indexOf(lstforshare);
            if (index > -1) {
                //if already selected then removed
                $scope.selectedContentfeed.splice(index, 1);
            }
            else {
                $scope.selectedContentfeed.push(lstforshare);
            }

            console.log($scope.selectedContentfeed);
        }


     


        $scope.getOnPageLoadReports = function () {
            var abcd = 'general';
            $scope.globeSearch(abcd);
            $('.modal-trigger').leanModal();
        }

        $scope.getOnPageLoadReports();
        $('.modal-trigger').leanModal();

        $scope.viewPostModal = function (tempo) {
            debugger;
            $scope.feed = tempo;
            $('#viewPostModal').openModal();
           
        }
  });

});
SocioboardApp.directive('myRepeatDataaTabDirective', function ($timeout) {
    return function (scope, element, attrs) {
        if (scope.$last === true) {
            $timeout(function () {
                $('#MostShared').DataTable({
                    dom: 'Bfrtip',
                    buttons: [
                        'copy', 'csv', 'excel', 'pdf', 'print'
                    ]
                });
            });
        }
    };
})

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
