<?php

use Illuminate\Support\Facades\Route;
use Modules\Boards\Http\Controllers\BoardsController;

Route::group(['module' => 'Boards', 'middleware' => ['authenticateUser', 'checkPlanExpiry', 'checkPlanAccesses:board_me'],'namespace' => 'App\Modules\Boards\Controllers'], function () {
    Route::prefix('boards')->group(function() {
        Route::get('/', [BoardsController::class,'index']);
        Route::get('/view-boards', [BoardsController::class, 'show'])->name('view-boards');
        Route::get('/create-boards', [BoardsController::class, 'create'])->name('create-boards');
        Route::post('/create-boards', [BoardsController::class, 'createBoards'])->name('create-boards');
        Route::delete('/board-delete/{id}', [BoardsController::class, 'deleteBoards'])->name('board-delete');
        Route::post('/update-boards', [BoardsController::class, 'updateBoards'])->name('update-boards');
        Route::get('/board-me/{keyword}/{type}/{id}', [BoardsController::class, 'viewPerticularBoard'])->name('board-me');
        Route::post('/get-next-youtube-feeds', [BoardsController::class, 'getMoreYoutubeFeeds'])->name('get-next-youtube-feeds');
    });
});
