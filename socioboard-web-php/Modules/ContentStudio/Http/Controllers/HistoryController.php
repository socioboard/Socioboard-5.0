<?php

namespace Modules\ContentStudio\Http\Controllers;

use App\ApiConfig\ApiConfig;
use Illuminate\Contracts\Support\Renderable;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Session;
use Modules\User\helper;

class HistoryController extends Controller
{
    private $helper;
    protected $apiUrl;
    private $url;
    private $slug;
    private $publish;

    public function __construct(){
        $this->helper = Helper::getInstance();
        $this->publish = new PublishContentController();
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
                            $twitterAccountsIds [$val->account_id] = $val->first_name;
                        } else if ($k == 'facebook') {
                            $facebookAccountsIds [$val->account_id] = $val->first_name;
                        } else if ($k == 'linkedin') {
                            $linkedInAccountsIds [$val->account_id] = $val->first_name;
                        }else if ($k === 'instagram') {
                            $instagramAccountsIds [$val->account_id] = $val->first_name;
                        }else if ($k === 'tumblr') {
                            $tumblrAccountsIds [$val->account_id] = $val->first_name;
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
                                $api_url = $this->apiUrl . "/schedule/get-schedule-details-by-categories?fetchPageId=". $paginationId . "&scheduleStatus=". $scheduleStatus ."&scheduleCategory=". 1 ."&teamId=".$team['teamid'];
                                $type = "In progress";
                                break;

                            case $request->slug == "ready-queue":
                                $api_url = $this->apiUrl . "/schedule/get-schedule-details-by-categories?fetchPageId=". $paginationId . "&scheduleStatus=". $scheduleStatus ."&scheduleCategory=". 0 ."&teamId=".$team['teamid'] ;
                                $type = "In progress";
                                break;

                            default : $api_url = $this->apiUrl . "/schedule/get-filtered-schedule-details?fetchPageId=" . $paginationId . "&scheduleStatus=" . $scheduleStatus."&teamId=".$team['teamid'];
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
                                        $socialAccounts['linkedin']['account'][] = $account;
                                        break;
                                    case 7:
                                        $socialAccounts['linkedin-in']['account'][] = $account;
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
            if ($request->type === "draft_schedule"){
                $apiUrl =  $this->apiUrl.'/schedule/delete?scheduleId='.$request->id;
                $response = $this->helper->postApiCallWithAuth('delete', $apiUrl);
            } else {
                $apiUrl =  $this->apiUrl.'/publish/delete-draft-post-by-id';
                $requestData = ['id' => [$request->id]];
                $response = $this->helper->postApiCallWithAuth('delete', $apiUrl, $requestData);
            }
            return $this->helper->responseHandler($response['data']);
        }
        catch (AppException $e) {
            $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'deleteSchedule() {HistoryController}');
            return response()->json(["ErrorMessage" => 'Can not fetch accounts, please reload page'], 401);
        }
    }

    public function youtubeDrafts(){
        $account_name = '';
        $team = \Session::get('team');
        $apiUrl =  $this->apiUrl.'/youtube/team-published-details?teamId='.$team['teamid'].'&pageId=1&postType=1';
        $response = $this->helper->postApiCallWithAuth('get', $apiUrl);
        $data =  $this->helper->responseHandler($response['data']);
        return view("contentstudio::history.youtube_drafts",compact('data'));

    }

    public function youtubeDraftsEdit($id){
        $apiUrl =  $this->apiUrl.'/youtube/published-details-by-id?postId='.$id;
        $response = $this->helper->postApiCallWithAuth('get', $apiUrl);
        $data =  $this->helper->responseHandler($response['data']);
        $accounts= $this->publish->getTeamYoutubeAccounts();
        if (isset($accounts ) && isset($accounts['youtube'])){
            $socialAccounts = $accounts['youtube'];
        }else{
            $socialAccounts = null;
        }
        return view("contentstudio::scheduling.youtube_publish",compact('socialAccounts','data'));
    }

    public function youtubeDraftsDelete($id){
        try {
            $apiUrl =  $this->apiUrl.'/youtube/published-details?postId=' . $id;
            $response = $this->helper->postApiCallWithAuth('delete', $apiUrl);
            return $this->helper->responseHandler($response['data']);
        }
        catch (AppException $e) {
            $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'youtubeDraftsDelete() {HistoryController}');
            return response()->json(["ErrorMessage" => 'Can not fetch accounts, please reload page'], 401);
        }
    }

    public function scheduleDetails($id){
        try {
            $apiUrl =  $this->apiUrl.'/schedule/get-published-schedule-post-by-id?scheduleId=' .$id;
            $responses = $this->helper->postApiCallWithAuth('post', $apiUrl);
            $team = Session::get('team');
            $teamID = $team['teamid'];
            $apiUrl = ApiConfig::get('/team/get-team-details?teamId=' . $team['teamid']);
            $response = $this->helper->postApiCallWithAuth('get', $apiUrl);
            if (isset($response['code']) && $response['code'] === 200) {
                $responseData = $this->helper->responseHandler($response['data']);
                if (isset($responseData['data'])) {
                    $accounts = $responseData['data']->teamSocialAccountDetails[0]->SocialAccount;
                }
            } else {
                $accounts = [];
            }
            $data['data'] =  $this->helper->responseHandler($responses['data']);
            $data['account'] =  $accounts;
            return $data;
//            return view('contentstudio::history.postDetails',compact('data','accounts'));
        }
        catch (AppException $e) {
            $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'youtubeDraftsDelete() {HistoryController}');
            return response()->json(["ErrorMessage" => 'Can not fetch accounts, please reload page'], 401);
        }
    }
}
