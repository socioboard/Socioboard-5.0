<?php

Route::group(['module' => 'User', 'middleware' => ['web'], 'namespace' => 'App\Modules\User\Controllers'], function() {

    Route::get('signup', 'UserController@signup');
    Route::post('signup', 'UserController@signup');
    Route::get('login', 'UserController@login');
    Route::post('login', 'UserController@login');
    Route::post('/forgot-password', 'UserController@forgotpassword');
    Route::get('social/{network}', 'UserController@social');
    Route::get('facebook-callback', 'UserController@facebookCallback');
    Route::get('facebook', 'UserController@redirectToProvider');
    Route::get('google-callback', 'UserController@googleCallback');
    Route::get('two-step-authentication', 'UserController@twoStepAuthentication');
    Route::post('two-step-authentication', 'UserController@twoStepAuthentication');

    Route::group(['middleware' => ['authenticateuser:user']], function () {

        Route::get('getDetails','UserController@getDetailsForDashboard');
        Route::get('dashboard/{team}','UserController@dashboard');
        Route::post('getTeamDetails','UserController@getTeamDetails');
        Route::get('settings','UserController@account');
        Route::get('logout','UserController@logout');
        Route::post('change-password','UserController@changePassword');
        Route::post('Two-Step-activation','UserController@TwoStepActivation');
        Route::post('profile-update','UserController@profileUpdate');


        //notification
        Route::get('notification','UserController@notification');

        //payment
        Route::get('payment/paypalSuccess','PaymentController@paymentSuccess');
        Route::get('payment/paypalCancel','PaymentController@paymentCancel');
        Route::post('updatePlan','PaymentController@updatePlan');
        Route::get('updatePlan','PaymentController@updatePlan');
        Route::get('loader','PaymentController@loader');
        Route::get('payment-ajax','PaymentController@paymentajax');

        //lock and unlock acc
        Route::post('lock-account','UserController@lockUnlockAccount');





    });



});
