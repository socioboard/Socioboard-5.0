<?php

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
use Illuminate\Support\Facades\Route;
use Modules\Feeds\Http\Controllers\FeedsController;

Route::group(['module' => 'team', 'middleware' => ['authenticateUser']], function () {
    Route::get('get-team-reports', 'ReportsController@getTeamReports');
    Route::get('get-twitter-reports', 'ReportsController@getTwitterReports');
    Route::get('get-youtube-reports', 'ReportsController@getYoutubeReports');
    Route::post('get-youtube-reports', 'ReportsController@getYoutubeReportsByTeam');
    Route::get('get-facebook-reports', 'ReportsController@getFacebookReports');
    Route::post('get-facebook-reports', 'ReportsController@getFacebookReportsByTeam');
    Route::post('get-schedule-reports', 'ReportsController@getScheduleReports');
    Route::post('get-twitter-reports', 'ReportsController@getTwitterReportsByTeam');
    Route::post('get-twitter-commulative-reports', 'ReportsController@getCommulativeReports');
    Route::post('get-reports-change-team', 'ReportsController@getTeamReportsByTeamID');
    Route::get('reports-settings', 'ReportsController@getReportsSettings');
    Route::get('auto-email-reports', 'ReportsController@autoEmailReports')->name('auto-email-reports');
    Route::post('save-auto-email-reports', 'ReportsController@saveAutoEmailReports')->name('save-auto-email-reports');
    Route::get('get-auto-email-reports', 'ReportsController@getAutoEmailReports')->name('get-auto-email-reports');
    Route::delete('delete-auto-email-reports/{id}', 'ReportsController@deleteAutoEmailReports')->name('delete-auto-email-reports');
    Route::post('update-auto-email-reports', 'ReportsController@updateAutoEmailReports')->name('update-auto-email-reports');
    Route::get('get-perticular-report/{id}', 'ReportsController@getPerticularReports')->name('get-perticular-report');
    Route::post('update-reports-settings', 'ReportsController@updateReportsSettings');
    Route::post('upload-screenshots', 'ReportsController@uploadScreenShots');
    Route::get('get-reports-Images', 'ReportsController@getReportImagesPage');
    Route::get('get-reports-Images-onload', 'ReportsController@getReportImagesOnload');
    Route::delete('delete-this-card', 'ReportsController@deleteThisCardFromTemplate');
    Route::delete('delete-all-the-cards', 'ReportsController@deleteAllTheCards');
});
