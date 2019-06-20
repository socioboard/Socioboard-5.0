<?php

namespace App\Modules\Discovery\Controllers;

use App\Modules\User\Helper;
use GuzzleHttp\RequestOptions;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;

class DiscoveryController extends Controller
{
    public function imgur(Request $request){
        return view('Discovery::imgur',[
            "socialAccount"=> Session::get('currentTeam')['SocialAccount']]);
    }


    public function getImurg(Request $request){
        $imgurDetails=[];
        $result=[];
        try{
            $responseForParticular = Helper::getInstance()->apiCallGetFeeds("trends/getImgur?keyword=".$request->keyword."&pageId=".$request->pageId);
//        dd( $responseForParticular );
            if($responseForParticular->code == 200 && $responseForParticular->status == "success"){
//                    dd($responseForParticular);
                $imgurDetails =$responseForParticular->response;
//                    dd($imgurDetails );

                $result['code'] =200;
                $result['status'] ="success";
                $result['imurgDetails'] =$imgurDetails;

            }else if($responseForParticular->code == 404 && $responseForParticular->status == "failed"){

                $result['code'] =400;
                $result['status'] ="failed";
                $result['message'] =$responseForParticular->error;
                Log::info("Imgur responded with an error message". $responseForParticular->error);
            }else if($responseForParticular->code == 400 && $responseForParticular->status == "failed"){
                $result['code'] =400;
                $result['status'] ="failed";
                $result['message'] =$responseForParticular->error;
                Log::info("Imgur responded with an error message". $responseForParticular->error);
            }
            return $result;
        }catch (\Exception $e){
            Log::info("Exception in imgur get ".$e->getFile()." => ".$e->getLine()." => ".$e->getMessage());
            $result['code'] =500;
            $result['status'] ="failed";
            $result['message'] =$e->getMessage();
            return $result;
            dd($e->getMessage());
        }
    }



    public function giphy(){
        return view('Discovery::giphy',[
            "socialAccount"=> Session::get('currentTeam')['SocialAccount'] ]);
    }




    public function getGiphy(Request $request){
//   return 1;
        $gifDetails=[];
        $result=[];
        try{
            $responseForParticular = Helper::getInstance()->apiCallGetFeeds("trends/getGiphy?keyword=".$request->keyword."&pageId=".$request->pageId);

            if($responseForParticular->code == 200 && $responseForParticular->status == "success"){
//                    dd($responseForParticular);
                $gifDetails =$responseForParticular->response;
//                    dd($imgurDetails );

                $result['code'] =200;
                $result['status'] ="success";
                $result['giphyDetails'] =$gifDetails;

            }else if($responseForParticular->code == 404 && $responseForParticular->status == "failed"){

                $result['code'] =400;
                $result['status'] ="failed";
                $result['message'] =$responseForParticular->error;
                Log::info("Imgur responded with an error message". $responseForParticular->error);
            }else if($responseForParticular->code == 400 && $responseForParticular->status == "failed"){
                $result['code'] =400;
                $result['status'] ="failed";
                $result['message'] =$responseForParticular->error;
                Log::info("Imgur responded with an error message". $responseForParticular->error);
            }
            return $result;
        }catch (\Exception $e){
            Log::info("Exception in imgur get ".$e->getFile()." => ".$e->getLine()." => ".$e->getMessage());
            $result['code'] =500;
            $result['status'] ="failed";
            $result['message'] =$e->getMessage();
            return $result;
            dd($e->getMessage());
        }
    }

    public function pixabay(){
        return view('Discovery::pixabay',["socialAccount"=> Session::get('currentTeam')['SocialAccount']]);

    }

    public function getPixabay(Request $request){
//   return 1;
        $gifDetails=[];
        $result=[];
        try{
            $responseForParticular = Helper::getInstance()->apiCallGetFeeds("trends/getPixabay?keyword=".$request->keyword."&pageId=".$request->pageId);

            if($responseForParticular->code == 200 && $responseForParticular->status == "success"){
//                    dd($responseForParticular);
                $pixabayDetails =$responseForParticular->response;
//                    dd($imgurDetails );

                $result['code'] =200;
                $result['status'] ="success";
                $result['pixaDetails'] =$pixabayDetails;
            }else if($responseForParticular->code == 404 && $responseForParticular->status == "failed"){

                $result['code'] =400;
                $result['status'] ="failed";
                $result['message'] =$responseForParticular->error;
                Log::info("Pixapay responded with an error message". $responseForParticular->error);
            }else if($responseForParticular->code == 400 && $responseForParticular->status == "failed"){
                $result['code'] =400;
                $result['status'] ="failed";
                $result['message'] =$responseForParticular->error;
                Log::info("Pixapay responded with an error message". $responseForParticular->error);
            }
            return $result;
        }catch (\Exception $e){
            Log::info("Exception in Pixapay get ".$e->getFile()." => ".$e->getLine()." => ".$e->getMessage());
            $result['code'] =500;
            $result['status'] ="failed";
            $result['message'] =$e->getMessage();
            return $result;
            dd($e->getMessage());
        }
    }


    public function flickr(){
        return view('Discovery::flickr',["socialAccount"=> Session::get('currentTeam')['SocialAccount']]);
    }
    public function getFlickr(Request $request){
        $gifDetails=[];
        $result=[];
        try{
            $responseForParticular = Helper::getInstance()->apiCallGetFeeds("trends/getFlickr?keyword=".$request->keyword."&pageId=".$request->pageId);

            if($responseForParticular->code == 200 && $responseForParticular->status == "success"){
//                    dd($responseForParticular);
                $flickrDetails =$responseForParticular->response;
//                    dd($imgurDetails );

                $result['code'] =200;
                $result['status'] ="success";
                $result['flickrDetails'] =$flickrDetails;

            }else if($responseForParticular->code == 404 && $responseForParticular->status == "failed"){

                $result['code'] =400;
                $result['status'] ="failed";
                $result['message'] =$responseForParticular->error;
                Log::info("Imgur responded with an error message". $responseForParticular->error);
            }else if($responseForParticular->code == 400 && $responseForParticular->status == "failed"){
                $result['code'] =400;
                $result['status'] ="failed";
                $result['message'] =$responseForParticular->error;
                Log::info("Imgur responded with an error message". $responseForParticular->error);
            }
            return $result;
        }catch (\Exception $e){
            Log::info("Exception in imgur get ".$e->getFile()." => ".$e->getLine()." => ".$e->getMessage());
            $result['code'] =500;
            $result['status'] ="failed";
            $result['message'] =$e->getMessage();
            return $result;
            dd($e->getMessage());
        }
    }


    public function dailymotion(){
        return view('Discovery::dailymotion',["socialAccount"=> Session::get('currentTeam')['SocialAccount']]);
    }
    public function getDailymotion(Request $request){

        $dailyMotionDetails=[];
        $result=[];
        try{
            $responseForParticular = Helper::getInstance()->apiCallGetFeeds("trends/getDailyMotion?pageId=".$request->pageId);

//            dd($responseForParticular );

            if($responseForParticular->code == 200 && $responseForParticular->status == "success"){
//                    dd($responseForParticular);
                $dailyMotionDetails =$responseForParticular->response->dailymotionDetails;
//                    dd($imgurDetails );

                $result['code'] =200;
                $result['status'] ="success";
                $result['DailyDetails'] =$dailyMotionDetails;

            }else if($responseForParticular->code == 404 && $responseForParticular->status == "failed"){

                $result['code'] =400;
                $result['status'] ="failed";
                $result['message'] =$responseForParticular->error;
                Log::info("Imgur responded with an error message". $responseForParticular->error);
            }else if($responseForParticular->code == 400 && $responseForParticular->status == "failed"){
                $result['code'] =400;
                $result['status'] ="failed";
                $result['message'] =$responseForParticular->error;
                Log::info("Imgur responded with an error message". $responseForParticular->error);
            }
            return $result;
        }catch (\Exception $e){
            Log::info("Exception in imgur get ".$e->getFile()." => ".$e->getLine()." => ".$e->getMessage());
            $result['code'] =500;
            $result['status'] ="failed";
            $result['message'] =$e->getMessage();
            return $result;
            dd($e->getMessage());
        }
    }
    public function newsApi(){
        return view('Discovery::newsapi',["socialAccount"=> Session::get('currentTeam')['SocialAccount']]);
    }
    public function getNews(Request $request){

        $dailyMotionDetails=[];
        $result=[];
        try{
            $responseForParticular = Helper::getInstance()->apiCallGetFeeds("trends/getNewsApi?keyword=".$request->keyword."&pageId=".$request->pageId);


            if($responseForParticular->code == 200 && $responseForParticular->status == "success"){
//                    dd($responseForParticular);
                $newsApiDetails =$responseForParticular->response->newsApiDetails;
//                    dd($imgurDetails );

                $result['code'] =200;
                $result['status'] ="success";
                $result['newsApiDetails'] =$newsApiDetails;

            }else if($responseForParticular->code == 404 && $responseForParticular->status == "failed"){

                $result['code'] =400;
                $result['status'] ="failed";
                $result['message'] =$responseForParticular->error;
                Log::info("Imgur responded with an error message". $responseForParticular->error);
            }else if($responseForParticular->code == 400 && $responseForParticular->status == "failed"){
                $result['code'] =400;
                $result['status'] ="failed";
                $result['message'] =$responseForParticular->error;
                Log::info("Imgur responded with an error message". $responseForParticular->error);
            }
            return $result;
        }catch (\Exception $e){
            Log::info("Exception in imgur get ".$e->getFile()." => ".$e->getLine()." => ".$e->getMessage());
            $result['code'] =500;
            $result['status'] ="failed";
            $result['message'] =$e->getMessage();
            return $result;
            dd($e->getMessage());
        }
    }


    public function rssFeed(){
        return view('Discovery::rssfeeds',["socialAccount"=> Session::get('currentTeam')['SocialAccount']]);
    }
    public function getRss(Request $request){

        if (strpos($request->keyword, 'http:') !== false) {
            $request->keyword=    str_replace("http:","https:",$request->keyword);
        }

        $rssDetails=[];
        $result=[];
        try{
            $responseForParticular = Helper::getInstance()->apiCallGetFeeds("trends/getRssFeeds?rssUrl=".$request->keyword);
            if($responseForParticular->code == 200 && $responseForParticular->status == "success"){
//                    dd($responseForParticular);
                $rssDetails =$responseForParticular->response;
//                    dd($imgurDetails );

                $result['code'] =200;
                $result['status'] ="success";
                $result['rssDetails'] =$rssDetails;

            }else if($responseForParticular->code == 404 && $responseForParticular->status == "failed"){

                $result['code'] =400;
                $result['status'] ="failed";
                $result['message'] =$responseForParticular->error;
                Log::info("Imgur responded with an error message". $responseForParticular->error);
            }else if($responseForParticular->code == 400 && $responseForParticular->status == "failed"){
                $result['code'] =400;
                $result['status'] ="failed";
                $result['message'] =$responseForParticular->error;
                Log::info("Imgur responded with an error message". $responseForParticular->error);
            }
            return $result;
        }catch (\Exception $e){
            Log::info("Exception in imgur get ".$e->getFile()." => ".$e->getLine()." => ".$e->getMessage());
            $result['code'] =500;
            $result['status'] ="failed";
            $result['message'] =$e->getMessage();
            return $result;
            dd($e->getMessage());
        }
    }
    public function youtube(){
        return view('Discovery::youtube',["socialAccount"=> Session::get('currentTeam')['SocialAccount']]);
    }
    public function getYoutube(Request $request){

        $youtubeDetails=[];
        $result=[];
        try{
            $responseForParticular = Helper::getInstance()->apiCallGetFeeds("trends/getYoutube?keyword=".$request->keyword."&pageId=".$request->pageId);
            if($responseForParticular->code == 200 && $responseForParticular->status == "success"){
//                    dd($responseForParticular);
                $youtubeDetails=$responseForParticular->response->youtubeDetails;
//                    dd($imgurDetails );

                $result['code'] =200;
                $result['status'] ="success";
                $result['youtubeDetails'] =$youtubeDetails;

            }else if($responseForParticular->code == 404 && $responseForParticular->status == "failed"){

                $result['code'] =400;
                $result['status'] ="failed";
                $result['message'] =$responseForParticular->error;
                Log::info("Imgur responded with an error message". $responseForParticular->error);
            }else if($responseForParticular->code == 400 && $responseForParticular->status == "failed"){
                $result['code'] =400;
                $result['status'] ="failed";
                $result['message'] =$responseForParticular->error;
                Log::info("Imgur responded with an error message". $responseForParticular->error);
            }
            return $result;
        }catch (\Exception $e){
            Log::info("Exception in imgur get ".$e->getFile()." => ".$e->getLine()." => ".$e->getMessage());
            $result['code'] =500;
            $result['status'] ="failed";
            $result['message'] =$e->getMessage();
            return $result;
            dd($e->getMessage());
        }
    }

    public function twitter(){

        return view('Discovery::twitter',["socialAccount"=> Session::get('currentTeam')['SocialAccount']]);
    }
    public function getTwitter(Request $request){
        $youtubeDetails=[];
        $result=[];
        $country="IN";
        try{
            if(isset($_COOKIE['country'])){
                $country = $_COOKIE['country'];
            }
            $responseForParticular = Helper::getInstance()->apiCallGetFeeds("trends/getCurrentTrends?countryCode=".$country);

            if($responseForParticular->code == 200 && $responseForParticular->status == "success"){
//                    dd($responseForParticular);
                $trends=$responseForParticular->response;
                if (strpos($trends[0]->title, '#') !== false) {
                $val =    str_replace("#","",$trends[0]->title);

                }

                $responseForTwtter = Helper::getInstance()->apiCallGetFeeds("trends/getTwitter?keyword=".$val);
                if($responseForTwtter->code == 200 && $responseForTwtter->status == "success"){
                    $result['code'] =200;
                    $result['status'] ="success";
                    $result['tweets']=$responseForTwtter->response->tweets;
                    $result['trends'] =$trends;
                }  else{
                    $result['code'] =400;
                    $result['status'] ="failed";
                    $result['message'] =$responseForTwtter->error;
                    Log::info("Imgur responded with an error message". $responseForTwtter->error);
                }

            }else if($responseForParticular->code == 404 && $responseForParticular->status == "failed"){

                $result['code'] =400;
                $result['status'] ="failed";
                $result['message'] =$responseForParticular->error;
                Log::info("Imgur responded with an error message". $responseForParticular->error);
            }else if($responseForParticular->code == 400 && $responseForParticular->status == "failed"){
                $result['code'] =400;
                $result['status'] ="failed";
                $result['message'] =$responseForParticular->error;
                Log::info("Imgur responded with an error message". $responseForParticular->error);
            }
            return $result;
        }catch (\Exception $e){
            Log::info("Exception in imgur get ".$e->getFile()." => ".$e->getLine()." => ".$e->getMessage());
            $result['code'] =500;
            $result['status'] ="failed";
            $result['message'] =$e->getMessage();
            return $result;
            dd($e->getMessage());
        }
    }




    public function getTrends(Request $request){
        $country ='IN';
        $result=[];
        try{
            if (strpos($request->country, 'mine') !== false) {
                if(isset($_COOKIE['country'])){
                    $country = $_COOKIE['country'];
                }
            }else{
                $country = $request->country;
            }

            $responseForParticular = Helper::getInstance()->apiCallGetFeeds("trends/getCurrentTrends?countryCode=".$country);

            if($responseForParticular->code == 200 && $responseForParticular->status == "success"){
//                    dd($responseForParticular);
                    $result['code'] =200;
                    $result['status'] ="success";
                    $result['trends'] =$responseForParticular->response;

            }else if($responseForParticular->code == 404 && $responseForParticular->status == "failed"){
                $result['code'] =400;
                $result['status'] ="failed";
                $result['message'] =$responseForParticular->error;
                Log::info("Imgur responded with an error message". $responseForParticular->error);
            }else if($responseForParticular->code == 400 && $responseForParticular->status == "failed"){
                $result['code'] =400;
                $result['status'] ="failed";
                $result['message'] =$responseForParticular->error;
                Log::info("Imgur responded with an error message". $responseForParticular->error);
            }
            return $result;
        }catch (\Exception $e){
//            dd($e->getMessage());
            Log::info("Exception in imgur get ".$e->getFile()." => ".$e->getLine()." => ".$e->getMessage());
            $result['code'] =500;
            $result['status'] ="failed";
            $result['message'] =$e->getMessage();
            return $result;
        }
    }


    public function getTwitterSearch(Request $request){
        $country ='IN';
        $result=[];
        try{

            $responseForParticular = Helper::getInstance()->apiCallGetFeeds("trends/getTwitter?keyword=".$request->Keyword);

            if($responseForParticular->code == 200 && $responseForParticular->status == "success"){
//                    dd($responseForParticular);
                $result['code'] =200;
                $result['status'] ="success";
                $result['tweets']=$responseForParticular->response->tweets;

            }else if($responseForParticular->code == 404 && $responseForParticular->status == "failed"){
                $result['code'] =400;
                $result['status'] ="failed";
                $result['message'] =$responseForParticular->error;
                Log::info("Imgur responded with an error message". $responseForParticular->error);
            }else if($responseForParticular->code == 400 && $responseForParticular->status == "failed"){
                $result['code'] =400;
                $result['status'] ="failed";
                $result['message'] =$responseForParticular->error;
                Log::info("Imgur responded with an error message". $responseForParticular->error);
            }
            return $result;
        }catch (\Exception $e){
            dd($e->getMessage());
            Log::info("Exception in imgur get ".$e->getFile()." => ".$e->getLine()." => ".$e->getMessage());
            $result['code'] =500;
            $result['status'] ="failed";
            $result['message'] =$e->getMessage();
            return $result;
        }
    }

    public function boardMe(Request $request){
        if($request->isMethod('get')){
            return view('Discovery::boardMe.Loadpage');
        }else if($request->isMethod('post')){
            $resultData =[];
            try{
                $helper = Helper::getInstance();
//                dd($request->all());
                $data['team_id'] = Session::get('currentTeam')['team_id'];
                $response = Helper::getInstance()->apiCallFeedsPut($data,"boards/create?boardName=".$request->boardName."&keyword=".$request->boardKeyword."&teamId=".Session::get('currentTeam')['team_id']);


                if($response->getStatusCode() == 200){
                    $result = json_decode($response->getBody()->getContents());
                    if($result->code == 400){
                        Log::info("Could not create board".$request->boardName." for team ". $data['team_id'] ." at time ".date('y-m-s'));
                        $resultData['code']=400;
                        $resultData['code']=$result->error;
                    }else if($result->code == 200){
                        Log::info("Created board".$request->boardName." for team ". $data['team_id'] ." at time ".date('y-m-s'));

                        $resultData['code']= 200;
                        $resultData['Data']=$result->message;
                    }

                }else{
                    Log::info("Could not create board".$request->boardName." for team ". $data['team_id'] ." at time ".date('y-m-s'));
                    Log::info($response);

                    $resultData['code']= 500;
                    $resultData['Data']="Something went wrong";
                }
                return $resultData;
            }catch (\Exception $e){
                Log::info("Create board Exception ".$e->getMessage()." at line ".$e->getLine()." in file ".$e->getFile()." at time ".date('y-m-s'));
                $resultData['code'] = 500;
                $resultData['message'] = "Something went wrong";
                return $resultData;
            }

        }
    }




}
