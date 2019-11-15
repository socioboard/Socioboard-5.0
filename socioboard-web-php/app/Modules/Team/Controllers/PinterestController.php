<?php

namespace App\Modules\Team\Controllers;

use App\Modules\User\Helper;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
//use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;

//use Illuminate\Support\Facades\Validator;
//use Mockery\CountValidator\Exception;
use Cache;

class PinterestController extends Controller
{
    protected $client;
    protected $API_URL;

    public function __construct()
    {
        $this->client = new Client();
        $this->API_URL = env('API_URL') . env('VERSION') . '/';
    }

    public function boardCreate(Request $request){

        $result = [];
//        $api_url = $this->API_URL . "profile/createPinterestBoards?accountId=".$request->accountId."&boardName=".urlencode($request->boardName)."&boardDescription=".urlencode($request->boardDesc);
        try {
            $response = Helper::getInstance()->apiCallGet("profile/createPinterestBoards?accountId=".$request->accountId."&boardName=".urlencode($request->boardName)."&boardDescription=".urlencode($request->boardDesc));

            if ($response->code == 200 && $response->status == "success") {
                $result['code'] = 200;
                return $response;
            } else {
                $result['code'] = 201;
                $result['error'] = $result->error;
            }
        }catch (\Exception $e){
            if($e->getCode() === 404){
            }

        }

    }

    public function boardDelete(Request $request){
        $result = [];
        try {
            $response = Helper::getInstance()->apiDelete("profile/deletePinterestBoards?accountId=".$request->accountId."&boardId=".$request->boardId);
            if ($response->code == 200 && $response->status == "success") {
                $result['code'] = 200;
                return $response;
            } else {
                $result['code'] = 201;
                return $response;
            }

        }catch (\Exception $e){
            if($e->getCode() === 404){
            }

        }
    }


    public function viewPage($account_id, $page_id = 0)
    {



        if (\Request::route()->getName() == 'socialNetworkDashboard') {
            $boards = [];
            $board_id = 0;
            $i = 0;

            $boards = (array)$this->getBoards($account_id);
            foreach ($boards as $value) {
                if ($i == 0) {
                    $board_id = (integer)$value->board_id;
                };
                $i++;
            }

            return redirect( route('socialNetworkPinterestPageContent', [
                'account_id' => $account_id,
                'page_id' => $board_id,
            ]));
        } else
            {
            try {
                return view('Team::Pinterest.index',
                    [
                        //To specify the account type 1-Facebook, 2-FacebookPage,3-FacebookGroup,4-Twitter,5-Instagram,6-Linkedin,7-LinkedinBusiness,8-GooglePlus,9-Youtube,10-GoogleAnalytics
                        'userProfile' => TeamController::getProfileInfo($account_id, 5),
                        'socioboard_accounts' => TeamController::getAllSocialAccounts(),
                        'account_id' => $account_id,
                        'board_id' => $page_id,
                        'account_info' => TeamController::getAccountInfoById($account_id),
                        'boards' => $this->getBoards($account_id),
                        'feeds' => $this->viewPosts($account_id, $page_id),
                        "socialAccount"=> Session::get('currentTeam')['SocialAccount'],
                        "pinterestBoards"=> Session::get('pinterestBoards'),
                    ]);
            } catch (\Exception $e) {
                return TeamController::showErrorPage($e);
            }
        }
    }


    public function viewPosts($account_id, $board_id)
    {
        $params = [
            'boardId' => $board_id,
            'accountId' => $account_id,
            'teamId' => (integer)@Session::get('currentTeam')['team_id'],
        ];

        try {
//            $response = Helper::getInstance()->apiCallPostFeeds(null, "feeds/getPinterestPins?" . http_build_query($params), null, "GET");
            $response = Cache::remember('response_pinterest_' . $account_id . '_' . $board_id, 3600, function () use ($params) {
                return $response = Helper::getInstance()->apiCallPostFeeds(null, "feeds/getPinterestPins?" . http_build_query($params), null, "GET");
            });

            if ($response->statusCode == 200 && $response->data->code == 200 && $response->data->status == "success") {
                if (!empty($response->data->pins->message)) {
                    echo $response->data->pins->message;
                } else {
                    return $response->data->pins->data;
                }
            } else {
                return 'Problem with response data, code=' . $response->data->code. 'Message::'.$response->data->message;
            }

        } catch (\Exception $e) {
            return TeamController::showErrorPage($e);
        }
    }

    /* Returns a list of Pinterest boards or null */
    public function getBoards($account_id)
    {
        try {
            $response = Helper::getInstance()->apiCallGet("profile/fetchNewPinterestBoards?accountId=" . $account_id . "");
            if ($response->code == 200 && $response->status == "success") {
                return $response->boards;
            } else {
                return null;
            }
        } catch (\Exception $e) {
            return TeamController::showErrorPage($e);
        }
    }


    public function pinterestAdd($network, $teamId, Request $request)
    {
        try {
            $help = Helper::getInstance();
            $response = $help->apiCallGet('team/getProfileRedirectUrl?teamId=' . $teamId . "&network=" . $network);
            if ($response->code == 200 && $response->status == "success") {
//                $data = (str_replace("state=", "state=" . $network . "_", $response->navigateUrl)); // previously state was provided in url itself now we get in seperate firld
                $twitterReqData = array("teamId" => $teamId,
                    "state" => $response->state);
                Session::put('pinterestState', $twitterReqData);
                $request->session()->save(); //coz session wil not get saved if yu immediately redirect
                header('Location: ' . $response->navigateUrl);

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

//not in use=====================

//    public function pinterestCallback2(Request $request){
//
//
//        $a = $request->state;
//        $team = Session::get('currentTeam')['team_id'];
//
//        $help = Helper::getInstance();
//        try{
//
//            if (strpos($a, env('ACCOUNT_ADD_PINTEREST')) !== false) {
//
//                $response = $help->apiCallGet('team/addSocialProfile?state='.explode('_',$request->state)[1].'&code='.$request->code);
//
//
//                if($response->code == 200&&$response->status == "success"){
//                    $team = Helper::getInstance()->getTeamNewSession();
//                    return redirect('dashboard/'.$response->teamDetails->team_id);
//                }else if ($response->code == 400 && $response->status == "failed") {
//                    return redirect('dashboard/' . $team)->with('FBError', $response->error);
//                } else {
//                    return redirect('dashboard/' . $team)->with('FBError', 'Not able to add your account');
//                }
//            }
//            return redirect('dashboard/' . $team)->with('FBError', 'Not able to add your account');
//        }catch (\Exception $e){
//
//            Log::info('Exception in adding pinterest =>'.$e->getFile()." at ".$e->getLine()." => ".$e->getMessage());
//            return redirect('dashboard/' . $team)->with('FBError', 'Not able to add your account');
//        }
//
//    }

//===================not in use end


    public function pinterestCallback(Request $request)
    {

        $state = Session::get('pinterestState')['state'];
        $code = $request['code'];
        $team = Session::get('currentTeam')['team_id'];
        try {
            $help = Helper::getInstance();
            $response = $help->apiCallGet('team/addSocialProfile?state=' . $state . '&code=' . $code);
            Session::forget('pinterestState');
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

            Log::info('Exception in adding pinterest =>' . $e->getFile() . " at " . $e->getLine() . " => " . $e->getMessage());
            return Redirect::back()->withErrors(['Not able to add tour account']);
        }

    }


}
