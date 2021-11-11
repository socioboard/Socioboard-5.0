<?php

use App\Http\Controllers\Api\FileController;
use App\Http\Controllers\Api\VideoFileController;

Route::post('image_file', [FileController::class, 'store']);
Route::post('video_file', [VideoFileController::class, 'store']);

Route::middleware('auth:api')->group(function () {
    Route::get('user', function (Request $request) {
        return $request->user();
    });
});
