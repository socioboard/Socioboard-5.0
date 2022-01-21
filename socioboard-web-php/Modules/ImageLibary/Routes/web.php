<?php

use Modules\ImageLibary\Http\Controllers\ImageLibaryController;
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

Route::prefix('imagelibary')->middleware(['authenticateUser', 'checkPlanExpiry'])->group(function() {
    Route::get('/private-images', [ImageLibaryController::class, 'privateImages']);
    Route::post('/private-images', [ImageLibaryController::class, 'privateImages']);
    Route::get('/public-images', [ImageLibaryController::class, 'publicImages']);
    Route::post('/public-images', [ImageLibaryController::class, 'publicImages']);
    Route::get('/gallery-images', [ImageLibaryController::class, 'galleryImages']);
    Route::post('/gallery-images', [ImageLibaryController::class, 'galleryImages']);
    Route::delete('/delete-image', [ImageLibaryController::class, 'deleteImage']);
    Route::post('/upload-image', [ImageLibaryController::class, 'uploadImage']);
    Route::post('/draft-post', [ImageLibaryController::class, 'draftPostFunction']);
    Route::post('/search-public-image', [ImageLibaryController::class, 'searchPublic']);
    Route::post('/search-private-image', [ImageLibaryController::class, 'searchPrivte']);
    Route::put('/rate-image', [ImageLibaryController::class, 'rateImages']);
});
