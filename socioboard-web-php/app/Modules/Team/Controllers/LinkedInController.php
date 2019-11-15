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

class LinkedInController extends Controller
{


    protected $client;
    protected $API_URL;

    public function __construct()
    {
        $this->client = new Client();
        $this->API_URL = env('API_URL') . env('VERSION') . '/';

    }


    // TODO have to check team session
    public function LinkedinAdd($network,$teamid,Request $request){
        try{

            $help = Helper::getInstance();
            $response = $help->apiCallGet('team/getProfileRedirectUrl?teamId='.$teamid."&network=".$network);

            if($response->code == 200 && $response->status == "success" ){


                $data = (str_replace("state=","state=".$network."_",$response->navigateUrl));

                header('Location: '.$data);
                exit(0);
            }else if($response->code == 400 && $response->status == "failed"){
                Log::info("Linkedin redirection".date('y-m-d h:m:s'));
                Log::info($response);
                return redirect('dashboard/'.$teamid)->with('FBError',$request->error);
            }
            Log::info("Linkedin redirection".date('y-m-d h:m:s'));
            Log::info($response);
            return redirect('dashboard/'.$teamid)->with('FBError',"Currently not able to add your account");
        }catch (\Exception $e){
            Log::error('Exception'.$e->getCode()." @=> ".$e->getLine()." message=> ".$e->getMessage());
            return redirect('dashboard/'.$teamid)->with('FBError',"Currently not able to add your account");
        }
    }

    public function linkedinCallBack(Request $request){

        $team = Session::get('currentTeam')['team_id'];
        $help = Helper::getInstance();
        $a = $request->state;
        try {
            if (strpos($a, env('ACCOUNT_ADD_LINKEDINC')) !== false) { //company
                $responsePage = $help->apiCallGet('profile/getLinkedInCompanyProfiles?code='.$request->code .'&state='.explode('_',$request->state)[1]);

            //TODO Check api issue
                if ($responsePage->code == 200 && $responsePage->status) {
                    Session::put('linkedCompany', $responsePage->company);
                    return redirect('dashboard/' . $team);
                } else if ($responsePage->code == 400 && $responsePage->status == "failed") {
                    return redirect('dashboard/' . $team)->with('FBError', $responsePage->error);
                } else {
                    Log::info("Linkedin buisness page add ".date('y-m-d h:m:s'));
                    Log::info($responsePage);
                    return redirect('dashboard/' . $team)->with('FBError', 'Not able to add your account');
                }
            } else if (strpos($a, env('ACCOUNT_ADD_LINKEDIN')) !== false) {
                $response = $help->apiCallGet('team/addSocialProfile?state=' . explode('_',$request->state)[1] . '&code=' . $request->code);

                if ($response->code == 200 && $response->status == "success") {
                    $team1 = Helper::getInstance()->getTeamNewSession();
                    return redirect('dashboard/'.$team);
                } else if ($response->code == 400 && $response->status == "failed") {
                    return redirect('dashboard/' . $team)->with('FBError', $response->error);
                } else {
                    Log::info("Linked in account add ".date('y-m-d h:m:s'));
                    Log::info($response);

                    return redirect('dashboard/' . $team)->with('FBError', 'Not able to add your account');
                }
            } else {

            }
        } catch (\Exception $e) {
            Log::info("Exception " . $e->getCode() . "=>" . $e->getLine() . "=>" . $e->getMessage());
            return redirect('dashboard/' . $team)->with('FBError', 'Something went wrong');
        }

    }


    public function linkedInCompany(Request $request)
    {
        $companies = [];
        $k = 0;
        $companies = $request->company;
        $pageSession = Session::get('linkedCompany');
        $SocialAccounts = [];
        if ($request->company != null) {
            for ($i = 0; $i < count($companies); $i++) {
                /*account_type=2,user_name,last_name="",email="",social_id,profile_pic_url,cover_pic_url,access_token,refresh_token,friendship_counts,info=""*/
                for ($j = 0; $j < count($pageSession); $j++) {
                    if ($pageSession[$j]->companyName == $companies[$i]) {
                        //construct bulk facebook account
                        $SocialAccounts[$k] = array(
                            "account_type" => env('LINKEDINCOMPANY'),//fixed
                            "user_name" => $pageSession[$j]->companyId,
                            "first_name" => $pageSession[$j]->companyName,
                            "last_name" => "",
                            "email" => "",
                            "social_id" => $pageSession[$j]->companyId,
                            "profile_pic_url" => $pageSession[$j]->profileUrl,
                            "cover_pic_url" => $pageSession[$j]->profileUrl,
                            "access_token" => $pageSession[$j]->accessToken,
                            "refresh_token" => $pageSession[$j]->accessToken,
                            "friendship_counts" => 0,
                            "info" => ""
                        );
                        $k++;
                    }
                }
            }
            //team/addBulkSocialProfiles?TeamId
            try {
                $response = Helper::getInstance()->apiCallPost($SocialAccounts, 'team/addBulkSocialProfiles?TeamId=' . $request->teamId);

                Log::info("Linkedin page adding ".date('y-m-d h:m:s'));
                Log::info($response);
                Session::forget('linkedCompany');
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
}
