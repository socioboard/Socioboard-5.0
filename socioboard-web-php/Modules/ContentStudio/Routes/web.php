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
use Modules\ContentStudio\Http\Controllers\PublishContentController;

Route::group(['middleware' => ['authenticateUser', 'checkPlanExpiry']], function () {
    Route::middleware('checkPlanAccesses:content_studio')->group(function () {
        Route::prefix('discovery/content_studio')->group(function () {
            Route::get('/most_shared', function () {
                return view('home::empty');
            })->name('discovery.content_studio.most_shared');

            Route::get('/trending_now', function () {
                return view('home::empty');
            })->name('discovery.content_studio.trending_now');

            Route::get('/shareathon_queue', function () {
                return view('home::empty');
            })->name('discovery.content_studio.shareathon_queue');

            Route::get('/giphy', 'GiphyController@index')->name('discovery.content_studio.giphy');
            Route::post('/giphy/search', 'GiphyController@search');
            Route::post('/giphy/search/next', 'GiphyController@searchNext');

            Route::get('/imgur', 'ImgurController@index')->name('discovery.content_studio.imgur');
            Route::post('/imgur/search', 'ImgurController@search');
            Route::post('/imgur/search/next', 'ImgurController@searchNext');

            Route::get('/flickr', 'FlickrController@index')->name('discovery.content_studio.flickr');
            Route::post('/flickr/search', 'FlickrController@search');
            Route::post('/flickr/search/next', 'FlickrController@searchNext');

            Route::get('/dailymotion', 'DailymotionController@index')->name('discovery.content_studio.dailymotione');
            Route::post('/dailymotion/search', 'DailymotionController@search');
            Route::post('/dailymotion/search/next', 'DailymotionController@searchNext');

            Route::get('/newsapi', 'NewsApiController@index')->name('discovery.content_studio.news_api');
            Route::post('/newsapi/search', 'NewsApiController@search');
            Route::post('/newsapi/search/next', 'NewsApiController@searchNext');

            Route::get('/pixabay', 'PixabayController@index')->name('discovery.content_studio.pixabay');
            Route::post('/pixabay/search', 'PixabayController@search');
            Route::post('/pixabay/search/next', 'PixabayController@searchNext');

            Route::post('publish-content/modal', 'PublishContentController@modal')->name('publish_content.modal');
            Route::post('publish-content/feeds-modal', 'PublishContentController@feedsModal')->name('publish_content.feeds-modal');
            Route::post('publish-content/share', 'PublishContentController@share')->name('publish_content.share');
            Route::post('publish-content/update/{id}', 'PublishContentController@update')->name('publish_content.update');

            Route::post('image/upload', "FileUploadingsController@uploadMedia");
            Route::post('video/upload', "FileUploadingsController@uploadMedia");
            Route::post('media/download', "FileUploadingsController@downloadMediFromURL");
        });

    });
    Route::prefix('discovery/content_studio')->group(function () {
        Route::post('publish-content/modal', 'PublishContentController@modal')->name('publish_content.modal');
        Route::post('publish-content/feeds-modal', 'PublishContentController@feedsModal')->name('publish_content.feeds-modal');
        Route::post('publish-content/share', 'PublishContentController@share')->name('publish_content.share');
        Route::post('publish-content/update/{id}', 'PublishContentController@update')->name('publish_content.update');

        Route::post('image/upload', "FileUploadingsController@uploadMedia");
        Route::post('video/upload', "FileUploadingsController@uploadMedia");
        Route::post('media/download', "FileUploadingsController@downloadMediFromURL");
    });
    Route::middleware('checkPlanAccesses:scheduling_posting')->group(function () {
        Route::prefix('home/publishing')->group(function () {
            Route::any('/scheduling', 'PublishContentController@scheduling')->name('publish_content.scheduling');
            Route::get('youtube-scheduling', "PublishContentController@youtubeView")->name('youtube-publish');
            Route::post('youtube-schedule', "PublishContentController@youtubeSchedule")->name('youtube-schedule');
            Route::get('edit-with-youtube/{id}/{type}', 'PublishContentController@editWithYoutube');
            Route::any('/scheduling/{id}', 'PublishContentController@edit')->name('publish_content.scheduling-edit');
            Route::any('/socioQueue-scheduling/{id}/{content}', 'PublishContentController@socioQueueEdit')->name('publish_content.dayWise-SocioQueue');
            Route::any('/draft/{id}', 'PublishContentController@draftEdit')->name('publish_content.draft-edit');
            Route::any('/draft-schedule/{id}', 'PublishContentController@draftScheduleEdit')->name('publish_content.draft-schedule-edit');
            Route::get('pinterest-scheduling', "PublishContentController@pinterestView")->name('pinterest-publish');
            Route::post('pinterest-schedule', "PublishContentController@pinterestSchedule")->name('pinterest-schedule');
            Route::get('tiktok-publish', "PublishContentController@showTikTokPublish")->name('tiktok-publish');;
            Route::post('tiktok-schedule', "PublishContentController@tikTokSchedule")->name('tiktok-schedule');
            Route::post('history-show', "HistoryController@historyShow");

            Route::get('{page}/{slug?}', "HistoryController@index");
            Route::get('drafts', 'HistoryController@index')->name('drafts-history');
            Route::get('schedule/drafts', 'HistoryController@index')->name('schedule-drafts-history');
            Route::get('schedule/ready-queue', 'HistoryController@index')->name('schedule-ready-queue-history');
            Route::get('schedule/history', 'HistoryController@index')->name('schedule-done-history');
            Route::get('schedule/day-wise-socioqueue', 'HistoryController@index')->name('schedule-day-wise-history');
            Route::delete('schedule/delete', 'HistoryController@deleteSchedule')->name('schedule-day-wise-history-delete');
            Route::get('schedule/post-detail/{id}', 'HistoryController@scheduleDetails')->name('schedule-day-wise-history-post-detail');


        });
        Route::get('youtube-drafts', "HistoryController@youtubeDrafts")->name('youtube-drafts');
        Route::get('youtube-edit/{id}', "HistoryController@youtubeDraftsEdit")->name('youtube-edit');
        Route::delete('youtube-delete/{id}', "HistoryController@youtubeDraftsDelete")->name('youtube-delete');
    });
});

