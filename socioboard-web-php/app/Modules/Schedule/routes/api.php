<?php

Route::group(['module' => 'Schedule', 'middleware' => ['api'], 'namespace' => 'App\Modules\Schedule\Controllers'], function() {

    Route::resource('schedule', 'ScheduleController');

});
