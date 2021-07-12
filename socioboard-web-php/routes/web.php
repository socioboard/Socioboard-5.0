<?php

 use Illuminate\Support\Facades\Route;
 use \App\Http\Controllers\FileController;

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

Route::post('file/create', [FileController::class,'store']);
Route::post('file/destroy', [FileController::class,'destroy']);

Route::get('/', function () {
    return redirect('/login');
});

Route::any('amember/member', function (){
    return redirect('/login');
});
