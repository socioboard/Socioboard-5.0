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

Route::group(['module' => 'team', 'middleware' => ['authenticateUser']], function () {
    Route::get('feeds/{network}', 'FeedsController@getFeedsSocialAccounts');
    Route::get('get-Next-Twitter-feeds', 'FeedsController@getNextTwitterFeeds');
    Route::get('get-Next-youtube-feeds', 'FeedsController@getNextYoutubeFeeds');
    Route::get('get-Next-instgram-feeds', 'FeedsController@getNextInstagramFeeds');
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
    Route::get('get-Next-facebook-feeds', 'FeedsController@getNextFacebookFeeds');
});
