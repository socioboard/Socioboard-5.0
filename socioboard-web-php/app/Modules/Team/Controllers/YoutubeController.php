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

class YoutubeController extends Controller
{


    protected $client;
    protected $API_URL;

    public function __construct()
    {
        $this->client = new Client();
        $this->API_URL = env('API_URL') . env('VERSION') . '/';
    }

    public function getProfileFeeds(Request $request,$account_id,$network){
        try{
            $help = Helper::getInstance();
            $result = [];

            $responseForParticular = $help->apiCallGet("team/getSocialProfilesById?accountId=".$account_id);
            if($responseForParticular->code == 200){
                if($network == env('YOUTUBE')){
                    return view('Team::youtube.youtubeFeeds')->with(["account_id"=>$account_id,
                        "account_type"=>$network,
                        "socialAccount"=> Session::get('currentTeam')['SocialAccount'],
                        "profileData" => $responseForParticular->profile,
                        "pinterestBoards"=> Session::get('pinterestBoards')
                    ]);
                }else if($network == env('INSTAGRAMBUSINESSPAGE')){//D:\bitbuckets\socioboard-upwork\web\app\Modules\Team\Views\instagram\instagramBusinessFeeds.blade.php
                    return view('Team::Instagrm.instagramBusinessFeeds')->with(["account_id"=>$account_id,
                        "account_type"=>$network,
                        "socialAccount"=> Session::get('currentTeam')['SocialAccount'],
                        "profileData" => $responseForParticular->profile,
                        "instagramStats"=>\unserialize($responseForParticular->profile->info),
                        "pinterestBoards"=> Session::get('pinterestBoards')
                    ]);
                }
            }else if($responseForParticular->code == 400){
                Log::info("Getting feeds profile error ");
                Log::info($responseForParticular);
                return redirect('dashboard/' .Session::get('currentTeam')['team_id'])->with('FBError', $responseForParticular->error);

            }else{
                Log::info("Getting feeds profile error ");
                Log::info($responseForParticular);
                return redirect('dashboard/' .Session::get('currentTeam')['team_id'])->with('FBError', "Account not found or your account is locked or beongs to different team");
            }
        }catch (\Exception $e){
            Log::info("Get feeds profile Exception ".$e->getMessage()." in line ".$e->getLine()." in file ".$e->getFile());
            return redirect('dashboard/' .Session::get('currentTeam')['team_id'])->with('FBError', "Account not found or your account is locked or beongs to different team");

        }
    }

    public function getYoutubeFeeds(Request $request){
        try{
            /*
             * 200 => success
             * 201 => no post
             * 400 => error
             * 500 => exception*/
            $help = Helper::getInstance();
            $result = [];
            $responseForParticular = $help->apiCallPostFeeds(null, "feeds/getYoutubeFeeds?accountId=".$request->accountId."&teamId=".Session::get('currentTeam')['team_id']."&pageId=".$request->pageId, null, "GET");
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

    public function getYoutubeAction(Request $request){
        try{
            $action="";
            $help = Helper::getInstance();
            $result = [];
            if($request->rating != 2){
                if($request->rating  == 1){
                    $action = "like";
                }else if($request->rating  == 0){
                    $action = "dislike";
                }
                $responseForParticular = $help->apiCallPostFeeds(null, "likecomments/ytlike?accountId=".$request->accountId."&teamId=".Session::get('currentTeam')['team_id']."&videoId=".$request->videoId."&rating=".$action, null, "POST");

            }else{
                $responseForParticular = $help->apiCallPostFeeds(null, "likecomments/ytcomment?accountId=".$request->accountId."&teamId=".Session::get('currentTeam')['team_id']."&videoId=".$request->videoId."&comment=".$request->comment, null, "POST");
            }

      if($responseForParticular->data->code == 200){
          $result['code']=200;
          if(strpos($responseForParticular->data->message,'commented')!=false)
              $result['message']="Successfully commented";
          else{
              $result['message']=$responseForParticular->data->message;
          }

      }else{

          Log::info("Youtube like/dislike/comment failed because");
          $result['code']=200;
          if(isset($responseForParticular->data->error))
              $result['message']=$responseForParticular->data->error;
          else
              $result['message']="Could not perform action";


      }

        }catch (\Exception $e){
            Log::info("Youtube like/dislike/comment Exception because".$e->getMessage()." in line ".$e->getLine());
            $result['code']=200;
            $result['message']="Could not perform action";
        }
return $result;
        /*{
        "code": 400,
  "status": "failed",
  "error": "User not belongs to the team!"*/

}


}
