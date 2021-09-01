<?php

use Illuminate\Support\Facades\Route;
use Modules\Discovery\Http\Controllers\DiscoveryController;

Route::group(['module' => 'discovery',  'prefix' => 'discovery', 'middleware' => ['authenticateUser', 'checkPlanExpiry'], 'namespace' => 'App\Modules\Discovery\Controllers'], function () {
    Route::middleware('checkPlanAccesses:discovery')->group(function() {
        Route::post('/publish-model', [DiscoveryController::class, 'publishModel'])->name('publish-model');
        Route::post('/search-more-twits', [DiscoveryController::class, 'getMoreTwitterFeeds'])->name('search-more-twits');
        Route::post('/search-more-youtubes', [DiscoveryController::class, 'getMoreYoutubeFeeds'])->name('search-more-youtubes');
        Route::post('/search-twits', [DiscoveryController::class, 'searchTwitter'])->name('search-twits');
        Route::post('/search-youtubes', [DiscoveryController::class, 'searchYoutube'])->name('search-youtubes');
        Route::get('/twitter', [DiscoveryController::class, 'showTwitter'])->name('twitter');
        Route::get('/youtube', [DiscoveryController::class,'showYoutube'])->name('youtube');
    });

    Route::middleware('checkPlanAccesses:rss_feeds')->group(function() {
        Route::post('/edit-rss-feeds', [DiscoveryController::class, 'editRssTitle'])->name('edit-rss-feeds');
        Route::get('/rss-feeds', [DiscoveryController::class, 'showRssFeeds'])->name('rss-feeds');
        Route::post('/search-rss-feeds', [DiscoveryController::class, 'searchRssFeeds'])->name('search-rss-feeds');
    });
});
