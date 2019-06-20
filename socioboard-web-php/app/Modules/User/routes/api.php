<?php

Route::group(['module' => 'User', 'middleware' => ['api'], 'namespace' => 'App\Modules\User\Controllers'], function() {

    Route::resource('user', 'UserController');

});
