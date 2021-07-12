<?php


use Illuminate\Support\Facades\Route;
use Modules\Discovery\Http\Controllers\DiscoveryController;
use Modules\Discovery\Http\Middleware\CheckUser;


Route::group(['module' => 'discovery',  'middleware' => 'authenticateUser', 'namespace' => 'App\Modules\Discovery\Controllers'], function () {
    Route::prefix('discovery')->group(function() {
        Route::get('/youtube', [DiscoveryController::class,'showYoutube'])->name('youtube');
        Route::get('/twitter', [DiscoveryController::class, 'showTwitter'])->name('twitter');
        Route::post('/search-youtubes', [DiscoveryController::class, 'searchYoutube'])->name('search-youtubes');
        Route::post('/search-more-youtubes', [DiscoveryController::class, 'getMoreYoutubeFeeds'])->name('search-more-youtubes');
        Route::post('/search-twits', [DiscoveryController::class, 'searchTwitter'])->name('search-twits');
        Route::post('/search-more-twits', [DiscoveryController::class, 'getMoreTwitterFeeds'])->name('search-more-twits');
        Route::get('/rss-feeds', [DiscoveryController::class, 'showRssFeeds'])->name('rss-feeds');
        Route::post('/search-rss-feeds', [DiscoveryController::class, 'searchRssFeeds'])->name('search-rss-feeds');
        Route::post('/edit-rss-feeds', [DiscoveryController::class, 'editRssTitle'])->name('edit-rss-feeds');
        Route::post('/publish-model', [DiscoveryController::class, 'publishModel'])->name('publish-model');
    });
});
