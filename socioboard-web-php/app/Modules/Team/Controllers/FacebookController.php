<?php

namespace App\Modules\Team\Controllers;

use App\Modules\User\Helper;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
//use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Session;
//use Illuminate\Support\Facades\Validator;
use Mockery\CountValidator\Exception;
//use App\Modules\Discovery\Controllers\DiscoveryPublishController;
//use App\Modules\Team\Controllers\TeamController;

class FacebookController extends Controller
{
    protected $client;
    protected $API_URL;

    public function __construct()
    {
        $this->client = new Client();
        $this->API_URL = env('API_URL') . env('VERSION') . '/';
    }


    // TODO have to check team session


    public function FacebookAdd($network, $teamId)
    {

        try {
            $help = Helper::getInstance();
//            Log("Network ".$network);
            $response = $help->apiCallGet('team/getProfileRedirectUrl?teamId=' . $teamId . "&network=" . $network);
//Log::info("Redirection  ".$response->navigateUrl);
            if ($response->code == 200 && $response->status == "success") {
                $data = (str_replace("state=", "state=" . $network . "_", $response->navigateUrl));
                header('Location: ' . $data);
                exit();
            } else if ($response->code == 400 && $response->status == "failed") {
                return redirect('dashboard/' . $teamId)->with('FBError', "Access denied. You can not add account to this team");
            }
            return redirect('dashboard/' . $teamId)->with('FBError', "Currently not able to add your account");
        } catch (\Exception $e) {
            Log::info("Exception " . $e->getCode() . "=>" . $e->getLine() . "=>" . $e->getMessage());
            return redirect('dashboard/' . $teamId)->with('FBError', "Currently not able to add your account");
        }
    }


    //Callback for facebook and facebook page
    public function addSocialProfile(Request $request)
    {


        $teamId = Session::get('currentTeam')['team_id'];
        $a = $request->state;
        $help = Helper::getInstance();
        try {
            //Warning:  Never interchange the if conditions here
            if (strpos($a, env('ACCOUNT_ADD_FBP')) !== false) {

                $responsePage = $help->apiCallGet('profile/getOwnFacebookPages?code=' . $request->code);
                if ($responsePage->code == 200 && $responsePage->status == "success") {
                    Session::put('facebookPage', $responsePage->pages);
                    return redirect('dashboard/' . $teamId);
                } else if ($responsePage->code == 400 && $responsePage->status == "failed") {
                    Log::info("Exception in Fbp account adding" );
                    return redirect('dashboard/' . $teamId)->withErrors([$responsePage->error]);

                } else {
                    Log::info("Exception in Fbp account adding" );
                    return redirect('dashboard/' . $teamId)->withErrors(['Not able to add your account']);
                    return Redirect::back()->withErrors(['Not able to add your account']);
                }
            } else if (strpos($a, env('ACCOUNT_ADD_FB')) !== false) {
                $response = $help->apiCallGet('team/addSocialProfile?state=' . explode('_', $request->state)[1] . '&code=' . $request->code);

                if ($response->code == 200 && $response->status == "success") {
                    $team = Helper::getInstance()->getTeamNewSession();
                    return redirect('dashboard/' . $teamId);
                } else if ($response->code == 400 && $response->status == "failed") {
                    Log::info(" Fb account adding error" );
                    return redirect('dashboard/' . $teamId)->withErrors([$response->message]);
                }else if($response->code == 403 ){
                    Log::info(" Fb account adding error" );
                    return redirect('dashboard/' . $teamId)->withErrors([$response->message]);
                } else {
                    Log::info("Fb  account adding" );
                    return redirect('dashboard/' . $teamId)->with('FBError', 'Not able to add your account');
                }
            }else if(strpos($a, env('ACCOUNT_ADD_INSTAGRAM_PAGE')) !== false){
                $responseInstaBusiness = $help->apiCallGet('profile/getInstaBusinessAccount?code=' . $request->code);
                if ($responseInstaBusiness->code == 200 && $responseInstaBusiness->status == "success") {
                    Session::put('InstaBusiness', $responseInstaBusiness->pages);
                    return redirect('dashboard/' . $teamId);
                } else if ($responseInstaBusiness->code == 400 && $responseInstaBusiness->status == "failed") {
                    Log::info("Exception in adding instagram business account" );
                    return redirect('dashboard/' . $teamId)->withErrors([$responseInstaBusiness->error]);
                } else {
                    Log::info("Exception in adding instagram business account" );
                    return redirect('dashboard/' . $teamId)->withErrors(['Not able to add your account']);
                    return Redirect::back()->withErrors(['Not able to add your account']);
                }
            }
            else {
                return redirect('dashboard/' . $teamId)->withErrors(['Something went wrong']);
            }
        } catch (\Exception $e) {

            Log::info("Exception " . $e->getCode() . "=>" . $e->getLine() . "=>" . $e->getMessage());
            return Redirect::back()->withErrors(['Something went wrong']);
        }

//            $response = $help->apiCallGet('team/addSocialProfile?state='.$request->state.'&code='.$request->code);
//            if($response->code == 200&&$response->status == "success"){
//                $team = Helper::getInstance()->getTeamNewSession();
//
//                return redirect()->back();
//            }else if($response->code == 400 && $response->status == "failed"){
//                return Redirect::back()->withErrors([ $response->error]);
//            }else if($response->status == "success" ){
//                $responsePage = $help->apiCallGet('facebook/getOwnFacebookPages?code='.$response->code);
//                if($responsePage->code == 200 && $responsePage->status == "success"){
//                    Session::put('facebookPage',$responsePage->pages);
//                    return redirect()->back();
//                }
//            }else{
//                return Redirect::back()->withErrors([ 'Something weent wrong']);
//            }

    }


    // for facebook page
    public function facebookPageAdd(Request $request)
    {
        $pages = [];
        $k = 0;
        $pages = $request->pages;
        $pageSession = Session::get('facebookPage');
        $SocialAccounts = [];

        if ($request->pages != null && $pageSession != null) {

            for ($i = 0; $i < count($pages); $i++) {
                /*account_type=2,user_name,last_name="",email="",social_id,profile_pic_url,cover_pic_url,access_token,refresh_token,friendship_counts,info=""*/
                for ($j = 0; $j < count($pageSession); $j++) {
                    if ($pageSession[$j]->pageName == $pages[$i]) {
                        //construct bulk facebook account
                        $SocialAccounts[$k] = array(
                            "account_type" => env('FACEBOOKPAGE'),//fixed
                            "user_name" => $pageSession[$j]->pageId,
                            "first_name" => $pageSession[$j]->pageName,
                            "last_name" => "",
                            "email" => "",
                            "social_id" => $pageSession[$j]->pageId,
                            "profile_pic_url" => $pageSession[$j]->profilePicture,
                            "cover_pic_url" => $pageSession[$j]->profilePicture,
                            "access_token" => $pageSession[$j]->accessToken,
                            "refresh_token" => $pageSession[$j]->accessToken,
                            "friendship_counts" => $pageSession[$j]->fanCount,
                            "info" => ""
                        );
                        $k++;
                    }
                }
            }
            try {
                $response = Helper::getInstance()->apiCallPost($SocialAccounts, 'team/addBulkSocialProfiles?TeamId=' . $request->teamId);
                Session::forget('facebookPage');
                if ($response['statusCode'] == 200 && $response['data']['code'] == 200 && $response['data']['status'] = "success") {
                    $team = Helper::getInstance()->getTeamNewSession();
                    $result['code'] = 200;
                    $result['status'] = "success";
                    if(isset($response['data']['errorProfileId'])) $result['errorIds'] = $response['data']['errorProfileId'];
                    else $response['errorIds'] = "";
                    return $result;
                } else if ($response['data']['code'] == 400 && $response['data']['status'] == "failed") {
                    Log::info("Exception in adding facebook page " );
                    $result['code'] = 400;
                    $result['status'] = "failure";
                    $result['message'] = $response['data']["error"];
                    return $result;
                } else {
                    Log::info("Exception in adding facebook page " );
                    $result['code'] = 400;
                    $result['status'] = "failure";
                    $result['message'] = $response['data']["error"];
                    return $result;
                    return Redirect::back()->withErrors(["Not able to add your facebook page.. Please try again after sometime"]);
                }
            } catch (Exception $e) {
                Log::info("Exception in facebook page adding  " . $e->getCode() . "=>" . $e->getLine() . "=>" . $e->getMessage());

//                return $e->getMessage();
                $result['code'] = 500;
                $result['status'] = "failure";
                return $result;
            }
        } else {
            $result['code'] = 400;
            $result['status'] = "failure";
            $result['message'] = "Please select atleast 1 acc";
            return $result;
            // ask user to select a page
        }

    }


    public function instaBusinessAdd(Request $request)
    {

        $k = 0;
        $pages = $request->pages;
        $pageSession = Session::get('InstaBusiness');
        $SocialAccounts = [];


        if ($request->pages != null && $pageSession != null) {

            for ($i = 0; $i < count($pages); $i++) {
                /*account_type=2,user_name,last_name="",email="",social_id,profile_pic_url,cover_pic_url,access_token,refresh_token,friendship_counts,info=""*/
                for ($j = 0; $j < count($pageSession); $j++) {
                    if ($pageSession[$j]->userName == $pages[$i]) {
                        //construct bulk facebook account
                        $SocialAccounts[$k] = array(
                            "account_type" => env('INSTAGRAMBUSINESSPAGE'),//fixed
                            "user_name" => $pageSession[$j]->social_id,
                            "first_name" => $pageSession[$j]->userName,
                            "last_name" => "",
                            "email" => "",
                            "social_id" => $pageSession[$j]->social_id,
                            "profile_pic_url" => $pageSession[$j]->profile_pic,
                            "cover_pic_url" => $pageSession[$j]->profile_pic,
                            "access_token" => $pageSession[$j]->accessToken,
                            "refresh_token" => $pageSession[$j]->accessToken,
                            "friendship_counts" => $pageSession[$j]->fanCount,
                            "info" => \serialize($pageSession[0]->info )
                        );
                        $k++;
                    }
                }
            }
            try {
                $response = Helper::getInstance()->apiCallPost($SocialAccounts, 'team/addBulkSocialProfiles?TeamId=' . $request->teamId);
                Session::forget('InstaBusiness');
                if ($response['statusCode'] == 200 && $response['data']['code'] == 200 && $response['data']['status'] = "success") {
                    $team = Helper::getInstance()->getTeamNewSession();
                    $result['code'] = 200;
                    $result['status'] = "success";
                    if(isset($response['data']['errorProfileId'])) $result['errorIds'] = $response['data']['errorProfileId'];
                    else $response['errorIds'] = "";
                    return $result;
                } else if ($response['data']['code'] == 400 && $response['data']['status'] == "failed") {
                    Log::info("Exception in adding instagram business page " );
                    $result['code'] = 400;
                    $result['status'] = "failure";
                    $result['message'] = $response['data']["error"];
                    return $result;
                } else {
                    Log::info("Exception in adding instagram business page " );
                    $result['code'] = 400;
                    $result['status'] = "failure";
                    $result['message'] = $response['data']["error"];
                    return $result;
                    return Redirect::back()->withErrors(["Not able to add your facebook page.. Please try again after sometime"]);
                }
            } catch (Exception $e) {
                Log::info("Exception in instagram business page adding  " . $e->getCode() . "=>" . $e->getLine() . "=>" . $e->getMessage());

//                return $e->getMessage();
                $result['code'] = 500;
                $result['status'] = "failure";
                return $result;
            }
        } else {
            $result['code'] = 400;
            $result['status'] = "failure";
            $result['message'] = "Please select atleast 1 acc";
            return $result;
            // ask user to select a page
        }

    }


    public function deleteSocialAccount(Request $request)
    {
        try {
            $response = Helper::getInstance()->apiDelete('team/deleteSocialProfile?AccountId=' . $request->accountId . '&TeamId=' . $request->teamId);
            if ($response->code == 200 && $response->status == "success") {
                $team = Helper::getInstance()->getTeamNewSession();
                $result['code'] = 200;
                $result['status'] = "Success";
//              $result['status']="Success";
                return $result;
            } else {
                $result['code'] = 400;
                $result['status'] = "fail";
                $result['message'] = $response->error;
//              $result['status']="Success";
                return $result;
            }

        } catch (Exception $e) {
            Log::info("Exception in deleting social account " . $e->getCode() . "=>" . $e->getLine() . "=>" . $e->getMessage());
            $result['code'] = 400;
            $result['status'] = "fail";
            $result['message']=" Something went wrong";
//              $result['status']="Success";
            return $result;
        }
    }

    public function deleteFacebookPageSes()
    {
        if (Session::has('facebookPage'))
            Session::forget('facebookPage');
        return 200;
    }


    // ------------------------------------------------------------
    public function viewPage($account_id)
    {
        $help = Helper::getInstance();
        $profileData = [];

        $params = [
            'pageId' => 1,
            'accountId' => $account_id,
            'teamId' => Session::get('currentTeam')['team_id']
        ];

        try {
            $responseForParticular = $help->apiCallPostFeeds(null, "feeds/getRecentFbFeeds?" . http_build_query($params), null, "GET");
            $value = Session::get('currentTeam')['SocialAccount'];

            for ($i = 0; $i < count($value); $i++) {
                if ($value[$i]->account_id == $account_id) {
                    $profileData = (array)$value[$i];
                }
            }




            if ($responseForParticular->data->code == 200 && $responseForParticular->data->status == "success") {

                $fbParams = [
                    'feeds' => $responseForParticular->data->posts,
                    'userProfile' => (object)$profileData,
                    'socioboard_accounts' => TeamController::getAllSocialAccounts(),
                    'team_id' => Session::get('currentTeam')['team_id'],
                    'account_id' => $account_id,
                    "socialAccount"=> Session::get('currentTeam')['SocialAccount'],
                    "pinterestBoards"=> Session::get('pinterestBoards'),
                ];

                return view('Team::Facebook.index', $fbParams);
            } else {
                throw new \Exception($responseForParticular->data->message);
                return TeamController::showErrorPage($e, ['link' => '/', 'message' => $e->getMessage() ] );
            }
        } catch (\Exception $e) {
            return TeamController::showErrorPage($e, ['link' => '/', 'message' => 'Return' ] );
        }
    }


    public function viewPosts(Request $request, $account_id, $page_id)
    {

        $help = Helper::getInstance();
        $profileData = [];

        $params = [
            'pageId' => $page_id,
            'accountId' => $account_id,
            'teamId' => Session::get('currentTeam')['team_id']
        ];

        try {
            $responseForParticular = $help->apiCallPostFeeds(null, "feeds/getRecentFbFeeds?" . http_build_query($params), null, "GET");

            $feeds = [];
            foreach ($responseForParticular->data->posts as $post) {
                $cName = 'fb_liked_' . $post->postId;
                $post->liked = (@$_COOKIE[$cName]) ? 1 : 0;
                $feeds[] = $post;
            }

            $value = Session::get('currentTeam')['SocialAccount'];
            for ($i = 0; $i < count($value); $i++) {
                if ($value[$i]->account_id == $account_id) {
                    $profileData = (array)$value[$i];
                }
            }


            if ($responseForParticular->data->code == 200 && $responseForParticular->data->status == "success") {
                return view('Team::Facebook.inc_posts',
                    [
                        'feeds' => $feeds,
                        'userProfile' => (object)$profileData,
                    ]);
            } else {
                return null;
            }
        } catch (\Exception $e) {

        }
    }


    public function test()
    {
        $data = (Session::get("user")["userDetails"]);
        $data->user_id = 6;
        Session::push('user', $data);
    }

    /* returns all linked Facebook accounts */
    public function viewProfiles()
    {
        $help = Helper::getInstance();
        $result = null;

        try {
            //Get all social acc
            $allSocioAcc = $help->apiCallGet('team/getDetails');
            //

            if ($allSocioAcc->code == 200 && $allSocioAcc->status == "success") {
                //
                //print_r($allSocioAcc); die;

                foreach ($allSocioAcc->teamSocialAccountDetails as $i) {
                    foreach ($i as $j) {

                        //$result['team_id'] = $j->team_id;

                        foreach ($j->SocialAccount as $profile) {
                            // if facebook profile of facebook page
                            if ($profile->account_type == 1 or $profile->account_type == 2) {
                                // if non-locked
                                if ($profile->join_table_teams_social_accounts->is_account_locked != true) {
                                    $result[] = $profile;
                                }
                            }
                        }
                    }
                }

                return (object)$result;
            } else {
                return null;
            }
        } catch (\Exception $e) {
            return null;
        }
    }

    // returns media content for FB post
    /*
    public function getPostTemplateName($feed)
    {

        switch ($feed->postType) {

            case 'video':
                return null;
                //return 'Team::postContent.incVideo3';
                break;
            case 'status':
                return null;
                //return 'Team::postContent.incPhoto';
                break;
            case 'link':
                return null;
                //return 'Team::postContent.incPhoto';
                break;

            case 'photo':
                if (sizeof($feed->mediaUrls) < 2)
                    return 'Team::postContent.incPhoto';
                else
                    return 'Team::postContent.incPhotoCarousel';
                return null;

                break;

            default:
                return 'Team::postContent.incPhoto';
                break;
        }

    }
*/
    //
    public function sendLike($postId, $accountId)
    {
        $help = Helper::getInstance();
        $params = [
            'accountId' => $accountId,
            'postId' => $postId,
            'teamId' => Session::get('currentTeam')['team_id']
        ];

        try {
            $apiResponse = $help->apiCallPostPublish($params, "likecomments/fblike?" . http_build_query($params), null, 'POST');

            if ($apiResponse->statusCode == 200) {
                if ($apiResponse->data->code == 200 && $apiResponse->data->status == "success") {
                    // try this row with data!
                    return json_encode(['status' => $apiResponse->data->status, 'message' => $apiResponse->data->message]);
                } else {
                    return json_encode(['status' => $apiResponse->data->status, 'message' => $apiResponse->data->error->message]);
                }
            } else {
                return null;
            }
        } catch (\Exception $e) {
            return json_encode(['status' => 'error', 'message' => 'code: ' . $apiResponse->statusCode . ', error: ' . $e->getMessage()]);
        }
    }

    // Post comment to FB post

    public function sendComment(Request $request)
    {
        $help = Helper::getInstance();
        $params = [
            'accountId' => $request->input('accountId'),
            'teamId' => Session::get('currentTeam')['team_id'],
            'postId' => $request->input('postId'),
            'comment' => $request->input('comment')
        ];

        if ($request->input('comment') != null) {
            try {
                $apiResponse = $help->apiCallPostFeeds($params, "likecomments/fbcomment?" . http_build_query($params), null, 'POST');
                if ($apiResponse->statusCode == 200) {
                    if ($apiResponse->data->code == 200 && $apiResponse->data->status == "success") {
                        // try this row with data!
                        return json_encode(['status' => $apiResponse->data->status, 'message' => $apiResponse->data->message]);
                    } else {
                        return json_encode(['status' => $apiResponse->data->status, 'message' => $apiResponse->data->error->message]);
                    }
                } else {
                    return null;
                }
            } catch (\Exception $e) {
                return json_encode(['status' => 'Sytem error', 'message' => $e->getMessage()]);
            }
        }
    }


    /* returns all linked Facebook accounts */
    /*  moved to TwitterController */

    /*
    public function publishPost(Request $request)
    {
        $help = Helper::getInstance();
        $result = null;

        $params = [
            'teamId' => (integer)Session::get('currentTeam')['team_id'],
            'postDetails' => json_encode([
                "postType" => "Text",
                "message" =>  @$request->input('message'),
                "mediaPaths" => $request->input('mediaPaths'),
                "link" => $request->input('link'),
                //"accountIds" => $request->input('accountIds'),
                "accountIds" => array_unique( array_merge(
                    (array)$request->input('accountIds'),
                    [(integer)$request->input('accountId')])
                    ),
                "postStatus" => 1,
            ])
        ];


        try {
            //Get all social acc
            // why apiCallPostPublish returns Array, notObject ???

            $url = "publish/publishPosts?teamId=" . (integer)Session::get('currentTeam')['team_id'];
            $apiResponse = (object)$help->apiCallPostPublish($params, $url, false, 'POST');
            //

            if ($apiResponse->statusCode == 200) {
                $data = (object)$apiResponse->data;

                if ($data->code == 200 && $data->status == "success") {
                    // try this row with data!
                    return json_encode(['status' => $data->status, 'message' => $data->message]);
                } else {
                    return json_encode(['status' => $data->status, 'message' => $data->error] );
                }
            }
        } catch (\Exception $e) {
            return null;
        }
    }
*/


//    public function test()
//    {
//        $data = (Session::get("user")["userDetails"]);
//        $data->user_id = 6;
//        Session::push('user', $data);
//        return view('Team::test');
//    }



    function FacebookFanInsight(Request $request)
    {
        try {
            return view('Team::AppInsight.FacebookFanpageReport');


//            D:\bitbuckets\socioboard-upwork\web\app\Modules\Team\Views\AppInsight\FacebookFanpageReport.blade.php

        } catch (\Exception $e) {
        }
    }


}
