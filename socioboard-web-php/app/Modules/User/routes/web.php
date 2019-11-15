<?php

Route::group(['module' => 'User', 'middleware' => ['web'], 'namespace' => 'App\Modules\User\Controllers'], function() {

    Route::get('signup', 'UserController@signup');
    Route::post('signup', 'UserController@signup');
    Route::get('login/{email?}/{twoWayChoice?}', 'UserController@login')->name('login');
    Route::post('login', 'UserController@login');
    Route::post('mob-otp-login', 'UserController@mobOtpLogin');
    Route::post('email-otp-login', 'UserController@emailOtpLogin');
    Route::post('/forgot-password', 'UserController@forgotpassword');
    Route::get('verifyPasswordToken','UserController@verifyPasswordToken');
    Route::post('/resetPassword','UserController@resetPassword');
    Route::get('social/{network}', 'UserController@social');
    Route::get('facebook-callback', 'UserController@facebookCallback');
    Route::get('facebook', 'UserController@redirectToProvider');
    Route::get('google-callback', 'UserController@googleCallback');
//    Route::get('two-step-authentication/{email}', 'UserController@twoStepAuthentication')->name('two-step-authentication');
//    Route::post('two-step-authentication', 'UserController@twoStepAuthentication');
//    Route::get('twoStepAuth/{email?}','UserController@twoStepAuth')->name('twoStepAuth');
//    Route::get('accept-invitation', 'TeamController@acceptInvitation');

    Route::group(['middleware' => ['authenticateuser:user']], function () {

        Route::get('getDetails','UserController@getDetailsForDashboard');
        Route::get('dashboard/{team}','UserController@dashboard');
        Route::post('getTeamDetails','UserController@getTeamDetails');
        Route::get('settings','UserController@account');
        Route::get('get-user-info','UserController@getUserInfo');
//        Route::get('link_shortening','UserController@linkShortening');
        Route::get('logout','UserController@logout');
        Route::post('change-password','UserController@changePassword');
        Route::post('Two-Step-activation','UserController@TwoStepActivation');
        Route::post('profile-update','UserController@profileUpdate');
        Route::post('update-two-way-auth','UserController@updateTwoWayAuth');


        //notification
        Route::get('notification','UserController@notification');
        Route::get('/get-user-notification','UserController@getUserNotification');
        Route::get('/get-all-user-notification','UserController@getUserNotification');
        Route::get('/get-team-notification','UserController@getTeamNotification');
        Route::get('/get-all-team-notification','UserController@getTeamNotification');
        Route::get('seeAllNotifications','UserController@seeAllNotifications');
//        Route::get('/get-new-session','UserController@getNewSession');

        //payment
        Route::get('payment/paypalSuccess','PaymentController@paymentSuccess');
        Route::get('payment/paypalCancel','PaymentController@paymentCancel');
        Route::post('updatePlan','PaymentController@updatePlan');
        Route::get('updatePlan','PaymentController@updatePlan');
        Route::get('loader','PaymentController@loader');
        Route::get('payment-ajax','PaymentController@paymentajax');

        //lock and unlock acc
        Route::post('lock-account','UserController@lockUnlockAccount');

        //Link shortening
        Route::get('link-shortening','UserController@linkShortening');
        Route::post('link-shortening','UserController@linkShortening');

        //Dowload Invoice
        Route::post('/get-invoice','UserController@getInvoice');

    });
});
