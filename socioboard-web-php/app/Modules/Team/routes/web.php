<?php

use Illuminate\Http\Request;
use App\Modules\Team\Controllers\TeamController;


Route::group(['module' => 'Team', 'middleware' => ['web'], 'namespace' => 'App\Modules\Team\Controllers'], function () {
    Route::get('test', 'FacebookController@test');
    Route::group(['middleware' => ['authenticateuser:user']], function () {
        Route::post('/create-team', 'TeamController@createTeam');
        Route::get('/create-team', 'TeamController@createTeam');
        Route::get('/view-team/{id}', 'TeamController@viewTeam');
        Route::post('/delete-team', 'TeamController@deleteTeam');
        Route::post('/invite-team/{id}', 'TeamController@inviteTeam');
        Route::post('/addToOtherTeam', 'TeamController@addToOtherTeam');
        Route::post('/deleteTeamSocialProfile', 'TeamController@deleteTeamSocialProfile');
        Route::post('/edit-team', 'TeamController@editteam');
        Route::get('accept-invitation', 'TeamController@acceptInvitation');
        Route::post('accept-invitation', 'TeamController@acceptInvitation'); // accept inv
        Route::post('decline-invitation', 'TeamController@declineInvitation'); // decline inv
        Route::post('withdraw-invitation', 'TeamController@withdrawInvitation'); // withdraw inv
        Route::post('/remove-member', 'TeamController@removeMember');//remove member
        Route::post('/leave-team', 'TeamController@leaveTeam');//leave team


        //facebook
        Route::get('/facebook-add/{network}/{team}', 'FacebookController@FacebookAdd');
        Route::get('addSocialProfile', 'FacebookController@addSocialProfile');
        Route::post('facebookPageAdd', 'FacebookController@facebookPageAdd');

        Route::post('insta-business-add', 'FacebookController@instaBusinessAdd');
        Route::get('clear-add-profile-session','TeamController@clearAddSession');


        Route::post('deleteSocialAccount', 'FacebookController@deleteSocialAccount');
        //    Route::get('view-facebook-feeds/{accountid}','FacebookController@viewFacebookFeeds');

        // postFiles
        Route::post('view-facebook-feeds/{accountid}/postFiles', function (Request $request) {
            return TeamController::uploadMedia($request);
        });

        Route::get('deleteFacebookPageSes', 'FacebookController@deleteFacebookPageSes');

        //twitter
        Route::get('twitter/callback', 'TwitterController@twittercallback');
        Route::get('twitter/{teamid}', 'TwitterController@twitterGet');


        // ------------------- TWITTER --------------------------

        /*
                Route::get('view-twitter-feeds/{accountid}', function ($account_id, Request $request) {

                    $controller = new \App\Modules\Team\Controllers\TwitterController();
                    return $controller->viewPage($account_id, $request);
                })->name('viewTwitterFeeds');
        */

        // -------------------- Common routes ------------------
        Route::group(['prefix' => '/view-{socialNetwork}-feeds'], function () {

            $c = new \App\Modules\Team\Controllers\TeamController();

            Route::get('aaa', function ($socialNetwork) use ($c) {
                print_r($c);
            });
        });

        // dashboard
        Route::get('view-{socialNetwork}-feeds/{accountid}', function (Request $request, $socialNetwork, $account_id) {
            return TeamController::getControllerInstance($socialNetwork)->viewPage($account_id, $request);
        })->name('socialNetworkDashboard');

        // page

        // for Pinterest only
        Route::any('view-pinterest-feeds/{accountId}/{pageId}', function ($accountId, $pageId) {
            $pc = new \App\Modules\Team\Controllers\PinterestController();
            return $pc->viewPage($accountId, $pageId);
        })
            ->where('pageId', '[0-9]+')
            ->name('socialNetworkPinterestPageContent');

        // for all the Networks
        Route::any('view-{socialNetwork}-feeds/{accountid}/{pageId}', function (Request $request, $socialNetwork, $accountId, $pageId) {
            return TeamController::getControllerInstance($socialNetwork)->viewPosts($request, $accountId, $pageId);
        })
            ->where('pageId', '[0-9]+')
            ->name('socialNetworkPageContent');

        // send Like
        Route::any('view-{socialNetwork}-feeds/{accountId}/sendLike', function (Request $request, $socialNetwork, $accountId) {
            return TeamController::getControllerInstance($socialNetwork)->sendLike($request->input('postId'), $accountId);
        });

        // send Comment
        Route::post('view-{socialNetwork}-feeds/{accountid}/sendComment', function (Request $request, $socialNetwork) {
            return TeamController::getControllerInstance($socialNetwork)->sendComment($request);
        });

        // re-share
        Route::post('view-{socialNetwork}-feeds/{accountid}/reShare', function (Request $request, $socialNetwork) {
            return TeamController::publishPost($request);
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
        Route::get('pin-board-create', 'PinterestController@boardCreate');
        Route::get('pin-board-delete','PinterestController@boardDelete');


        //publish
        Route::get('publish', 'PublishController@publish');
        Route::post('/publish-data', 'PublishController@publishData');

        //App insight
        Route::get('report/{account_id}/{network}', 'ReportController@reportingTo');
        Route::get('team-report/{team_id}', 'ReportController@teamReport');
        Route::post('get-facebook-insight', 'ReportController@getFacebookFanInsight');
        Route::post('get-youtube-insight', 'ReportController@getYoutubeInsight');
        Route::post('get-insta-insight', 'ReportController@getInstaInsight');
        Route::post('get-twitter-insight', 'ReportController@getTwitterInsight');
        Route::post('get-team-insight', 'ReportController@getTeamReport');


        //youtube Feeds
        Route::get('get-feeds/{account_id}/{network}', 'YoutubeController@getProfileFeeds');
        Route::post('get-youtube-post', 'YoutubeController@getYoutubeFeeds');
        Route::post('get-youtube-action', 'YoutubeController@getYoutubeAction');
        Route::post('get-instagram-business-post', 'InstagramController@getInstagramBusinessPost');

    });

});
