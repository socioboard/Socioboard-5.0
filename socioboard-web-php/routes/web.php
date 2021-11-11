<?php

use Illuminate\Support\Facades\Route;
use \App\Http\Controllers\FileController;

Route::post('file/create', [FileController::class, 'store']);
Route::post('file/destroy', [FileController::class, 'destroy']);

Route::get('/', function () {
    return redirect('/login');
});

Route::any('amember/member', function (){
    return redirect('/login');
});
