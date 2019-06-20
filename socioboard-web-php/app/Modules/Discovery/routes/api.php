<?php

Route::group(['module' => 'Discovery', 'middleware' => ['api'], 'namespace' => 'App\Modules\Discovery\Controllers'], function() {

    Route::resource('Discovery', 'DiscoveryController');

});
