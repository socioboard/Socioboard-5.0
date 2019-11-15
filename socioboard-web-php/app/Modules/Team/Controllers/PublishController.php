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
            }catch (\Exception $e){
                Log::info('Schedule post page '.$e->getFile()." => @ ".$e->getLine()."=> ".$e->getMessage());
            }
            return view('Team::publishing',[
                'socialAccount'=>Session::get('currentTeam')['SocialAccount'],
                'boards'=>$boards
            ]);
        }else if($request->isMethod('POST')){
        }
    }

    public function publishData(Request $request){
            $helper =Helper::getInstance();
            $accountType=[];
            $boardsData=[];
            $publishData=[];
            $publishData=[];
            $publishVideos=[];
            $pinboardata =[];
            $privacy = env('POST_PRIVACY'); // default public
            $link=$request->link;
            $postType="Text";
            $postStatus = $request->postStatus;
            if($request->message == "" || $request->message == null && $request->link == "" ){
                $result['code']=404;
                $result['status']="failure";
//                $result['message']="Message field or outgoing link is required";
                $result['message']="Message field or link is required";
                return ($result);
            }
        $acc = explode(",",$request["checked"]);
            if($acc[0] != "") $accountType = explode(",",$request["checked"]);

        $publishImages =[];
            //for checking if profiles selected are not
            if(count($accountType) == 1 && $accountType[0] == "" &&  $request->selectedBoards == ""){
                $result['code']=400;
                $result['status']="failure";
                $result['message']="Please select atleast 1 account.";
                return ($result);
            }
            if($request->selectedBoards != ""){
                if($request->imageName == "" || $request->message ==""){
                    $result['code']=400;
                    $result['status']="failure";
                    $result['message']="For posting on boards image, message and link are necessary";
                    return ($result);
                }
                $postType ="Image";

                $k=0;
                $baordsAcc = explode(',',$request->selectedBoards);
                $j=0;
                for($i=0;$i<count($baordsAcc);$i++){
                    if (isset($boardsData[$j-1]['accountId']) && $boardsData[$j-1]['accountId'] == explode('_',$baordsAcc[$i])[0]){
                        $boardsData[$j-1]['boardId'][$k] = explode('_',$baordsAcc[$i])[1];
                        $k++;
                        unset($baordsAcc[$i]);
                        $baordsAcc = array_values($baordsAcc);
                        $i--;;
                        print_r($i);
                        echo "</br>";
                    }else{
                        $k=0;
                        $boardsData[$j]['accountId'] = (int)explode('_',$baordsAcc[$i])[0];
                        $boardsData[$j]['boardId'][$k] = explode('_',$baordsAcc[$i])[1];
                        array_push($accountType,explode('_',$baordsAcc[$i])[0]);
                        $k++;
                        $j++;

                    }
                }
                for($m=0;$m<count($boardsData);$m++){
                    array_push($pinboardata,$boardsData[$m]);
                }
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
                            $response = $helper->apiCallPostPublish($filedata,"upload/media?title=publish&teamId=".$team."&privacy=".$privacy,true);
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

                if($request->link != ""){
                    if($request->selectedBoards == ""){
                        $postType ="Link";
                    }
                    if($publishImages != []) $postType = 'Image';
                    if((int)Session::get('user')['userDetails']->Activations->shortenStatus == 1){
                        $shortenLinkResponse = $helper->apiCallGet("user/getShortenUrl?longurl=".$request->link);
                        if($shortenLinkResponse->code == 200){
                            $link = $shortenLinkResponse->message->shortLink;
                        }
                    }
                }else $link = '';

                $publishData=array(
                    "postType"=>$postType,
                    "postStatus"=>$postStatus,
                    "message"=>$request->message,
                    "link"=>$link,
                    "mediaPaths"=>$publishImages,
                    "accountIds"=>$accountType,
                    "pinBoards"=>$pinboardata
                );

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
                Log::info(" Exception on post ".$e->getFile()."  =>line=>  ".$e->getLine()."  =>  ".$e->getMessage());
                $result['code']=500;
                $result['status']="failure";
                $result['message']=$e->getMessage();
                return ($result);
            }
        }

}
