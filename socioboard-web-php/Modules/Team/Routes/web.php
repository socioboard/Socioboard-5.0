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
use Modules\Team\Http\Controllers\TeamController;
use Modules\Discovery\Http\Middleware\CheckUser;

Route::group(['module' => 'team', 'middleware' => ['authenticateUser', 'checkPlanExpiry'], 'namespace' => 'App\Modules\User\Controllers'], function () {
    Route::get('/view-teams', [TeamController::class, 'viewTeams']);
    Route::get('/team/{id}', [TeamController::class, 'teamView']);
    Route::get('/create-team', [TeamController::class, 'createTeam']);
    Route::post('/create-team', [TeamController::class, 'createTeam']);

    Route::post('/search', [TeamController::class, 'searchTeam']);
    Route::get('/team-delete/{id}', [TeamController::class, 'deleteTeams']);
    Route::post('/team-update', [TeamController::class, 'updateTeams']);
    Route::get('/hold-teams/{id}', [TeamController::class, 'holdTeams']);
    Route::get('/unhold-teams/{id}', [TeamController::class, 'unholdTeams']);

    Route::get('/ivite-member-to-team/{id}', [TeamController::class, 'inviteMemberToTeam']);
    Route::get('get-team-details', [TeamController::class, 'getParticularTeamDetails']);
    Route::get('drag-drop-team-operations', [TeamController::class, 'dragDopTeamOperation']);
    Route::get('get-available-social-accounts', [TeamController::class, 'getAvailableSocialAccounts']);
    Route::get('/drag-invite', [TeamController::class, 'dragToInviteMembers']);
    Route::post('/invite', [TeamController::class, 'inviteMembers']);
    Route::get('/get-available-members', [TeamController::class, 'getAvailableMembers']);
    Route::get('/get-invited-members', [TeamController::class, 'getInvitedMembers']);
    Route::get('/withdraw-invitation', [TeamController::class, 'withDrawInvitation']);
    Route::post('/changeTeamSession', [TeamController::class, 'changeTeamSession']);
});
