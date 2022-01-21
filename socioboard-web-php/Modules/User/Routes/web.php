<?php

use Illuminate\Support\Facades\Route;
use Modules\User\Http\Controllers\RegistrationController;
use Modules\User\Http\Controllers\LoginController;
use Modules\User\Http\Controllers\ImageLibraryController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/
Route::group(['module' => 'User', 'middleware' => ['web'], 'namespace' => 'App\Modules\User\Controllers'], function () {

    //  show login page
    Route::get('/login', [LoginController::class, 'show'])->middleware('CheckUser');
    // login to acc
    Route::post('/login', [LoginController::class, 'checkLogin']);
    //  show register page
    Route::get('/register', [RegistrationController::class, 'show'])->name('register')->middleware(['guest', 'CheckUser']);
    // appsumo register page
    Route::get('/appsumo/{email}', [RegistrationController::class, 'appsumoRegister'])->name('appsumoRegister')->middleware(['guest', 'CheckUser']);
    // appsumo register page
    Route::post('/appsumo-register', [RegistrationController::class, 'saveAppsumo'])->name('saveAppsumo');
    // registration function
    Route::post('/register', [RegistrationController::class, 'signUp']);
    //verify email route
    Route::get('/verifyEmails', [RegistrationController::class, 'verify'])->middleware('CheckUser');

    // Log out User
    Route::get('/logout', [LoginController::class, 'logout'])->middleware('authenticateUser');

    Route::get('social/{network}', [LoginController::class, 'social']);
    Route::get('facebook-callback', [LoginController::class, 'facebookCallBack']);
    Route::get('google-callback', [LoginController::class, 'googleCallBack']);
    Route::get('github-callback', [LoginController::class, 'gitHubCallBack']);
    Route::get('twitter-callback', [LoginController::class, 'twitterCallBack']);

    // Forgot Password
    Route::get('/forgot-password', [LoginController::class, 'forgotPassword']);
    Route::post('/forgot-password-email', [LoginController::class, 'forgotPasswordEmail']);
    Route::get('/verify-password-token', [LoginController::class, 'verifyPasswordToken']);

//  New Password
    Route::get('/reset-password', [LoginController::class, 'resetPassword']);
    Route::post('/new-password', [LoginController::class, 'newPassword']);

//  Email Login
    Route::post('/email-login', [LoginController::class, 'emailLogin']);
    Route::post('/get-activation-link', [LoginController::class, 'getEmailActivationLink']);
    Route::get('/verify-direct-login', [LoginController::class, 'verifyDirectLogin']);
    Route::get('/send-mobile-otp', [LoginController::class, 'sendMobileOtp']);
    Route::post('/verify-mobile-otp', [LoginController::class, 'verifyMobileOtp']);
    Route::post('/update-session', [LoginController::class, 'updateUserSession']);
    Route::get('/get-session', [LoginController::class, 'getSession']);
});
