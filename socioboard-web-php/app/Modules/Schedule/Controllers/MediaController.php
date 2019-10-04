<?php

namespace App\Modules\Schedule\Controllers;

use App\Modules\User\Helper;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Validator;


class MediaController extends Controller
{
    //Image library

    public function imageLibrary(Request $request, $type){
        try{
            if($request->isMethod('GET')){
                if($type == 0){ //Public
                    return view('Schedule::imageLibrary.public_image_library',
                        [    "socialAccount" => Session::get('currentTeam')['SocialAccount'],
                            "pinterestBoards" => Session::get('pinterestBoards')]);
                }else if($type == 1){ //Private
                    return view('Schedule::imageLibrary.private_image_library',
                        [    "socialAccount" => Session::get('currentTeam')['SocialAccount'],
                            "pinterestBoards" => Session::get('pinterestBoards')]);
                }
            }else if($request->isMethod('POST')){
                $helper = Helper::getInstance();
                $teamId = Session::get('currentTeam')['team_id'];
//                upload/getMediaDetails?teamId=1&privacy=0&pageId=1
                $response = $helper->apiCallPublishGet("upload/getMediaDetails?teamId=".$teamId."&privacy=".$type."&pageId=".$request->pageId);
                if($response->code == 200){
                   $result['code'] = 200;
                   $result['data'] =[];
                  foreach( $response->data as $media){
                      if(strpos($media->media_url,'images') !== false){
                          array_push($result['data'],$media);
                      }
                  }
                   $result['totalSize']=$response->totalSpace/1024/1024;
                   $result['usedSize']=$response->usedSpace/1024/1024;
               }else{
                   $result['code'] = 400;
                   if(isset($response->error))
                       $result['message'] = $response->error;
                   else if(isset($response->message))
                       $result['message'] = $response->message;
                   else
                       $result['message'] ="Something went wrong";
               }
                return $result;
            }
        }catch (\Exception $e){
            Log::info(" Image library exception " . $e->getMessage() . " in file " . $e->getFile() . " at line " . $e->getLine());
        }
    }

    //delete media
    public function mediaDelete(Request $request,$id){
        $response = Helper::getInstance()->apiCallPublishDelete("upload/deleteMedia?mediaId=".$id."&isForceDelete=1");

        if($response->code == 200){
//            return redirect('dashboard/' . $teamId)->with('message', "Currently not able to add your account");

            return Redirect::back()->withErrors([ $response->message]);
        }else{
            return Redirect::back()->withErrors([$response->error]);

        }

    }

    public function mediaUpload(Request $request,$privacy){

        try{
            $validator = Validator::make($request->all(), [
                'title' => 'required|max:255',
                'media' => 'required|max:20000',
            ]);

            if ($validator->fails()) {
                $result['code']=400;
                $result['error']=$validator->errors();
                return $result;
            }else{
                $team = Session::get('currentTeam')['team_id'];
                $image = $request->media;
                $helper = Helper::getInstance();
                $pathToStorage = storage_path("uploadimages");
                if (!file_exists($pathToStorage))
                    mkdir($pathToStorage, 0777, true);
                $publishimage = $image->getClientOriginalName();
                $path = $pathToStorage . "/" . $publishimage;
                Log::info("Upload file Path:" . $path);
                file_put_contents($path, file_get_contents($image->path()));
                $filedata = array("name" => "media",
                    "file" => $path);
                $response = $helper->apiCallPostPublish($filedata, "upload/media?title=".$request->title."&teamId=" . $team . "&privacy=".$privacy, true);

                if ($response['statusCode'] == 200) {

                    //getting filename for
                    $publishImages[] = $response['data']['mediaDetails'][0]['media_url'];
                    File::Delete($filedata['file']);
                    Log::info("Deleted a file -> " . $filedata['file'] . " after sending file to api. Dated-> " . date('y/m/d'));
                    $result['code']=200;
                    $result['message']="Uploaded successfully";
                    return $result;
                }

            }
        }catch (\Exception $e){
            Log::info("Exception in mediaUpload ".$e->getMessage());
            $result['code']=500;
            $result['message']="Something went wrong";
            return $result;
        }

    }


}
