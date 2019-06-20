<?php

Route::group(['module' => 'Team', 'middleware' => ['api'], 'namespace' => 'App\Modules\Team\Controllers'], function() {

    Route::resource('Team', 'TeamController');

});
