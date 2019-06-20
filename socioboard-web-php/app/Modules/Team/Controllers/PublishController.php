<?php

namespace App\Modules\Team\Controllers;

use App\Modules\User\Helper;
use GuzzleHttp\Client;
use GuzzleHttp\RequestOptions;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\File;


class PublishController extends Controller
{

    /*
     * Author: Aishwarya_M <aishwarya@globussoft.in>
     * Desc: */
    protected $client;
    protected $API_URL;

    public function __construct()
    {
        $this->client = new Client();
        $this->API_URL = env('API_URL') . env('VERSION') . '/';
    }


    public function publish(Request $request){
        if($request->isMethod('GET')){

            $help = Helper::getInstance();
            $socialAccs =Session::get('currentTeam');
            $boards =[];
            try{
                $response = $help->apiCallGet("team/getTeamDetails?TeamId=".$socialAccs['team_id']);

                if($response->code == 200 && $response->status =="success"){
                    if(isset($response->pinterestBoards)){
                        $boards = $response->pinterestBoards;
                    }
                }
//dd($boards);
            }catch (\Exception $e){
                Log::info('Schedule post page '.$e->getFile()." => @ ".$e->getLine()."=> ".$e->getMessage());
            }
            return view('Team::publishing',[
                'socialAccount'=>Session::get('currentTeam')['SocialAccount'],
                'boards'=>$boards
            ]);
        }else if($request->isMethod('POST')){
            dd(11);
        }
    }

    public function publishData(Request $request){

            $helper =Helper::getInstance();
            $accountType=[];
            $publishData=[];
            $publishData=[];
            $publishVideos=[];
            $postType="Text";
            $postStatus = $request->postStatus;
            if($request->message == ""){
                $result['code']=404;
                $result['status']="failure";
                $result['message']="Message field is required";
                return ($result);

            }
            $accountType =  explode(",",$request["checked"]);
            $publishImages =[];
//for checking if profiles selected are not
            if(count($accountType) == 1 && $accountType[0] == "" ){
                $result['code']=400;
                $result['status']="failure";
                $result['message']="Please select atleast 1 account.";
                return ($result);
            }
            try{
                $team = Session::get('currentTeam')['team_id'];
                if($request->hasFile('imageName')){
                    if($request->hasFile('videoupload')){
                        $result['code']=400;
                        $result['status']="failure";
                        $result['message']="Please select only images or videos. Not both at a time";
                        return ($result);
                    }

                    //TODO image validation has to be done
                    foreach($request->imageName as $image){
                        if(substr($image->getMimeType(), 0, 5) == 'image') {
                            $postType = "Image";
                            $pathToStorage = storage_path("uploadimages");
                            if (!file_exists($pathToStorage))
                                mkdir($pathToStorage, 0777, true);
                            $publishimage = $image->getClientOriginalName();
                            $path = $pathToStorage."/".$publishimage ;
                            Log::info("Publish file Path:".$path);
                            file_put_contents($path, file_get_contents($image->path()));
                            $filedata = array("name"=>"media",
                                "file"=>$path);
                            $response = $helper->apiCallPostPublish($filedata,"upload/media?teamId=".$team."&privacy=0",true);
                            if($response['statusCode'] == 200){

                                //getting filename for
                                $publishImages[]=$response['data']['mediaDetails'][0]['media_url'];
                                File::Delete($filedata['file']);
                                Log::info("Deleted a file -> ".$filedata['file']." after sending file to api. Dated-> ".date('y/m/d'));
                            }


                        }else{
                            $result['code']=400;
                            $result['status']="failure";
                            $result['message']="Select only images or videos";
                            return ($result);
                        }
                    }
                }
                if(isset($request->videoupload)){
                    //TODO video validation has to be done
                    foreach($request->videoupload as $video){

                        $postType = "Video";
                        $pathToStorage = storage_path("uploadvideos");
                        if (!file_exists($pathToStorage))
                            mkdir($pathToStorage, 0777, true);
                        $publishimage = $video->getClientOriginalName();
                        $path = $pathToStorage."/".$publishimage ;
                        Log::info("Publish file Path:".$path);
                        file_put_contents($path, file_get_contents($video->path()));
                        $videodata = array("name"=>"media",
                            "file"=>$path);
                        $response = $helper->apiCallPostPublish($videodata,"upload/media?teamId=".$team."&privacy=0",true);

                        if($response['statusCode'] == 200){
                            //getting filename for
                            $publishImages[]=$response['data']['mediaDetails'][0]['media_url'];
                            File::Delete($videodata['file']);
                            Log::info("Deleted a file -> ".$videodata['file']." after sending file to api. Dated-> ".date('y/m/d'));
                        }

                    }
                }

                $pin = array("accountId"=>0,
                    "boardId"=>['string']);
                $pinD = json_encode($pin );
                //Publish videos
//                if($publishVideos != null){
                    $publishData=array(
                        "postType"=>$postType,
                        "postStatus"=>$postStatus,
                        "message"=>$request->message,
                        "link"=>"",
                        "mediaPaths"=>$publishImages,
                        "accountIds"=>$accountType,
                        "pinBoards"=> [
                            $pinD
                        ]
                    );
//                }

//dd($publishData);

//                //publish images
//                if($publishImages != null){
//                    $publishData=array(
//                        "postType"=>$postType,
//                        "postStatus"=>$postStatus,
//                        "message"=>$request->message,
//                        "link"=>"",
//                        "mediaPaths"=>$publishImages,
//                        "accountIds"=>$accountType,
//                        "pinBoards"=> [
//                            $pinD
//                        ]
//                    );


//                }

//                //publish texts
//                $publishData=array(
//                    "postType"=>$postType,
//                    "postStatus"=>$postStatus,
//                    "message"=>$request->message,
//                    "link"=>"",
//                    "mediaPaths"=>$publishImages,
//                    "accountIds"=>$accountType,
//                    "pinBoards"=> [
//                        $pinD
//                    ]
//                );




                $publishresponse = $helper->apiCallPostPublish($publishData,"publish/publishPosts?teamId=".$team);

                if($publishresponse['statusCode'] == 200 && $publishresponse['data']['code']==200 && $publishresponse['data']['status']=="success"){
                    $result['code']=200;
                    $result['message']=$publishresponse['data']['message'];
                    $result['status']="success";
                    return $result;
                }else if( $publishresponse['data']['code']==400 && $publishresponse['data']['status']=="failed" ){
                    $result['code']=500;
                    $result['status']="failure";
                    $result['message']=$publishresponse['data']['error'];
                    return ($result);
                }

            }catch (\Exception $e){
//           echo $e->getMessage();
                Log::info(" Exception on post ".$e->getFile()."  =>line=>  ".$e->getLine()."  =>  ".$e->getMessage());
                $result['code']=500;
                $result['status']="failure";
                $result['message']=$e->getMessage();
                return ($result);
            }

        }







        public function publishDataold(Request $request){
            $helper =Helper::getInstance();
            $accountType=[];
            $publishData=[];
            $publishData=[];
            $publishVideos=[];
            $postType="Text";

            if($request->message == ""){
                $result['code']=404;
                $result['status']="failure";
                $result['message']="Message field is required";
                return ($result);

            }
            $accountType =  explode(",",$request["checked"]);
            $publishImages =[];
//for checking if profiles selected are not
            if(count($accountType) == 1 && $accountType[0] == "" ){
                $result['code']=400;
                $result['status']="failure";
                $result['message']="Please select atleast 1 account.";
                return ($result);
            }
            try{
                if($request->hasFile('imageName')){
                    if($request->hasFile('videoupload')){
                        $result['code']=400;
                        $result['status']="failure";
                        $result['message']="Please select only images or videos. Not both at a time";
                        return ($result);
                    }

                    //TODO image validation has to be done
                    foreach($request->imageName as $image){
                        if(substr($image->getMimeType(), 0, 5) == 'image') {
                            $postType = "Image";
                            $pathToStorage = storage_path("uploadimages");
                            if (!file_exists($pathToStorage))
                                mkdir($pathToStorage, 0777, true);
                            $publishimage = $image->getClientOriginalName();
                            $path = $pathToStorage."/".$publishimage ;
                            Log::info("Publish file Path:".$path);
                            file_put_contents($path, file_get_contents($image->path()));
                            $filedata = array("name"=>"media",
                                "file"=>$path);
                            $response = $helper->apiCallPostPublish($filedata,"upload/images",true);
                            if($response['statusCode'] == 200){
                                //getting filename for
                                $publishImages[]=$response['data'][0]['filename'];
                                File::Delete($filedata['file']);
                                Log::info("Deleted a file -> ".$filedata['file']." after sending file to api. Dated-> ".date('y/m/d'));
                            }
                        }else{
                            $result['code']=400;
                            $result['status']="failure";
                            $result['message']="Select only images or videos";
                            return ($result);
                        }
                    }
                }
                if(isset($request->videoupload)){
                    //TODO video validation has to be done
                    foreach($request->videoupload as $video){

                        $postType = "Video";
                        $pathToStorage = storage_path("uploadvideos");
                        if (!file_exists($pathToStorage))
                            mkdir($pathToStorage, 0777, true);
                        $publishimage = $video->getClientOriginalName();
                        $path = $pathToStorage."/".$publishimage ;
                        Log::info("Publish file Path:".$path);
                        file_put_contents($path, file_get_contents($video->path()));
                        $videodata = array("name"=>"video",
                            "file"=>$path);
                        $response = $helper->apiCallPostPublish($videodata,"upload/videos",true);
                        if($response['statusCode'] == 200){
                            //getting filename for
                            $publishVideos[]=$response['data'][0]['filename'];
                            File::Delete($videodata['file']);
                            Log::info("Deleted a file -> ".$videodata['file']." after sending file to api. Dated-> ".date('y/m/d'));
                        }

                    }
                }
                if($publishVideos != null){
                    $publishData=array(
                        "postType"=>$postType,
                        "message"=>$request->message,
                        "link"=>"",
                        "mediaPaths"=>$publishVideos,
                        "accountIds"=>$accountType
                    );
                }


                $pin = array("accountId"=>0,
                    "boardId"=>['2222']);
                $pinD = json_encode($pin );
                if($publishImages != null){
                    $publishData=array(
                        "postType"=>$postType,
                        "message"=>$request->message,
                        "link"=>"",
                        "mediaPaths"=>$publishImages,
                        "accountIds"=>$accountType,
                        "pinBoards"=> [
                            $pinD
                        ]
                    );


                }

                $publishData=array(
                    "postType"=>$postType,
                    "message"=>$request->message,
                    "link"=>"",
                    "mediaPaths"=>$publishImages,
                    "accountIds"=>$accountType,
                    "pinBoards"=> [
                        $pinD
                    ]
                );
//return json_encode($publishData);


                $team = Session::get('currentTeam')['team_id'];

                $publishresponse = $helper->apiCallPostPublish($publishData,"publish/publishPosts?teamId=".$team);

                if($publishresponse['statusCode'] == 200 && $publishresponse['data']['code']==200 && $publishresponse['data']['status']=="success"){
                    $result['code']=200;
                    $result['message']=$publishresponse['data']['message'];
                    $result['status']="success";
                    return $result;
                }else if( $publishresponse['data']['code']==400 && $publishresponse['data']['status']=="failed" ){
                    $result['code']=500;
                    $result['status']="failure";
                    $result['message']=$publishresponse['data']['error'];
                    return ($result);
                }

            }catch (\Exception $e){
//           echo $e->getMessage();
                Log::info(" Exception on post ".$e->getFile()."  =>line=>  ".$e->getLine()."  =>  ".$e->getMessage());
                $result['code']=500;
                $result['status']="failure";
                $result['message']=$e->getMessage();
                return ($result);
            }

        }


    //schedule post

    public function schedulePost(Request $request){
        return json_encode($request->all());
    }




    public function publishData1(Request $request){
return $request->videoupload;
        $accountType=[];
        if($request->message == ""){
            return 404;
        }
        $accountType =  explode(",",$request["checked"]);
//for checking if profiles selected are not
        if(count($accountType) == 1 && $accountType[0] == "" ){
            return 55;
        }


        try{
            $helper =Helper::getInstance();
            if(isset($request->picupload)){
                if(isset($request->videoupload)){
                    return 400;
                }

                if(substr($request->picupload->getMimeType(), 0, 5) == 'image') {
                    $data = array("file"=>$request->picupload,
                        "name"=>'imageName');
                    $response = $helper->apiCallPost($data,"upload/images",true);
                    return $response;
                }
            }

            for($i=0;$i<count($accountType);$i++){



                if(explode('+',$accountType[$i])[1] == 1 || explode('+',$accountType[$i])[1] == 2 || explode('+',$accountType[$i])[1] == 3){ // facebook
                    //for fb or fbpage or fbgroup

                } if(explode('+',$accountType[$i])[1]  == 4){
                    //for twitter

                } if(explode('+',$accountType[$i])[1]  == 5 ){
                    // instagram

                } if(explode('+',$accountType[$i])[1]  == 6 || explode('+',$accountType[$i])[1]  == 7){
                    //linked in or linked in business

                } if(explode('+',$accountType[$i])[1]  == 8 ||explode('+',$accountType[$i])[1]  == 10 ){
                    // google plus or google analytics
                } if(explode('+',$accountType[$i])[1]  == 9){
                    //youtube
                }
//            else if()
            }

        }catch (\Exception $e){

//            echo $e->getMessage();
            return json_encode($e->getMessage());
        }

    }



}
