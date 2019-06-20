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

        $imageArray = explode(',', $request->imagevideos);

        $helper = Helper::getInstance();
        $team = Session::get('currentTeam')['team_id'];
        $privacy = 1; // default public

//       return json_encode($request->all());



        $accountType = explode(",", $request["checked"]);
        if ($request->message === null) {
            $result['code'] = 404;
            $result['message'] = "Message field is required";
            return $result;
        }

        if (count($accountType) == 1 && $accountType[0] == "") {
            $result['code'] = 400;
            $result['status'] = "failure";
            $result['message'] = "Please select atleast 1 account.";
            return ($result);
        }
        try {

//daily motions embed urls give Link type posting


//for rss case
            if (isset($request->rsslink)) {
                $postType = "Link";
                $linkMedia =$request->rsslink;
            }else{

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

                        }else{  $postType = "Image";
                            $pathToStorage = storage_path("uploadimages");
//dd($pathToStorage);
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

                        file_put_contents($path, file_get_contents($image));

                        $filedata = array("name" => "media",
                            "file" => $path);

                        $response = $helper->apiCallPostPublish($filedata, "upload/media?teamId=" . $team . "&privacy=" . $privacy, true);

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



            $pinD = array("accountId"=>0,
                "boardId"=>['string']);
            $publishData=array(
                "postType"=>$postType,
                "postStatus"=>$request->postStatus,
                "message"=>$request->message,
                "link"=>$linkMedia,
                "mediaPaths"=>$publishMedia,
                "accountIds"=>$accountType,
                "pinBoards"=> [
                    $pinD
                ]
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
            dd($e->getMessage());
            $result['code'] = 500;
            $result['message'] = "something went wrong";
            return $result;
        }


    }
}
