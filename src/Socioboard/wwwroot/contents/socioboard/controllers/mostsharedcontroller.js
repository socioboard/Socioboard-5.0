'use strict';
SocioboardApp.controller('MostSharedController', function ($rootScope, $scope, $http, $timeout, apiDomain, domain) {
    $scope.$on('$viewContentLoaded', function() {   
        $scope.disbtncom = true;
        $scope.draftbtn = true;
        $scope.dispbtn = true;
        $scope.composePostdata = {};
        MostShared();
        $scope.deleteMsg = function(profileId){
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
        $('#tags').tagsInput();
        $scope.Loaddata = function (key) {
            //codes to load Data
            $http.get(apiDomain + '/api/ContentStudio/GetAdvanceSearchData?keywords=' + key)
                              .then(function (response) {
                                  $scope.lstAdvSearhDataaa = response.data;
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
            // end codes to load Data
        }
        $scope.Loaddata('none');

        $scope.saveshreathondata = function () {
           
            var pageId = $('#shraeathonfacebookpage').val();
            var timeInterval = $('#shraeathontimeinterval').val();
            if (pageId == "") {
                if (FacebookUrl == "") {
                    swal("please enter any facebook page url or select any facebook page");
                    return false;
                }
            }
            var formData = new FormData();
            if (pageId != null && timeInterval != null) {
              
                $scope.datasharethon = [];
                $scope.datasharethon = $scope.selectedContentfeed;
                var sb = $scope.datasharethon;
                var x=angular.toJson(sb);
                console.log("data");
                console.log($scope.selectedContentfeed);
                $scope.dispbtn = false;
               

                 formData.append('FacebookPageId', pageId);
                var shareData = $scope.datasharethon;
                formData.append('shareData', x);
                //var data = {
                //    'fbuserIds': $('#shraeathonfacebookpage').val(),
                //    'timeIntervals': $('#shraeathontimeinterval').val(),
                   // 'shareData': $scope.datasharethon
            //    }
               // formData1.append('shareData', data);
                //codes to add  page shreathon     long userId, string fbuserId, int timeInterval
                //  $http.post(apiDomain + '/api/Shareathon/AddPageShareathon?userId=' + $rootScope.user.Id + '&FacebookPageId=' + pageId + '&Facebookaccountid=' + accountId + '&Timeintervalminutes=' + timeInterval)
              //  $http.post(apiDomain + '/api/ContentStudio/saveDataIdForShare?shareData=' + datasharethon + '&fbuserIds=' + pageId + '&timeIntervals=' + timeInterval)
                //$http.post(apiDomain + '/api/ContentStudio/saveDataIdForShare',{
                //    params: {
                //        fbuserIds:pageId,
                //        timeIntervals: timeInterval, 
                //        shareData:datasharethon
                //    }
                //})
                //var shareData = JSON.stringify($scope.datasharethon);
               // console.log(" --- > encodeURIComponent(datasharethon) : ", shareData);
                $http({

                    method: 'POST',
                    url: apiDomain + '/api/ContentStudio/saveDataIdForShare?fbuserIds=' + pageId + '&timeIntervals=' + timeInterval,
                    data: formData,
                    headers: {
                        'Content-Type': undefined
                    },                               
                    transformRequest: angular.identity,
                })     
                
                //$http({
                //    method: "POST",
                  
                //    url: apiDomain + '/api/ContentStudio/saveDataIdForShare',
                //    data: sb,
                //    headers: {
                //        "Content-Type": "application/json"
                //    },
                //    transformRequest: angular.identity,
                //})

                    .then(function (response) {
                        $scope.lstAdvSearhDataaa = response.data;
                        $scope.dispbtn = true;
                          swal(response.data);
                      }, function (reason) {
                          $scope.error = reason.data;
                      });
                // end codes to add page shreathon
            }
            else {
                $scope.dispbtn = true;
                swal('Please fill in all the details');
            }
        }
     



        $scope.SearchData = function () {
            var tempTextSearch = $('#textSearch').val();
            $scope.Loaddata(tempTextSearch);
        }
        $scope.sorttype = function () {
            $('#ShareathonModal').openModal();
        }
        $scope.ComposeMessageModal = function (lstData) {
            jQuery('input:checkbox').removeAttr('checked');
            if (lstData != null) {
                var message = {
                    "title": lstData.title,
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
            $("#checkboxdatarss .subcheckboxrss").each(function () {
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

        $scope.tekeDatashare = function (getshare) {

            $http.get(apiDomain + '/api/ContentStudio/GetAdvanceSearchData?keywords=' + key)
                           .then(function (response) {
                               $scope.lstAdvSearhDataaa = response.data;
                           }, function (reason) {
                               $scope.error = reason.data;
                           });

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
        }

        $scope.shareathonData = function () {
            debugger;
          
        }



        console.log($scope.selectedContentfeed);

        $scope.draftMsg = function () {
            $scope.draftbtn = false;
            var message = $('#composeMessage').val();
            var updatedmessage = "";
            var postdata = message.split("\n");
            for (var i = 0; i < postdata.length; i++) {
                updatedmessage = updatedmessage + "<br>" + postdata[i];
            }
            updatedmessage = updatedmessage.replace(/#+/g, 'hhh');
            updatedmessage = updatedmessage.replace(/&+/g, 'nnn');
            updatedmessage = updatedmessage.replace("+", 'ppp');
            updatedmessage = updatedmessage.replace("-+", 'jjj');
            message = updatedmessage;
            if (message != "" && message != undefined) {
                $scope.checkfile();
                if ($scope.check == true) {
                    var formData = new FormData();
                    formData.append('files', $("#composeImage").get(0).files[0]);
                    //$scope.dispbtn = false;
                    $http({
                        method: 'POST',
                        url: apiDomain + '/api/SocialMessages/DraftScheduleMessage?userId=' + $rootScope.user.Id + '&message=' + message + '&scheduledatetime=' + "" + '&groupId=' + $rootScope.groupId + '&imagePath=' + encodeURIComponent($('#imageUrl').val()),
                        data: formData,
                        headers: {
                            'Content-Type': undefined
                        },
                        transformRequest: angular.identity,
                    }).then(function (response) {
                        $('#ScheduleMsg').val('');
                        $('#ScheduleTime').val('');
                        $scope.draftbtn = true;
                        $('#ComposePostModal').closeModal();
                        swal("Message has got saved in draft successfully");
                    }, function (reason) {
                    });
                }
                else if ($scope.check == false) {
                    var formData = new FormData();
                    $scope.draftbtn = false;
                    $http({
                        method: 'POST',
                        url: apiDomain + '/api/SocialMessages/DraftScheduleMessage?userId=' + $rootScope.user.Id + '&message=' + message + '&scheduledatetime=' + "" + '&groupId=' + $rootScope.groupId + '&imagePath=' + encodeURIComponent($('#imageUrl').val()),
                        data: formData,
                        headers: {
                            'Content-Type': undefined
                        },
                        transformRequest: angular.identity,
                    }).then(function (response) {
                        $('#ScheduleMsg').val('');
                        $('#ScheduleTime').val('');
                        $scope.draftbtn = true;
                        $('#ComposePostModal').closeModal();
                        swal("Message has got saved in draft successfully");
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
                swal('Please type a message to save in draft');
            }
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