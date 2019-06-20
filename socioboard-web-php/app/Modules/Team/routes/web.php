<?php

use Illuminate\Http\Request;

Route::group(['module' => 'Team', 'middleware' => ['web'], 'namespace' => 'App\Modules\Team\Controllers'], function () {

    Route::get('test', 'FacebookController@test');
    Route::group(['middleware' => ['authenticateuser:user']], function () {
        Route::post('/create-team', 'TeamController@createTeam');
        Route::get('/create-team', 'TeamController@createTeam');
        Route::get('/view-team/{id}', 'TeamController@viewTeam');
        Route::post('/delete-team', 'TeamController@deleteTeam');
        Route::post('/invite-team/{id}', 'TeamController@inviteTeam');
        Route::post('/addToOtherTeam', 'TeamController@addToOtherTeam');
        Route::post('/edit-team', 'TeamController@editteam');
        Route::get('accept-invitation', 'TeamController@acceptInvitation');
        Route::post('accept-invitation', 'TeamController@acceptInvitation'); // accept inv
        Route::post('decline-invitation', 'TeamController@declineInvitation'); // accept inv
        Route::post('withdraw-invitation', 'TeamController@withdrawInvitation'); // accept inv

        //facebook
        Route::get('/facebook-add/{network}/{team}', 'FacebookController@FacebookAdd');
        Route::get('addSocialProfile', 'FacebookController@addSocialProfile');
        Route::post('facebookPageAdd', 'FacebookController@facebookPageAdd');

        Route::post('insta-business-add', 'FacebookController@instaBusinessAdd');



        Route::post('deleteSocialAccount', 'FacebookController@deleteSocialAccount');
        //    Route::get('view-facebook-feeds/{accountid}','FacebookController@viewFacebookFeeds');

        Route::get('view-facebook-feeds/{accountid}', function ($account_id) {
            $FBController = new \App\Modules\Team\Controllers\FacebookController();
            return $FBController->viewPage($account_id);
        })->name('viewFBFeeds');

        /*
        Route::any('view-facebook-feeds/{accountid}/{pageId}', function (Request $request, $accountId, $pageId) {
            $controller = new \App\Modules\Team\Controllers\FacebookController();
            return $controller->viewPosts($request, $accountId, $pageId);
        })
            ->where('pageId', '[0-9]+')
            ->name('facebookPageContent');
            */

        // postFiles
        Route::post('view-facebook-feeds/{accountid}/postFiles', function (Request $request) {
            $FBController = new \App\Modules\Team\Controllers\FacebookController();
            return $FBController->uploadMedia($request);
        });

        Route::get('deleteFacebookPageSes', 'FacebookController@deleteFacebookPageSes');

        //twitter
        Route::get('twitter/callback', 'TwitterController@twittercallback');
        Route::get('twitter/{teamid}', 'TwitterController@twitterGet');


        // ------------------- TWITTER --------------------------

        Route::get('view-twitter-feeds/{accountid}', function ($account_id, Request $request) {

            $controller = new \App\Modules\Team\Controllers\TwitterController();
            return $controller->viewPage($account_id, $request);
        })->name('viewTwitterFeeds');


        // -------------------- Common routes ------------------

        // pages
        Route::any('view-{socialNetwork}-feeds/{accountid}/{pageId}', function (Request $request, $socialNetwork, $accountId, $pageId) {
            switch ($socialNetwork) {
                case 'facebook':
                    $controller = new \App\Modules\Team\Controllers\FacebookController();
                    break;
                case 'twitter':
                    $controller = new \App\Modules\Team\Controllers\TwitterController();
                    break;
                default:
                    return json_encode(['error'=>'no social network selected']);
            }

            return $controller->viewPosts($request,$accountId, $pageId);
        })
            ->where('pageId', '[0-9]+')
            ->name('facebookPageContent');



        // send Like
        Route::any('view-{socialNetwork}-feeds/{accountId}/sendLike', function (Request $request, $socialNetwork, $accountId) {
            switch ($socialNetwork) {
                case 'facebook':
                    $controller = new \App\Modules\Team\Controllers\FacebookController();
                    break;
                case 'twitter':
                    $controller = new \App\Modules\Team\Controllers\TwitterController();
                    break;
                default:
                    return json_encode(['error'=>'no social network selected']);
            }

            return $controller->sendLike($request->input('postId'), $accountId);
        });


        // send Comment
        Route::post('view-{socialNetwork}-feeds/{accountid}/sendComment', function (Request $request, $socialNetwork) {

            switch ($socialNetwork) {
                case 'facebook':
                    $controller = new \App\Modules\Team\Controllers\FacebookController();
                    break;
                case 'twitter':
                    $controller = new \App\Modules\Team\Controllers\TwitterController();
                    break;
                default:
                    return json_encode(['error'=>'no social network selected']);
            }

            return $controller->sendComment($request);
        });


        // re-share
        Route::post('view-{socialNetwork}-feeds/{accountid}/reShare', function (Request $request, $socialNetwork) {

            /*
            switch ($socialNetwork) {
                case 'facebook':
                    $controller = new \App\Modules\Team\Controllers\FacebookController();
                    break;
                case 'twitter':
            */
                    $controller = new \App\Modules\Team\Controllers\TwitterController();
              /*
                    break;
            }
              */



            return $controller->publishPost($request);
        });

        // ------------------------------------------------------

        //instagram
        Route::get('instagram/{teamid}', 'InstagramController@instagramGet');
        Route::get('instagram-callback', 'InstagramController@instagramCallback');

        //linkedin
        Route::get('linkedin-add/{network}/{teamid}', 'LinkedInController@LinkedinAdd');
        Route::get('linkedIn-callback', 'LinkedInController@linkedinCallBack');
        Route::post('linkedInCompany', 'LinkedInController@linkedInCompany');

        //google and youtube adding account
        Route::get('google-account-add/{network}/{teamid}', 'GoogleController@googleAdd');
        Route::get('google/profile/callback', 'GoogleController@googleCallback');
        Route::post('googleAnalyticsAccount', 'GoogleController@googleAnalyticsAccount');
        Route::post('youtubeChannels', 'GoogleController@youtubeChannels');

        //pinterest
        Route::get('pinterest/{network}/{teamid}', 'PinterestController@pinterestAdd');
        Route::get('pinterest-callback', 'PinterestController@pinterestCallback');


        //publish
        Route::get('publish', 'PublishController@publish');
        Route::post('/publish-data', 'PublishController@publishData');

        //App insight
        Route::get('report/{account_id}/{network}', 'ReportController@reportingTo');
        Route::post('get-facebook-insight', 'ReportController@getFacebookFanInsight');
        Route::post('get-youtube-insight', 'ReportController@getYoutubeInsight');
        Route::post('get-insta-insight', 'ReportController@getInstaInsight');


        //youtube Feeds
        Route::get('get-feeds/{account_id}/{network}', 'YoutubeController@getProfileFeeds');
        Route::post('get-youtube-post', 'YoutubeController@getYoutubeFeeds');
        Route::post('get-youtube-action', 'YoutubeController@getYoutubeAction');
        Route::post('get-instagram-business-post', 'InstagramController@getInstagramBusinessPost');

    });

});
