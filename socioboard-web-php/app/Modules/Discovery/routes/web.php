<?php

Route::group(['module' => 'Discovery', 'middleware' => ['web'], 'namespace' => 'App\Modules\Discovery\Controllers'], function() {


    Route::group(['middleware' => ['authenticateuser:user']], function () {
        Route::get('discovery/imgur', 'DiscoveryController@imgur');
        Route::post('getImurg', 'DiscoveryController@getImurg');
        Route::get('discovery/giphy', 'DiscoveryController@giphy');
        Route::post('getGiphy', 'DiscoveryController@getGiphy');
        Route::get('discovery/pixabay', 'DiscoveryController@pixabay');
        Route::post('getPixabay', 'DiscoveryController@getPixabay');
        Route::get('discovery/flickr', 'DiscoveryController@flickr');
        Route::post('getFlickr', 'DiscoveryController@getFlickr');
        Route::get('discovery/dailymotion', 'DiscoveryController@dailymotion');
        Route::post('get-daily-motion', 'DiscoveryController@getDailymotion');
        Route::get('discovery/newsapi', 'DiscoveryController@newsapi');
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

        Route::post('publish-data-discovery', 'DiscoveryPublishController@publishdatadiscovery');


    });

});
