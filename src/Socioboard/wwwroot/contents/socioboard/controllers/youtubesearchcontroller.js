'use strict';

SocioboardApp.controller('YoutubeSearchController', function ($rootScope, $scope, $http, $timeout, $stateParams, apiDomain, domain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function () {
        $scope.limit = 10;
        $scope.globaltokenpage = "";
        $scope.label = true;
        $scope.keywordsearchkey = "Type keyword to search";
        $scope.loadmore = 'hide';
        $scope.loader = false;
        $scope.openM = function (videoUrl, SearchType) {
            $scope.urlEmbedded = videoUrl;
            if (SearchType == 'video') {
                $('#ComposePostModal').openModal();
            }
            else {
                alertify.error("This is not a video type");
            }
        }
        $scope.searchytdata = function (searchkeyword) {
            if (!(searchkeyword == undefined || searchkeyword == "")) {
                $scope.label = false;
                $scope.searchdata = null;
                $scope.loadmore = 'hide';
                $scope.loader = true;
                $http.post(apiDomain + '/api/Discovery/YoutubeSearch?q=' + searchkeyword + '&page=' + 0)
                               .then(function (response) {
                                   $scope.limit = 10;
                                   if (response.data == "") {
                                       $scope.loader = false;
                                       $scope.label = true;
                                       $scope.keywordsearchkey = "Sorry, No data available for this keyword";
                                   }
                                   else {
                                       $scope.tempQ = searchkeyword;
                                       $scope.searchdata = response.data;
                                       $scope.loadmore = 'show';
                                       $scope.loader = false;

                                       angular.forEach($scope.searchdata, function (item) {
                                           $scope.globaltokenpage = item.pageCode;
                                       })
                                       $scope.latesttokenpage = "";


                                   }
                               }, function (reason) {
                                   $scope.error = reason.data;
                               });
            }
            else {
                alertify.error("Type any keyword to search data");
            }
        }
        $scope.limitClk = function () {
            if ($scope.searchdata.length > $scope.limit) {
                $scope.limit = $scope.limit + 7;
                if (!($scope.searchdata.length > $scope.limit))
                {
                    $scope.loadmore = 'hide';
                }
            }
            else
            {
                $scope.loadmore = 'hide';
            }
        }

        $scope.loadmoreextra=function()
        {
            $scope.searchytdatapage();
        }



        $scope.searchytdatapage = function () {
            if ($scope.latesttokenpage != $scope.globaltokenpage) {
                var tempglobal = $scope.globaltokenpage;
                $http.post(apiDomain + '/api/Discovery/YoutubeSearch?q=' + $scope.tempQ + '&page=' + 1 + '&pagecode=' + tempglobal)
                               .then(function (response) {
                                   if (response.data == "") {
                                   }
                                   else {
                                       $scope.tempDataResponse = response.data;
                                       $scope.searchdata = $scope.searchdata.concat(response.data);
                                       angular.forEach($scope.tempDataResponse, function (item) {
                                           $scope.globaltokenpage = item.pageCode;
                                       })
                                   }
                               }, function (reason) {
                                   $scope.error = reason.data;
                               });
                $scope.latesttokenpage = $scope.globaltokenpage;
            }
            

        }




    });
})
.filter('youtubeEmbedUrl', function ($sce) {
    debugger;
    return function (videoId) {
        return $sce.trustAsResourceUrl('https://www.youtube.com/embed/' + videoId);
    };
});