<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/
use Illuminate\Support\Facades\Route;
use Modules\Feeds\Http\Controllers\FeedsController;

Route::group(['module' => 'team', 'middleware' => ['authenticateUser', 'checkPlanExpiry']], function () {
    Route::get('feeds/{network}', 'FeedsController@getFeedsSocialAccounts');
    Route::get('get-next-twitter-feeds', 'FeedsController@getNextTwitterFeeds');
    Route::get('get-next-tumbler-feeds', 'FeedsController@getNextTumblerFeeds');
    Route::get('get-next-youtube-feeds', 'FeedsController@getNextYoutubeFeeds');
    Route::get('get-next-instgram-feeds', 'FeedsController@getNextInstagramFeeds');
    Route::get('get-next-linkedIn-feeds', 'FeedsController@getNextLinkedInFeeds');
    Route::get('get-next-tiktok-feeds', 'FeedsController@getNextTikTokFeeds');
    Route::post('dislike-tweet', 'FeedsController@disLikeTheTweet');
    Route::post('like-tweet', 'FeedsController@LikeTheTweet');
    Route::post('comment-on-tweet', 'FeedsController@commentOnTweet');
    Route::post('retweet-this-tweet', 'FeedsController@retweetThisTweet');
    Route::post('like-youtube-feed', 'FeedsController@likeYoutubeFeed');
    Route::post('dislike-youtube-feed', 'FeedsController@disLikeYoutubeFeed');
    Route::post('comment-on-youtubeFeed', 'FeedsController@commentOnYoutubeFeed');
    Route::post('dislike-fb-feed', 'FeedsController@disLikeFbFeed');
    Route::post('like-fb-feed', 'FeedsController@likeFbFeed');
    Route::post('comment-fb-feed', 'FeedsController@commentFbFeed');
    Route::get('get-next-facebook-feeds', 'FeedsController@getNextFacebookFeeds');
    Route::get('get-user-posts', 'FeedsController@getUserPosts');
    Route::get('get-user-publications', 'FeedsController@getUserPublications');
    Route::post('publishOnMedium', 'FeedsController@publishOnMedium');
    Route::post('get-country-hashtags', 'FeedsController@getCountryHashtags');
    Route::get('get-next-pinterest-feeds', 'FeedsController@getNextPinterestFeeds');
    Route::get('show-boards/Pinterest{id}', 'FeedsController@showPinterestBoards');
    Route::post('get-boards-on-change', 'FeedsController@getBoardsOnChange');
    Route::get('/show-boards/get-pinterest-pins', 'FeedsController@showPinterestPins');

});
