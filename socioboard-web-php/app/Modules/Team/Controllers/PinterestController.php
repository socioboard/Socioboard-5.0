<?php

namespace App\Modules\Team\Controllers;

use App\Modules\User\Helper;
use Http\Adapter\Guzzle6\Client;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;
use Mockery\CountValidator\Exception;

class PinterestController extends Controller
{


    protected $client;
    protected $API_URL;

    public function __construct()
    {
        $this->client = new Client();
        $this->API_URL = env('API_URL') . env('VERSION') . '/';

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
//        dd($code);
//        dd($state." ".$code);
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
