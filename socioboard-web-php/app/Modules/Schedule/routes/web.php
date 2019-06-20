<?php

Route::group(['module' => 'Schedule', 'middleware' => ['web'], 'namespace' => 'App\Modules\Schedule\Controllers'], function() {

    Route::group(['middleware' => ['authenticateuser:user']], function () {
        //schedule post
        Route::get('schedule_post','ScheduleController@schedule');
        Route::post('schedule_post','ScheduleController@schedule');
        Route::get('post_history','ScheduleController@postHistory');
        Route::post('get-post-history','ScheduleController@getPostHistory');
        Route::post('schedule-action','ScheduleController@scheduleAction');
//        Route::post('schedule_post','ScheduleController@schedule');
    });


});
