<?php

Route::group(['module' => 'Schedule', 'middleware' => ['web'], 'namespace' => 'App\Modules\Schedule\Controllers'], function() {

    Route::group(['middleware' => ['authenticateuser:user']], function () {
        //schedule post
        Route::get('schedule_post','ScheduleController@schedule');
        Route::post('schedule_post','ScheduleController@schedule');
        Route::get('post_history','ScheduleController@postHistory');
        Route::get('post_draft_history','ScheduleController@postDraftHistory');
        Route::post('get-draft-history','ScheduleController@getDraftHistory');
        Route::post('get-post-history','ScheduleController@getPostHistory');
        Route::post('schedule-action','ScheduleController@scheduleAction');
        Route::get('/scheduleEdit','ScheduleController@scheduleEdit');
        Route::post('/edit-schedule-post','ScheduleController@editSchedulePost');

//        Route::post('schedule_post','ScheduleController@schedule');

        //Image Library
        Route::get('image-library/{type}','MediaController@imageLibrary');
        Route::post('image-library/{type}','MediaController@imageLibrary');
        Route::get('media-delete/{id}','MediaController@mediaDelete');
        Route::post('upload-media/{privacy}','MediaController@mediaUpload');

    });
});
