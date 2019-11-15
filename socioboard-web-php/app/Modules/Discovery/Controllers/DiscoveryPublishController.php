<?php

namespace App\Modules\Discovery\Controllers;

use App\Modules\User\Helper;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class DiscoveryPublishController extends Controller
{


    //TODO psoting not yet completed
    public function publishdatadiscovery(Request $request)
    {
        ini_set('max_execution_time', 300);
        $result = [];
        $accountType = [];
        $imageArray = [];
        $linkMedia="";
        $publishMedia=[];
        $postType="Text";
        $pinboardata =[];
        $boardsData=[];

        $imageArray = explode(',', $request->imagevideos);
        $helper = Helper::getInstance();
        $team = Session::get('currentTeam')['team_id'];
        $privacy = env('POST_PRIVACY'); // default public





        $accountType = explode(",", $request["checked"]);
        if ($request->message === null && $request->link == "") {
            $result['code'] = 404;
            $result['message'] = "Message field is required";
            return $result;
        }


        if (count($accountType) == 1 && $accountType[0] == "") {
            if($request->selectedBoards == null){
                $result['code'] = 400;
                $result['status'] = "failure";
                $result['message'] = "Please select atleast 1 account.";
                return ($result);
            }
        }
        try {

//daily motions embed urls give Link type posting


//for rss case
            if (isset($request->rsslink)) {
                if(!filter_var($request->rsslink, FILTER_VALIDATE_URL)){
                    $result['code']=400;
                    $result['status']="failure";
                    $result['message']="Provide valid URL";
                    return ($result);
                }
                if($request->selectedBoards == ""){
                    $postType ="Link";
                }
                $linkMedia =$request->rsslink;

                if((int)Session::get('user')['userDetails']->Activations->shortenStatus == 1){
                    $shortenLinkResponse = $helper->apiCallGet("user/getShortenUrl?longurl=".urlencode($request->rsslink));
                    if($shortenLinkResponse->code == 200){
                        $linkMedia = $shortenLinkResponse->message->shortLink;
                    }
                    else $linkMedia = $request->rsslink;
                }
            }else if($imageArray[0] != ""){

                foreach ($imageArray as $image) {

                        if(strpos($image,"embed") !== false || strpos($image,"video") !== false || strpos($image, "dailymotion") !== false){
                            // for embede urls directly pass
                            $postType = "Link";
                            $linkMedia = $image;

                        }
                        else{
                            if (pathinfo($image, PATHINFO_EXTENSION) == "mp4" || pathinfo($image, PATHINFO_EXTENSION) == "flv" || pathinfo($image, PATHINFO_EXTENSION) == "m3u8"  || strpos($image,'video')) {
                                $postType = "Video";
                                $pathToStorage = storage_path("uploadvideos");

                            }
                            else{
                                $postType = "Image";
                                $pathToStorage = storage_path("uploadimages");
                            }

                            if (!file_exists($pathToStorage))
                                mkdir($pathToStorage, 0777, true);
                            if( pathinfo($image, PATHINFO_EXTENSION) == null){

                                $path = $pathToStorage . "/" . rand(10, 100) . time() . "." . "jpg";

                            }else{
                                $extension = pathinfo($image, PATHINFO_EXTENSION);
                                if(strpos(pathinfo($image, PATHINFO_EXTENSION),"?") !== false){
                                    $extension = explode('?',pathinfo($image, PATHINFO_EXTENSION))[0];
                                }
                                $path = $pathToStorage . "/" . rand(10, 100) . time() . "." . $extension;
                            }

                            Log::info("Publish file Path:" . $path);

                            $filePut = file_put_contents($path, file_get_contents($image));



                            $filedata = array("name" => "media",
                                "file" => $path);


                            $response = $helper->apiCallPostPublish($filedata, "upload/media?title=publish&teamId=" . $team . "&privacy=" . $privacy, true);
                            if ($response['statusCode'] == 200) {
                                //getting filename for
                                $publishMedia[] = $response['data']['mediaDetails'][0]['media_url'];
                                File::Delete($filedata['file']);

                                Log::info("Deleted a file -> " . $filedata['file'] . " after sending file to api. Dated-> " . date('y/m/d'));
                            }else{
                                Log::info("Media upload issue" . date('y/m/d'));
                                Log::info($response);

                            }
                        }

                    }
                }




            if(isset($request->selectedBoards ) && $request->selectedBoards  != ""){



                if( $imageArray[0] == "" || $request->message ==""){
                    $result['code']=400;
                    $result['status']="failure";
                    $result['message']="For posting on boards image, message and link are necessary";
                    return ($result);
                }
                if($request->link != null && !filter_var($request->link, FILTER_VALIDATE_URL)){
                    $result['code']=400;
                    $result['status']="failure";
                    $result['message']="Provide valid URL";
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
            if($request->link != ""){
                if($request->selectedBoards == ""){
                    $postType ="Link";
                }
                if($publishMedia != [])  $postType = 'Image';
                $linkMedia=$request->link;
                if((int)Session::get('user')['userDetails']->Activations->shortenStatus == 1){
                    $shortenLinkResponse = $helper->apiCallGet("user/getShortenUrl?longurl=".urlencode($request->link));
                    if($shortenLinkResponse->code == 200){
                        $linkMedia = $shortenLinkResponse->message->shortLink;
                    }
                    else $linkMedia = $request->link;

                }
            }

            $publishData=array(
                "postType"=>$postType,
                "postStatus"=>$request->postStatus,
                "message"=>$request->message,
                "link"=>$linkMedia,
                "mediaPaths"=>$publishMedia,
                "accountIds"=>$accountType,
                "pinBoards"=> $pinboardata

            );
            $publishresponse = $helper->apiCallPostPublish($publishData,"publish/publishPosts?teamId=".$team);
            if($publishresponse['statusCode'] == 200 && $publishresponse['data']['code']==200 && $publishresponse['data']['status']=="success"){
                $result['code']=200;
                $result['message']=$publishresponse['data']['message'];
                $result['errors']=$publishresponse['data']['errors'];
                $result['status']="success";
                return $result;
            }else if( $publishresponse['data']['code']==400 && $publishresponse['data']['status']=="failed" ){
                $result['code']=500;
                $result['status']="failure";
                $result['message']=$publishresponse['data']['error'];
                return ($result);
            }


        } catch (\Exception $e) {
            $result['code'] = 500;
            $result['message'] = "something went wrong";
            return $result;
        }


    }
}
