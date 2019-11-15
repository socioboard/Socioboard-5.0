<?php

namespace App\Modules\Schedule\Controllers;

use App\Modules\User\Helper;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Redirect;


class ScheduleController extends Controller
{

    public function editSchedulePost(Request $request){
       if ($request->isMethod('post')) {
           $helper = Helper::getInstance();
           $accountType = [];
           $publishData = [];
           $publishVideos = [];
           $timeDArray = [];
           $accountDetail = [];
           $linkMedia = "";
           $postType = "Text";
           $timestamp = "";
           $pinboardata = [];
           $privacy = env('POST_PRIVACY'); // default public

           $postStatus = $request->scheduleStatus;
           if($postStatus == 1) $moduleName = "Schedule";
           elseif($postStatus == 5) $moduleName = "Draft";
           if ($request->sMessage == "" && $request->sLink == "") {
               $result['code'] = 404;
               $result['status'] = "failure";
               $result['message'] = "Oops you forgot to provide message/link";
               return ($result);
           }
           $accountType = explode(",", $request["checked"]); //16--2 id--type


           $Days = explode(",", $request["selectDays"]);
           $publishImages = [];
//for checking if profiles selected are not
           if (count($accountType) == 1 && $accountType[0] == "" && $request->selectedBoards == "") {
               $result['code'] = 400;
               $result['status'] = "failure";
               $result['message'] = "Please select atleast 1 account.";
               return ($result);
           }

           if ($request->selectedBoards != "") {
               if ($request->mediaUploaded == "" && $request->imageName == "") {
                   $result['code'] = 400;
                   $result['status'] = "failure";
                   $result['message'] = "For posting on boards image and link is neccessdary";
                   return ($result);
               }
               $k = 0;
               $baordsAcc = explode(',', $request->selectedBoards);
               $j = 0;
               for ($i = 0; $i < count($baordsAcc); $i++) {
                   if (isset($boardsData[$j - 1]['accountId']) && $boardsData[$j - 1]['accountId'] == explode('_', $baordsAcc[$i])[0]) {
                       $boardsData[$j - 1]['boardId'][$k] = explode('_', $baordsAcc[$i])[1];
                       $k++;
                       unset($baordsAcc[$i]);
                       $baordsAcc = array_values($baordsAcc);
                       $i--;;
                       print_r($i);
                       echo "</br>";
                   } else {
                       $k = 0;
                       $boardsData[$j]['accountId'] = (int)explode('_', $baordsAcc[$i])[0];
                       $boardsData[$j]['boardId'][$k] = explode('_', $baordsAcc[$i])[1];
                       $data = explode('_', $baordsAcc[$i])[0] . "--" . env('PINTEREST');
                       array_push($accountType, $data);
                       $k++;
                       $j++;

                   }
               }

               for ($m = 0; $m < count($boardsData); $m++) {
                   array_push($pinboardata, $boardsData[$m]);
               }

           }
           if ($request->daywsiseChecked == 1) {
               if ($request->dayWiseDateTime == null || count($Days) == 0) {
                   $result['code'] = 400;
                   $result['status'] = "failure";
                   $result['message'] = "For day-wise schedule, please provide day and time to schedule the post";
                   return ($result);
               } else {
                   $timestampDay = strtotime($request->dayWiseDateTime);
                   $timestampDay = gmdate("Y-m-d\TH:i:s.ms\Z", $timestampDay);
                   foreach ($Days as $day) {
                       $obt = new \stdClass();
                       $obt->dayId = (int)$day;
                       $obt->timings = (array)$timestampDay;
                       $timeDArray[] = $obt;
//                       $timeDArray[] = array("dayId"=>(int)$day,
//                           "timings"=>$timestampDay); // json encode this in daywiseScheduleTimer of schedule data
                   }

               }
           }
//            return json_encode($timeDArray);
           if ($request->normalChecked == 1) {
               if ($request->normalDateTime == null) {
                   $result['code'] = 400;
                   $result['status'] = "failure";
                   $result['message'] = "For normal schedule, please provide time to schedule the post";
                   return ($result);
               } else {
                   $timestamp = strtotime($request->normalDateTime);
                   $timestamp = gmdate("Y-m-d\TH:i:s.ms\Z", $timestamp);
               }
           }
           try {
               $team = Session::get('currentTeam')['team_id'];
               if ($request->hasFile('imageName')) {

                   //type image
                   if ($request->hasFile('videoupload')) {
                       $result['code'] = 400;
                       $result['status'] = "failure";
                       $result['message'] = "Please select only images or videos. Not both at a time";
                       return ($result);
                   }

                   //TODO image validation has to be done
                   foreach ($request->imageName as $image) {
                       if (substr($image->getMimeType(), 0, 5) == 'image') {
                           $postType = "Image";
                           $pathToStorage = storage_path("uploadimages");
                           if (!file_exists($pathToStorage))
                               mkdir($pathToStorage, 0777, true);
                           $publishimage = $image->getClientOriginalName();
                           $path = $pathToStorage . "/" . $publishimage;
                           Log::info("Publish file Path:" . $path);
                           file_put_contents($path, file_get_contents($image->path()));
                           $filedata = array("name" => "media",
                               "file" => $path);
                           $response = $helper->apiCallPostPublish($filedata, "upload/media?title=schedule&teamId=" . $team . "&privacy=" . $privacy, true);
                           if ($response['statusCode'] == 200) {

                               //getting filename for
                               $publishImages[] = $response['data']['mediaDetails'][0]['media_url'];
                               File::Delete($filedata['file']);
                               Log::info("Deleted a file -> " . $filedata['file'] . " after sending file to api. Dated-> " . date('y/m/d'));
                           }


                       } else {
                           $result['code'] = 400;
                           $result['status'] = "failure";
                           $result['message'] = "Select only images or videos";
                           return ($result);
                       }
                   }
               } else if (isset($request->videoupload)) {
                   //type video
                   foreach ($request->videoupload as $video) {

                       $postType = "Video";
                       $pathToStorage = storage_path("uploadvideos");
                       if (!file_exists($pathToStorage))
                           mkdir($pathToStorage, 0777, true);
                       $publishimage = $video->getClientOriginalName();
                       $path = $pathToStorage . "/" . $publishimage;
                       Log::info("Publish file Path:" . $path);
                       file_put_contents($path, file_get_contents($video->path()));
                       $videodata = array("name" => "media",
                           "file" => $path);
                       $response = $helper->apiCallPostPublish($videodata, "upload/media?teamId=" . $team . "&privacy=0", true);

                       if ($response['statusCode'] == 200) {
                           //getting filename for
                           $publishImages[] = $response['data']['mediaDetails'][0]['media_url'];
                           File::Delete($videodata['file']);
                           Log::info("Deleted a file -> " . $videodata['file'] . " after sending file to api. Dated-> " . date('y/m/d'));
                       }

                   }
               }

               if ($request->sLink != '') {
                   //type link
                   $postType = "Link";
                   $linkMedia = $request->slink;
                   $postType = "Link";
                   if ((int)Session::get('user')['userDetails']->Activations->shortenStatus == 1) {
                       $shortenLinkResponse = $helper->apiCallGet("user/getShortenUrl?longurl=" . $linkMedia);
                       if ($shortenLinkResponse->code == 200) {
                           $linkMedia = $shortenLinkResponse->message->shortLink;
                       }
                   }
               }

//                $pin = array("accountId"=>0,
//                    "boardId"=>['2222']);
//                $pinD = json_encode($pin );


               //accounts array
               foreach ($accountType as $a) {

                   if ($a != "") {
                       $splitedAccData = explode('--', $a);
                       $oba = new \stdClass();
                       $oba->accountType = $splitedAccData[1];
                       $oba->accountId = $splitedAccData[0];
                       $accountDetail[] = ($oba);
                   }


               }
               //merge the already-uploaded and newly-uploaded file arrays
               if ($request->mediaUploaded !== null) {
                   $postType = "Image";
                   $array = array(json_decode($request->mediaUploaded));
                   $publishImages = array_merge($publishImages, ...$array);
               }
               Log::info("scheduling");
               if ($request->daywsiseChecked == 1) {
                   Log::info("Daywise scheduling");
                   $publishData['postInfo'] = array(
                       "postType" => $postType,
                       "description" => $request->sMessage,
                       "shareLink" => $linkMedia,
                       "mediaUrl" => $publishImages,
                       "postingSocialIds" => ($accountDetail),
                       "pinBoards" => $pinboardata,
                       "scheduleCategory" => ENV('DAYWISE_SCHEDULE'),
                       "teamId" => $team,
                       "moduleName" => $moduleName,
                       "moduleValues" => "",
                       "scheduleStatus" => (int)$postStatus,
                       "normalScheduleDate" => $timestamp,
                       "daywiseScheduleTimer" => ($timeDArray)
                   );

                   $publishresponse = $helper->apiCallPublishPut($publishData, "schedule/edit?scheduleId=".$request->scheduleId."&teamId=".$request->teamId);
                   Log::info("Daywise scheduling");
                   Log::info($publishresponse);

               }
               if ($request->normalChecked == 1) {
                   $publishData['postInfo'] = array(
                       "postType" => $postType,
                       "description" => $request->sMessage,
                       "shareLink" => $linkMedia,
                       "mediaUrl" => $publishImages,
                       "postingSocialIds" => ($accountDetail),
                       "pinBoards" => $pinboardata,
                       "scheduleCategory" => env('NORMAL_SCHEDULE'),
                       "teamId" => $team,
                       "moduleName" => $moduleName,
                       "moduleValues" => "",
                       "scheduleStatus" => (int)$postStatus,
                       "normalScheduleDate" => $timestamp,
                       "daywiseScheduleTimer" => ($timeDArray)
                   );

                   $publishresponse = $helper->apiCallPublishPut($publishData, "schedule/edit?scheduleId=".$request->scheduleId."&teamId=".$request->teamId);

                   Log::info("Normal scheduling");
                   Log::info($publishresponse);

               }
               if ($publishresponse['statusCode'] == 200 && $publishresponse['data']['code'] == 200 && $publishresponse['data']['status'] == "success") {
                   Log::info("Edited successful");
                   $result['code'] = 200;
                   $result['message'] = "Edited successfully";
                   $result['status'] = "success";
                   return $result;
               } else if ($publishresponse['data']['code'] == 400 && $publishresponse['data']['status'] == "failed") {
                   $result['code'] = 500;
                   $result['status'] = "failure";
                   $result['message'] = $publishresponse['data']['error'];
                   return ($result);
               } else {
                   $result['code'] = 500;
                   $result['status'] = "failure";
                   $result['message'] = $publishresponse['data']['error'];
                   return ($result);
               }
           } catch (\Exception $e) {
               Log::info("Schedule exception " . $e->getMessage() . " in file => " . $e->getFile() . " at line => " . $e->getLine());
               $result['code'] = 500;
               $result['status'] = "failure";
               $result['message'] = "Something went wrong.. Please try again later";
               return ($result);
           }

       }
    }

    public function schedule(Request $request)
    {
        if ($request->isMethod('get')) {

            return view('Schedule::schedule', [
                "socialAccount" => Session::get('currentTeam')['SocialAccount'],
                "pinterestBoards" => Session::get('pinterestBoards')
            ]);
        } else if ($request->isMethod('post')) {
            $helper = Helper::getInstance();
            $accountType = [];
            $publishData = [];
            $publishVideos = [];
            $timeDArray = [];
            $accountDetail = [];
            $linkMedia = "";
            $postType = "Text";
            $timestamp = "";
            $pinboardata=[];
            $privacy = env('POST_PRIVACY'); // default public

            $postStatus = $request->scheduleType;
            if($request->scheduleStatus == 1) $moduleName = "Schedule";
            elseif($request->scheduleStatus == 5) $moduleName = "Draft";
            if ($request->sMessage == "" && $request->sLink == "") {
                $result['code'] = 404;
                $result['status'] = "failure";
                $result['message'] = "Oops you forgot to provide message/link";
                return ($result);
            }
            $accountType = explode(",", $request["checked"]); //16--2 id--type

            $Days = explode(",", $request["selectDays"]);
            $publishImages = [];
//for checking if profiles selected are not
            if (count($accountType) == 1 && $accountType[0] == ""&&  $request->selectedBoards == "") {
                $result['code'] = 400;
                $result['status'] = "failure";
                $result['message'] = "Please select atleast 1 account.";
                return ($result);
            }

            if($request->selectedBoards != ""){
                if($request->mediaUploaded == "" && $request->imageName == ""){
                    $result['code']=400;
                    $result['status']="failure";
                    $result['message']="For posting on boards image and link is neccessdary";
                    return ($result);
                }
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
                        $data = explode('_',$baordsAcc[$i])[0]."--".env('PINTEREST');
                        array_push($accountType,$data);
                        $k++;
                        $j++;

                    }
                }

                for($m=0;$m<count($boardsData);$m++){
                    array_push($pinboardata,$boardsData[$m]);
                }


            }
            if ($request->daywsiseChecked == 1) {
                if ($request->dayWiseDateTime == null || count($Days) == 0) {
                    $result['code'] = 400;
                    $result['status'] = "failure";
                    $result['message'] = "For day-wise schedule, please provide day and time to schedule the post";
                    return ($result);
                } else {
                    $timestampDay = strtotime($request->dayWiseDateTime);
                    $timestampDay = gmdate("Y-m-d\TH:i:s.ms\Z", $timestampDay);
                    foreach ($Days as $day) {
                        $obt = new \stdClass();
                        $obt->dayId = (int)$day;
                        $obt->timings = (array)$timestampDay;
                        $timeDArray[] = $obt;
//                       $timeDArray[] = array("dayId"=>(int)$day,
//                           "timings"=>$timestampDay); // json encode this in daywiseScheduleTimer of schedule data
                    }

                }
            }
//            return json_encode($timeDArray);
            if ($request->normalChecked == 1) {
                if ($request->normalDateTime == null) {
                    $result['code'] = 400;
                    $result['status'] = "failure";
                    $result['message'] = "For normal schedule, please provide time to schedule the post";
                    return ($result);
                } else {
                    $timestamp = strtotime($request->normalDateTime);
                    $timestamp = gmdate("Y-m-d\TH:i:s.ms\Z", $timestamp);
                }
            }
            try {
                $team = Session::get('currentTeam')['team_id'];
               if ($request->hasFile('imageName')) {

                    //type image
                    if ($request->hasFile('videoupload')) {
                        $result['code'] = 400;
                        $result['status'] = "failure";
                        $result['message'] = "Please select only images or videos. Not both at a time";
                        return ($result);
                    }

                    //TODO image validation has to be done
                    foreach ($request->imageName as $image) {
                        if (substr($image->getMimeType(), 0, 5) == 'image') {
                            $postType = "Image";
                            $pathToStorage = storage_path("uploadimages");
                            if (!file_exists($pathToStorage))
                                mkdir($pathToStorage, 0777, true);
                            $publishimage = $image->getClientOriginalName();
                            $path = $pathToStorage . "/" . $publishimage;
                            Log::info("Publish file Path:" . $path);
                            file_put_contents($path, file_get_contents($image->path()));
                            $filedata = array("name" => "media",
                                "file" => $path);
                            $response = $helper->apiCallPostPublish($filedata, "upload/media?title=schedule&teamId=" . $team . "&privacy=".$privacy, true);
                            if ($response['statusCode'] == 200) {

                                //getting filename for
                                $publishImages[] = $response['data']['mediaDetails'][0]['media_url'];
                                File::Delete($filedata['file']);
                                Log::info("Deleted a file -> " . $filedata['file'] . " after sending file to api. Dated-> " . date('y/m/d'));
                            }


                        } else {
                            $result['code'] = 400;
                            $result['status'] = "failure";
                            $result['message'] = "Select only images or videos";
                            return ($result);
                        }
                    }
                } else if (isset($request->videoupload)) {
                    //type video
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

                if ($request->sLink != '') {
                    //type link
                    $postType = "Link";
                    $linkMedia = $request->slink;
                    $postType ="Link";
                    if((int)Session::get('user')['userDetails']->Activations->shortenStatus == 1){
                        $shortenLinkResponse = $helper->apiCallGet("user/getShortenUrl?longurl=".$linkMedia);
                        if($shortenLinkResponse->code == 200){
                            $linkMedia = $shortenLinkResponse->message->shortLink;
                        }
                    }
                }

//                $pin = array("accountId"=>0,
//                    "boardId"=>['2222']);
//                $pinD = json_encode($pin );


                //accounts array
                foreach ($accountType as $a) {

                    if($a != ""){
                        $splitedAccData = explode('--', $a);
                        $oba = new \stdClass();
                        $oba->accountType = $splitedAccData[1];
                        $oba->accountId = $splitedAccData[0];
                        $accountDetail[] = ($oba);
                    }


                }
                //merge the already-uploaded and newly-uploaded file arrays
                if ($request->mediaUploaded !== null) {
                    $postType = "Image";
                    $array = array(json_decode($request->mediaUploaded));
                    $publishImages = array_merge($publishImages, ...$array);
                }
                Log::info("scheduling");

                if($request->daywsiseChecked == 1){
                    Log::info("Daywise scheduling");
                    $publishData['postInfo'] = array(
                        "postType" => $postType,
                        "description" => $request->sMessage,
                        "shareLink" => $linkMedia,
                        "mediaUrl" => $publishImages,
                        "postingSocialIds" => ($accountDetail),
                        "pinBoards" => $pinboardata  ,
                        "scheduleCategory" => ENV('DAYWISE_SCHEDULE'),
                        "teamId" => $team,
                        "moduleName" => $moduleName,
                        "moduleValues" => "",
                        "scheduleStatus" => (int)$postStatus,
                        "normalScheduleDate" => $timestamp,
                        "daywiseScheduleTimer" => ($timeDArray)
                    );
                    $publishresponse = $helper->apiCallPostPublish($publishData, "schedule/create");
                    Log::info("Daywise scheduling");
                    Log::info($publishresponse);

                }
                    if($request->normalChecked == 1){
                    $publishData['postInfo'] = array(
                        "postType" => $postType,
                        "description" => $request->sMessage,
                        "shareLink" => $linkMedia,
                        "mediaUrl" => $publishImages,
                        "postingSocialIds" => ($accountDetail),
                        "pinBoards" => $pinboardata  ,
                        "scheduleCategory" => env('NORMAL_SCHEDULE'),
                        "teamId" => $team,
                        "moduleName" => $moduleName,
                        "moduleValues" => "",
                        "scheduleStatus" => (int)$postStatus,
                        "normalScheduleDate" => $timestamp,
                        "daywiseScheduleTimer" => ($timeDArray)
                    );
                    $publishresponse = $helper->apiCallPostPublish($publishData, "schedule/create");
                    Log::info("Normal scheduling");
                    Log::info($publishresponse);

                }


                if ($publishresponse['statusCode'] == 200 && $publishresponse['data']['code'] == 200 && $publishresponse['data']['status'] == "success") {

                    //if draft to schedule then delete the draft once scheduled.
                    if($request->draftToSchedule == 1) $responseDelete = $helper->apiCallPublishDelete("schedule/delete?scheduleId=".$request->scheduleId);

                    Log::info("SChedule successful");
                    $result['code'] = 200;
                    $result['message'] = "Scheduled successfully";
                    $result['status'] = "success";
                    return $result;
                } else if ($publishresponse['data']['code'] == 400 && $publishresponse['data']['status'] == "failed") {
                    $result['code'] = 500;
                    $result['status'] = "failure";
                    $result['message'] = $publishresponse['data']['error'];
                    return ($result);
                }else{
                    $result['code'] = 500;
                    $result['status'] = "failure";
                    $result['message'] = $publishresponse['data']['error'];
                    return ($result);
                }
            } catch (\Exception $e) {
                Log::info("Schedule exception " . $e->getMessage() . " in file => " . $e->getFile() . " at line => " . $e->getLine());
                $result['code'] = 500;
                $result['status'] = "failure";
                $result['message'] ="Something went wrong.. Please try again later";
                return ($result);
            }
        }
    }

    public function postHistory(Request $request){
        if($request->isMethod('get')){
            return view('Schedule::post_history');
        }
    }

    public function postDraftHistory(Request $request){
        if($request->isMethod('get')) return view('Schedule::post_draft_history');
    }

    public function getPostHistory(Request $request){
        try{
            $icon="";
            $helper = Helper::getInstance();
            $contents=[];
            $result=[];
            $socialId="";
            $publishresponse="";
            if($request->methods == 'socio' || $request->methods == "daywise"){
                $publishresponse = $helper->apiCallPublishGet("schedule/getScheduleDetailsByCategories?scheduleStatus=".$request->scheuleStatus."&scheduleCategory=".$request->scheduleCategory."&fetchPageId=".$request->pageId);

            }else if($request->methods == 'draft'){
                $publishresponse = $helper->apiCallPublishGet("schedule/getFilteredScheduleDetails?scheduleStatus=5&fetchPageId=".$request->pageId);
            }else if($request->methods == "history") {
                $publishresponse = $helper->apiCallPublishGet("schedule/getFilteredScheduleDetails?scheduleStatus=6&fetchPageId=" . $request->pageId);
            }
            if($publishresponse->code == 200){
                if(count($publishresponse->scheduleDetails) == count($publishresponse->postContents)){
                    $result['code']=200;
                    for($i=0; $i<count($publishresponse->scheduleDetails) ; $i++){
//            $contents[$i]['scheduleStatus'] = $publishresponse->postContents[$i]->scheduleStatus;
                        switch($publishresponse->scheduleDetails[$i]->schedule_status){
                            case 1:
                                $contents[$i]['scheduleStatus'] = "Ready queue";
                                $contents[$i]['cancel'] ='<a onclick="deleteSchedule('.$publishresponse->scheduleDetails[$i]->schedule_id.',1)" data-toggle="tooltip" title="Cancel schedule"><i class="fas fa-window-close"></i></a>';
                                $contents[$i]['edit'] ='<a href="'.env('APP_URL').'scheduleEdit?scheduleId='.$publishresponse->scheduleDetails[$i]->schedule_id.'&teamId='.$publishresponse->scheduleDetails[$i]->team_id.'"  title="Edit Schedule"><i class="fas fa-edit"></i></a>';
                                break;
                            case 2:
                                $contents[$i]['scheduleStatus'] = "Wait (pause) state";
                                $contents[$i]['cancel'] ="";
                                $contents[$i]['edit'] ='<a href="'.env('APP_URL').'scheduleEdit?scheduleId='.$publishresponse->scheduleDetails[$i]->schedule_id.'&teamId='.$publishresponse->scheduleDetails[$i]->team_id.'" title="Edit Schedule"><i class="fas fa-edit"></i></a>';
                                break;
                            case 3:
                                $contents[$i]['scheduleStatus'] = "Approval pending";
                                $contents[$i]['cancel'] ="";
                                $contents[$i]['edit'] ='<a href="'.env('APP_URL').'scheduleEdit?scheduleId='.$publishresponse->scheduleDetails[$i]->schedule_id.'&teamId='.$publishresponse->scheduleDetails[$i]->team_id.'" title="Edit Schedule"><i class="fas fa-edit"></i></a>';
                                break;
                            case 4:
                                $contents[$i]['scheduleStatus'] = "Rejected";
                                $contents[$i]['cancel'] ="";
                                $contents[$i]['edit'] ="";
                                break;
                            case 5:
                                $contents[$i]['scheduleStatus'] = "Draft";
                                $contents[$i]['cancel'] ="";
                                $contents[$i]['edit'] ='<a href="'.env('APP_URL').'scheduleEdit?scheduleId='.$publishresponse->scheduleDetails[$i]->schedule_id.'&teamId='.$publishresponse->scheduleDetails[$i]->team_id.'" title="Edit Schedule"><i class="fas fa-edit"></i></a>';
                                break;
                            case 6:
                                $contents[$i]['scheduleStatus'] = "Completed";
                                $contents[$i]['cancel'] ="";
                                $contents[$i]['edit'] ="";
                                break;
                            case 7:
                                $contents[$i]['scheduleStatus'] = "Canceled";
                                $contents[$i]['cancel'] ="";
                                $contents[$i]['edit'] ="";
                                break;
                        }
                        //info required from post contents
                        if($publishresponse->postContents[$i]->_id == $publishresponse->scheduleDetails[$i]->mongo_schedule_id){
                            $contents[$i]['message'] = $publishresponse->postContents[$i]->description;
                            foreach($publishresponse->postContents[$i]->postingSocialIds as $key=>$value){
//                return ($publishresponse->postContents[$i]->postingSocialIds);

                                switch($value->accountType ){
                                    case 1:
                                        $icon =     '<i class="fab fa-facebook-f"></i>';
                                        break;
                                    case 2:
                                        $icon =     '<i class="fab fa-facebook-f"></i>';
                                        break;
                                    case 3:
                                        $icon =     '<i class="fab fa-facebook-f"></i>';
                                        break;
                                    case 4:
                                        $icon =     '<i class="fab fa-twitter"></i>'; //twitter
                                        break;
                                    case 5:
                                        $icon =     '<i class="fab fa-instagram"></i>'; //instagram
                                        break;
                                    case 6:
                                        $icon =     ' <i class="fab fa-linkedin-in"></i>'; //LINKEDIN
                                        break;
                                    case 7:
                                        $icon =     ' <i class="fab fa-linkedin-in"></i>'; //LINKEDINCOMPANY
                                        break;
                                    case 9:
                                        $icon =     ' <i class="fab fa-youtube"></i>'; //youtube
                                        break;
                                    case 10:
                                        $icon =     '<i class="fas fa-chart-line"></i>'; //google analytics
                                        break;
                                    case 11:
                                        $icon =     '  <i class="fab fa-pinterest-p"></i>'; //pinterest
                                        break;

                                }
                                if($key == 0 ){
                                    $socialId = $icon;
                                }else{
                                    $socialId = $socialId."   ".$icon;
                                }
                            }
                            $contents[$i]['postingSocialIds'] = $socialId;
                        }


                        $contents[$i]['scheduleId'] = $publishresponse->scheduleDetails[$i]->schedule_id;
                        $contents[$i]['schedulername'] = $publishresponse->scheduleDetails[$i]->{"UserSchedule.name"};

                    }
                    $result['content'] = $contents;


                }
                else
                {
                    $result['code']= 400;
                    $result['message']="Something went wrong";
                    Log::info("Getting history scheduleDetails and  postContents  mismatch");
                }
            }else{
                $result['code']= 400;
                if(isset($publishresponse->error)){
                    $result['message']=$publishresponse->error;
                }else{
                    $result['message']=$publishresponse->message;
                }
                Log::info("Getting history scheduleDetails and  postContents  mismatch");
            }
            return ($result);

        }catch (\Exception $e){
            $result['code']= 400;
            $result['message']="Something went wrong";
            Log::info("Getting history error ".$e->getMessage()." @ ".$e->getLine());
            return ($result);
        }

    }

    public function scheduleEdit(Request $request){
        $helper = Helper::getInstance();
        $scheduleId = $request->scheduleId;
        $teamId = $request->teamId;
        $result[] = "";
        try{
            $response = $helper->apiCallPublishGet("schedule/getParticularScheduleDetails?scId=".$scheduleId);
            if($response->code == 200 ){
                $data = $response->data->postContents;
                $result['scheduleStatus'] = $data[0]->scheduleStatus;
                $result['postType'] = $data[0]->postType;
                $result['description'] = $data[0]->description;
                $result['shareLink'] = $data[0]->shareLink;
                $result['scheduleCategory'] = $data[0]->scheduleCategory;
                $result['teamId'] = $data[0]->teamId;
                $result['moduleName'] = $data[0]->moduleName;
                $result['normalScheduleDate'] = $data[0]->normalScheduleDate;
                $result['daywiseScheduleTimer'] = $data[0]->daywiseScheduleTimer;
                $result['ownerId'] = $data[0]->ownerId;
                $result['postingSocialIds'] = $data[0]->postingSocialIds;
                $result['pinBoards'] = $data[0]->pinBoards;
                $result['mediaUrl'] = $data[0]->mediaUrl;
                return view('Schedule::schedule_edit', [
                        "socialAccount" => Session::get('currentTeam')['SocialAccount'],
                        "pinterestBoards" => Session::get('pinterestBoards'),
                        "scheduleDetails" => $result,
                        "scheduleId" => $request->scheduleId
                    ]);
            }
            else return Redirect::back();

        }catch(\Exception $e){

        }


    }

    //post-now-draft
    public function getDraftHistory(Request $request){
        try{
            $icon="";
            $helper = Helper::getInstance();
            $contents=[];
            $result=[];
            $socialId="";
            $publishresponse="";
            if($request->methods == 'postHistory'){
                $team = Session::get('currentTeam')['team_id'];
                $publishresponse = $helper->apiCallPublishGet("publish/getDraftedPosts?teamId=".$team."&pageId=1");
            }


            if($publishresponse->code == 200){
            }else{
                $result['code']= 400;
                if(isset($publishresponse->error)){
                    $result['message']=$publishresponse->error;
                }else{
                    $result['message']=$publishresponse->message;
                }
                Log::info("Getting history scheduleDetails and  postContents  mismatch");
            }
            return ($result);

        }catch (\Exception $e){
            $result['code']= 400;
            $result['message']="Something went wrong";
            Log::info("Getting history error ".$e->getMessage()." @ ".$e->getLine());
            return ($result);
        }

    }

    public function scheduleAction(Request $request){
        $helper = Helper::getInstance();
        $data=[];
        $result=[];
        try{
            if($request->deleteAction == 0){ // delete schedule
                $publishresponse = $helper->apiCallPublishDelete("schedule/delete?scheduleId=".$request->scheduleId);

                if($publishresponse->code == 400){
                    $result['code']=400;
                    $result['message']="Could not delete schedule";
                    Log::info("schedule delete failed for schedule id".$request->scheduleId." because ".$publishresponse->error);

                }else if($publishresponse->code == 200){
                    $result['code']=200;
                    $result['message']="Deleted schedule";
                    Log::info("Schedule deleted for id ".$request->scheduleId );
                }

            }else if($request->deleteAction == 1){ // cancel schedule
                $publishresponse = $helper->apiCallPublishPut($data,"schedule/cancel?scheduleId=".$request->scheduleId);

                if($publishresponse['data']['code'] == 400){
                    $result['code']=400;
                    $result['message']=$publishresponse['data']['error'];
                    Log::info("schedule cancel failed for schedule id".$request->scheduleId." because ".$publishresponse['data']['error']);

                }else if($publishresponse['data']['code'] == 200){
                    $result['code']=200;
                    $result['message']="Canceled schedule";
                    Log::info("Schedule canceled for id ".$request->scheduleId );
                }
            }

         return $result;

        }catch (\Exception $e){

        }
    }

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
                   $result['totalSize']=$response->totalSize/1024/1024;
                   $result['usedSize']=$response->usedSize/1024/1024;
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



}
