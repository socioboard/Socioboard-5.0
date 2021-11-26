<?php

namespace Modules\ContentStudio\Http\Controllers;

use App\ApiConfig\ApiConfig;
use Illuminate\Contracts\Support\Renderable;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\User\helper;

class HistoryController extends Controller
{
    private $helper;
    protected $apiUrl;
    private $url;
    private $slug;

    public function __construct(){
        $this->helper = Helper::getInstance();
        $this->apiUrl = config('env.PUBLISH_API').env('API_VERSION');
        $this->url = config("env.API_URL");
    }
    /**
     * Display a listing of the resource.
     * @return Renderable
     */
    public function index($page, $slug = null)
    {
        $pageTitle = \Str::ucfirst($page);
        if(isset($slug)){
            switch ($slug) {
                case 'ready-queue':
                    $pageTitle = 'SocioQueue';
                    break;
                case 'day-wise-socioqueue':
                    $pageTitle = 'Day Wise SocioQueue';
                    break;
                case 'history':
                    $pageTitle = 'History';
                    break;
            }
        }
        return view('contentstudio::history.index', compact('page','slug', 'pageTitle'));
    }

    public function historyShow(Request $request)
    {
        $socialAccounts = $this->getTeamSocialAccounts();
        $twitterAccountsIds = [];
        $facebookAccountsIds = [];
        $linkedInAccountsIds = [];
        $instagramAccountsIds = [];
        $tumblrAccountsIds = [];
        if(!empty($socialAccounts)){
            foreach ($socialAccounts as $k => $v) {
                foreach ($v as $key => $value) {
                    foreach ($value as $val) {
                        if ($k == 'twitter') {
                            $twitterAccountsIds [] = $val->account_id;
                        } else if ($k == 'facebook') {
                            $facebookAccountsIds [] = $val->account_id;
                        } else if ($k == 'linkedin') {
                            $linkedInAccountsIds [] = $val->account_id;
                        }else if ($k === 'instagram') {
                            $instagramAccountsIds [] = $val->account_id;
                        }else if ($k === 'tumblr') {
                            $tumblrAccountsIds [] = $val->account_id;
                        }
                    }
                }
            }
        }
        if($request->page == "schedule"){
            $statuses = [
                "ready-queue" => 1,
                "day-wise-socioqueue" => 1,
                "drafts" => 5,
                'history' => 6,
            ];
        }

        $paginationId = intval($request->paginationId);
        $team = \Session::get('team');
        $history = [];
        $type = "";
        if($paginationId){
            try{
                //get drafted
                if($request->page == 'drafts'){
                    $api_url = $this->apiUrl . "/publish/get-drafted-posts?teamId=" . $team['teamid'] . "&pageId=" . $paginationId;
                }
                //get schedules
                if($request->page == 'schedule'){
                    if($request->slug){
                        $scheduleStatus = $statuses[$request->slug];
                        switch ($request->slug) {
                            case $request->slug == "day-wise-socioqueue":
                                $api_url = $this->apiUrl . "/schedule/get-schedule-details-by-categories?fetchPageId=". $paginationId . "&scheduleStatus=". $scheduleStatus ."&scheduleCategory=". 1 ;
                                $type = "In progress";
                                break;

                            case $request->slug == "ready-queue":
                                $api_url = $this->apiUrl . "/schedule/get-schedule-details-by-categories?fetchPageId=". $paginationId . "&scheduleStatus=". $scheduleStatus ."&scheduleCategory=". 0 ;
                                $type = "In progress";
                                break;

                            default : $api_url = $this->apiUrl . "/schedule/get-filtered-schedule-details?fetchPageId=" . $paginationId . "&scheduleStatus=" . $scheduleStatus;
                                $type = "Posted";
                        }

                    }
                }

                $response = $this->helper->postApiCallWithAuth("get", $api_url );
                if($response['code'] == 200){
                    if( $request->page == "schedule" ){
                        $history['data'] = $response['data']->data->postContents;
                        $history['schedule_information'] = $response['data']->data->scheduleDetails;
                    }

                    if( $request->page == 'drafts' ){
                        $getScheduleDraftsUrl = $this->apiUrl . "/schedule/get-filtered-schedule-details?fetchPageId=". $paginationId . "&scheduleStatus=5";
                        $scheduleDraftss = $this->helper->postApiCallWithAuth('get', $getScheduleDraftsUrl);

                        if($scheduleDraftss){
                            $scheduleDrafts = $scheduleDraftss['data']->data->postContents;
                            $mergeArrays = array_merge($scheduleDrafts, $response['data']->data);
                            $createdDatesArr = array_column($mergeArrays, 'createdDate');
                            array_multisort($createdDatesArr, SORT_DESC, $mergeArrays);
                            $history['data'] = $mergeArrays;
                            $history['schedule_information'] = $scheduleDraftss['data']->data->scheduleDetails;
                        }
                    }
                    $html = view("contentstudio::history.parts._item")
                        ->with(
                            [
                                "data" => $history,
                                "site_url" => $this->url,
                                "page" => $request->page,
                                "slug" => $request->slug,
                                'socialAccounts' => $socialAccounts,
                                'twitterAccountsIds' => $twitterAccountsIds,
                                'facebookAccountsIds' => $facebookAccountsIds,
                                'linkedInAccountsIds' => $linkedInAccountsIds,
                                'instagramAccountsIds' => $instagramAccountsIds,
                                'tumblrAccountsIds' => $tumblrAccountsIds,
                                'page_title' => $request->slug,
                                'type' => $type,
                                'env' => env('APP_URL')
                            ])->render();
                    return response()->json([
                        'html' => $html,
                    ]);
                }
            }

            catch(Exception $e){
                return false;
            }
        }
    }


    /**
     * Remove the specified resource from storage.
     * @author Lakshmi Gayathri
     * @return $socialAccounts
     */
    public function getTeamSocialAccounts()
    {
        $socialAccounts = [];
        try {
            $team = \Session::get('team');
            $apiUrl = ApiConfig::get('/team/get-team-details?teamId=' . $team['teamid']);
            try {
                $response = $this->helper->postApiCallWithAuth('get', $apiUrl);
                if (isset($response['code']) && $response['code'] === 200) {
                    $responseData = $this->helper->responseHandler($response['data']);
                    $accounts = $responseData['data']->teamSocialAccountDetails[0]->SocialAccount;
                    if(!empty($accounts)){
                        foreach ($accounts as $social){
                            foreach ($responseData['data']->SocialAccountStats as $stats){
                                if ($social->account_id === $stats->account_id && $social->account_type !== 9){
                                    $social->friendship_counts = isset($stats->follower_count) && $stats->follower_count !== null ? $stats->follower_count : "0";
                                }
                            }
                        }
                        foreach ($accounts as $key => $account) {
                            if (!$account->join_table_teams_social_accounts->is_account_locked) {
                                switch ($account->account_type) {
                                    case 1:
                                        $socialAccounts['facebook']['user'][] = $account;
                                        break;
                                    case 2:
                                        $socialAccounts['facebook']['page'][] = $account;
                                        break;
                                    case 3:
                                        $socialAccounts['facebook']['group'][] = $account;
                                        break;
                                    case 4:
                                        $socialAccounts['twitter']['account'][] = $account;
                                        break;
                                    case 6:
                                    case 7:
                                        $socialAccounts['linkedin']['account'][] = $account;
                                        break;
                                    case 12:
                                        $socialAccounts['instagram']['business account'][] = $account;
                                        break;
                                    case 16:
                                        $socialAccounts['tumblr']['account'][] = $account;
                                        break;
                                }
                            }
                        }
                    }
                } else {
                    return false;
                }
            } catch (AppException $e) {
                $this->helper->logException($e->getLine(),$e->getCode(),$e->getMessage(), 'getTeamSocialAccounts() {HistoryController}');
                return false;
            }
        } catch (AppException $e) {
            $this->helper->logException($e->getLine(),$e->getCode(),$e->getMessage(), 'getTeamSocialAccounts() {HistoryController}');
            return false;
        }
        return $socialAccounts;
    }

    public function deleteSchedule(Request $request){
        try {
            $apiUrl =  $this->apiUrl.'/schedule/delete?scheduleId='.$request->id;
            $response = $this->helper->postApiCallWithAuth('delete', $apiUrl);
            return $this->helper->responseHandler($response['data']);
        }
        catch (AppException $e) {
            $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'deleteSchedule() {HistoryController}');
            return response()->json(["ErrorMessage" => 'Can not fetch accounts, please reload page'], 401);
        }
    }
}
