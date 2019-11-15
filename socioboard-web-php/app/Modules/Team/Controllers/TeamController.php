<?php

namespace App\Modules\Team\Controllers;

use App\Modules\User\Helper;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

//

class TeamController extends Controller
{


    protected $client;
    protected $API_URL;

    public function __construct()
    {
        $this->client = new Client();
        $this->API_URL = env('API_URL') . env('VERSION') . '/';

    }

    public function createTeam(Request $request)
    {
        if ($request->isMethod('get')) {
            return view('Team::createView');
        } elseif ($request->isMethod('post')) {
            /*
             * 200 => success
             * 204 => team name required
             * 500 => exception
             * 400 => Team already exists*/
            $result = [];
            if ($request->team_name == "") {
                $result['code'] = 204;
                $result['message'] = "Team name is required";
                return $result;
            }
            $data['TeamInfo'] = array(
                "name" => $request->team_name,
                "description" => "NA",
                "logoUrl" => 'www.NA.com'
            );
            try {
                $help = Helper::getInstance();
                $response = $help->apiCallPost($data, 'team/create');
                if ($response['statusCode'] == 200 && $response['data']['code'] == 200 && $response['data']['status'] == "success") {
                    //creating new session
                    if (Session::has('team')) {
                        Session::forget('team');
                        $response = $help->apiCallGet("team/getDetails");
                        if ($response->code == 200 && $response->status == "success") {


                            for ($i = 0; $i < count($response->teamSocialAccountDetails); $i++) {
                                $teamDetails[] = $response->teamSocialAccountDetails[$i];
                            }

                            $team = array(
                                'teamSocialAccountDetails' => $response->teamSocialAccountDetails,
                                'teamMembers' => $response->teamMembers,
                                'memberProfileDetails' => $response->memberProfileDetails
                            );
                            Session::put('team', $team);
                            $team = Session::get('team', $team);
                        }

                    }
                    $result['code'] = 200;
                    $result['message'] = "Team created Successfully";
                    return $result;

                } elseif ($response['statusCode'] == 200 && $response['data']['code'] == 400 && $response['data']['status'] == "failed") {
                    $result['code'] = 400;
                    $result['message'] = " User has already team with same name!";
                    return $result;
                }
            } catch (\Exception $e) {
                Log::info("Exception " . $e->getCode() . " => " . $e->getLine() . " => " . $e->getMessage());
                $result['code'] = 500;
                $result['message'] = "Exception";
                return $result;
            }


        }
    }

    public function clearAddSession(){
        if(session()->has('youtubeChannels')) Session::forget('youtubeChannels');
    }

    public function viewTeam($id)
    {
        $help = Helper::getInstance();
        if (Session::has('team'))
        {
            Session::forget('team');
            $resp = $help->apiCallGet("team/getDetails");
            if ($resp->code == 200 && $resp->status == "success") {
//                        for ($i = 0; $i < count($response->teamSocialAccountDetails); $i++) {
//                            $teamDetails[] = $response->teamSocialAccountDetails[$i];
//                        }
                $team = array(
                    'teamSocialAccountDetails' => $resp->teamSocialAccountDetails,
                    'teamMembers' => $resp->teamMembers,
                    'memberProfileDetails' => $resp->memberProfileDetails
                );

                Session::put('team', $team);
                $teamSess = Session::get('team');

            }


        }



        $teamDefault = 0;
        $profileAvailablecount = 0;
        $teamDetails = [];
        $adminDetails = [];
        $profAvailable = [];
        $reindex = [];
        $teamMemberActivation = [];
        $admin = 0;
        if ($id == 1)// a default team
            $teamDefault = 1;
        $help = Helper::getInstance();
        try {
            $response = $help->apiCallGet('team/getTeamDetails?TeamId=' . $id);

            if ($response->code == 200 && $response->status == "success") {
                $teamDetails = (array)$response->teamSocialAccountDetails[0];
                $value = Session::get('team'); //team session

                //Logic for profiles available
                //complete team for this user
                for ($i = 0; $i < count($value['teamMembers']); $i++) {
                    for ($j = 0; $j < count($value['teamMembers'][$i]); $j++) {
                        //for team member activation rec
                        if ($value['teamMembers'][$i][$j]->team_id == $id) {
                            $teamMemberActivation = $value['teamMembers'][$i];
                            for ($m = 0; $m < count($value['memberProfileDetails']); $m++) {
                                for ($n = 0; $n < count($value['memberProfileDetails'][$m]); $n++) {
                                    for ($k = 0; $k < count($teamMemberActivation); $k++) {
                                        //for user profile details
                                        if ($value['memberProfileDetails'][$m][$n]->user_id == $teamMemberActivation[$k]->user_id) {
                                            $teamMemberActivation[$k]->first_name = $value['memberProfileDetails'][$m][$n]->first_name;
                                            $teamMemberActivation[$k]->profile = $value['memberProfileDetails'][$m][$n]->profile_picture;
                                            $teamMemberActivation[$k]->email = $value['memberProfileDetails'][$m][$n]->email;
                                        }
                                        //for admin details
                                        if ($value['memberProfileDetails'][$m][$n]->user_id == $teamDetails['team_admin_id']) {
                                            $adminDetails = array(
                                                "id" => $value['memberProfileDetails'][$m][$n]->user_id,
                                                "email" => $value['memberProfileDetails'][$m][$n]->email,
                                                "first_name" => $value['memberProfileDetails'][$m][$n]->first_name
                                            );
                                        }
                                    }
                                }
                            }
                        } else
                            break;
                    }
                }
                //Get all social acc
                $allSocioAcc = $help->apiCallGet('team/getSocialProfiles');
                if ($allSocioAcc->code == 200 && $allSocioAcc->status == "success") {
                    $profileAvailablecount = 1;

                    for ($l = 0; $l < count($allSocioAcc->profiles); $l++) {
                        for ($k = 0; $k < count($teamDetails['SocialAccount']); $k++) {
                            if ($allSocioAcc->profiles[$l]->account_id === $teamDetails['SocialAccount'][$k]->account_id) {
                                unset($allSocioAcc->profiles[$l]);
                                $allSocioAcc->profiles = array_values($allSocioAcc->profiles);

                                $l = 0;

                            }
                        }
                    }

                    $profAvailable = $allSocioAcc->profiles;
//                    $reindex = array_values($allSocioAcc->profiles);
                }
                return view('Team::viewTeam', ['defaultTeam' => $teamDefault,
                    'teamDetails' => $teamDetails,
                    'adminDetails' => $adminDetails,
                    'teamMemeberActivation' => $teamMemberActivation,
                    "profileAvailablecount" => $profileAvailablecount,
                    'profilesAvailable' => $profAvailable]);
            }
            return view('Team::viewTeam', ['defaultTeam' => $teamDefault, 'teamDetails' => $teamDetails, 'adminDetails' => $adminDetails]);
        } catch (\Exception $e) {
            Log::info("Exception in team view" . $e->getCode() . " => " . $e->getLine() . " => " . $e->getMessage());
            return view('Team::viewTeam', ['defaultTeam' => "", 'teamDetails' => [], 'adminDetails' => []]);
        }
    }


    public function withdrawInvitation(Request $request)
    {

        $result = [];
        $help = Helper::getInstance();
        try {
            $data = explode('+', $request->data);
//            team/withdrawInvitation?EmailId=aishwarya%40globussoft.in&TeamId=21
            $response = $help->apiDelete("team/withdrawInvitation?EmailId=" . $data[0] . "&TeamId=" . $data[1]);

            if ($response->code == 200 && $response->status == "success") {
                $team = Helper::getInstance()->getTeamNewSession();
                $result['message'] = "Invitation withdrawn";
                $result['code'] = 200;
                return $result;

            } else if ($response->code == 400 && $response->status == "failure") {
                $result['code'] = 400;
                $result['message'] = "Not able to decline invitation";
                return json_encode($result);
            }
        } catch (\Exception $e) {
            Log::info("Exception " . $e->getCode() . "=>" . $e->getMessage() . "=>" . $e->getMessage());
            $result['code'] = 500;
            $result['message'] = "Something went wrong.";
            return $result;
        }
    }


    //remove-member
    public function removeMember(Request $request)
    {
        $result = [];
        $help = Helper::getInstance();
        try {
            $data = explode('+', $request->data);
            $response = $help->apiDelete("team/removeTeamMember?memberId=" . $data[2] . "&TeamId=" . $data[1]);
            if ($response->code == 200 && $response->status == "success") {
                $team = Helper::getInstance()->getTeamNewSession();
                $result['message'] = "Removed ";
                $result['code'] = 200;
                return $result;
            } else if ($response->code == 400 && $response->status == "failure") {
                $result['code'] = 400;
                $result['message'] = "Not able to remove member";
                return json_encode($result);
            }
        } catch (\Exception $e) {
            Log::info("Exception " . $e->getCode() . "=>" . $e->getMessage() . "=>" . $e->getMessage());
            $result['code'] = 500;
            $result['message'] = "Something went wrong.";
            return $result;
        }
    }


    //leave-team
    public function leaveTeam(Request $request)
    {
        $result = [];
        $help = Helper::getInstance();
        try {
            $data = explode('+', $request->data);
            $response = $help->apiPostLeave("team/leave?TeamId=" . (int)$data[1]);
            if ($response->code == 200 && $response->status == "success") {
                $team = $help->getTeamNewSession();
                $help->getTeamNewSession();
                $result['message'] = "Left team";
                $result['code'] = 200;
                $result['owner'] = Session::get('ownerTeamId');
                return $result;
            } else if ($response->code == 400 && $response->status == "failure") {
                $result['code'] = 400;
                $result['message'] = "Not able to leave team currently";
                return json_encode($result);
            }
        } catch (\Exception $e) {
            Log::info("Exception " . $e->getCode() . "=>" . $e->getMessage() . "=>" . $e->getMessage());
            $result['code'] = 500;
            $result['message'] = "Something went wrong.";
            return $result;
        }
    }


    public function deleteTeam(Request $request)
    {
        $result = [];
        $response = [];
        try {
            $help = Helper::getInstance();
            $response = $help->apiDelete('team/delete?TeamId=' . $request->teamId);
            if ($response->code == 400 && $response->status = "failed") {
                $result['code'] = 400;
                $result['message'] = "Access denied.. You cannot delete this team";
                return $result;
            } else if ($response->code == 200 && $response->status == "success") {
                if (Session::has('team')) {
                    Session::forget('team');
                    $response = $help->apiCallGet("team/getDetails");
                    if ($response->code == 200 && $response->status == "success") {
                        for ($i = 0; $i < count($response->teamSocialAccountDetails); $i++) {
                            $teamDetails[] = $response->teamSocialAccountDetails[$i];
                        }


                        $team = array(
                            'teamSocialAccountDetails' => $response->teamSocialAccountDetails,
                            'teamMembers' => $response->teamMembers,
                            'memberProfileDetails' => $response->memberProfileDetails
                        );
                        Session::put('team', $team);
                        $team = Session::get('team', $team);
                    }
                }

                $result['code'] = 200;
                $result['message'] = "Team deleted successfully";
                return $result;
            }
        } catch (\Exception $e) {
            Log::info("Exception " . $e->getCode() . "=>" . $e->getMessage() . "=>" . $e->getMessage());
            $result['code'] = 500;
            $result['message'] = "Something went wrong.";
            return $result;
        }

    }

    public function inviteTeam(Request $request, $id)
    {
        /*
         * 200 =>success
         * 400=>access denied, email not found
         * 500 => exception
         * */
        $rules = array(
            "inviteUserMail" => 'required|email'
        );
        try {
            $customMessage = [
                'inviteUserMail.email' => 'Email id is not vslid',
                'inviteUserMail.required' => 'Please enter your mail id!'
            ];
            $validator = Validator::make($request->all(), $rules, $customMessage);
            if ($validator->fails()) {
                return Response::json(array(
                    'code' => 202,
                    'success' => false,
                    'errors' => $validator->getMessageBag()->toArray()
                ), 202);
            } else {
                $data = array("TeamId" => $id,
                    "Email" => $request->inviteUserMail,
                    "Permission" => 1
                );
                $help = Helper::getInstance();
                $response = $help->apiCallPost($data, 'team/invite?TeamId=' . $id . '&Email=' . $request->inviteUserMail . '&Permission=' . $data['Permission']);
                if ($response['statusCode'] == 200 && $response['data']['code'] == 200 && $response['data']['status'] == "success") {
                    //TODO sending notification
                    $team = Helper::getInstance()->getTeamNewSession();
                    $result['code'] = 200;
                    $result['message'] = "Invitation sent!";
                    return $result;
                } else if ($response['data']['code'] == 400 && $response['data']['status'] == "failed") {

                    $result['code'] = 400;
                    $result['message'] = $response['data']['error'];
                    return $result;
                } else {
                    $result['code'] = 500;
                    $result['message'] = "Something went wrong";
                    return $result;
                }
            }
        } catch (\Exception $e) {
            Log::info("Exception " . $e->getCode() . "=> " . $e->getLine() . "=>" . $e->getMessage());
            $result['code'] = 500;
            $result['message'] = "Something went wrong";
            return $result;

        }
    }


    public function addToOtherTeam(Request $request)
    {
        $data = [];
        $help = Helper::getInstance();
        $response = $help->apiCallPost($data, 'team/addOtherTeamAccount?AccountId=' . $request->accountId . "&TeamId=" . $request->teamId);
        return $response;
        //TODO check cases
    }

    public function deleteTeamSocialProfile(Request $request){
        $data = [];
        $helper = Helper::getInstance();
        $response = $helper->apiDelete("team/deleteTeamSocialProfile?AccountId=".$request->accountId."&TeamId=".$request->teamId);
        return $response;
    }



    public function editteam(Request $request)
    {

        $teamInfo = array(
            "name" => $request->teamName,
            "description" => $request->teamDesc,
            "logoUrl" => "www.NA.com"
        );
        $data['TeamInfo'] = $teamInfo;
//200 => success, 400=> Not able to edit team currently, 500=> Something went wrong from our side:(
        try {
            $response = Helper::getInstance()->apiCallPost($data, "team/edit?TeamId=" . session()->get('currentTeam')['team_id']);
            if ($response['statusCode'] == 200 && $response['data']['code'] == 200 && $response['data']['status'] == "success") {
                $team = Helper::getInstance()->getTeamNewSession();
                $result['code'] = 200;
                $result['message'] = "Team has been edited successfully";
                return $result;
            } else if ($response['data']['code'] == 400 && $response['data']['status'] == "failure") {
                $result['code'] = 400;
                $result['message'] = "Not able to edit team currently";
                return $result;
            }
        } catch (\Exception $e) {
            $result['code'] = 500;
            $result['message'] = "Something went wrong from our side:(";
            return $result;
            return $e->getMessage();
        }


        return json_encode($data);
    }

//    public function acceptInvitation(Request $request)
//    {
//        $help = Helper::getInstance();
//        $result = [];
//        if ($request->isMethod('GET')) {
//            $response = $help->apiCallGet("team/getTeamInvitations");
//            if ($response->code == 200 || $response->status == "success") {
//
//                if ($response->teamDetails != null)
//                    return view('User::dashboard.AcceptInvitation', ['invite' => $response->teamDetails[0]]);
//                else
//                    return view('User::dashboard.AcceptInvitation', ['invite' => ""]);
//            }
//            return view('User::dashboard.AcceptInvitation', ['invite' => ""]);
//        } else if ($request->isMethod('POST')) {
//            $TeamId = array('TeamId' => (int)$request->teamid);
//            try {
//                $response = $help->apiCallPost($TeamId, "team/acceptInvitation?TeamId=" . $request->teamid, false, true);
//            } catch (\Exception $e) {
//                $result['code'] = 500;
//                $result['message'] = "Something went wrong..Not able to accept invitation";
//                return json_encode($result);
//            }
//            if ($response['statusCode'] == 200 && $response['data']['code'] == 200 && $response['data']['status'] == "success") {
//                $message = $response['data']['message'];
//                $result['code'] = 200;
//                return $result;
//
//            } else if ($response['data']['code'] == 400 && $response['data']['status'] == "failure") {
//                $result['code'] = 400;
//                $result['message'] = "Not able to accept invitation";
//                return json_encode($result);
//            }
//
//        }
//    }
    public function acceptInvitation(Request $request)
    {
        $help = Helper::getInstance();
        $result = [];
        if ($request->isMethod('GET')) {
            $response = $help->apiCallGet("team/getTeamInvitations");
            if ($response->code == 200 || $response->status == "success") {

                if ($response->teamDetails != null)
                    return view('User::dashboard.AcceptInvitation', ['invite' => $response->teamDetails[0]]);
                else
                    return view('User::dashboard.AcceptInvitation', ['invite' => ""]);
            }
            return view('User::dashboard.AcceptInvitation', ['invite' => ""]);
        } else if ($request->isMethod('POST')) {
            $TeamId = array('TeamId' => (int)$request->teamid);
            try {
                $response = $help->apiCallPost($TeamId, "team/acceptInvitation?TeamId=" . $request->teamid, false, true);
            } catch (\Exception $e) {
                $result['code'] = 500;
                $result['message'] = "Something went wrong..Not able to accept invitation";
                return json_encode($result);
            }
            if ($response['statusCode'] == 200 && $response['data']['code'] == 200 && $response['data']['status'] == "success") {
                $message = $response['data']['message'];
                $result['code'] = 200;



                if (Session::has('team')) {
                    Session::forget('team');
                    $response = $help->apiCallGet("team/getDetails");
                    if ($response->code == 200 && $response->status == "success") {
//                        for ($i = 0; $i < count($response->teamSocialAccountDetails); $i++) {
//                            $teamDetails[] = $response->teamSocialAccountDetails[$i];
//                        }
                        $team = array(
                            'teamSocialAccountDetails' => $response->teamSocialAccountDetails,
                            'teamMembers' => $response->teamMembers,
                            'memberProfileDetails' => $response->memberProfileDetails
                        );
                        Session::put('team', $team);
                        $teamSess = Session::get('team');


                    }


                }








//                $teamMemeberActivation->invitation_accepted = true;
                return $result;

            } else if ($response['data']['code'] == 400 && $response['data']['status'] == "failure") {
                $result['code'] = 400;
                $result['message'] = "Not able to accept invitation";
                return json_encode($result);
            }

        }
    }
    public function declineInvitation(Request $request)
    {
        $help = Helper::getInstance();
        $result = [];
        $TeamId = array('TeamId' => (int)$request->teamid);
        try {
            $response = $help->apiCallPost($TeamId, "team/declineTeamInvitation?TeamId=" . $request->teamid, false, true);
            if ($response['statusCode'] == 200 && $response['data']['code'] == 200 && $response['data']['status'] == "success") {
                $message = "Invitation declined";
                $result['code'] = 200;
                return $result;

            } else if ($response['data']['code'] == 400 && $response['data']['status'] == "failure") {
                $result['code'] = 400;
                $result['message'] = "Not able to decline invitation";
                return json_encode($result);
            }
        } catch (\Exception $e) {
            $result['code'] = 500;
            $result['message'] = "";

        }
    }

    public static function getAllSocialAccounts()
    {
        //$fb = new FacebookController();
        //$tw = new TwitterController();


        $out = array(
            'facebook' => null,
            'twitter' => null,
            //'linkedin' => null,
            'pinterest' => null,
        );

        /*
        $out['facebook'] = $fb->viewProfiles();
        $out['twitter'] = $tw->viewProfiles();
        $out['linkedin'] = null;
        $out['pinterest'] = null;
        */
        //echo '<pre>'.print_r($out).'</pre>';

        $help = Helper::getInstance();
        $out = null;

        try {
            //Get all social acc
            $allSocioAcc = $help->apiCallGet('team/getDetails');
            //

            if ($allSocioAcc->code == 200 && $allSocioAcc->status == "success") {

                foreach ($allSocioAcc->teamSocialAccountDetails as $i) {
                    foreach ($i as $j) {
                        foreach ($j->SocialAccount as $profile) {

                            if ($profile->join_table_teams_social_accounts->is_account_locked != true) { // if non-locked

                                // Facebook
                                if ($profile->account_type == 1 or $profile->account_type == 2) {
                                    $out['facebook'][] = $profile;
                                }

                                // if Twitter profile
                                if ($profile->account_type == 4) {
                                    $out['twitter'][] = $profile;
                                }


                                // if Instagam profile
                                /*
                                if ($profile->account_type == 5) {
                                    $out['instagram'][] = $profile;
                                }
                                */

                                // if Pinterest
                                if ($profile->account_type == 11) {
                                    $out['pinterest'][] = $profile;
                                }


                            }
                        }
                    }
                }

                return (object)$out;
            } else {
                return null;
            }
        } catch (\Exception $e) {
            return null;
        }

        return (object)$out;
    }


    public static function getAccountInfoById($account_id)
    {
        $out = null;
        foreach (Session::get('currentTeam')['SocialAccount'] as $acc) {
            if ($acc->account_id == $account_id) {
                $out = $acc;
            }
        }
        return $out;
    }


    public static function getProfileInfo($account_id, $account_type)
    {
        $help = Helper::getInstance();
        $socialAccs = Session::get('currentTeam');
        $team_id = $socialAccs['team_id'];

        // included function to get stats
        //To specify the account type 1-Facebook, 2-FacebookPage,3-FacebookGroup,4-Twitter,5-Instagram,6-Linkedin,7-LinkedinBusiness,8-GooglePlus,9-Youtube,10-GoogleAnalytics
        function getAccAdditionalInfo($statsArr, $account_id)
        {
            $out = array();
            if (sizeof($statsArr) > 0) {
                foreach ($statsArr as $row) {
                    $out = null;
                    if ($row->account_id == $account_id) {
                        $out = $row;
                    }
                }
            }
            return (array)$out;
        }

        ;

        function accMainInfo($account_id, $response)
        {
            $r = array(); // result
            $value = Session::get('currentTeam')['SocialAccount'];
            for ($i = 0; $i < count($value); $i++) {
                if ($value[$i]->account_id == $account_id) {
                    $out[$i] = array_merge(
                        (array)$value[$i],
                        getAccAdditionalInfo($response->SocialAccountStats, $account_id)
                    );
                }
            }

            foreach ($out as $row) {
                $r[] = $row;
            }
            return $r;
        }

        ;


        try {
            $response = $help->apiCallGet("team/getTeamDetails?TeamId=" . $team_id);

            if ($response->code == 200 && $response->status == "success") {
                $profileData = accMainInfo($account_id, $response)[0];
                $profileData['items'] = accMainInfo($account_id, $response);
            }
        } catch (\Exception $e) {
            Log::error('Exception' . $e->getCode() . " @=> " . $e->getLine() . " message=> " . $e->getMessage());
            return Redirect::back()->withErrors(['Not able to add tour account']);
        }
        return (object)$profileData;
    }


    public static function getControllerInstance($socialNetwork)
    {
        switch ($socialNetwork) {
            case 'facebook':
                $controllerInstance = new \App\Modules\Team\Controllers\FacebookController();
                break;
            case 'twitter':
                $controllerInstance = new \App\Modules\Team\Controllers\TwitterController();
                break;
            case 'instagram':
                $controllerInstance = new \App\Modules\Team\Controllers\InstagramController();
                break;
            case 'pinterest':
                $controllerInstance = new \App\Modules\Team\Controllers\PinterestController();
                break;

            default:
                return json_encode(['error' => 'no social network selected']);
        }
        return $controllerInstance;
    }


    //
    public static function showErrorPage($e, $linkArr = ['link' => '/', 'message' => 'Back to home page'])
    {


        Log::error('Exception' . $e->getCode() . " @=> " . $e->getLine() . " message=> " . $e->getMessage());

        return view('Team::message',
            [
                'status' => 'error',
                'descr' => $e->getMessage() . ' in ' . $e->getFile() . ', line ' . $e->getLine(),
                'code' => $e->getCode(),
                'message' => '<textarea>' . $e->getTraceAsString() . '</textarea>',
                //'message' => '<pre>'.print_r(get_class_methods($e),true).'</pre>',
                'action_link' => $linkArr['link'],
                'action_title' => $linkArr['message'],
            ]
        );
    }


// re-share
    public static function publishPost($request)
    {
        $help = Helper::getInstance();
        $result = null;

        $params = [
            "postType" => "Text",
            "message" => @$request->input('message'),
            "mediaPaths" => $request->input('mediaPaths'),
            "link" => $request->input('link'),
            "accountIds" => array_unique(array_merge((array)$request->input('accountIds'), array((integer)$request->input('accountId')))),
            "postStatus" => 1,
            //'accountId' => $request->input('accountId'),
            //'teamId' => (integer)Session::get('currentTeam')['team_id'],
        ];

        $accountsArr = (array_unique(array_merge((array)$request->input('accountIds'), array((integer)$request->input('accountId')))));
        $boardsArr = array_filter((array)$request->input('boardIds'), function ($var) {
            return !is_null($var);
        }); // deleted null values

        foreach ($accountsArr as $account) {

            if (null !== self::getAccountInfoById($account) && (integer)self::getAccountInfoById($account)->account_type == 11 && is_array($boardsArr)) {// if Pinterest

                $boardIds = [];
                foreach ($boardsArr as $boardId) {
                    $boardIds[] = $boardId;
                };

                $params['pinBoards'][] = [
                    "accountId" => $account,
                    "boardId" => $boardIds,
                ];

                unset($boardIds);
            }

        }

        try {
            //Get all social acc
            $url = "publish/publishPosts?teamId=" . (integer)Session::get('currentTeam')['team_id'];

            $apiResponse = (object)$help->apiCallPostPublish($params, $url, false, 'POST');

            if ($apiResponse->statusCode == 200 && $apiResponse->data['code'] == 200) {
                $data = (object)$apiResponse->data;
                // try this row with data!
                return json_encode(['status' => $data->status, 'message' => $data->message]);
            } else { // error
                $data = (object)$apiResponse->data;
                return json_encode(['status' => $data->status, 'message' => $data->error]);
            }

        } catch (\Exception $e) {
            return json_encode(['status' => '666', 'message' => $e->getMessage()]);

        }
    }


// converts from rfc-2397 to raw file data
    /*
    function convertFile($content)
    {
        $fileContent = substr($content, 7 + strpos($content, 'base64'));
        $fileContent = base64_decode($fileContent);
        return $fileContent;
    }
    */


    public
    static function uploadMedia(Request $request)
    {
        $helper = Helper::getInstance();
        $team_id = (integer)Session::get('currentTeam')['team_id'];

        if (null !== $request->input('src')) // external link
        {
            //echo 'processing external file '.$request->input('src');
            // for HTTPS you smust change settings in nginx.conf !!!
            $content = file_get_contents($request->input('src'));
            $finfo = new \finfo(FILEINFO_MIME_TYPE);
            $extension = self::mime2ext($finfo->buffer($content));

            $path = '\public\\' . date('Y-m') . '\\' . time() . '_' . rand(1000, 9999) . '.' . $extension;
            $fileContent = $content;
        } else { // POST file uploading
            $content = $request->input('content');
            $path = '\public\\' . date('Y-m') . '\\' . time() . '_' . rand(1000, 9999) . '.' . pathinfo($request->input('name'), PATHINFO_EXTENSION);

            // converts from rfc-2397 to raw file data
            $fileContent = substr($content, 7 + strpos($content, 'base64'));
            $fileContent = base64_decode($fileContent);
        }

        try {
            // save file to storage
            Storage::put($path, $fileContent);
            $filePath = storage_path() . '\app' . $path;

            if (file_exists($filePath)) {//file exists
                // call API to upload file
                $paramsArr = ["name" => "media", "file" => $filePath];
                $paramsStr = "upload/media?title=just_required_field_called_upload_title&teamId=" . $team_id . "&privacy=3";

                // https://nodepublish.socioboard.com/v1/upload/media?title=ewewrrwerwe&teamId=8&privacy=0
                $apiResponse = (object)$helper->apiCallPostPublish($paramsArr, $paramsStr, true);

                if ($apiResponse->statusCode == 200) {
                    $data = (object)$apiResponse->data;
                    if ($data->code == 200 && $data->status == "success") {
                        // try this row with data!
                        $fileDetails = (object)$data->mediaDetails[0];
                        Storage::delete($path);
                        Log::info("Deleted a file -> " . $path . " after sending file to api with path " . $fileDetails->media_url . '');
                        return json_encode([
                            'status' => $data->status,
                            'path' => $fileDetails->media_url,
                            'thumbnail' => $fileDetails->thumbnail_url,
                            'localFileId' => $request->input('name'),
                        ]);
                    } else {
                        return json_encode(['status' => $data->status, 'message' => $data->error]);
                    }
                } else {
                    return json_encode(['status' => 'error', 'message' => 'response status code ' + $apiResponse->statusCode]);
                }
            } else {
                // echo 'file is absent';
                return json_encode(['status' => 'error', 'message' => 'trying to upload unexistent file']);
            };


        } catch (\Exception $e) {
            return null;
        }
    }

    private static function mime2ext($mime)
    {
        $mime_map = [
            'video/3gpp2' => '3g2',
            'video/3gp' => '3gp',
            'video/3gpp' => '3gp',
            'application/x-compressed' => '7zip',
            'audio/x-acc' => 'aac',
            'audio/ac3' => 'ac3',
            'application/postscript' => 'ai',
            'audio/x-aiff' => 'aif',
            'audio/aiff' => 'aif',
            'audio/x-au' => 'au',
            'video/x-msvideo' => 'avi',
            'video/msvideo' => 'avi',
            'video/avi' => 'avi',
            'application/x-troff-msvideo' => 'avi',
            'application/macbinary' => 'bin',
            'application/mac-binary' => 'bin',
            'application/x-binary' => 'bin',
            'application/x-macbinary' => 'bin',
            'image/bmp' => 'bmp',
            'image/x-bmp' => 'bmp',
            'image/x-bitmap' => 'bmp',
            'image/x-xbitmap' => 'bmp',
            'image/x-win-bitmap' => 'bmp',
            'image/x-windows-bmp' => 'bmp',
            'image/ms-bmp' => 'bmp',
            'image/x-ms-bmp' => 'bmp',
            'application/bmp' => 'bmp',
            'application/x-bmp' => 'bmp',
            'application/x-win-bitmap' => 'bmp',
            'application/cdr' => 'cdr',
            'application/coreldraw' => 'cdr',
            'application/x-cdr' => 'cdr',
            'application/x-coreldraw' => 'cdr',
            'image/cdr' => 'cdr',
            'image/x-cdr' => 'cdr',
            'zz-application/zz-winassoc-cdr' => 'cdr',
            'application/mac-compactpro' => 'cpt',
            'application/pkix-crl' => 'crl',
            'application/pkcs-crl' => 'crl',
            'application/x-x509-ca-cert' => 'crt',
            'application/pkix-cert' => 'crt',
            'text/css' => 'css',
            'text/x-comma-separated-values' => 'csv',
            'text/comma-separated-values' => 'csv',
            'application/vnd.msexcel' => 'csv',
            'application/x-director' => 'dcr',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => 'docx',
            'application/x-dvi' => 'dvi',
            'message/rfc822' => 'eml',
            'application/x-msdownload' => 'exe',
            'video/x-f4v' => 'f4v',
            'audio/x-flac' => 'flac',
            'video/x-flv' => 'flv',
            'image/gif' => 'gif',
            'application/gpg-keys' => 'gpg',
            'application/x-gtar' => 'gtar',
            'application/x-gzip' => 'gzip',
            'application/mac-binhex40' => 'hqx',
            'application/mac-binhex' => 'hqx',
            'application/x-binhex40' => 'hqx',
            'application/x-mac-binhex40' => 'hqx',
            'text/html' => 'html',
            'image/x-icon' => 'ico',
            'image/x-ico' => 'ico',
            'image/vnd.microsoft.icon' => 'ico',
            'text/calendar' => 'ics',
            'application/java-archive' => 'jar',
            'application/x-java-application' => 'jar',
            'application/x-jar' => 'jar',
            'image/jp2' => 'jp2',
            'video/mj2' => 'jp2',
            'image/jpx' => 'jp2',
            'image/jpm' => 'jp2',
            'image/jpeg' => 'jpeg',
            'image/pjpeg' => 'jpeg',
            'application/x-javascript' => 'js',
            'application/json' => 'json',
            'text/json' => 'json',
            'application/vnd.google-earth.kml+xml' => 'kml',
            'application/vnd.google-earth.kmz' => 'kmz',
            'text/x-log' => 'log',
            'audio/x-m4a' => 'm4a',
            'audio/mp4' => 'm4a',
            'application/vnd.mpegurl' => 'm4u',
            'audio/midi' => 'mid',
            'application/vnd.mif' => 'mif',
            'video/quicktime' => 'mov',
            'video/x-sgi-movie' => 'movie',
            'audio/mpeg' => 'mp3',
            'audio/mpg' => 'mp3',
            'audio/mpeg3' => 'mp3',
            'audio/mp3' => 'mp3',
            'video/mp4' => 'mp4',
            'video/mpeg' => 'mpeg',
            'application/oda' => 'oda',
            'audio/ogg' => 'ogg',
            'video/ogg' => 'ogg',
            'application/ogg' => 'ogg',
            'application/x-pkcs10' => 'p10',
            'application/pkcs10' => 'p10',
            'application/x-pkcs12' => 'p12',
            'application/x-pkcs7-signature' => 'p7a',
            'application/pkcs7-mime' => 'p7c',
            'application/x-pkcs7-mime' => 'p7c',
            'application/x-pkcs7-certreqresp' => 'p7r',
            'application/pkcs7-signature' => 'p7s',
            'application/pdf' => 'pdf',
            'application/octet-stream' => 'pdf',
            'application/x-x509-user-cert' => 'pem',
            'application/x-pem-file' => 'pem',
            'application/pgp' => 'pgp',
            'application/x-httpd-php' => 'php',
            'application/php' => 'php',
            'application/x-php' => 'php',
            'text/php' => 'php',
            'text/x-php' => 'php',
            'application/x-httpd-php-source' => 'php',
            'image/png' => 'png',
            'image/x-png' => 'png',
            'application/powerpoint' => 'ppt',
            'application/vnd.ms-powerpoint' => 'ppt',
            'application/vnd.ms-office' => 'ppt',
            'application/msword' => 'ppt',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation' => 'pptx',
            'application/x-photoshop' => 'psd',
            'image/vnd.adobe.photoshop' => 'psd',
            'audio/x-realaudio' => 'ra',
            'audio/x-pn-realaudio' => 'ram',
            'application/x-rar' => 'rar',
            'application/rar' => 'rar',
            'application/x-rar-compressed' => 'rar',
            'audio/x-pn-realaudio-plugin' => 'rpm',
            'application/x-pkcs7' => 'rsa',
            'text/rtf' => 'rtf',
            'text/richtext' => 'rtx',
            'video/vnd.rn-realvideo' => 'rv',
            'application/x-stuffit' => 'sit',
            'application/smil' => 'smil',
            'text/srt' => 'srt',
            'image/svg+xml' => 'svg',
            'application/x-shockwave-flash' => 'swf',
            'application/x-tar' => 'tar',
            'application/x-gzip-compressed' => 'tgz',
            'image/tiff' => 'tiff',
            'text/plain' => 'txt',
            'text/x-vcard' => 'vcf',
            'application/videolan' => 'vlc',
            'text/vtt' => 'vtt',
            'audio/x-wav' => 'wav',
            'audio/wave' => 'wav',
            'audio/wav' => 'wav',
            'application/wbxml' => 'wbxml',
            'video/webm' => 'webm',
            'audio/x-ms-wma' => 'wma',
            'application/wmlc' => 'wmlc',
            'video/x-ms-wmv' => 'wmv',
            'video/x-ms-asf' => 'wmv',
            'application/xhtml+xml' => 'xhtml',
            'application/excel' => 'xl',
            'application/msexcel' => 'xls',
            'application/x-msexcel' => 'xls',
            'application/x-ms-excel' => 'xls',
            'application/x-excel' => 'xls',
            'application/x-dos_ms_excel' => 'xls',
            'application/xls' => 'xls',
            'application/x-xls' => 'xls',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' => 'xlsx',
            'application/vnd.ms-excel' => 'xlsx',
            'application/xml' => 'xml',
            'text/xml' => 'xml',
            'text/xsl' => 'xsl',
            'application/xspf+xml' => 'xspf',
            'application/x-compress' => 'z',
            'application/x-zip' => 'zip',
            'application/zip' => 'zip',
            'application/x-zip-compressed' => 'zip',
            'application/s-compressed' => 'zip',
            'multipart/x-zip' => 'zip',
            'text/x-scriptzsh' => 'zsh',
        ];

        return isset($mime_map[$mime]) ? $mime_map[$mime] : false;
    }

}
