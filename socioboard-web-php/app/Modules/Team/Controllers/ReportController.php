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
use Illuminate\Support\Facades\Storage;
use App\Modules\Discovery\Controllers\DiscoveryPublishController;


class ReportController extends Controller
{

    protected $client;
    protected $API_URL;

    public function __construct()
    {
        $this->client = new Client();
        $this->API_URL = env('API_URL') . env('VERSION') . '/';

    }



    public function reportingTo(Request $request,$accountId,$network){
        $profile= [];
        $socialAccounts = Session::get('currentTeam')['SocialAccount'];
        if($network == env('FACEBOOKPAGE') || $network == env('INSTAGRAMBUSINESSPAGE') || $network == env('LINKEDINCOMPANY') || $network == env('YOUTUBE') || $network == env('TWITTER') ){
            if($accountId == env('REPORT_INITIAL')){
                foreach ($socialAccounts as $socialAccount) {
                    if ($socialAccount->account_type == $network && $socialAccount->join_table_teams_social_accounts->is_account_locked == false) {
                        $profile = $socialAccount;
                        break;
                    }
                }

            }else{
                foreach($socialAccounts as $socialAccount){
                    if($socialAccount->account_id == $accountId && $socialAccount->join_table_teams_social_accounts->is_account_locked == false){
                        $profile = $socialAccount;
                    }
                }
            }
            if($profile == null){
                return redirect('dashboard/' .Session::get('currentTeam')['team_id'])->with('FBError', "Account not found or your account is locked or belongs to different team");
            }
            switch($network){
                case env('FACEBOOKPAGE'):
                    return view('Team::AppInsight.FacebookFanpageReport')->with(['profileData'=>$profile]);
                    break;
                case env('INSTAGRAMBUSINESSPAGE'):
                    return view('Team::AppInsight.instagramInsight')->with(['profileData'=>$profile]);
                    break;
                case env('YOUTUBE'):
                    return view('Team::AppInsight.YoutubeFanpageReport')->with(['profileData'=>$profile]);
                    break;
                case env('LINKEDINCOMPANY'):
                   break;
                case env('TWITTER'):
                    return view('Team::AppInsight.TwitterReport')->with(['profileData'=>$profile]);
                    break;
                default :
                    return redirect()->back()->with('Fail', 'We currently don\'t have insight for this network ');
                    break;
            }
        }else{
            return redirect()->back()->with('Fail', 'We currently don\'t have insight for this network ');
        }

    }

    public function teamReport(Request $request, $teamId){
         return view('Team::AppInsight.teamReport', ['teamId' => $teamId]);

    }

    public function getTeamReport(Request $request){
            $helper = Helper::getInstance();
            $result = [];
            try{
                $response = $helper->apiCallGetFeeds("networkinsights/getTeamInsights?teamId=".Session::get('currentTeam')['team_id']."&filterPeriod=".$request->filterPeriod."&since=".$request->since."&untill=".$request->until);
                if($response->code == 200){
                    $result['code'] = 200;
                    $result['teamMemberStats'] = $response->result->TeamMemberStats;
                    $result['facebook'] = $response->result->Facebook;
                    $result['twitter'] = $response->result->Twitter;
                    $result['insta'] = $response->result->InstagramBusiness;
                    $result['youtube'] = $response->result->Youtube;
                }
                else{
                    $result['code'] = 201;
                    $result['error'] = $response->error;
                }
                return $result;
            }catch (\Exception $e){
                Log::info("Exception Team insight".date('y-m-d h:m:s').$e->getMessage()." @ ".$e->getLine()." in ".$e->getFile());
                $result['code'] = 500;
                $result['message']= "Something went wrong";
                return $result;
            }

    }

    public function getFacebookFanInsight(Request $request){
        try{
            $team_id = Session::get('currentTeam')['team_id'];
            $helper = Helper::getInstance();
            $resultArray = [];

            $dayArray=[];
            $result=[];
            $response = $helper->apiCallGetFeeds('networkinsights/getFacebookPageInsights?accountId='.$request->accountId.'&teamId='.$team_id.'&filterPeriod='.$request->filterPeriod.'&since='.$request->since.'&untill='.$request->untill);

            if($response->code == 200 && $response->status == "success"){

                if(isset($response->result->data)){
                    $resultArray = $response->result->data;
                    if($request->filterPeriod == env('DAYPERIOD') || $request->filterPeriod == env('YESTERDAY')){
                        //take day


                        for($i = 0 ; $i<count($resultArray); $i++){

                            if($resultArray[$i]->period == 'day'){

//                            $dayArray[] = $resultArray[$i];
//                            if($resultArray[$i]->name == "page_fan_adds"){
//
//                            }
                                $dayArray[0][0]['date'] =$resultArray[$i]->values[0]->end_time;
                                switch($resultArray[$i]->name){
                                    case "page_fan_adds":
                                        $dayArray[0][0]['page_fan_adds'] =$resultArray[$i]->values[0]->value;
                                        break;
                                    case "page_fan_removes":
                                        $dayArray[0][0]['page_fan_removes'] =$resultArray[$i]->values[0]->value;
                                        break;
                                    case "page_impressions":
                                        $dayArray[0][0]['page_impressions'] =$resultArray[$i]->values[0]->value;
                                        break;
                                    case "page_impressions_viral":
                                        $dayArray[0][0]['page_impressions_viral'] =$resultArray[$i]->values[0]->value;
                                        break;
                                }

                            }
                        }

                        $result['code'] = 200;
                        $result['message']= "success";
                        $result['data']= $dayArray;
                    }else {
                        //take week
                        $k=0;
                        ini_set('max_execution_time', 300);
                        $weekArray=[];
                        for($i = 0 ; $i<count($resultArray); $i++){
                            if($resultArray[$i]->period == 'day'){
                                //give one more array
                                $weekArray[$i]['values'] = $resultArray[$i]->values;
                                $weekArray[$i]['name'] = $resultArray[$i]->name;
                            }
                        }


                        for($m = 0; $m<count($weekArray);$m++){

                            for($j=0; $j<count($weekArray[$m]['values']);$j++){
                                $k=0;
                                if($m == 0){
                                    switch($weekArray[$m]['name']){
                                        case "page_fan_adds":
                                            $weekResult[$k][$j]['date'] =$weekArray[$m]['values'][$j]->end_time;
                                            $weekResult[$k][$j]['page_fan_adds'] =$weekArray[$m]['values'][$j]->value;
                                            break;
                                        case "page_fan_removes":
                                            $weekResult[$k][$j]['date'] =$weekArray[$m]['values'][$j]->end_time;
                                            $weekResult[$k][$j]['page_fan_removes'] =$weekArray[$m]['values'][$j]->value;
                                            break;
                                        case "page_impressions":
                                            $weekResult[$k][$j]['date'] =$weekArray[$m]['values'][$j]->end_time;

                                            $weekResult[$k][$j]['page_impressions'] =$weekArray[$m]['values'][$j]->value;
                                            break;
                                        case "page_impressions_viral":
                                            $weekResult[$k][$j]['date'] =$weekArray[$m]['values'][$j]->end_time;

                                            $weekResult[$k][$j]['page_impressions_viral'] =$weekArray[$m]['values'][$j]->value;
                                            break;
                                    }

                                }else if($weekArray[$m]['values'][$j]->end_time == $weekArray[$m-1]['values'][$j]->end_time){
                                    $weekResult[$k][$j]['date'] =$weekArray[$m]['values'][$j]->end_time;
                                    switch($weekArray[$m]['name']){
                                        case "page_fan_adds":
                                            $weekResult[$k][$j]['date'] =$weekArray[$m]['values'][$j]->end_time;

                                            $weekResult[$k][$j]['page_fan_adds'] =$weekArray[$m]['values'][$j]->value;
                                            break;
                                        case "page_fan_removes":
                                            $weekResult[$k][$j]['date'] =$weekArray[$m]['values'][$j]->end_time;

                                            $weekResult[$k][$j]['page_fan_removes'] =$weekArray[$m]['values'][$j]->value;
                                            break;
                                        case "page_impressions":
                                            $weekResult[$k][$j]['date'] =$weekArray[$m]['values'][$j]->end_time;

                                            $weekResult[$k][$j]['page_impressions'] =$weekArray[$m]['values'][$j]->value;
                                            break;
                                        case "page_impressions_viral":
                                            $weekResult[$k][$j]['date'] =$weekArray[$m]['values'][$j]->end_time;

                                            $weekResult[$k][$j]['page_impressions_viral'] =$weekArray[$m]['values'][$j]->value;
                                            break;
                                    }

                                }else{
                                    $k++;
                                }
                            }
                        }
                        $result['code'] = 200;
                        $result['message']= "success";
                        $result['data']= $weekResult;
                    }
                }else{
                    $result['code'] = 400;
                    $result['message']= $response->result;
                    return $result;
                }
            }else if($response->code == 400){
                $result['code'] = 400;
                $result['message']= $response->error;
            }
            return $result;

        }catch (\Exception $e){
            Log::info("Exception Facebook insight".date('y-m-d h:m:s').$e->getMessage()." @ ".$e->getLine()." in ".$e->getFile());
            $result['code'] = 500;
            $result['message']= "Something went wrong";
            return $result;
//            $result['data']= $weekResult;
        }
    }


    public  function getYoutubeInsight(Request $request){

        try{
            // today and yester insight is not present
            $team_id = Session::get('currentTeam')['team_id'];
            $helper = Helper::getInstance();
            $resultArray = [];

            $dayArray=[];
            $result=[];
            $response = $helper->apiCallGetFeeds('networkinsights/getYoutubeInsights?accountId='.$request->accountId.'&teamId='.$team_id.'&filterPeriod='.$request->filterPeriod.'&since='.$request->since.'&untill='.$request->untill);
            $youtubeInsightData =[];
            if($response->code == 200 && $response->status == "success") {

                $responseData = $response->result;

                        for($j = 0; $j<count($responseData->rows);$j++){
                            for($i=0;$i<count($responseData->columnHeaders);$i++){
//                                if($responseData->columnHeaders[$i]->name == "day"){
//                                    $youtubeInsightData[$j]['day'] = $responseData->rows[$j][$i];
//                                }
                                switch($responseData->columnHeaders[$i]->name){
                                    case "day":
                                        $youtubeInsightData[$j]['day'] = $responseData->rows[$j][$i];
                                        break;
                                    case "likes":
                                        $youtubeInsightData[$j]['likes'] = $responseData->rows[$j][$i];
                                        break;
                                    case "subscribersLost":
                                        $youtubeInsightData[$j]['dislikes'] = $responseData->rows[$j][$i];
                                        break;
                                    case "averageViewDuration":
                                        $youtubeInsightData[$j]['averageViewDuration'] = $responseData->rows[$j][$i];
                                        break;
//                                    case "day":
//                                        $youtubeInsightData[$j]['day'] = $responseData->rows[$j][$i];
//                                        break;
//                                    case "day":
//                                        $youtubeInsightData[$j]['day'] = $responseData->rows[$j][$i];
//                                        break;
//                                    case "day":
//                                        $youtubeInsightData[$j]['day'] = $responseData->rows[$j][$i];
//                                        break;
//                                    case "day":
//                                        $youtubeInsightData[$j]['day'] = $responseData->rows[$j][$i];
//                                        break;
//                                    case "day":
//                                        $youtubeInsightData[$j]['day'] = $responseData->rows[$j][$i];
//                                        break;
                                }
                            }
                        }

                $result['code']=200;
                $result['message']="success";
                $result['data']=$youtubeInsightData;


            }else if($response->code == 400){
                $result['code']=400;
                $result['message']=$response->error;
            }
            return $result;
        }catch (\Exception $e){
            $result['code']=500;
            $result['message']="Failed";
            Log::info("Exception in youtube insight . ".$e->getMessage()." @ ".$e->getLine()." in file ".$e->getFile());
            return $result;
        }
    }

    public function getInstaInsight(Request $request){
        try{
            $team_id = Session::get('currentTeam')['team_id'];
            $helper = Helper::getInstance();
            $weekResult=[];
            $result=[];
            $weekArray=[];
            $response = $helper->apiCallGetFeeds('networkinsights/getInstagramBusinessInsights?accountId='.$request->accountId.'&teamId='.$team_id.'&filterPeriod='.$request->filterPeriod.'&since='.$request->since.'&untill='.$request->untill);
            $instaInsightData =[];
            if($response->code == 200 && $response->status == "success") {
                if(isset($response->result->error)){
                $result['code'] = 500;
                $result['message']= $response->result->error->message;
                }else {


                    $weekArray = $response->result->data;
                    for ($m = 0; $m < count($weekArray); $m++) {
                        for ($j = 0; $j < count($weekArray[$m]->values); $j++) {
                            $k = 0;
                            if ($m == 0) {
                                switch ($weekArray[$m]->name) {
                                    case "impressions":
                                        $weekResult[$k][$j]['date'] = $weekArray[$m]->values[$j]->end_time;

                                        $weekResult[$k][$j]['impressions'] = $weekArray[$m]->values[$j]->value;
                                        break;
                                    case "reach":
                                        $weekResult[$k][$j]['date'] = $weekArray[$m]->values[$j]->end_time;

                                        $weekResult[$k][$j]['reach'] = $weekArray[$m]->values[$j]->value;
                                        break;
                                    case "follower_count":
                                        $weekResult[$k][$j]['date'] = $weekArray[$m]->values[$j]->end_time;

                                        $weekResult[$k][$j]['follower_count'] = $weekArray[$m]->values[$j]->value;
                                        break;
                                    case "profile_views":
                                        $weekResult[$k][$j]['date'] = $weekArray[$m]->values[$j]->end_time;

                                        $weekResult[$k][$j]['profile_views'] = $weekArray[$m]->values[$j]->value;
                                        break;
                                }

                            } else if ($weekArray[$m]->values[$j]->end_time == $weekArray[$m - 1]->values[$j]->end_time) {
                                $weekResult[$k][$j]['date'] = $weekArray[$m]->values[$j]->end_time;
                                switch ($weekArray[$m]->name) {
                                    case "impressions":
                                        $weekResult[$k][$j]['date'] = $weekArray[$m]->values[$j]->end_time;

                                        $weekResult[$k][$j]['impressions'] = $weekArray[$m]->values[$j]->value;
                                        break;
                                    case "reach":
                                        $weekResult[$k][$j]['date'] = $weekArray[$m]->values[$j]->end_time;

                                        $weekResult[$k][$j]['reach'] = $weekArray[$m]->values[$j]->value;
                                        break;
                                    case "follower_count":
                                        $weekResult[$k][$j]['date'] = $weekArray[$m]->values[$j]->end_time;

                                        $weekResult[$k][$j]['follower_count'] = $weekArray[$m]->values[$j]->value;
                                        break;
                                    case "profile_views":
                                        $weekResult[$k][$j]['date'] = $weekArray[$m]->values[$j]->end_time;

                                        $weekResult[$k][$j]['profile_views'] = $weekArray[$m]->values[$j]->value;
                                        break;
                                }
                            } else {
                                $k++;
                            }
                        }
                    }
                    $result['code'] = 200;
                    $result['message'] = "success";
                    $result['data'] = $weekResult;
                }
                return $result;
            }else if($response->code == 400){
                Log::info("Instagram business account was inactive Account id".$request->accountId);
                $result['code'] = 400;
                $result['message']= $response->error;
                return $result;
            }
        }catch (\Exception $e){
            Log::error("Exception in insta insight ".$e->getMessage()." @ ".$e->getLine()." in ".$e->getFile());
            $result['code']=500;
            $result['message']="Something went wrong";
            return $result;
        }
    }


    public function getTwitterInsight(Request $request){
        try{
            $team_id = Session::get('currentTeam')['team_id'];
            $helper = Helper::getInstance();
            $response = $helper->apiCallGetFeeds('networkinsights/getTwitterInsights?accountId='.$request->accountId.'&teamId='.$team_id.'&filterPeriod='.$request->filterPeriod.'&since='.$request->since.'&untill='.$request->untill);
            if($response->code == 200 && $response->status == "success") {
                if(isset($response->result->error)){
                    $result['code'] = 500;
                    $result['message']= $response->result->error->message;
                }else {
                    $result['code'] = 200;
                    $result['message'] = "success";
                    $result['data'] = $response->result;
                }
                return $result;
            }else if($response->code == 400){
                Log::info("In twitter report. Twitter was inactive Account id".$request->accountId);
                $result['code'] = 400;
                $result['message']= $response->error;
                return $result;
            }
        }catch (\Exception $e){
            Log::error("Exception in Twitter insight ".$e->getMessage()." @ ".$e->getLine()." in ".$e->getFile());
            $result['code']=500;
            $result['message']="Something went wrong";
            return $result;
        }


    }


}
