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

Route::group(['module' => 'team', 'middleware' => ['authenticateUser','checkPlanExpiry']], function () {
    Route::middleware('checkPlanAccesses:custom_report')->group(function() {
        Route::post('upload-screenshots', 'ReportsController@uploadScreenShots');
        Route::get('get-reports-Images', 'ReportsController@getReportImagesPage');
        Route::get('get-reports-Images-onload', 'ReportsController@getReportImagesOnload');
        Route::delete('delete-this-card', 'ReportsController@deleteThisCardFromTemplate');
        Route::delete('delete-all-the-cards', 'ReportsController@deleteAllTheCards');
    });

    Route::middleware('checkPlanAccesses:social_report')->group(function() {
        Route::get('get-facebook-reports', 'ReportsController@getFacebookReports');
        Route::post('get-facebook-reports', 'ReportsController@getFacebookReportsByTeam');
        Route::post('get-twitter-commulative-reports', 'ReportsController@getCommulativeReports');
        Route::get('get-twitter-reports', 'ReportsController@getTwitterReports');
        Route::post('get-twitter-reports', 'ReportsController@getTwitterReportsByTeam');
        Route::get('get-youtube-reports', 'ReportsController@getYoutubeReports');
        Route::post('get-youtube-reports', 'ReportsController@getYoutubeReportsByTeam');
        Route::get('get-linked-reports', 'ReportsController@getLinkedInReports');
        Route::post('get-linked-reports-follower-stats', 'ReportsController@getLinkedInFollowerReportsByTeam');
        Route::post('get-linked-pages-stats', 'ReportsController@getLinkedInPagesReportsByTeam');
    });

    Route::middleware('checkPlanAccesses:team_report')->group(function() {
        Route::post('get-reports-change-team', 'ReportsController@getTeamReportsByTeamID');
        Route::post('get-schedule-reports', 'ReportsController@getScheduleReports');
        Route::get('get-team-reports', 'ReportsController@getTeamReports');
    });
    Route::post('update-reports-settings', 'ReportsController@updateReportsSettings');
    Route::get('reports-settings', 'ReportsController@getReportsSettings');
    Route::get('auto-email-reports', 'ReportsController@autoEmailReports')->name('auto-email-reports');
    Route::post('save-auto-email-reports', 'ReportsController@saveAutoEmailReports')->name('save-auto-email-reports');
    Route::get('get-next-email-reports/{id}', 'ReportsController@getNextReports')->name('get-next-email-reports');
    Route::get('get-auto-email-reports', 'ReportsController@getAutoEmailReports')->name('get-auto-email-reports');
    Route::delete('delete-auto-email-reports/{id}', 'ReportsController@deleteAutoEmailReports')->name('delete-auto-email-reports');
    Route::post('update-auto-email-reports', 'ReportsController@updateAutoEmailReports')->name('update-auto-email-reports');
    Route::get('get-perticular-report/{id}', 'ReportsController@getPerticularReports')->name('get-perticular-report');
});
