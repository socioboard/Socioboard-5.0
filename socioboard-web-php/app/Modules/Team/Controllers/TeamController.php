<?php

namespace App\Modules\Team\Controllers;

use App\Modules\User\Helper;
use Http\Adapter\Guzzle6\Client;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;
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
//           dd($request->team_name);
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

    public function viewTeam($id)
    {
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
//                dd($allSocioAcc);
                if ($allSocioAcc->code == 200 && $allSocioAcc->status == "success") {
                    $profileAvailablecount = 1;

                    for ($l = 0; $l < count($allSocioAcc->profiles); $l++) {
                        for ($k = 0; $k < count($teamDetails['SocialAccount']); $k++) {
                            if ($allSocioAcc->profiles[$l]->account_id === $teamDetails['SocialAccount'][$k]->account_id) {
                                unset($allSocioAcc->profiles[$l]);
                                $allSocioAcc->profiles = array_values($allSocioAcc->profiles);
//                                dd($allSocioAcc->profiles);

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
            dd($e->getMessage());
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
//                dd($request->permission);
                $data = array("TeamId" => $id,
                    "Email" => $request->inviteUserMail,
                    "Permission" => 1
                );
                $help = Helper::getInstance();
                $response = $help->apiCallPost($data, 'team/invite?TeamId=' . $id . '&Email=' . $request->inviteUserMail . '&Permission=' .$data['Permission']);
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
//            dd($e->getMessage());
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
            $response = Helper::getInstance()->apiCallPost($data, "team/edit?TeamId=" . $request->teamId);
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
            'linkedin' => null,
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

                            }
                        }
                    }
                }

                return (object)$out;
            } else {
                return null;
            }
        } catch (\Exception $e) {
            dd($e->getMessage());
            return null;
        }

        return (object)$out;
    }





}
