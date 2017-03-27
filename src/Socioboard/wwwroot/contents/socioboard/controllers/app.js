/// <reference path="../../views/home/index.html" />
/// <reference path="../../views/home/index.html" />
'use strict';
/***
Socioboard AngularJS App Main Script
***/
/* Socioboard App */
var SocioboardApp = angular.module("SocioboardApp", [
    "ui.router",
    "ui.bootstrap",
    "oc.lazyLoad",
    "ngSanitize",
    "lazy-scroll",
    "ngMaterial",
    "mdPickers",
]);



SocioboardApp.constant("apiDomain", "http://localhost:6361");
SocioboardApp.constant("domain", "http://localhost:9821");
//Not Using codes Start
SocioboardApp.directive('myRepeatDropdownDirective', function () {
    return function (scope, element, attrs) {
        // if (scope.$last) {
        $('select').material_select();
        $('select').change(function () {
            var newValuesArr = [],
                select = $(this),
                ul = select.prev();
            ul.children('li').toArray().forEach(function (li, i) {
                if ($(li).hasClass('active')) {
                    newValuesArr.push(select.children('option').toArray()[i].value);
                }
            });
            select.val(newValuesArr);
        });
        //}
    };
})

//Not Using End

SocioboardApp.directive('myRepeatTimeoutDirective', function ($timeout) {
    return function (scope, element, attrs) {
        if (scope.$last === true) {
            $timeout(function () {
                $('select').material_select();
                $('select').change(function () {
                    var newValuesArr = [],
                        select = $(this),
                        ul = select.prev();
                    ul.children('li').toArray().forEach(function (li, i) {
                        if ($(li).hasClass('active')) {
                            newValuesArr.push(select.children('option').toArray()[i].value);
                        }
                    });
                    select.val(newValuesArr);
                });

            });
        }
    };
})

SocioboardApp.directive('myRepeatTimeoutGroupsDirective', function ($timeout) {
    return function (scope, element, attrs) {
        if (scope.$last === true) {
            $timeout(function () {
                $('select').material_select();

            });
        }
    };
})







//codes to redirect all unauthorized calls to index page
SocioboardApp.config(function ($httpProvider) {
    $httpProvider.interceptors.push('SB401Detector');
});



// interceptor logic.
SocioboardApp.factory('SB401Detector', function ($location, $q) {
    return {
        responseError: function (response) {
            if (response.status === 401) {
                window.top.location = "../Index/Index";
                return $q.reject(response);
            }
            else {
                return $q.reject(response);
            }
        }
    };
});
//end codes to redirect all unauthorized calls to index page


/* Configure ocLazyLoader(refer: https://github.com/ocombe/ocLazyLoad) */
SocioboardApp.config(['$ocLazyLoadProvider', function ($ocLazyLoadProvider) {
    $ocLazyLoadProvider.config({
        cssFilesInsertBefore: 'ng_load_plugins_before' // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
    });
}]);

/********************************************
 BEGIN: BREAKING CHANGE in AngularJS v1.3.x:
*********************************************/
/**
`$controller` will no longer look for controllers on `window`.
The old behavior of looking on `window` for controllers was originally intended
for use in examples, demos, and toy apps. We found that allowing global controller
functions encouraged poor practices, so we resolved to disable this behavior by
default.

To migrate, register your controllers with modules rather than exposing them
as globals:

Before:

```javascript
function MyController() {
  // ...
}
```

After:

```javascript
angular.module('myApp', []).controller('MyController', [function() {
  // ...
}]);

Although it's not recommended, you can re-enable the old behavior like this:

```javascript
angular.module('myModule').config(['$controllerProvider', function($controllerProvider) {
  // this option might be handy for migrating old apps, but please don't use it
  // in new ones!
  $controllerProvider.allowGlobals();
}]);
**/

//AngularJS v1.3.x workaround for old style controller declarition in HTML
SocioboardApp.config(['$controllerProvider', function ($controllerProvider) {
    // this option might be handy for migrating old apps, but please don't use it
    // in new ones!
    $controllerProvider.allowGlobals();
}]);

/********************************************
 END: BREAKING CHANGE in AngularJS v1.3.x:
*********************************************/

/* Setup global settings */
SocioboardApp.factory('settings', ['$rootScope', function ($rootScope) {
    // supported languages
    var settings = {
        layout: {
            pageSidebarClosed: false, // sidebar state
            pageAutoScrollOnLoad: 1000 // auto scroll to top on page load
        },
        layoutImgPath: '/contents/socioboard/images/',
        layoutCssPath: '/contents/socioboard/css/'
    };

    $rootScope.settings = settings;

    return settings;
}]);

/* Setup App Main Controller */
// SocioboardApp.controller('AppController', ['$scope', '$rootScope', function($scope, $rootScope) {
//     $scope.$on('$viewContentLoaded', function() {
//         Socioboard.initComponents(); // init core components
//         //Layout.init(); //  Init entire layout(header, footer, sidebar, etc) on page load if the partials included in server side instead of loading with ng-include directive 
//     });
// }]);

/***
Layout Partials.
By default the partials are loaded through AngularJS ng-include directive. In case they loaded in server side(e.g: PHP include function) then below partial 
initialization can be disabled and Layout.init() should be called on page load complete as explained above.
***/

/* Setup Layout Part - Header */
SocioboardApp.controller('HeaderController', function ($rootScope, $scope, $http, domain, apiDomain, groupmember) {
    $scope.$on('$includeContentLoaded', function () {
        console.log($rootScope.user);
        localStorage.setItem("user", JSON.stringify($rootScope.user));


        $scope.changeGroup = function (groupId) {
            console.log($rootScope.groupId);
            $http.get(domain + '/Home/changeSelectdGroupId?groupId=' + groupId)
                          .then(function (response) {
                              if (response.data == "changed") {
                                  $rootScope.groupId = groupId;
                                  window.location.reload();
                              }
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
        }



        $scope.getOnPageLoadGroups = function () {
            var canContinue = true;
            angular.forEach($rootScope.groups, function (value, key) {
                if (canContinue && value.id == $rootScope.groupId) {
                    groupmember.getGroupMembers(key, $rootScope.groupId)
                    $rootScope.groupIndex = key;
                    canContinue = false;
                }
            });
        }

        $scope.getOnPageLoadGroups();
    });
});

/* Setup Layout Part - Sidebar */
/* Setup Layout Part - Sidebar */
SocioboardApp.controller('SidebarController', function ($rootScope, $scope, $http, apiDomain, domain) {
    $scope.$on('$includeContentLoaded', function () {

        $scope.fbProfileFilter = function (item) {
            return item.profileType === 0 || item.profileType === 1;
        };
        $scope.logout = function () {
            console.log("sdfasfsa");
            //alert('hello');
            $rootScope.groupId = '';
            //$rootScope.user.Id = '';
            //codes to logout from all session
            $http.get(domain + '/Home/Logout')
                          .then(function (response) {
                              debugger;
                              var cookies = document.cookie.split(";");
                              for (var i = 0; i < cookies.length; i++) {
                                  var cookie = cookies[i];
                                  var eqPos = cookie.indexOf("=");
                                  var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                                  if (name.indexOf("socioboardpluginemailId") > -1) {
                                      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
                                  }
                                  if (name.indexOf("socioboardpluginToken") > -1) {
                                      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
                                  }
                              }


                              localStorage.removeItem("user");
                              window.location.href = '../Index/Index';
                              window.location.reload();
                          }, function (reason) {
                              $scope.error = reason.data;
                          });

            // end codes to logout from all session
        }

        ////codes to load  social profiles start
        //$http.get(apiDomain + '/api/GroupProfiles/GetGroupProfiles?groupId=' + $rootScope.groupId)
        //              .then(function (response) {

        //                  $rootScope.lstProfiles = response.data;
        //              }, function (reason) {
        //                  $scope.error = reason.data;
        //              });
        // end codes to load social profiles

        $('.collapsible').collapsible();
        // Layout.initSidebar(); // init sidebar


        $scope.getHttpsURL = function (obj) {
            if (obj.includes("wwwroot\\")) {
                return apiDomain + "/api/Media/get?id=" + obj.split("wwwroot\\upload\\")[1];
            }
            else {
                return obj;
            }
        };
    });
});

/* Setup Layout Part - Sidebar */
// SocioboardApp.controller('PageHeadController', ['$scope', function($scope) {
//     $scope.$on('$includeContentLoaded', function() {        
//         Demo.init(); // init theme panel
//     });
// }]);

/* Setup Layout Part - Footer */
SocioboardApp.controller('FooterController', ['$scope', function ($scope) {
    $scope.$on('$includeContentLoaded', function () {
        // Layout.initFooter(); // init footer
    });
}]);

/* Setup Rounting For All Pages */
SocioboardApp.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

    // Redirect any unmatched url
    $urlRouterProvider.otherwise("/dashboard");

    $stateProvider
        // Dashboard
        .state('dashboard', {
            url: "/dashboard",
            templateUrl: "../contents/socioboard/views/dashboard/dashboard.html",
            data: {
                pageTitle: 'Dashboard', pageSubTitle: 'updated',
            },
            controller: "DashboardController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                             '../contents/socioboard/controllers/dashboardcontroller.js',
                             '../contents/socioboard/js/admin/plugins.js',
                             '../contents/socioboard/css/admin/custom.css'
                        ]
                    });
                }]
            }
        })

         // smart inbox controller

        .state('smartinbox', {
            url: "/smartinbox",
            templateUrl: "../contents/socioboard/views/message/smartinbox.html",
            data: { pageTitle: 'Smart Inbox', pageSubTitle: 'updated' },
            controller: "SmartInboxController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/smartinboxcontroller.js',
                            '../contents/socioboard/services/grouptask.js'
                        ]
                    });
                }]
            }
        })

         // inbox message controller
        .state('inboxmessage', {
            url: "/inboxmessage",
            templateUrl: "../contents/socioboard/views/message/inboxmessage.html",
            data: { pageTitle: 'Inbox Message', pageSubTitle: 'updated' },
            controller: "InboxMessageController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/inboxmessagecontroller.js',
                            '../contents/socioboard/js/admin/moment.min.js',
                            '../contents/socioboard/services/grouptask.js'
                        ]
                    });
                }]
            }
        })

         // MyTask controller

        .state('mytask', {
            url: "/mytask",
            templateUrl: "../contents/socioboard/views/message/mytask.html",
            data: { pageTitle: 'My Task', pageSubTitle: 'updated' },
            controller: "MyTaskController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/mytaskcontroller.js',
                             '../contents/socioboard/services/grouptask.js',
                             '../contents/socioboard/services/utility.js'
                        ]
                    });
                }]
            }
        })

         // Sent Messages Controller 
         .state('sentmessages', {
             url: "/sentmessages",
             templateUrl: "../contents/socioboard/views/message/sentmessages.html",
             data: { pageTitle: 'Sent Messages', pageSubTitle: 'updated' },
             controller: "SentMessagesController",

             resolve: {
                 deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                     return $ocLazyLoad.load({
                         name: 'SocioboardApp',
                         insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                         files: [
                             '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/js/admin/moment.min.js',
                             '../contents/socioboard/controllers/sentmessagescontroller.js'
                         ]
                     });
                 }]
             }
         })

          // schedule message controller
        .state('schedulemessage', {
            url: "/schedulemessage",
            templateUrl: "../contents/socioboard/views/publishing/schedulemsg.html",
            data: { pageTitle: 'Schedule Message', pageSubTitle: 'updated' },
            controller: "ScheduleMessageController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/global/plugins/mdPickers/dist/mdPickers.css',
                            '../contents/socioboard/global/plugins/mdPickers/dist/mdPickers.js',
                            '../contents/socioboard/global/plugins/moment.js',
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/schedulemsgcontroller.js'

                        ]
                    });
                }]
            }
        })

         // draft message controller
         .state('draft', {
             url: "/draft",
             templateUrl: "../contents/socioboard/views/publishing/draft.html",
             data: { pageTitle: 'Draft Message', pageSubTitle: 'updated' },
             controller: "DraftMessageController",

             resolve: {
                 deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                     return $ocLazyLoad.load({
                         name: 'SocioboardApp',
                         insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                         files: [
                             '../contents/socioboard/js/admin/plugins.js',
                             '../contents/socioboard/js/admin/moment.min.js',
                             '../contents/socioboard/css/admin/custom.css',
                             '../contents/socioboard/controllers/draftmsgcontroller.js',
                             '../contents/socioboard/services/utility.js'
                         ]
                     });
                 }]
             }
         })
          // socialqueue message controller
         .state('socioqueue', {
             url: "/socioqueue",
             templateUrl: "../contents/socioboard/views/publishing/socioqueue.html",
             data: { pageTitle: 'SocioQueue', pageSubTitle: 'updated' },
             controller: "SocioqueueController",

             resolve: {
                 deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                     return $ocLazyLoad.load({
                         name: 'SocioboardApp',
                         insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                         files: [
                             '../contents/socioboard/js/admin/plugins.js',
                             '../contents/socioboard/js/admin/moment.min.js',
                             '../contents/socioboard/css/admin/custom.css',
                             '../contents/socioboard/controllers/socioqueuecontroller.js'
                         ]
                     });
                 }]
             }
         })


        .state('calendar', {
            url: "/calendar",
            templateUrl: "../contents/socioboard/views/publishing/calendar.html",
            data: { pageTitle: 'Calendar', pageSubTitle: 'updated' },
            controller: "CalendarController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins/fullcalendar/css/fullcalendar.min.css',
                            '../contents/socioboard/js/admin/plugins/fullcalendar/lib/jquery-ui.custom.min.js',
                            '../contents/socioboard/js/admin/plugins/fullcalendar/lib/moment.min.js',
                            '../contents/socioboard/js/admin/plugins/fullcalendar/js/fullcalendar.min.js',
                            '../contents/socioboard/js/admin/plugins/fullcalendar/fullcalendar-script.js',
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/calendarcontroller.js'
                        ]
                    });
                }]
            }
        })


        // discovery
        .state('discovery', {
            url: "/discovery",
            templateUrl: "../contents/socioboard/views/discovery/discovery.html",
            data: { pageTitle: 'Discovery', pageSubTitle: 'updated' },
            controller: "DiscoveryController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                             '../contents/socioboard/js/admin/moment.min.js',
                            '../contents/socioboard/controllers/discoverycontroller.js'
                        ]
                    });
                }]
            }
        })

        // Smart Search
        .state('smartsearch', {
            url: "/smartsearch",
            templateUrl: "../contents/socioboard/views/discovery/smartsearch.html",
            data: { pageTitle: 'SmartSearch', pageSubTitle: 'updated' },
            controller: "DiscoveryController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                             'https://maps.googleapis.com/maps/api/js?key=AIzaSyAyfTLfVpXa2nAkYREyFdst3bl0B6sYuGU',
                             '../contents/socioboard/js/admin/moment.min.js',
                            '../contents/socioboard/controllers/discoverycontroller.js'
                        ]
                    });
                }]
            }
        })

           // facebook feeds controller

         .state('facebookfeeds', {
             url: "/facebookfeeds/{profileId}",
             templateUrl: "../contents/socioboard/views/feeds/facebookfeeds.html",
             data: { pageTitle: 'Facebook Live feeds', pageSubTitle: 'updated' },
             controller: "FacebookFeedsController",

             resolve: {
                 deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                     return $ocLazyLoad.load({
                         name: 'SocioboardApp',
                         insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                         files: [
                             '../contents/socioboard/js/admin/plugins.js',
                             '../contents/socioboard/controllers/facebookfeedscontroller.js',
                             '../contents/socioboard/js/admin/moment.min.js',
                            '../contents/socioboard/services/grouptask.js',
                            '../contents/socioboard/directives/directives.js'
                         ]
                     });
                 }]
             }
         })
        // AngularJS plugins


      .state('profilesettings', {
          url: "/profilesettings",
          templateUrl: "../contents/socioboard/views/settings/profilesettings.html",
          data: { pageTitle: 'Profile Settings', pageSubTitle: 'updated' },
          controller: "ProfileSettingController",

          resolve: {
              deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                  return $ocLazyLoad.load({
                      name: 'SocioboardApp',
                      insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                      files: [
                          '../contents/socioboard/global/plugins/mdPickers/dist/mdPickers.css',
                            '../contents/socioboard/global/plugins/mdPickers/dist/mdPickers.js',
                            '../contents/socioboard/global/plugins/moment.js',
                          '../contents/socioboard/js/admin/plugins.js',
                          '../contents/socioboard/services/userservice.js',
                          '../contents/socioboard/controllers/profilesettingcontroller.js'
                      ]
                  });
              }]
          }
      })



      .state('upgradeplan', {
          url: "/upgradeplan",
          templateUrl: "../contents/socioboard/views/settings/upgradeplan.html",
          data: { pageTitle: 'Upgrade Plans', pageSubTitle: 'updated' },
          controller: "ProfileSettingController",

          resolve: {
              deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                  return $ocLazyLoad.load({
                      name: 'SocioboardApp',
                      insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                      files: [
                          '../contents/socioboard/js/admin/plugins.js',
                          '../contents/socioboard/services/userservice.js',
                          '../contents/socioboard/css/frontend/style.css',
                          '../contents/socioboard/controllers/profilesettingcontroller.js'
                      ]
                  });
              }]
          }
      })

        // Profiles list
        .state('profiles', {
            url: "/profiles",
            templateUrl: "../contents/socioboard/views/dashboard/profiles.html",
            data: { pageTitle: 'Profile List', pageSubTitle: 'updated' },
            controller: "ProfilesController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [

                            '../contents/socioboard/js/admin/plugins.js',
                             '../contents/socioboard/controllers/profilescontroller.js'

                        ]
                    });
                }]
            }
        })

     // twitter feeds controller
         .state('twitterfeeds', {
             url: "/twitterfeeds/{profileId}",
             templateUrl: "../contents/socioboard/views/feeds/twitterfeeds.html",
             data: { pageTitle: 'Twitter Live feeds', pageSubTitle: 'updated' },
             controller: "TwitterFeedsController",
             resolve: {
                 deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                     return $ocLazyLoad.load({
                         name: 'SocioboardApp',
                         insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                         files: [
                             '../contents/socioboard/js/admin/plugins.js',
                             '../contents/socioboard/controllers/twitterfeedscontroller.js',
                            '../contents/socioboard/services/grouptask.js'
                         ]
                     });
                 }]
             }
         })


        // instagram feeds controller
         .state('instagramfeeds', {
             url: "/instagramfeeds/{profileId}",
             templateUrl: "../contents/socioboard/views/feeds/instagramfeeds.html",
             data: { pageTitle: 'Instagram Live feeds', pageSubTitle: 'updated' },
             controller: "InstagramFeedsController",
             resolve: {
                 deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                     return $ocLazyLoad.load({
                         name: 'SocioboardApp',
                         insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                         files: [
                             '../contents/socioboard/js/admin/plugins.js',
                             '../contents/socioboard/js/admin/moment.min.js',
                             '../contents/socioboard/controllers/instagramfeedscontroller.js',
                            '../contents/socioboard/services/grouptask.js'
                         ]
                     });
                 }]
             }
         })


         // Linkedin Company feeds controller

        .state('linkedin_comp_feeds', {
            url: "/linkedin_comp_feeds.html/{profileId}",
            templateUrl: "../contents/socioboard/views/feeds/linkedin_comp_feeds.html",
            data: { pageTitle: 'LinkedIn Company page Live feeds', pageSubTitle: 'updated' },
            controller: "LinkedinCompFeedsController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                             '../contents/socioboard/js/admin/moment.min.js',
                            '../contents/socioboard/controllers/linkedin_comp_feeds_controller.js',
                            '../contents/socioboard/services/grouptask.js'
                        ]
                    });
                }]
            }
        })


          .state('googleplusfeeds', {
              url: "/googleplusfeeds/{profileId}",
              templateUrl: "../contents/socioboard/views/feeds/googleplusfeeds.html",
              data: { pageTitle: 'Google plus Live feeds', pageSubTitle: 'updated' },
              controller: "GooglePlusFeedsController",

              resolve: {
                  deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                      return $ocLazyLoad.load({
                          name: 'SocioboardApp',
                          insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                          files: [
                              '../contents/socioboard/js/admin/plugins.js',
                             '../contents/socioboard/js/admin/moment.min.js',
                              '../contents/socioboard/controllers/googleplusfeedscontroller.js'
                          ]
                      });
                  }]
              }
          })

        // Rss News

        .state('rss_news', {
            url: "/rss_news.html",
            templateUrl: "../contents/socioboard/views/rss_news/rss_news.html",
            data: { pageTitle: 'Rss News', pageSubTitle: 'updated' },
            controller: "RssNewsController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/rssnewscontroller.js'
                        ]
                    });
                }]
            }
        })



          // AutoMate Rss Feeds

        .state('automate_rss_feeds', {
            url: "/automate_rss_feeds.html",
            templateUrl: "../contents/socioboard/views/rss_feeds/automate_rss_feeds.html",
            data: { pageTitle: 'RssQueue', pageSubTitle: 'updated' },
            controller: "AutoMateRssFeedsController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/global/plugins/datatables/media/css/jquery.dataTables.min.css',
                            '../contents/socioboard/global/plugins/datatables/media/js/jquery.dataTables.min.js',
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/automaterssfeedscontroller.js'
                        ]
                    });
                }]
            }
        })



        // Rss Feeds

        .state('rss_feeds', {
            url: "/rss_feeds.html",
            templateUrl: "../contents/socioboard/views/rss_feeds/rss_feeds.html",
            data: { pageTitle: 'RssFeeds', pageSubTitle: 'updated' },
            controller: "RssFeedsController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/rssfeedscontroller.js'
                        ]
                    });
                }]
            }
        })


        // Posted Rss Feeds

        .state('posted_rss_feeds', {
            url: "/posted_rss_feeds.html",
            templateUrl: "../contents/socioboard/views/rss_feeds/posted_rss_feeds.html",
            data: { pageTitle: 'RssQueue', pageSubTitle: 'updated' },
            controller: "PostedRssFeedsController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                           '../contents/socioboard/global/plugins/datatables/media/css/jquery.dataTables.min.css',
                            '../contents/socioboard/global/plugins/datatables/media/js/jquery.dataTables.min.js',
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/postedrssfeedscontroller.js'
                        ]
                    });
                }]
            }
        })


        // Rss Queue controller

        .state('rss_queue', {
            url: "/rss_queue.html",
            templateUrl: "../contents/socioboard/views/rss_feeds/rss_queue.html",
            data: { pageTitle: 'RssQueue', pageSubTitle: 'updated' },
            controller: "RssQueueController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                             '../contents/socioboard/global/plugins/datatables/media/css/jquery.dataTables.min.css',
                            '../contents/socioboard/global/plugins/datatables/media/js/jquery.dataTables.min.js',
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/rssqueuecontroller.js'
                        ]
                    });
                }]
            }
        })



         // group report

        .state('groupreport', {
            url: "/groupreport.html",
            templateUrl: "../contents/socioboard/views/reports/groupreport.html",
            data: { pageTitle: 'Group Report', pageSubTitle: 'updated' },
            controller: "GroupreportController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [

                            '../contents/socioboard/js/admin/plugins/sparkline/jquery.sparkline.min.js',
                            '../contents/socioboard/global/plugins/amcharts/charts-amcharts.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/amcharts.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/serial.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/pie.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/themes/light.js',
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/groupreportcontroller.js',
                            '../contents/socioboard/js/admin/moment.min.js'

                        ]
                    });
                }]
            }
        })


          // tweeter group report

        .state('twitterreports', {
            url: "/twitterreports",
            templateUrl: "../contents/socioboard/views/reports/twitterreports.html",
            data: { pageTitle: 'Tweeter Group Report', pageSubTitle: 'updated' },
            controller: "TwitterreportsController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/global/plugins/amcharts/amcharts/amcharts.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/serial.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/themes/light.js',
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/js/admin/moment.min.js',
                            '../contents/socioboard/controllers/twitterreportscontroller.js',
                        ]
                    });
                }]
            }
        })

         // googleanalytic report

        .state('googleanalyticsreport', {
            url: "/googleanalyticsreport",
            templateUrl: "../contents/socioboard/views/reports/googleanalyticsreport.html",
            data: { pageTitle: 'googleanalytic Report', pageSubTitle: 'updated' },
            controller: "GoogleAnalyticreportController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/global/plugins/amcharts/charts-amcharts.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/amcharts.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/serial.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/themes/light.js',
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/js/admin/moment.min.js',
                            '../contents/socioboard/controllers/googleanalyticreportcontroller.js',

                        ]
                    });
                }]
            }
        })
          // Facebook public page report
        .state('facebookpagereport', {
            url: "/facebookpagereport.html",
            templateUrl: "../contents/socioboard/views/reports/facebookpagereport.html",
            data: { pageTitle: 'Facebook Page Report', pageSubTitle: 'updated' },
            controller: "FacebookpagereportController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [

                            '../contents/socioboard/global/plugins/datatables/media/css/jquery.dataTables.min.css',
                            '../contents/socioboard/global/plugins/datatables/media/js/jquery.dataTables.min.js',
                            '../contents/socioboard/js/admin/plugins/sparkline/jquery.sparkline.min.js',
                            '../contents/socioboard/global/plugins/amcharts/charts-amcharts.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/amcharts.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/serial.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/pie.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/themes/light.js',
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/facebookpagereportcontroller.js',
                              '../contents/socioboard/js/admin/moment.min.js',

                        ]
                    });
                }]
            }
        })


            // Facebook report

        .state('facebookreport', {
            url: "/facebookreport.html",
            templateUrl: "../contents/socioboard/views/reports/facebookreport.html",
            data: { pageTitle: 'Facebook Report', pageSubTitle: 'updated' },
            controller: "FacebookreportController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [

                            '../contents/socioboard/global/plugins/datatables/media/css/jquery.dataTables.min.css',
                            '../contents/socioboard/global/plugins/datatables/media/js/jquery.dataTables.min.js',
                            '../contents/socioboard/js/admin/plugins/sparkline/jquery.sparkline.min.js',
                            '../contents/socioboard/global/plugins/amcharts/charts-amcharts.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/amcharts.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/serial.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/pie.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/themes/light.js',
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/facebookreportcontroller.js',
                            '../contents/socioboard/js/admin/moment.min.js'

                        ]
                    });
                }]
            }
        })

         // Instagram report

        .state('instagramreport', {
            url: "/instagramreport.html",
            templateUrl: "../contents/socioboard/views/reports/instagramreport.html",
            data: { pageTitle: 'Instagram Report', pageSubTitle: 'updated' },
            controller: "InstagramreportController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [

                            '../contents/socioboard/global/plugins/datatables/media/css/jquery.dataTables.min.css',
                            '../contents/socioboard/global/plugins/datatables/media/js/jquery.dataTables.min.js',
                            '../contents/socioboard/js/admin/plugins/sparkline/jquery.sparkline.min.js',
                            '../contents/socioboard/global/plugins/amcharts/charts-amcharts.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/amcharts.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/serial.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/pie.js',
                            '../contents/socioboard/global/plugins/amcharts/amcharts/themes/light.js',
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/instagramreportcontroller.js'

                        ]
                    });
                }]
            }
        })


         // Shareathon //

        // Create group shareathon controller

        .state('creategroupshareathon', {
            url: "/create_group_shareathon.html",
            templateUrl: "../contents/socioboard/views/shareathon/create_group_shareathon.html",
            data: { pageTitle: 'Create group shareathon', pageSubTitle: 'updated' },
            controller: "CreateGroupShareathonController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/creategroupshareathoncontroller.js'
                        ]
                    });
                }]
            }
        })

        // Edit group shareathon controller

        .state('editgroupshareathon', {
            url: "/edit_group_shareathon.html",
            templateUrl: "../contents/socioboard/views/shareathon/edit_group_shareathon.html",
            data: { pageTitle: 'Edit group shareathon', pageSubTitle: 'updated' },
            controller: "CreateGroupShareathonController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/creategroupshareathoncontroller.js'
                        ]
                    });
                }]
            }
        })

        // group shareathon

        .state('groupshareathon', {
            url: "/group_shareathon.html",
            templateUrl: "../contents/socioboard/views/shareathon/group_shareathon.html",
            data: { pageTitle: 'Group Shareathon', pageSubTitle: 'updated' },
            controller: "GroupShareathonController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/groupshareathoncontroller.js'
                        ]
                    });
                }]
            }
        })

        // Create Page shareathon controller

        .state('createpageshareathon', {
            url: "/create_page_shareathon.html",
            templateUrl: "../contents/socioboard/views/shareathon/create_page_shareathon.html",
            data: { pageTitle: 'Create page shareathon', pageSubTitle: 'updated' },
            controller: "CreatePageShareathonController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/createpageshareathoncontroller.js'
                        ]
                    });
                }]
            }
        })

        //edit page shareathon
          .state('editpageshareathon', {
              url: "/edit_page_shareathon.html",
              templateUrl: "../contents/socioboard/views/shareathon/edit_page_shareathon.html",
              data: { pageTitle: 'Edit page shareathon', pageSubTitle: 'updated' },
              controller: "CreatePageShareathonController",

              resolve: {
                  deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                      return $ocLazyLoad.load({
                          name: 'SocioboardApp',
                          insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                          files: [
                              '../contents/socioboard/js/admin/plugins.js',
                              '../contents/socioboard/controllers/createpageshareathoncontroller.js'
                          ]
                      });
                  }]
              }
          })

        // page shareathon

        .state('pageshareathon', {
            url: "/page_shareathon.html",
            templateUrl: "../contents/socioboard/views/shareathon/page_shareathon.html",
            data: { pageTitle: 'Page Shareathon', pageSubTitle: 'updated' },
            controller: "PageShareathonController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/pageshareathoncontroller.js'
                        ]
                    });
                }]
            }
        })




        .state('groups', {
            url: "/groups",
            templateUrl: "../contents/socioboard/views/groups/groups.html",
            data: { pageTitle: 'Groups', pageSubTitle: 'updated' },
            controller: "GroupsController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/groupscontroller.js',
                            '../contents/socioboard/services/utility.js'
                        ]
                    });
                }]
            }
        })

    // BoardList controller

        .state('boardlist', {
            url: "/boardlist",
            templateUrl: "../contents/socioboard/views/boardme/boardlist.html",
            data: { pageTitle: 'BoardList', pageSubTitle: 'updated' },
            controller: "BoardlistController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/global/plugins/datatables/media/css/jquery.dataTables.min.css',
                            '../contents/socioboard/global/plugins/datatables/media/js/jquery.dataTables.min.js',
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/boardlistcontroller.js'
                        ]
                    });
                }]
            }
        })


        // Create Board me controller
        .state('createboard', {
            url: "/createboard",
            templateUrl: "../contents/socioboard/views/boardme/createboard.html",
            data: { pageTitle: 'Create BoardMe', pageSubTitle: 'updated' },
            controller: "CreateBoardController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/createboardcontroller.js'
                        ]
                    });
                }]
            }
        })


         // Create Board me controller
        .state('board', {
            url: "/board/{boardId}/{boardName}",
            templateUrl: "../contents/socioboard/views/boardme/board.html",
            data: { pageTitle: 'BoardMe', pageSubTitle: 'updated' },
            controller: "BoardController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                             '../contents/socioboard/global/plugins/masonry.pkgd.min.js',
                             '../contents/socioboard/global/plugins/moment.js',
                            '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/js/admin/imagesloaded.pkgd.min.js',
                             '../contents/socioboard/controllers/boardcontroller.js'
                        ]
                    });
                }]
            }
        })


    .state('boardanalytics', {
        url: "/boardanalytics/{boardName}",
        templateUrl: "../contents/socioboard/views/boardme/boardanalytics.html",
        data: { pageTitle: 'BoardList', pageSubTitle: 'updated' },
        controller: "BoardAnalyticsController",

        resolve: {
            deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load({
                    name: 'SocioboardApp',
                    insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                    files: [

                        '../contents/socioboard/js/admin/plugins/sparkline/jquery.sparkline.min.js',
                        '../contents/socioboard/global/plugins/amcharts/charts-amcharts.js',
                        '../contents/socioboard/global/plugins/amcharts/amcharts/amcharts.js',
                        '../contents/socioboard/global/plugins/amcharts/amcharts/serial.js',
                        '../contents/socioboard/global/plugins/amcharts/amcharts/pie.js',
                        '../contents/socioboard/global/plugins/amcharts/amcharts/themes/light.js',
                        '../contents/socioboard/global/plugins/datatables/media/css/jquery.dataTables.min.css',
                        '../contents/socioboard/global/plugins/datatables/media/js/jquery.dataTables.min.js',
                        '../contents/socioboard/js/admin/plugins.js',
                        '../contents/socioboard/controllers/boardanalyticscontroller.js'
                    ]
                });
            }]
        }
    })

     // Design Feeds Sample

        .state('facebookgrouppost', {
            url: "/facebookgrouppost",
            templateUrl: "../contents/socioboard/views/design/design_feeds.html",
            data: { pageTitle: 'Design Feeds', pageSubTitle: 'updated' },
            controller: "DesignFeedsController",

            resolve: {
                deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'SocioboardApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '../contents/socioboard/global/plugins/masonry.pkgd.min.js',
                             '../contents/socioboard/js/admin/moment.min.js',
                            '../contents/socioboard/js/admin/imagesloaded.pkgd.min.js',
                            '../contents/socioboard/js/admin/plugins.js',
                             '../contents/socioboard/controllers/designfeedscontroller.js'

                        ]
                    });
                }]
            }
        })

       .state('linkedingrouppost', {
           url: "/linkedingrouppost",
           templateUrl: "../contents/socioboard/views/design/design_linfeeds.html",
           data: { pageTitle: 'Design Feeds', pageSubTitle: 'updated' },
           controller: "DesignFeedsINController",

           resolve: {
               deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                   return $ocLazyLoad.load({
                       name: 'SocioboardApp',
                       insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                       files: [
                           '../contents/socioboard/global/plugins/masonry.pkgd.min.js',
                            '../contents/socioboard/js/admin/moment.min.js',
                           '../contents/socioboard/js/admin/plugins.js',
                            '../contents/socioboard/controllers/designlinfeedscontroller.js'

                       ]
                   });
               }]
           }
       })

}]).run(function ($rootScope, $state) {
    $rootScope.$on('$stateChangeStart', function (event, toState, $stateParams) {

        if (localStorage.user != "" && localStorage.user != undefined) {

        }
        else {
            window.location.href = '../Index/Index';
            window.location.reload();
        }
    });
});

