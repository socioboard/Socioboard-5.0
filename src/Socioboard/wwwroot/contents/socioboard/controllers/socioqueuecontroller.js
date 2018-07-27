'use strict';
SocioboardApp.controller('SocioqueueController', function ($rootScope, $scope, $http, $modal, $timeout, $stateParams, apiDomain) {
    $scope.$on('$viewContentLoaded', function () {
        var lastreach = false;
        var nomessages = false;

        socioqueue();
        $scope.deleteMsg = function (socioqueueId) {
            swal({
                title: "Are you sure?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false
            },
	        function () {
	            //todo: code to delete profile
	            //codes to delete  draft messages start
	            $http.get(apiDomain + '/api/SocialMessages/DeleteSocialMessages?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id + '&socioqueueId=' + socioqueueId)
                              .then(function (response) {
                                  closeOnConfirm: false
                                  swal("Deleted");
                                  $scope.date(response.data);
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
	            // end codes to delete draft messages
	        });
        }

        $scope.fetchsocioqueuemessage = function () {
            //codes to load  socioqueue messages start
            $http.get(apiDomain + '/api/SocialMessages/GetAllScheduleMessage?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id)
                          .then(function (response) {
                              if (response.data != "") {
                                  $scope.date(response.data);
                                  $scope.lastreach = true;
                              } else {
                                  $scope.lastreach = true;
                                  $scope.nomessages = true;

                                  $('#socio_all').attr('disabled', true);
                                  //document.getElementById("deleteAll").disabled = true;
                              }
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load socioqueue messages
        }
        $scope.fetchsocioqueuemessage();

        $scope.getProperURL = function (obj) {

            if (obj.includes("wwwroot\\")) {
                var img = obj.split("wwwroot\\upload\\")[1];
                return apiDomain + "/api/Media/Get?id=" + img;
            }
            else {
                return obj;
            }
        };

        $scope.editscheulemessage = function (sharemessage, socioqueueId) {
            $rootScope.editscdmessage = sharemessage;           
            $rootScope.socioqueueId = socioqueueId;
            $('#SocioqueueModal').openModal();
            document.getElementById('editScheduleMsg').value = sharemessage;
            
            //$scope.modalinstance = $modal.open({
            //    templateUrl: 'editschedulemessageModalContent.html',
            //    controller: 'SocioqueueController',
            //    scope: $scope
            //});
        }

       
        $scope.date = function (parm) {
            for (var i = 0; i < parm.length; i++) {
                var date = moment(parm[i].scheduleTime);
                var newdate = date.toString();
                var splitdate = newdate.split(" ");
                date = splitdate[0] + " " + splitdate[1] + " " + splitdate[2] + " " + splitdate[3];
                parm[i].scheduleTime = date;
            }
            $scope.lstsocioqueuemessage = parm;
        }
        $scope.closeModal = function () {
            $scope.modalinstance.dismiss('cancel');
        }
        $scope.savesocioqueueedit = function () {
            var message = $('#editScheduleMsg').val();

            if (/\S/.test(message)) {
                //For taking special character start
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
                //End

                $http.get(apiDomain + '/api/SocialMessages/EditScheduleMessage?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id + '&socioqueueId=' + $rootScope.socioqueueId + '&message=' + message)
                                      .then(function (response) {
                                          //$scope.modalinstance.dismiss('cancel');
                                          //$rootScope.lstdraftmessage = response.data;
                                          $scope.date(response.data);
                                          $('#editScheduleMsg').val('');
                                      }, function (reason) {
                                          $scope.error = reason.data;
                                      });
            }
            else {
                swal("Please enter a text");
            }

        }



        var getAllSelected = function () {
            var selectedItems = $scope.lstsocioqueuemessage.filter(function (profile) {
                return $scope.temp;
            });

            return selectedItems.length === $scope.lstsocioqueuemessage.length;
        }

        var setAllSelected = function (value) {

            angular.forEach($scope.lstsocioqueuemessage, function (profile) {
                $scope.temp = value;
            });
        }

        $scope.allSelected = function (value) {

            if (value !== undefined) {
                $scope.toggleAll(value);
                return setAllSelected(value);

            } else {
                return getAllSelected();
            }
        }

        $scope.toggleAll = function (value) {
            var toggleStatus = value;
            angular.forEach($scope.lstsocioqueuemessage, function (itm) {
                itm.selected = toggleStatus;
            });

        }

        $scope.optionToggled = function () {
            $scope.isAllSelected = $scope.lstsocioqueuemessage.every(function (itm) { return itm.selected; })
            if ($scope.isAllSelected == true) {
                return setAllSelected($scope.isAllSelected);
            }
            else {
                return setAllSelected($scope.isAllSelected);
            }
        }

        $scope.deleteMultipleMessages = function () {

            var messages = new Array();
            $("#SocioQueue .subcheckbox").each(function () {

                var attrId = $(this).attr("id");
                if (document.getElementById(attrId).checked == false) {
                    var index = messages.indexOf(attrId);
                    if (index > -1) {
                        messages.splice(index, 1);
                    }
                } else {
                    messages.push(attrId);
                }
            });

            swal({
                title: "Are you sure?",
                text: "You will not be able to recover this scheduled messages!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55", confirmButtonText: "Yes, delete it!",
                cancelButtonText: "No, cancel it!",
                closeOnConfirm: false,
                closeOnCancel: false
            },
            function (isConfirm) {
                if (isConfirm) {

                    $http.get(apiDomain + '/api/SocialMessages/DeleteMultiSocialMessages?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id + '&socioqueueId=' + messages)
                              .then(function (response) {
                                  closeOnConfirm: false
                                  if (response.data != "") {
                                      swal("Deleted!", "Your selected scheduled messages has been deleted.", "success");
                                      $scope.date(response.data);
                                      //$scope.allSelected = false;
                                  }
                                  else {
                                      swal("Deleted!", "Your selected scheduled messages has been deleted.", "success");
                                      $scope.date(response.data);
                                      $('#socio_all').attr('disabled', true);
                                      $scope.allSelected = false;
                                  }
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
                } else {
                    swal("Cancelled", "Your selected scheduled messages are safe :)", "error");
                }
            });

        }
    });

})

.filter('Url', function ($sce) {
    return function (Url) {
        return $sce.trustAsResourceUrl(Url);
    };
});