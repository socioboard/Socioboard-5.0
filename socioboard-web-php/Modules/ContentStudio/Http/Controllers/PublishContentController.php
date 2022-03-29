<?php

namespace Modules\ContentStudio\Http\Controllers;

use Faker\Provider\DateTime;
use Illuminate\Contracts\Support\Renderable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Validator;
use Modules\ContentStudio\Http\Requests\PublishRequest;
use Illuminate\Routing\Controller;
use Modules\User\helper;
use App\ApiConfig\ApiConfig;
use Exception;
use Illuminate\Support\Facades\Session;



class PublishContentController extends Controller
{

    private $helper;
    private $apiUrl;
    private $feedsUrl;
    private $site_url;

    public function __construct()
    {
        $this->helper = Helper::getInstance();
        $this->apiUrl = env('API_URL_PUBLISH').env('API_VERSION');
        $this->feedsUrl = env('API_URL_FEEDS').env('API_VERSION');
        $this->site_url = config("env.API_URL");
    }

    /**
     * Show the form for creating a new resource.
     * @return Renderable
     */
    public function scheduling(Request $request)
    {
        (isset($request->pageType) && $request->pageType === "dailymotion" ? $pagetType = "DailyMotion" : $pagetType = "other");
        $socialAccounts = $this->getTeamSocialAccounts();
        $twitterAccountsIds = [];
        $facebookAccountsIds = [];
        $linkedinAccountsIds = [];
        $instagramAccountsIds = [];
        $bitlyAccountsIds = [];
        $tumblrAccountsIds = [];
        if(!empty($socialAccounts)){
            foreach ($socialAccounts as $k => $v) {
                foreach ($v as $key => $value) {
                    foreach ($value as $val) {
                        if ($k === 'twitter') {
                            $twitterAccountsIds [] = $val->account_id;
                        } else if ($k === 'facebook') {
                            $facebookAccountsIds [] = $val->account_id;
                        } else if ($k === 'linkedin') {
                            $linkedinAccountsIds [] = $val->account_id;
                        } else if ($k === 'instagram') {
                            $instagramAccountsIds [] = $val->account_id;
                        } else if ($k === 'tumblr') {
                            $tumblrAccountsIds [] = $val->account_id;
                        } else if ($k === 'bitly') {
                            $bitlyAccountsIds [] = $val->account_id;
                        }
                    }
                }
            }
        }
        return view('contentstudio::scheduling.index',[
            'mediaData' => [
                'mediaUrl' => $pagetType === "DailyMotion" ? null : ($request->mediaUrl ? request()->get('mediaUrl') : null),
                'sourceUrl' => $request->sourceUrl ? request()->get('sourceUrl') : null,
                'publisherName' => $request->publisherName ? request()->get('publisherName') : null,
                'title' => $request->title ? request()->get('title') : null,
                'description' => $request->description ? request()->get('description') : null,
                'type' =>$pagetType === "DailyMotion" ? null :( $request->type ? request()->get('type') : null),
                'pageType' => $pagetType,
            ],
            'downloadMedia' => true,
            'socialAccounts' => $socialAccounts,
            'accountIds' => [],
            'twitterAccountsIds' => $twitterAccountsIds,
            'facebookAccountsIds' => $facebookAccountsIds,
            'linkedinAccountsIds' => $linkedinAccountsIds,
            'instagramAccountsIds' => $instagramAccountsIds,
            'tumblrAccountsIds' => $tumblrAccountsIds,
            'bitlyAccountsIds' => $bitlyAccountsIds,
            'isTwitter' => "false",
            'isFacebook' => "false",
            'isLinkedin' => "false",
            'isInstagram' => "false",
            'isTumblr' => "false",
        ]);
    }

    /**
     * Store a newly created resource in storage.
     * @param Request $request
     * @return Renderable
     */
    public function share(PublishRequest $request)
    {

        try {
            if ($request->get('accountTypes') === "true"  && (!isset($request->mediaUrl) && !isset($request->videoUrl) )){
                $result = [];
                $result['code'] = 422;
                $result['message'] = "Please select any media for posting";
                return $result;
            }
            if($request->get('instagramInResocio') === "true" && $request->get('accountTypes') === null   && (!isset($request->mediaUrl) && !isset($request->videoUrl) ))
            {
                $result = [];
                $result['code'] = 422;
                $result['message'] = "Please select any media for posting in Instagram";
                return $result;
            }
            $team = \Session::get('team');
//            if ($request->get('accountTypes') === "true"){
//                $apiUrl = $apiUrl = $this->feedsUrl.'/feeds/get-insta-business-publish-limit?teamId=' . $team['teamid'];
//                $apidata = $request->get('socialAccount');
//                $responsed = $this->helper->postApiCallWithAuth('post', $apiUrl, $apidata);
//                $datass = $this->helper->responseHandler($responsed['data']);
//                $validity = [];
//                $c = 0;
//               if ( $datass['code'] === 200){
//                   foreach ($datass['data'] as $data){
//                       if ($data->limit == 0){
//                           $validity[$c] = $data;
//                           $c++;
//                       }
//                   }
//               }
//
//                if (sizeof($validity)>0){
//                    $result = [];
//                    $result['code'] = 423;
//                    $result['message'] = "invalid";
//                    $result['data'] = $validity;
//                    return  $result;
//                }
//            }
            $mediaArr = null;
            $postType = 'Text';
            if($request->has('mediaUrl') && !empty($request->get('mediaUrl'))){
                $postType = 'Image';
                $mediaArr = $request->get('mediaUrl');
            }else if($request->has('videoUrl') && !empty($request->get('videoUrl'))){
                $postType = 'Video';
                $mediaArr = $request->get('videoUrl');
            } else if (!isset($request->videoUrl)&& !isset($request->mediaUrl) && isset($request->outgoingUrl)){
                $postType = 'Link';
            }
            if($request->get('status') === 'scheduling') {
                date_default_timezone_set($request->timezone);
                $currentTime = date('Y-m-d\TH:i:s.ms\Z');
                if ($request->has('normal_schedule_datetime') && $request->get('normal_schedule_datetime') !== null){
                    $dt = new \DateTime($request->get('normal_schedule_datetime'), new \DateTimeZone($request->timezone));
                    $dateschedule = $dt->format("Y-m-d\TH:i:s.ms\Z");
                }else if ($request->has('day_wise_datetime') && $request->get('day_wise_datetime') !== null){
                    $dt = new \DateTime($request->get('day_wise_datetime'), new \DateTimeZone($request->timezone));
                    $dateschedule = $dt->format("Y-m-d\TH:i:s.ms\Z");
                }
                if ($currentTime > $dateschedule){
                    $result = [];
                    $result['code'] = 422;
                    $result['message'] = "Schedule time  should be atleast 3 minutes greater than current time.";
                    return $result;
                }
                $data = $this->makeSchedule($team['teamid'], $postType, $mediaArr, $request);
            }else if($request->get('status') === 'draft_scheduling'){
                $data = $this->makeSchedule($team['teamid'], $postType, $mediaArr, $request, 5);
            }else{
                $apiUrl = $this->apiUrl.'/publish/publishPosts?teamId=' . $team['teamid'];
                $requestData = (object)[
                    'postType' => $postType,
                    'message' => $request->has('content') ? $request->get('content') : '',
                    'mediaPaths' => $mediaArr,
                    'link' => $request->has('outgoingUrl') ? $request->get('outgoingUrl') : '',
                    'accountIds' => $request->get('socialAccount'),
                    'postStatus' => $request->has('status') && intval($request->get('status')) == 1 ? 1 : 0,
                    'pinBoards' => [
                        'accountId' => 0,
                        'boardId' => [],
                    ],
                ];
                $response = $this->helper->postApiCallWithAuth('post', $apiUrl, $requestData);
                $data = $this->helper->responseHandler($response['data']);
            }
            if ($data == null)
                return response()->json([
                    'satus' => 'error',
                    'message' => 'Sorry, something went wrong, please refresh the page. ',
                ],$e->getCode());
            if($data['code']){
                switch ($data['code']) {
                    case 200:
                        if (isset($data['data']->errors) && sizeof($data['data']->errors) > 0){
                            return response()->json([
                                'status' => 'error',
                                'message' => isset($data['message']) ? $data['message'] : null,
                                'error' => $data['data']->errors['0']->error
                            ], $data['code']);
                            break;
                        }else{
                            return response()->json([
                                'status' => 'success',
                                'message' => isset($data['message']) ? $data['message'] : null,
                            ], $data['code']);
                            break;
                        }

                    default:
                        return response()->json([
                            'satus' => 'error',
                            'message' => isset($data['message']) ? $data['message'] : null,
                            'error' => isset($data['error']) ? $data['error'] : null
                        ], $data['code']);
                        break;
                }
            }

        } catch (Exception $e) {
            $this->helper->logException($e->getLine(),$e->getCode(),$e->getMessage(), 'getSearchSessionApi() {PublishContentController}');
            return response()->json([
                'satus' => 'error',
                'message' => 'Sorry, something went wrong, please refresh the page. ',
            ],$e->getCode());

        }
    }

    /**
     * Show the specified resource.
     * @param int $id
     * @return Renderable
     */
    public function modal(Request $request)
    {
        $socialAccounts = [];
        try {
            $team = \Session::get('team');
            $apiUrl = ApiConfig::get('/team/get-team-details?teamId=' . $team['teamid']);
            try {
                $response = $this->helper->postApiCallWithAuth('get', $apiUrl);
                if ($response['code'] === 200) {
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
                                }
                            }
                        }
                    }
                } else {
                    return response()->json(["ErrorMessage" => 'Can not fetch accounts, please reload page'], 401);
                }
            } catch (AppException $e) {
                $this->helper->logException($e->getLine(),$e->getCode(),$e->getMessage(), 'index() {DashboardController}');
                return response()->json(["ErrorMessage" => 'Can not fetch accounts, please reload page'], 401);
            }
        } catch (AppException $e) {
            $this->helper->logException($e->getLine(),$e->getCode(),$e->getMessage(), 'index() {DashboardController}');
            return response()->json(["ErrorMessage" => 'Can not fetch accounts, please reload page'], 401);
        }
        $html = view('contentstudio::components.publish_modal', [
            'mediaData' => [
                'mediaUrl' => $request->has('mediaUrl') ? $request->get('mediaUrl') : null,
                'sourceUrl' => $request->has('sourceUrl') ? $request->get('sourceUrl') : null,
                'publisherName' => $request->has('publisherName') ? $request->get('publisherName') : null,
                'title' => $request->has('title') ? $request->get('title') : null,
                'description' => $request->has('description') ? $request->get('description') : null,
                'type' => $request->has('type') ? $request->get('type') : null,
            ],
            'socialAccounts' => $socialAccounts,
        ])->render();

        return response()->json(['html' => $html], 200);
    }

    public function feedsModal(Request $request)
    {
        $socialAccounts = [];
        $twitterAccountsIds = [];
        $facebookAccountsIds = [];
        $linkedinAccountsIds = [];
        $instagramAccountsIds = [];
        $bitlyAccountsIds = [];
        $tumblrAccountsIds = [];
        try {
            $team = \Session::get('team');
            $apiUrl = ApiConfig::get('/team/get-team-details?teamId=' . $team['teamid']);
            try {
                $response = $this->helper->postApiCallWithAuth('get', $apiUrl);
                if ($response['code'] === 200) {
                    $responseData = $this->helper->responseHandler($response['data']);
                    $accounts = $responseData['data']->teamSocialAccountDetails[0]->SocialAccount;
                    if(!empty($accounts)){
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
                        foreach ($socialAccounts as $k => $v) {
                            foreach ($v as $key => $value) {
                                foreach ($value as $val) {
                                    if ($k === 'twitter') {
                                        $twitterAccountsIds [] = $val->account_id;
                                    } else if ($k === 'facebook') {
                                        $facebookAccountsIds [] = $val->account_id;
                                    } else if ($k === 'linkedin') {
                                        $linkedinAccountsIds [] = $val->account_id;
                                    } else if ($k === 'instagram') {
                                        $instagramAccountsIds [] = $val->account_id;
                                    } else if ($k === 'tumblr') {
                                        $tumblrAccountsIds [] = $val->account_id;
                                    } else if ($k === 'bitly') {
                                        $bitlyAccountsIds [] = $val->account_id;
                                    }
                                }
                            }
                        }
                    }
                } else {
                    return response()->json(["ErrorMessage" => 'Can not fetch accounts, please reload page'], 401);
                }
            } catch (AppException $e) {
                $this->helper->logException($e->getLine(),$e->getCode(),$e->getMessage(), 'index() {DashboardController}');
                return response()->json(["ErrorMessage" => 'Can not fetch accounts, please reload page'], 401);
            }
        } catch (AppException $e) {
            $this->helper->logException($e->getLine(),$e->getCode(),$e->getMessage(), 'index() {DashboardController}');
            return response()->json(["ErrorMessage" => 'Can not fetch accounts, please reload page'], 401);
        }
        $html = view('feeds::feeds_resocio', [
            'mediaData' => [
                'mediaUrl' => $request->has('mediaUrl') ? $request->get('mediaUrl') : null,
                'sourceUrl' => $request->has('sourceUrl') ? $request->get('sourceUrl') : null,
                'publisherName' => $request->has('publisherName') ? $request->get('publisherName') : null,
                'title' => $request->has('title') ? $request->get('title') : null,
                'description' => $request->has('description') ? $request->get('description') : null,
                'type' => $request->has('type') ? $request->get('type') : null,
                'isType' => $request->has('isType') ? $request->get('isType') : null,
            ],
            'socialAccounts' => $socialAccounts,
            'accountIds' => [],
            'twitterAccountsIds' => $twitterAccountsIds,
            'facebookAccountsIds' => $facebookAccountsIds,
            'linkedinAccountsIds' => $linkedinAccountsIds,
            'instagramAccountsIds' => $instagramAccountsIds,
            'tumblrAccountsIds' => $tumblrAccountsIds,
            'bitlyAccountsIds' => $bitlyAccountsIds,
            'isTwitter' => "false",
            'isFacebook' => "false",
            'isLinkedin' => "false",
            'isInstagram' => "false",
            'isTumblr' => "false",
        ])->render();
        return response()->json(['html' => $html], 200);
    }
    
    /**
     * Show the form for editing the specified resource.
     * @param int $id
     * @return Renderable
     */
    public function draftScheduleEdit( Request $request, $id ){
        $socialAccounts = $this->getTeamSocialAccounts();
        $postUrl = $this->apiUrl . "/schedule/get-schedule-post-by-id?id=" . $id;
        $postData = $this->helper->postApiCallWithAuth('post', $postUrl);
        if($postData['code'] && $postData['code'] == 200){
            $postData = isset($postData['data']->data[0]) && $postData['data']->data[0] ? $postData['data']->data[0] : null;
            $postType = $postData->postType;

            $accountIds = [];
            if(isset($postData->postingSocialIds) && !empty($postData->postingSocialIds)){
                foreach ($postData->postingSocialIds as $key => $value) {
                    $accountIds[] = $value->accountId;
                }
            }
            $daywiseScheduleTimer = null;
            $daywiseSchedule = null;
            if(isset($postData->daywiseScheduleTimer) && !empty($postData->daywiseScheduleTimer)){
                foreach ($postData->daywiseScheduleTimer as $key => $value) {
                    $daywiseScheduleTimer[] = $value->dayId;
                    $daywiseSchedule = $value->timings['0'];
                }

            }

            $twitterAccountsIds = [];
            $facebookAccountsIds = [];
            $i = 0;
            $j = 0;
            if(!empty($socialAccounts)){
                foreach ($socialAccounts as $k => $v) {
                    foreach ($v as $key => $value) {
                        foreach ($value as $val) {
                            if ($k == 'twitter') {
                                $twitterAccountsIds [] = $val->account_id;
                                if(in_array($val->account_id, $accountIds)) $i++;
                            } else if ($k == 'facebook') {
                                $facebookAccountsIds [] = $val->account_id;
                                if(in_array($val->account_id, $accountIds)) $j++;
                            }
                        }
                    }
                }
            }
            $isTwitter = $i > 0 ? "true" : "false";
            $isFacebook = $j > 0 ? "true" : "false";

            return view('contentstudio::scheduling.edit',[
                'mediaData' => [
                    'description' => isset($postData->description) ? $postData->description : null,
                    'type' => isset($postType) ? strtolower($postType) : null,
                    'sourceUrl' => isset($postData->shareLink) ? $postData->shareLink : null,
                ],
                'mediaUrl' => isset($postData->mediaUrl) ? $postData->mediaUrl : null,
                'socialAccounts' => $socialAccounts,
                'scheduleId' => $id,
                'accountIds' => $accountIds,
                'id' => $id,
                'type' => 'draft-schedule',
                'formAction' => route('publish_content.update', $postData->schedule_id),
                'site_url' => $this->site_url,
                'postType' => $postType,
                'ownerId' => $postData->ownerId,
                'teamId' => $postData->teamId,
                'scheduleCategory' => $postData->scheduleCategory, //it should be either 0(daily) or 1(weekly)
                'moduleName' => $postData->moduleName,
                'scheduleStatus' => $postData->scheduleStatus,
                'normalScheduleDate' => $postData->normalScheduleDate,
                'daywiseScheduleTimer' => $daywiseScheduleTimer,
                'createdDate' => $postData->createdDate,
                'mediaSelectionType' => $postData->mediaSelectionType,
                'schedule_id' => $postData->schedule_id,
                'twitterAccountsIds' => $twitterAccountsIds,
                'facebookAccountsIds' => $facebookAccountsIds,
                'isTwitter' => $isTwitter,
                'isFacebook' => $isFacebook,
                'socioQueue' => null,
                'returntype' => 2,
                'daywisetime' => $daywiseSchedule
            ]);
        }
    }

    public function socioQueueEdit( Request $request, $id, $content = 1){
        $socialAccounts = $this->getTeamSocialAccounts();
        $postUrl = $this->apiUrl . "/schedule/get-schedule-post-by-id?id=" . $id;
        $postData = $this->helper->postApiCallWithAuth('post', $postUrl);
        if($postData['code'] && $postData['code'] == 200){
            $postData = isset($postData['data']->data[0]) && $postData['data']->data[0] ? $postData['data']->data[0] : null;
            $postType = isset($postData->postType) ? $postData->postType : null;

            $accountIds = [];
            if(isset($postData->postingSocialIds) && !empty($postData->postingSocialIds)){
                foreach ($postData->postingSocialIds as $key => $value) {
                    $accountIds[] = $value->accountId;
                }
            }

            $daywiseScheduleTimer = null;
            $daywiseSchedule = null;
            if(isset($postData->daywiseScheduleTimer) && !empty($postData->daywiseScheduleTimer)){
                foreach ($postData->daywiseScheduleTimer as $key => $value) {
                    $daywiseScheduleTimer[] = $value->dayId;
                    $daywiseSchedule = $value->timings['0'];
                }
            }

            $twitterAccountsIds = [];
            $facebookAccountsIds = [];
            $linkedInAccountsIds = [];
            $instagramInAccountsIds = [];
            $tumblrInAccountsIds = [];
            $i = 0;
            $j = 0;
            $x = 0;
            $y = 0;
            $z = 0;
            if(!empty($socialAccounts)){
                foreach ($socialAccounts as $k => $v) {
                    foreach ($v as $key => $value) {
                        foreach ($value as $val) {
                            if ($k == 'twitter') {
                                $twitterAccountsIds [] = $val->account_id;
                                if(in_array($val->account_id, $accountIds)) $i++;
                            } else if ($k == 'facebook') {
                                $facebookAccountsIds [] = $val->account_id;
                                if(in_array($val->account_id, $accountIds)) $j++;
                            }else if ($k == 'linkedin') {
                                $linkedInAccountsIds [] = $val->account_id;
                                if(in_array($val->account_id, $accountIds)) $x++;
                            }else if ($k == 'instagram') {
                                $instagramInAccountsIds [] = $val->account_id;
                                if(in_array($val->account_id, $accountIds)) $y++;
                            }else if ($k == 'instagram') {
                                $tumblrInAccountsIds [] = $val->account_id;
                                if(in_array($val->account_id, $accountIds)) $z++;
                            }
                        }
                    }
                }
            }
            $isTwitter = $i > 0 ? "true" : "false";
            $isFacebook = $j > 0 ? "true" : "false";
            $isLinkedin = $x > 0 ? "true" : "false";
            $isInstagram = $y > 0 ? "true" : "false";
            $istumblr = $z > 0 ? "true" : "false";
            return view('contentstudio::scheduling.edit',[
                'mediaData' => [
                    'description' => isset($postData->description) ? $postData->description : null,
                    'type' => isset($postType) ? strtolower($postType) : null,
                    'sourceUrl' => isset($postData->shareLink) ? $postData->shareLink : null,
                ],
                'mediaUrl' => isset($postData->mediaUrl) ? $postData->mediaUrl : null,
                'socialAccounts' => $socialAccounts,
                'scheduleId' => $id,
                'accountIds' => $accountIds,
                'id' => $id,
                'type' => 'schedule',
                'formAction' => route('publish_content.update', $postData->schedule_id),
                'site_url' => $this->site_url,
                'postType' => $postType,
                'ownerId' => $postData->ownerId,
                'teamId' => $postData->teamId,
                'scheduleCategory' => $postData->scheduleCategory, //it should be either 0(daily) or 1(weekly)
                'moduleName' => $postData->moduleName,
                'scheduleStatus' => $postData->scheduleStatus,
                'normalScheduleDate' => $postData->normalScheduleDate,
                'daywiseScheduleTimer' => $daywiseScheduleTimer,
                'createdDate' => $postData->createdDate,
                'mediaSelectionType' => $postData->mediaSelectionType,
                'schedule_id' => $postData->schedule_id,
                'twitterAccountsIds' => $twitterAccountsIds,
                'facebookAccountsIds' => $facebookAccountsIds,
                'isTwitter' => $isTwitter,
                'isFacebook' => $isFacebook,
                'istumblr' => $istumblr,
                'isInstagram' => $isInstagram,
                'isLinkedin' => $isLinkedin,
                'socioQueue' => 'socioQueue',
                'returntype' => $content,
                'daywisetime' => $daywiseSchedule
            ]);
        }
    }

    /**
     * Show the form for editing the specified resource.
     * @param int $id
     * @return Renderable
     */
    public function edit( Request $request, $id ){
        $socialAccounts = $this->getTeamSocialAccounts();
        $postUrl = $this->apiUrl . "/schedule/get-schedule-post-by-id?id=" . $id;
        $postData = $this->helper->postApiCallWithAuth('post', $postUrl);
        if($postData['code'] && $postData['code'] == 200){
            $postData = isset($postData['data']->data[0]) && $postData['data']->data[0] ? $postData['data']->data[0] : null;
            $postType = $postData->postType;
            
            $accountIds = [];
            if(isset($postData->postingSocialIds) && !empty($postData->postingSocialIds)){
                foreach ($postData->postingSocialIds as $key => $value) {
                    $accountIds[] = $value->accountId;
                }
            }
            $daywiseScheduleTimer = null;
            $daywiseSchedule = null;
            if(isset($postData->daywiseScheduleTimer) && !empty($postData->daywiseScheduleTimer)){
                foreach ($postData->daywiseScheduleTimer as $key => $value) {
                    $daywiseScheduleTimer[] = $value->dayId;
                    $daywiseSchedule = $value->timings['0'];
                }
            }

            $twitterAccountsIds = [];
            $facebookAccountsIds = [];
            $linkedInAccountsIds = [];
            $i = 0;
            $j = 0;
            $x = 0;
            if(!empty($socialAccounts)){
                foreach ($socialAccounts as $k => $v) {
                    foreach ($v as $key => $value) {
                        foreach ($value as $val) {
                            if ($k == 'twitter') {
                                $twitterAccountsIds [] = $val->account_id;
                                if(in_array($val->account_id, $accountIds)) $i++;
                            } else if ($k == 'facebook') {
                                $facebookAccountsIds [] = $val->account_id;
                                if(in_array($val->account_id, $accountIds)) $j++;
                            }else if ($k == 'linkedin') {
                                $linkedInAccountsIds [] = $val->account_id;
                                if(in_array($val->account_id, $accountIds)) $x++;
                            }
                        }
                    }
                }
            }
            $isTwitter = $i > 0 ? "true" : "false";
            $isFacebook = $j > 0 ? "true" : "false";
            $isLinkedin = $x > 0 ? "true" : "false";

            return view('contentstudio::scheduling.edit',[
                'mediaData' => [
                    'description' => isset($postData->description) ? $postData->description : null,
                    'type' => isset($postType) ? strtolower($postType) : null,
                    'sourceUrl' => isset($postData->shareLink) ? $postData->shareLink : null,
                ],
                'mediaUrl' => isset($postData->mediaUrl) ? $postData->mediaUrl : null,
                'socialAccounts' => $socialAccounts,
                'scheduleId' => $id,
                'accountIds' => $accountIds,
                'id' => $id,
                'type' => 'schedule',
                'formAction' => route('publish_content.update', $postData->schedule_id),
                'site_url' => $this->site_url,
                'postType' => $postType,
                'ownerId' => $postData->ownerId,
                'teamId' => $postData->teamId,
                'scheduleCategory' => $postData->scheduleCategory, //it should be either 0(daily) or 1(weekly)
                'moduleName' => $postData->moduleName,
                'scheduleStatus' => $postData->scheduleStatus,
                'normalScheduleDate' => $postData->normalScheduleDate,
                'daywiseScheduleTimer' => $daywiseScheduleTimer,
                'createdDate' => $postData->createdDate,
                'mediaSelectionType' => isset($postData->mediaSelectionType) ? $postData->mediaSelectionType : "",
                'schedule_id' => $postData->schedule_id,
                'twitterAccountsIds' => $twitterAccountsIds,
                'facebookAccountsIds' => $facebookAccountsIds,
                'isTwitter' => $isTwitter,
                'isFacebook' => $isFacebook,
                'isLinkedin' => $isLinkedin,
                'socioQueue' => null,
                'daywisetime' => $daywiseSchedule
            ]);
        }
    }

    /**
     * Update the specified resource in storage.
     * @param Request $request
     * @param int $id
     * @return Renderable
     */

    public function draftEdit(Request $request, $id){
        $socialAccounts = $this->getTeamSocialAccounts();
        $postUrl = $this->apiUrl . "/publish/get-draft-post-by-id?id=" . $id;
        $postData = $this->helper->postApiCallWithAuth('get', $postUrl);
        $twitterAccountsIds = [];
        $facebookAccountsIds = [];
        $i = 0;
        $j = 0;
        if($postData['code'] && $postData['code'] == 200){
            $postData = isset($postData['data']->data[0]) ? $postData['data']->data[0] : null;
            $postType = $postData->postType;
            if(!empty($socialAccounts)){
                foreach ($socialAccounts as $k => $v) {
                    foreach ($v as $key => $value) {
                        foreach ($value as $val) {
                            if ($k == 'twitter') {
                                $twitterAccountsIds [] = $val->account_id;
                                if(in_array($val->account_id, $postData->accountIds)) $i++;
                            } else if ($k == 'facebook') {
                                $facebookAccountsIds [] = $val->account_id;
                                if(in_array($val->account_id, $postData->accountIds)) $j++;
                            }
                        }
                    }
                }
            }
            $isTwitter = $i > 0 ? "true" : "false";
            $isFacebook = $j > 0 ? "true" : "false";
            return view('contentstudio::scheduling.edit',[
                'mediaData' => [
                    'description' => isset($postData->description) ? $postData->description : null,
                    'type' => isset($postType) ? strtolower($postType) : null,
                    'sourceUrl' => isset($postData->shareLink) ? $postData->shareLink : null,
                ],
                'mediaUrl' => isset($postData->mediaUrl) ? $postData->mediaUrl : null,
                'socialAccounts' => $socialAccounts,
                'accountIds' => isset($postData->accountIds) && !empty($postData->accountIds) ? $postData->accountIds : [],
                'id' => $id,
                'type' => 'draft',
                'formAction' => route('publish_content.update', $id),
                'site_url' => $this->site_url,
                'postType' => $postType,
                'ownerId' => $postData->ownerId,
                'teamId' => $postData->teamId,
                'twitterAccountsIds' => $twitterAccountsIds,
                'facebookAccountsIds' => $facebookAccountsIds,
                'isTwitter' => $isTwitter,
                'isFacebook' => $isFacebook,
                'socioQueue' => null,
                'returntype' => 2
            ]);
        }
    }


    public function update(PublishRequest $request, $id)
    {
        try {
            $mediaArr = null;
            $postType = 'Text';
            $team = \Session::get('team');

            if($request->has('mediaUrl') && !empty($request->get('mediaUrl'))){
                $postType = 'Image';
                $mediaArr = $request->get('mediaUrl');
            }else if($request->has('videoUrl') && !empty($request->get('videoUrl'))){
                $postType = 'Video';
                $mediaArr = $request->get('videoUrl');
            }

            if($request->get('status') == 'scheduling' && $request->type == 'schedule') {
                $data = $this->updateSchedule($id, $team['teamid'], $postType, $mediaArr, $request);
            } else if($request->get('status') == 'draft_scheduling' && $request->type == 'schedule'){
                $data = $this->updateSchedule($id, $team['teamid'], $postType, $mediaArr, $request, 5);
            }
            else if($request->get('status') == 'scheduling' && (($request->type == 'draft')  ||  ($request->type == 'draft-schedule')) ) {
                $data = $this->makeSchedule($team['teamid'], $postType, $mediaArr, $request);
            }else if($request->get('status') == 'draft_scheduling' && (($request->type == 'draft')  ||  ($request->type == 'draft-schedule')) ){
                $data = $this->makeSchedule($team['teamid'], $postType, $mediaArr, $request, 5);
            }
            else if($request->get('status') == '1' && $request->type == 'draft-schedule') {
                $data = $this->makeSchedule($team['teamid'], $postType, $mediaArr, $request);
            }else if($request->get('status') == '0' && $request->type == 'draft-schedule'){
                $data = $this->updateSchedule($id, $team['teamid'], $postType, $mediaArr, $request, 5);
            }
            else if($request->get('status') == '1' && $request->type == 'draft'){
                $apiUrl = $this->apiUrl.'/publish/publishPosts?teamId=' . $team['teamid'];
                $requestData = [
                    'postType' => $postType,
                    'message' => $request->has('content') ? $request->get('content') : '',
                    'mediaPaths' => $mediaArr,
                    'link' => $request->has('outgoingUrl') ? $request->get('outgoingUrl') : '',
                    'accountIds' => $request->get('socialAccount'),
                    'postStatus' => $request->has('status') && intval($request->get('status')) == 1 ? 1 : 0,
                    'pinBoards' => [
                        'accountId' => 0,
                        'boardId' => [],
                    ],
                ];

                $response = $this->helper->postApiCallWithAuth('post', $apiUrl, $requestData);
                $data = $this->helper->responseHandler($response['data']);
            }
            else if($request->get('status') == '0' && $request->type == 'draft'){
                $apiUrl = $this->apiUrl.'/publish/update-draft-post-by-id?id=' . $id;
                $requestData = [
                    'draftPost' => [(object)[
                        'postType' => $postType,
                        'description' => $request->has('content') ? $request->get('content') : '',
                        'mediaUrl' => $mediaArr,
                        'shareLink' => $request->has('outgoingUrl') ? $request->get('outgoingUrl') : '',
                        'accountIds' => $request->get('socialAccount'),
                        'ownerId' => $request->has('ownerId') ? intval($request->get('ownerId')) : null,
                        'teamId' => $request->has('teamId') ? intval($request->get('teamId')) : null,
                    ]
                    ]
                ];
                $response = $this->helper->postApiCallWithAuth('put', $apiUrl, $requestData);
                $data = $this->helper->responseHandler($response['data']);
            }

            if ($data == null)
                return response()->json([
                    'satus' => 'error',
                    'message' => 'Sorry, something went wrong, please refresh the page. ',
                ],$e->getCode());

            if($data['code']){

                switch ($data['code']) {
                    case 200:
                        return response()->json([
                            'status' => 'success',
                            'message' => isset($data['message']) ? $data['message'] : null,
                            'type_text' =>  (isset($request->socioQueue) && ($request->socioQueue == 'socioQueue')) ? $request->socioQueue : null,
                            'type_value' =>  $request->has('scheduling_type') ? $request->get('scheduling_type') : null,
                            'returnto' => $request->returntype
                        ], $data['code']);
                        break;

                    default:
                        return response()->json([
                            'code' => $data['code'],
                            'status' => 'error',
                            'message' => isset($data['message']) ? $data['message'] : null,
                            'error' => isset($data['error']) ? $data['error'] : null
                        ], $data['code']);
                        break;
                }
            }

        } catch (Exception $e) {
            $this->helper->logException($e->getLine(),$e->getCode(),$e->getMessage(), 'getSearchSessionApi() {PublishContentController}');
            return response()->json([
                'satus' => 'error',
                'message' => 'Sorry, something went wrong, please refresh the page. ',
            ],$e->getCode());

        }
    }

    /**
     * Remove the specified resource from storage.
     * @param int $id
     * @return Renderable
     */
    public function destroy($id)
    {
        //
    }


    private function uploadMediaFile($file)
    {
        $mimeType = null;
        $pathToStorage = public_path('media/uploads');
        if (!file_exists($pathToStorage))
            mkdir($pathToStorage, 0777, true);

        $mime = $file->getMimeType();
        if(strstr($mime, "video/")){
            $mimeType = 'video';
        }else if(strstr($mime, "image/")){
            $mimeType = 'image';
        }
        if($mimeType){
            $mediFile = $file->getClientOriginalName();
            $direction = $pathToStorage .'/'.$mediFile;
            file_put_contents($direction, file_get_contents($file->path()));

            return ['type' => $mimeType, 'path' => $direction];
        }
        return false;
    }

    private function uploadMediaToApi($data)
    {
        $result = [];

        $filedata = array("name" => $data['name'], "file" => $data['filePath']);
        $apiUrl = $this->apiUrl. '/upload/media?title=' . $data["title"] . '&teamId=' . $data["teamId"] . '&privacy=' . $data["privacy"];

        try {
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl, $filedata, true);

            unlink($data['filePath']);
            if ($response['code'] == 200) {
                $result["code"] = $response["data"]->code;
                $result["data"] = $response["data"]->data;
                $result["message"] = $response["data"]->message;
                $result["error"] = $response["data"]->error;
            } else {
                $result = $response;
            }
            return $result;
        } catch (Exception $e) {
            $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), ' uploadImage() {PublishContentController}');
            return false;
        }
    }

    private function downloadMediaUrl($mediaUrl)
    {
        $pathToStorage = public_path('media/uploads');
        if (!file_exists($pathToStorage))
            mkdir($pathToStorage, 0777, true);

        $publishimage = substr($mediaUrl, strrpos($mediaUrl, '/') + 1);
        $direction = $pathToStorage . "/" . $publishimage;
        file_put_contents($direction, file_get_contents($mediaUrl));

        return ['type' => 'image', 'path' => $direction];
    }

    private function getTeamSocialAccounts()
    {
        $user_id = session()->get('user')['userDetails']['user_id'];
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
                                        $socialAccounts['linkedin']['page'][] = $account;
                                        break;
                                    case 12:
                                        $socialAccounts['instagram']['business account'][] = $account;
                                        break;
                                    case 16:
                                        $socialAccounts['tumblr']['account'][] = $account;
                                        break;
                                    case 13:
                                        $socialAccounts['bitly']['account'][] = $account;
                                        break;
                                }
                            }
                        }
                    }
                } else {
                    return false;
                }
            } catch (AppException $e) {
                $this->helper->logException($e->getLine(),$e->getCode(),$e->getMessage(), 'index() {DashboardController}');
                return false;
            }
        } catch (AppException $e) {
            $this->helper->logException($e->getLine(),$e->getCode(),$e->getMessage(), 'index() {DashboardController}');
            return false;
        }
        return $socialAccounts;
    }

    /**
     * TODO we've to get youtube accounts.
     * This function is to get the youtube accounts in a particular account.
     * @return  all youtube accounts in json format.
     */
    public function getTeamYoutubeAccounts()
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
                            if (!$account->join_table_teams_social_accounts->is_account_locked) {
                                switch ($account->account_type) {
                                    case 9:
                                        $socialAccounts['youtube']['account'][] = $account;
                                        break;
                                }
                            }
                        }
                    }
                } else {
                    return false;
                }
            } catch (AppException $e) {
                $this->helper->logException($e->getLine(),$e->getCode(),$e->getMessage(), 'index() {DashboardController}');
                return false;
            }
        } catch (AppException $e) {
            $this->helper->logException($e->getLine(),$e->getCode(),$e->getMessage(), 'index() {DashboardController}');
            return false;
        }
        return $socialAccounts;
    }

    private function makeSchedule($teamId, $postType, $mediaArr, $request, $status = 1)
    {
        $socialAccount = [];
        if($request->has('socialAccount') && !empty($request->get('socialAccount'))){
            foreach ($request->get('socialAccount') as $key => $id) {
                $socialAccount[] = ['accountId' => $id];
            }
        }

        $daywiseScheduleTimer = null;
        if($request->has('weekday') && !empty($request->get('weekday')) && $request->has('day_wise_datetime') )
        {
            $dt = new \DateTime($request->get('day_wise_datetime'), new \DateTimeZone($request->timezone));
            $dt->setTimeZone(new \DateTimeZone('UTC'));
            $dateschedule = $dt->format("Y-m-d\TH:i:s.ms\Z");
            foreach ($request->get('weekday') as $key => $dayId) {
                $daywiseScheduleTimer[] = [
                    'dayId' => $dayId,
                    'timings' => [$request->has('day_wise_datetime') ? $dateschedule : null],
                ];
            }
        }

        if ($request->has('normal_schedule_datetime') && $request->get('normal_schedule_datetime')!== null && $request->get('normal_schedule_datetime')!== "Invalid Date"){
            $dt = new \DateTime($request->get('normal_schedule_datetime'), new \DateTimeZone($request->timezone));
            $dt->setTimeZone(new \DateTimeZone('UTC'));
            $date = $dt->format("Y-m-d\TH:i:s.ms\Z");
        } else{
            $date = null;
        }
        $requestData = [
            "postInfo" => [
                "postType" => $postType,
                "description" => $request->has('content') ? $request->get('content') : '',
                "mediaUrl" => $mediaArr,
                "mediaSelectionType" => $request->has('mediaSelectionType') ? $request->get('mediaSelectionType') : 0,
                "shareLink" => $request->has('outgoingUrl') ? $request->get('outgoingUrl') : '',
                "isInsta"=>$request->has('accountTypes') ? $request->get('accountTypes') : false,
                "postingSocialIds" => $socialAccount,

                "pinBoards" => [
                    [
                        "accountId" => 0,
                        "boardId" => [
                            "string"
                        ]
                    ]
                ],
                "scheduleCategory" => $request->has('scheduling_type') ? $request->get('scheduling_type') : 0,  //it should be either 0(daily) or 1(weekly)
                "teamId" => $teamId,

                "moduleName" => $request->has('scheduling_type') && $request->get('scheduling_type') === 1 ? "Daywise scheduling" : "Normal scheduling",
                "moduleValues" => [
                    "string"
                ],

                "scheduleStatus" => $status,

                "normalScheduleDate" => $date,

            ]
        ];

        if($request->has('scheduling_type') && $request->get('scheduling_type') == '1' && $daywiseScheduleTimer){
            $requestData['postInfo']['daywiseScheduleTimer'] = $daywiseScheduleTimer;
        }

        $apiUrl = $this->apiUrl.'/schedule/create';
        $response = $this->helper->postApiCallWithAuth('post', $apiUrl, $requestData);

        return $this->helper->responseHandler($response['data']);

    }

    private function updateSchedule($id, $teamId, $postType, $mediaArr, $request, $status = 1)
    {
        $socialAccount = [];
        if($request->has('socialAccount') && !empty($request->get('socialAccount'))){
            foreach ($request->get('socialAccount') as $key => $account_id) {
                $socialAccount[] = ['accountId' => $account_id];
            }
        }

        $daywiseScheduleTimer = null;
        if($request->has('weekday') && !empty($request->get('weekday')) && $request->has('day_wise_datetime') )
        {
            $dt = new \DateTime($request->get('day_wise_datetime'), new \DateTimeZone($request->timezone));
            $dt->setTimeZone(new \DateTimeZone('UTC'));
            $dateschedule = $dt->format("Y-m-d\TH:i:s.ms\Z");
            foreach ($request->get('weekday') as $key => $dayId) {
                $daywiseScheduleTimer[] = [
                    'dayId' => $dayId,
                    'timings' => [$request->has('day_wise_datetime') ? $dateschedule : null],
                ];
            }
        }
        if ($request->has('normal_schedule_datetime') && $request->get('normal_schedule_datetime') !== "Invalid Date"){
            $dt = new \DateTime($request->get('normal_schedule_datetime'), new \DateTimeZone($request->timezone));
            $dt->setTimeZone(new \DateTimeZone('UTC'));
            $date = $dt->format("Y-m-d\TH:i:s.ms\Z");
        } else{
            $date = null;
        }
        $requestData = [
            "postInfo" => [
                "postType" => $postType,
                "description" => $request->has('content') ? $request->get('content') : '',
                "mediaUrl" => $mediaArr,
                "mediaSelectionType" => $request->has('mediaSelectionType') ? $request->get('mediaSelectionType') : 0,
                "shareLink" => $request->has('outgoingUrl') ? $request->get('outgoingUrl') : '',
                "postingSocialIds" => $socialAccount,

                "pinBoards" => [
                    [
                        "accountId" => 0,
                        "boardId" => [
                            "string"
                        ]
                    ]
                ],
                "scheduleCategory" => $request->has('scheduling_type') ? $request->get('scheduling_type') : 0,  //it should be either 0(daily) or 1(weekly)
                "teamId" => $teamId,

                "moduleName" => "string",
                "moduleValues" => [
                    "string"
                ],

                "scheduleStatus" => $status, 

                "normalScheduleDate" => $date
            ]
        ];

        if($request->has('scheduling_type') && $request->get('scheduling_type') == '1' && $daywiseScheduleTimer){
            $requestData['postInfo']['daywiseScheduleTimer'] = $daywiseScheduleTimer;
        }
        $apiUrl = (isset($request->socioQueue) && ($request->socioQueue == 'socioQueue')) ? $this->apiUrl.'/schedule/edit?scheduleId='.$id.'&teamId='.$teamId : $this->apiUrl.'/schedule/edit-draft-schedule?scheduleId='.$id.'&teamId='.$teamId;
        $response = $this->helper->postApiCallWithAuth('PUT', $apiUrl, $requestData);

        return $this->helper->responseHandler($response['data']);

    }

    /**
     * TODO we've to show the youtube publish view with the accounts.
     * This function is to get the youtube accounts and return the view.
     * @return  youtube publish page view blade with all data required to display from controller to view.
     */
    public function youtubeView(){
        $accounts= $this->getTeamYoutubeAccounts();
        if (isset($accounts ) && isset($accounts['youtube'])){
            $socialAccounts = $accounts['youtube'];
        }else{
            $socialAccounts = null;
        }

        return view('contentstudio::scheduling.youtube_publish',compact('socialAccounts'));
    }

    /**
     * TODO we've to publish the video to youtube.
     * * This function is used for publishing video to youtube
     * By Requesting the /youtube/publish external NODE API from controller.
     * @param {string} discription- discription about the video.
     * @param {string} title-  Title of the video.
     * @param {number} account id- id of a account to which video to be posted.
     * !Do not change this function without referring API format getting the particular feeds from feeds servies.
     * @return {Object} Returns publisged video data in JSON object format.
     */
    public function youtubeSchedule(Request $request){
        $data = [];
        if ($request->privacystatus === "private"){
            $data = [
                'account_id' => 'required',
                'title' => 'required',
                'discription' => 'required',
                'videoUrl' => 'required',
                'thumbnail' => 'max:2048',
            ];
                $dt = new \DateTime($request->get('datetime'), new \DateTimeZone('Asia/Calcutta'));
                $dt->setTimeZone(new \DateTimeZone('UTC'));
                $date = $dt->format("Y-m-d\TH:i:s.ms\Z");
                $status = [
                "privacyStatus" => "private",
                "publishAt" => $date
            ];
        }else{
            $data = [
                'account_id' => 'required',
                'title' => 'required',
                'discription' => 'required',
                'videoUrl' => 'required',
                'thumbnail' => 'max:2048',
            ];
            $status = [
                "privacyStatus" => "public",
            ];
        }
        $validator = Validator::make($request->only('account_id', 'title','discription','videoUrl','thumbnail'), $data, [
            'account_id.required' => 'Youtube Account is Required',
            'videoUrl.required' => 'Video for Publishing is Required',
        ]);
        if ($validator->fails()) {
            $response['code'] = 201;
            $response['msg'] = $validator->errors()->all();
            $response['data'] = null;
            return Response::json($response, 200);
        }
        $mediaUrl = $request->videoUrl;
        if (isset($request->thumbnail))
        $requestData = [
            "postDetails" => [
                "postType" => (int)$request->type,
                "mediaUrls" => [
                    $mediaUrl
                ],
                "resource" => [
                    "snippet" => [
                        "title" => $request->title,
                        "description" => $request->discription,
                        "categoryId" => 24,
                        "defaultLanguage" => "en",
                        "defaultAudioLanguage" => "en",
                        "tags" => isset($request->param ) ? $request->param : []
                    ],
                    "status" => $status
                ],
                "thumbnailUrl" => $request->thumbnail
                ]
            ];
        else
            $requestData = [
                "postDetails" => [
                    "mediaUrls" => [
                        $mediaUrl
                    ],
                    "postType" => (int)$request->type,
                    "resource" => [
                        "snippet" => [
                            "title" => $request->title,
                            "description" => $request->discription,
                            "categoryId" => 24,
                            "defaultLanguage" => "en",
                            "defaultAudioLanguage" => "en",
                            "tags" => isset($request->param ) ? $request->param : []
                        ],
                        "status" => $status
                    ],
                ]
            ];
        $team = \Session::get('team');
        $method = '';
        $apiUrl = '';
        if($request->update === '2'){
            $apiUrl = $this->apiUrl.'/youtube/publish?accountId='.$request->account_id.'&teamId='.$team['teamid'];
            $method = 'POST';
        }else if ($request->update === '1'){
            $apiUrl = $this->apiUrl.'/youtube/edit-published-details?postId='.$request->id.'&accountId='.$request->account_id.'&teamId='.$team['teamid'];
            $method = 'PUT';
        }
        $response = $this->helper->postApiCallWithAuth($method, $apiUrl,$requestData);
        return $this->helper->responseHandler($response['data']);
    }

    /**
     * TODO we've to get pinterest accounts.
     * This function is to get the pinterest accounts in a particular account.
     * @return  all pinterest accounts in json format.
     */
    private function getPinterestAccounts()
    {
        $socialAccounts = [];
        try {
            $team = \Session::get('team');
            $apiUrl = ApiConfig::get('/team/get-team-details?teamId=' . $team['teamid']);
            try {
                $response = $this->helper->postApiCallWithAuth('get', $apiUrl);
                if (isset($response['code']) && $response['code'] === 200) {
                    $responseData = $this->helper->responseHandler($response['data']);
                    $accounts = $responseData['data']->pinterestAccountDetails;
                } else {
                    return false;
                }
            } catch (AppException $e) {
                $this->helper->logException($e->getLine(),$e->getCode(),$e->getMessage(), 'index() {DashboardController}');
                return false;
            }
        } catch (AppException $e) {
            $this->helper->logException($e->getLine(),$e->getCode(),$e->getMessage(), 'index() {DashboardController}');
            return false;
        }
        return $accounts;
    }

    /**
     * TODO we've to show the Pinterest publish view with the accounts.
     * This function is to get the pinteresr accounts and return the view.
     * @return  pinterest publish page view blade with all data required to display from controller to view.
     */
    public function pinterestView(){
        $socialAccounts = $this->getPinterestAccounts();
        return view('contentstudio::scheduling.pinterest_publish', compact('socialAccounts'));
    }

    /**
     * TODO we've to publish the video to pinterest.
     * * This function is used for publishing video to pinterest
     * By Requesting the /pinterest/publish external NODE API from controller.
     * @param {string} discription- discription about the image.
     * @param {number} account id- id of a account to which video to be posted.
     * !Do not change this function without referring API format getting the particular feeds from feeds servies.
     * @return {Object} Returns publisged image data in JSON object format.
     */
    public function pinterestSchedule(Request $request){
        if ($request['outgoing-url'] !== null){
            $data = [
                'board_id' => 'required',
                'discription' => 'required',
                'mediaUrl' => 'required',
                'outgoing-url'=> 'url'
            ];
            $validator = Validator::make($request->only('board_id', 'mediaUrl','discription','outgoing-url'), $data, [
                'board_id.required' => 'Pinterest account and boards are Required',
                'discription.required' => 'Discription is required',
                'mediaUrl.required' => 'Media for Publishing is Required',
                'outgoing-url.url' => 'Outgoing url should be a valid URL'
            ]);
        }else{
            $data = [
                'board_id' => 'required',
                'discription' => 'required',
                'mediaUrl' => 'required',
            ];
            $validator = Validator::make($request->only('board_id', 'mediaUrl','discription'), $data, [
                'board_id.required' => 'Pinterest account and boards are Required',
                'discription.required' => 'Discription is required',
                'mediaUrl.required' => 'Media for Publishing is Required'
            ]);
        }
        if ($validator->fails()) {
            $response['code'] = 201;
            $response['msg'] = $validator->errors()->all();
            $response['data'] = null;
            return Response::json($response, 200);
        }
        for ($i = 0 ; $i< sizeof($request->board_id) ; $i++){
            $name = explode(',',$request->board_id[$i]);
            $accounts[$i] = $name[1];
            $boards[] = [
                'accountId' => (int)$name[1],
                'boardId' => [$name[0]]
            ];
        }

        $accountIds = array_unique($accounts);
        $requestData = (object)[
            'postType' => 'Image',
            'message' => $request->discription,
            'mediaPaths' => $request->mediaUrl,
            'link' =>  $request['outgoing-url'] === null ? "" : $request['outgoing-url'],
            'accountIds' => $accountIds,
            'postStatus' => 1,
            'pinBoards' => $boards
        ];
        $team = \Session::get('team');
        $apiUrl = $this->apiUrl.'/publish/publishPosts?teamId=' . $team['teamid'];
        $response = $this->helper->postApiCallWithAuth('post', $apiUrl, $requestData);
        return $this->helper->responseHandler($response['data']);
    }

    public function editWithYoutube($id, $type){
        $postUrl = '';
        if ($type === 'draft'){
            $postUrl = $this->apiUrl . "/publish/get-draft-post-by-id?id=" . $id;
            $method = 'get';
        } else{
            $postUrl = $this->apiUrl . "/schedule/get-schedule-post-by-id?id=" . $id;
            $method = 'post';
        }
        $postData = $this->helper->postApiCallWithAuth($method, $postUrl);
        $responseData = $this->helper->responseHandler($postData['data']);
        $discription = $responseData['data']['0']->description;
        if ($responseData['data']['0']->postType === 'Video'){
            $videoData = $responseData['data']['0']->mediaUrl['0'];
        }else{
            $videoData = "No";
        }
        $accounts= $this->getTeamYoutubeAccounts();
        if (isset($accounts ) && isset($accounts['youtube'])){
            $socialAccounts = $accounts['youtube'];
        }else{
            $socialAccounts = null;
        }

        return view('contentstudio::scheduling.youtube_publish',compact('socialAccounts', 'videoData','discription'));
    }


    private function getTeamTikTokAccounts()
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

                    if (!empty($accounts)) {
                        foreach ($accounts as $key => $account) {
                            if (!$account->join_table_teams_social_accounts->is_account_locked) {
                                switch ($account->account_type) {
                                    case 18:
                                        $socialAccounts['tiktok']['account'][] = $account;
                                        break;
                                }
                            }
                        }
                    }
                } else {
                    return false;
                }
            } catch (AppException $e) {
                $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'index() {DashboardController}');
                return false;
            }
        } catch (AppException $e) {
            $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'index() {DashboardController}');
            return false;
        }
        return $socialAccounts;
    }

    public function showTikTokPublish()
    {

        $accounts = $this->getTeamTikTokAccounts();
        if (isset($accounts) && isset($accounts['tiktok'])) {
            $socialAccounts = $accounts['tiktok'];
        } else {
            $socialAccounts = null;
        }
        return view('contentstudio::scheduling.tiktok_publish', compact('socialAccounts'));
    }

    public function tikTokSchedule(Request $request)
    {
        $accids = $request->selectedAccs;
        $AccIds = [];
        $extractedAccids = [];
        $data = [
            'account_id' => 'required',
            'videoUrl' => 'required',
        ];
        $validator = Validator::make($request->only('account_id', 'title', 'discription', 'videoUrl'), $data, [
            'account_id.required' => 'TikTok Account is Required',
            'videoUrl.required' => 'Video for Publishing is Required',
        ]);
        if ($validator->fails()) {
            $response['code'] = 201;
            $response['msg'] = $validator->errors()->all();
            $response['data'] = null;
            return Response::json($response, 200);
        }
        if (str_contains($accids, ',') === true) {
            $extractedAccids = (explode(",", $accids));
            foreach ($extractedAccids as $value) {
                array_push($AccIds, (int)$value);
            }
        } else {
            array_push($AccIds, (int)$accids);
        }
        $mediaUrl = $request->videoUrl;
        $accId = (integer)$request->account_id;
        $team = Session::get('team');
        $teamID = $team['teamid'];
        $requestData = (object)[
            "accountIds" => $AccIds,
            "teamId" => $teamID,
            "videoUrl" => $mediaUrl
        ];
        $team = \Session::get('team');
        $apiUrl = $this->feedsUrl . '/feeds/tiktok/videos/upload';
        $response = $this->helper->postApiCallWithAuth('POST', $apiUrl, $requestData);
        return $this->helper->responseHandler($response['data']);
    }


}
