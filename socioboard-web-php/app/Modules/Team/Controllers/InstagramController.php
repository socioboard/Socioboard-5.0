<?php

namespace App\Modules\Team\Controllers;

use App\Modules\User\Helper;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;
use Mockery\CountValidator\Exception;

class InstagramController extends Controller
{
    protected $client;
    protected $API_URL;

    public function __construct()
    {
        $this->client = new Client();
        $this->API_URL = env('API_URL') . env('VERSION') . '/';
    }

    public function viewPage($account_id, $page_id)
    {
        $team_id = Session::get('currentTeam')['team_id'];

        try {
            $help = Helper::getInstance();
            $params = [
                'pageId' => 1,
                'accountId' => $account_id,
                'teamId' => $team_id,
                'socioboard_accounts' => TeamController::getAllSocialAccounts(),
            ];
            //print_r( TeamController::getAccountInfoById($account_id));
            return view('Team::Instagrm.index',
                [
                    //To specify the account type 1-Facebook, 2-FacebookPage,3-FacebookGroup,4-Twitter,5-Instagram,6-Linkedin,7-LinkedinBusiness,8-GooglePlus,9-Youtube,10-GoogleAnalytics
                    'userProfile' => TeamController::getProfileInfo($account_id, 5),
                    'socioboard_accounts' => TeamController::getAllSocialAccounts(),
                    'account_id' => $account_id,
                    "socialAccount"=> Session::get('currentTeam')['SocialAccount'],
                    "pinterestBoards"=> Session::get('pinterestBoards'),

                ]);

        } catch (\Exception $e) {
            Log::error('Exception' . $e->getCode() . " @=> " . $e->getLine() . " message=> " . $e->getMessage());
            return view('Team::index',
                ['status' => 'error',
                    'descr' => 'line ' . $e->getLine(),
                    'code' => $e->getCode(),
                    'message' => $e->getMessage(),
                    'action_link' => '',
                    'action_title' => '',
                ]
            );
            //return redirect('dashboard/' . $team_id)->with('FBError', "Currently not able to add your account");
        }
    }


    public function viewPosts(Request $request, $account_id, $page_id)
    {

        $team_id = Session::get('currentTeam')['team_id'];
        $help = Helper::getInstance();
        $params = [
            'pageId' => $page_id,
            'accountId' => $account_id,
            'teamId' => $team_id,
        ];

        try {
            $response = $help->apiCallPostFeeds(null, "feeds/getRecentInstagramFeeds?" . http_build_query($params), null, "GET");

            if ($response->statusCode == 200) {

                if ($response->data->code == 200 && $response->data->status == "success") {


                    return view('Team::Instagrm.inc_posts',
                        [
                            'feeds' => $response->data->feeds[0],
                            'userProfile' => TeamController::getProfileInfo($account_id, 5),
                            'socioboard_accounts' => TeamController::getAllSocialAccounts(),
                        ]);

                }
                else {
                   echo 'failed';
                    //return redirect('dashboard/' . $teamid)->with('FBError', "Access denied. You can not add account to this team");
                }
            }
            //return redirect('dashboard/' . $teamid)->with('FBError', "Currently not able to add your account");
        } catch (\Exception $e) {
            return TeamController::showErrorPage($e);

        }
    }


    public function instagramGet($teamid, Request $request)
    {
        try {
            $help = Helper::getInstance();
            $response = $help->apiCallGet('team/getProfileRedirectUrl?teamId=' . $teamid . "&network=Instagram");
            if ($response->code == 200 && $response->status == "success") {
                $twitterReqData = array("teamId" => $teamid,
                    "state" => $response->state);
                Session::put('instaState', $twitterReqData);
                $request->session()->save(); //coz session wil not get saved if yu immediately redirect
                header('Location: ' . $response->navigateUrl);
                exit(0);
            } else if ($response->code == 400 && $response->status == "failed") {
                return redirect('dashboard/' . $teamid)->with('FBError', "Access denied. You can not add account to this team");
            }
            return redirect('dashboard/' . $teamid)->with('FBError', "Currently not able to add your account");
        } catch (\Exception $e) {
            Log::error('Exception instagram, add' . $e->getCode() . " @=> " . $e->getLine() . " message=> " . $e->getMessage());
            return redirect('dashboard/' . $teamid)->with('FBError', "Currently not able to add your account");
        }
    }

    public function instagramCallback(Request $request)
    {

        $state = Session::get('instaState')['state'];
        $code = $request['code'];
        $team = Session::get('currentTeam')['team_id'];
        try {
            $help = Helper::getInstance();
            $response = $help->apiCallGet('team/addSocialProfile?state=' . $state . '&code=' . $code);

            Session::forget('instaState');
            if ($response->code == 200 && $response->status == "success") {
                //to get new team data after adding a account to a team
                $team = Helper::getInstance()->getTeamNewSession();
                return redirect('dashboard/' . $response->teamDetails->team_id);
            } else if ($response->code == 400 && $response->status == "failed") {
                return redirect('dashboard/' . $team)->with('FBError', $response->error); //warning do not remove space here=> ' . $team
//                return redirect('dashboard/'.$teamId)->with('FBerror',$response->error );
            } else if ($response->code == 403) {
                return redirect('dashboard/' . $team)->with('FBError', $response->message); //warning do not remove space here=> ' . $team
            }
            return redirect('dashboard/' . $team)->withErrors([$response->error]);
        } catch (\Exception $e) {
            Log::error('Exception' . $e->getCode() . " @=> " . $e->getLine() . " message=> " . $e->getMessage());
            return Redirect::back()->withErrors(['Not able to add tour account']);
        }


    }


    public function getInstagramBusinessPost(Request $request){
        try{
            /*
             * 200 => success
             * 201 => no post
             * 400 => error
             * 500 => exception*/
            $help = Helper::getInstance();
            $result = [];
            $responseForParticular = $help->apiCallPostFeeds(null, "feeds/getRecentInstagramBusinessFeeds?accountId=".$request->accountId."&teamId=".Session::get('currentTeam')['team_id']."&pageId=".$request->pageId, null, "GET");
            if($responseForParticular->data->code == 200 && $responseForParticular->data->status == "success"){
                if($responseForParticular->data->posts != null){
                    $result['code'] = 200;
                    $result['data'] = $responseForParticular->data->posts;
                }else{
                    $result['code'] = 201;
                    $result['data'] = "";
                }
            }else{
                $result['code']=400;
                $result['message']=$responseForParticular->data->message;
            }
            return $result;
        }catch (\Exception $e){
        }
    }

}
