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
                                break;
                            
                            case $request->slug == "ready-queue":
                                $api_url = $this->apiUrl . "/schedule/get-schedule-details-by-categories?fetchPageId=". $paginationId . "&scheduleStatus=". $scheduleStatus ."&scheduleCategory=". 0 ;
                                break;
                            
                            default : $api_url = $this->apiUrl . "/schedule/get-filtered-schedule-details?fetchPageId=" . $paginationId . "&scheduleStatus=" . $scheduleStatus;
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
                        $scheduleDrafts = $this->helper->postApiCallWithAuth('get', $getScheduleDraftsUrl);

                        if($scheduleDrafts){
                            $scheduleDrafts = $scheduleDrafts['data']->data->postContents;
                            $mergeArrays = array_merge($scheduleDrafts, $response['data']->data);
                            $createdDatesArr = array_column($mergeArrays, 'createdDate');
                            array_multisort($createdDatesArr, SORT_DESC, $mergeArrays);
                            $history['data'] = $mergeArrays;
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
                        foreach ($accounts as $key => $account) {
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
                                    $socialAccounts['linkedin']['personal account'][] = $account;
                                    break;
                                case 7:
                                    $socialAccounts['linkedin']['business account'][] = $account;
                                    break;
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
}
