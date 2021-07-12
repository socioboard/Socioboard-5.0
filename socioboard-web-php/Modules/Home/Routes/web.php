<?php

use Illuminate\Support\Facades\Route;
use Modules\Home\Http\Controllers\DashboardController;
use Modules\Home\Http\Controllers\ProfileUpdateController;
use Modules\Home\Http\Controllers\PlanDetailsController;
use Modules\Home\Http\Controllers\TeamController;


Route::group(['module' => 'Home', 'middleware' => ['authenticateUser'], 'namespace' => 'App\Modules\Home\Controllers'], function () {

    // show user dashboard page
    Route::group(['middleware' => ['authenticateUser']], function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])
            ->name('dashboard');
        Route::get('/add-twitter-accounts', [DashboardController::class, 'addTwitterAccounts']);
        Route::get('/calendar-view', [DashboardController::class, 'calendarView'])->name('calendar-view');
        Route::get('/calendar-data', [DashboardController::class, 'getCalendarData'])->name('calendar-data');
        Route::post('/update-rating', [DashboardController::class, 'updateRating']);
        Route::post('/update-cron', [DashboardController::class, 'updateCron']);
        Route::get('/lock-accounts/{id}', [DashboardController::class, 'lockAccount']);
        Route::get('/unlock-accounts/{id}', [DashboardController::class, 'unlockAccount']);
        Route::get('/view-accounts', [DashboardController::class, 'getSocialAccountsDetails']);
        Route::get('/add-accounts/{network}', [DashboardController::class, 'addSocialAccounts']);
        Route::get('/twitter/callback', [DashboardController::class, 'addTwitterCallback']);
        Route::get('/facebook-page/callback', [DashboardController::class, 'addFacebookPageCallBack']);
        Route::get('/facebook/callback', [DashboardController::class, 'addFacebookCallback']);
        Route::get('/linkedin/callback', [DashboardController::class, 'addLinkedInCallback']);
        Route::get('/youtube/callback', [DashboardController::class, 'addYoutubeCallback']);
        Route::get('/instagram/callback', [DashboardController::class, 'addInstagramCallback']);
        Route::get('/get-social-accounts-details', [DashboardController::class, 'getSocialAccountsDetails']);
        Route::get('/delete-social-account', [DashboardController::class, 'deleteSocialAccount']);
        //  Profile Update
        Route::get('/profile-update', [ProfileUpdateController::class, 'profileUpdate']);
        Route::post('/change-password', [ProfileUpdateController::class, 'changePassword']);
        Route::post('/update-profile-data', [ProfileUpdateController::class, 'updateProfileData']);
        Route::get('/delete-user', [ProfileUpdateController::class, 'deleteUser']);
        Route::get('/hold-user', [ProfileUpdateController::class, 'holdUser']);
        //  Invitation
        Route::get('/get-invitations', [DashboardController::class, 'getInvitations'])->name('get-invitations');
        Route::get('/accept-invitations', [DashboardController::class, 'acceptInvitations'])->name('accept-invitations');
        Route::get('/reject-invitations', [DashboardController::class, 'rejectInvitations'])->name('reject-invitations');
        // Team details
        Route::get('/get-teamcount', [DashboardController::class, 'getTeamCounts'])->name('get-teamcount');
        //Activity Log
        Route::get('/get-recent-activity', [DashboardController::class, 'recentActivities'])->name('get-recent-activity');
        //  plan Details
        Route::get('/plan-details-view', [PlanDetailsController::class, 'planDetailsView']);
        Route::get('/get-scheduled-reports-dashboard', [DashboardController::class, 'getScheduledReportsDashboard']);
        Route::post('facebookPageAdd', [DashboardController::class, 'addFacebookPageBulk']);
        Route::post('search-Accounts-filter', [DashboardController::class, 'searchAccountsFilter']);

    });

});
