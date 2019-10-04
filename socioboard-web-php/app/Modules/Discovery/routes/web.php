<?php

Route::group(['module' => 'Discovery', 'middleware' => ['web'], 'namespace' => 'App\Modules\Discovery\Controllers'], function() {


    Route::group(['middleware' => ['authenticateuser:user']], function () {

        Route::get('content-studio/{type}', 'DiscoveryController@contentStudio');
        Route::post('getImurg', 'DiscoveryController@getImurg');
        Route::post('getGiphy', 'DiscoveryController@getGiphy');
        Route::post('getPixabay', 'DiscoveryController@getPixabay');
        Route::post('getFlickr', 'DiscoveryController@getFlickr');
        Route::post('get-daily-motion', 'DiscoveryController@getDailymotion');
        Route::post('getNews', 'DiscoveryController@getNews');
        Route::get('discovery/rss-feed', 'DiscoveryController@rssFeed');
        Route::post('getRss', 'DiscoveryController@getRss');
        Route::get('discovery/youtube', 'DiscoveryController@youtube');
        Route::post('getYoutube', 'DiscoveryController@getYoutube');
        Route::get('discovery/twitter', 'DiscoveryController@twitter');
        Route::post('getTwitter', 'DiscoveryController@getTwitter');
        Route::post('getTrends', 'DiscoveryController@getTrends');
        Route::post('getTwitterSearch', 'DiscoveryController@getTwitterSearch');
        Route::get('boardMe', 'DiscoveryController@boardMe');
        Route::post('board-me-add', 'DiscoveryController@boardMe');
        Route::get('/get-all-boards', 'DiscoveryController@getAllBoards');
        Route::get('/boardView','DiscoveryController@boardView');
        Route::post('/delete-board','DiscoveryController@boardDelete');
        Route::post('/board-edit','DiscoveryController@boardEdit');
//        Route::get('/name/{id?}', 'DiscoveryController@getAllBoards');

        Route::post('publish-data-discovery', 'DiscoveryPublishController@publishdatadiscovery');


    });

});
