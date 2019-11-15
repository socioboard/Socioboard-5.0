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

class GoogleController extends Controller
{


    protected $client;
    protected $API_URL;

    public function __construct()
    {
        $this->client = new Client();
        $this->API_URL = env('API_URL') . env('VERSION') . '/';

    }

    //google analytics and youtube accoount adding

    public function googleAdd($network,$teamid,Request $request){
        try{
            $help = Helper::getInstance();
            $response = $help->apiCallGet('team/getProfileRedirectUrl?teamId='.$teamid."&network=".$network);
            if($response->code == 200 && $response->status == "success" ){
                $data = (str_replace("state=","state=".$network."_",$response->navigateUrl));
                header('Location: '.$data);
                exit(0);
            }else if($response->code == 400 && $response->status == "failed"){
                return redirect('dashboard/'.$teamid)->with('FBError',"Access denied. You can not add account to this team");
            }else if($response->code == 403 && $response->status == "failed"){

                return redirect('dashboard/'.$teamid)->with('FBError',$response->error);

            }
            return redirect('dashboard/'.$teamid)->with('FBError',"Currently not able to add your account");
        }catch (\Exception $e){
            Log::error('Exception'.$e->getCode()." @=> ".$e->getLine()." message=> ".$e->getMessage());
            return redirect('dashboard/'.$teamid)->with('FBError',"Currently not able to add your account");
        }
    }

    public function googleCallback(Request $request){

        $team = Session::get('currentTeam')['team_id'];
        $help = Helper::getInstance();
        try{
            $response=[];
            $a =$request->state;
            if (strpos($a, env('ACCOUNT_ADD_GA')) !== false) {
                $response = $help->apiCallGet('profile/getGoogleAnalyticAccounts?code=' . $request->code);
                if ($response->code == 200 && $response->status) {
                    Session::put('GoogleAnalytics', $response->AnalyticAccounts);
                    return redirect('dashboard/' . $team);
                } else if ($response->code == 400 && $response->status == "failed") {
                    return redirect('dashboard/' . $team)->with('FBError', $response->error);
                } else {
                    return redirect('dashboard/' . $team)->with('FBError', 'Not able to add your account');
                }
            }else if(strpos($a,env('ACCOUNT_ADD_YOUTUBE')) !== false ){

                $response = $help->apiCallGet('profile/getYoutubeChannels?code=' . $request->code);
                if ($response->code == 200 && $response->status) {
                    Session::put('youtubeChannels', $response->channels);
                    return redirect('dashboard/' . $team);
                } else if ($response->code == 400 && $response->status == "failed") {
                    return redirect('dashboard/' . $team)->with('FBError', $response->error);
                } else {
                    return redirect('dashboard/' . $team)->with('FBError', 'Not able to add tour account');
                }
            }else{
                return redirect('dashboard/' . $team)->with('FBError', 'Not a valid account data');

            }
        }catch (\Exception $e){
            Log::info("Exception ".$e->getCode()."=>".$e->getLine()."=>".$e->getMessage());
            return redirect('dashboard/'.$team)->with('FBError','Something went wrong');
        }
    }


    public function googleAnalyticsAccount(Request $request){
        $analytics = [];
        $k = 0;
        $analytics = $request->analytics;
        $pageSession = Session::get('GoogleAnalytics');
        $SocialAccounts = [];
        if ($request->analytics != null) {
            for ($i = 0; $i < count($analytics); $i++) {
                /*account_type=2,user_name,last_name="",email="",social_id,profile_pic_url,cover_pic_url,access_token,refresh_token,friendship_counts,info=""*/
                for ($j = 0; $j < count($pageSession); $j++) {
                    if ($pageSession[$j]->firstName == $analytics[$i]) {
                        //construct bulk facebook account
                        $SocialAccounts[$k] = array(
                            "account_type" => env('GOOGLEANALYTICS'),//fixed
                            "user_name" => $pageSession[$j]->userName,
                            "first_name" => $pageSession[$j]->firstName,
                            "last_name" => $pageSession[$j]->lastName,
                            "email" => $pageSession[$j]->email,
                            "social_id" => $pageSession[$j]->socialId,
                            "profile_pic_url" => $pageSession[$j]->profileUrl,
                            "cover_pic_url" => $pageSession[$j]->profileUrl,
                            "access_token" => $pageSession[$j]->accessToken,
                            "refresh_token" => $pageSession[$j]->refreshToken,
                            "friendship_counts" => 0,
                            "info" => $pageSession[$j]->info
                        );
                        $k++;
                    }
                }
            }
            //team/addBulkSocialProfiles?TeamId
            try {
                $response = Helper::getInstance()->apiCallPost($SocialAccounts, 'team/addBulkSocialProfiles?TeamId=' . $request->teamId);
                Session::forget('GoogleAnalytics');
                if ($response['statusCode'] == 200 && $response['data']['code'] == 200 && $response['data']['status'] = "success") {
                    $team = Helper::getInstance()->getTeamNewSession();
                    $result['code'] = 200;
                    $result['status'] = "success";
                    return $result;
                } else if ($response['data']['code'] == 400 && $response['data']['status'] == "failure") {
                    $result['code'] = 400;
                    $result['status'] = "failure";
                    $result['message'] = $response['data']['message'];
                    return $result;
                } else {
                    $result['code'] = 400;
                    $result['status'] = "failure";
                    $result['message'] = $response['data']['message'];

                    return $result;
                }
            } catch (Exception $e) {
                $result['code'] = 500;
                $result['status'] = "failure";
                return $result;
            }
        } else {
            $result['code'] = 400;
            $result['status'] = "failure";
            $result['message'] = "Select atleast one company";
            return $result;
        }
    }


    public function youtubeChannels(Request $request){
        $channels = [];
        $k = 0;
        $channels = $request->channels;

        $pageSession = Session::get('youtubeChannels');
//        return json_encode($pageSession);
        $SocialAccounts = [];
        if ($request->channels != null) {
//            return 2;
            for ($i = 0; $i < count($channels); $i++) {
                /*account_type=2,user_name,last_name="",email="",social_id,profile_pic_url,cover_pic_url,access_token,refresh_token,friendship_counts,info=""*/
                for ($j = 0; $j < count($pageSession); $j++) {
                    if ($pageSession[$j]->channelName == $channels[$i]) {
                        //construct bulk facebook account
                        $SocialAccounts[$k] = array(
                            "account_type" => env('YOUTUBE'),//fixed
                            "user_name" => $pageSession[$j]->channelName,
                            "first_name" => $pageSession[$j]->channelName,
                            "last_name" => $pageSession[$j]->channelName,
                            "email" => "",
                            "social_id" => $pageSession[$j]->channelId,
                            "profile_pic_url" => $pageSession[$j]->channelImage,
                            "cover_pic_url" => $pageSession[$j]->channelImage,
                            "access_token" => $pageSession[$j]->accessToken,
                            "refresh_token" => $pageSession[$j]->refreshToken,
                            "friendship_counts" => $pageSession[$j]->friendshipCount->subscriberCount,
                            "info" => $pageSession[$j]->info->publishedDate
                        );
                        $k++;
                    }
                }
            }
            try {
                $response = Helper::getInstance()->apiCallPost($SocialAccounts, 'team/addBulkSocialProfiles?TeamId=' . $request->teamId);
                Session::forget('youtubeChannels');
                if ($response['statusCode'] == 200 && $response['data']['code'] == 200 && $response['data']['status'] = "success") {
                    $team = Helper::getInstance()->getTeamNewSession();
                    $result['code'] = 200;
                    $result['status'] = "success";
                    return $result;
                } else if ($response['data']['code'] == 400 && $response['data']['status'] == "failure") {
//                    return json_encode($response);
                    $result['code'] = 400;
                    $result['status'] = "failure";
                    $result['message'] = $response['data']['error'];
                    return $result;
                } else {
//                    return json_encode($response);
                    $result['code'] = 400;
                    $result['status'] = "failure";
                    $result['message'] = $response['data']['error'];

                    return $result;
                }
            } catch (Exception $e) {
                $result['code'] = 500;
                $result['status'] = "failure";
                return $result;
            }
        } else {
//            return 1;
            $result['code'] = 400;
            $result['status'] = "failure";
            $result['message'] = "Select atleast one company";
            return $result;
        }
    }
}
