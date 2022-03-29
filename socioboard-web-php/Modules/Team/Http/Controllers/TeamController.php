<?php

namespace Modules\Team\Http\Controllers;

use App\ApiConfig\ApiConfig;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Modules\Team\Http\Requests\ModalTeamRequest;
use Illuminate\Routing\Controller;
use Modules\Team\Http\Requests\CreatTeamRequest;
use Illuminate\Support\Facades\Session;
use Modules\User\helper;
use Exception;

class TeamController extends Controller
{
    protected $helper;

    public function __construct()
    {
        $this->helper = Helper::getInstance();
    }

    public function viewTeams()
    {
        $apiUrl = ApiConfig::get('/team/get-details');
        try {
            $response = $this->helper->postApiCallWithAuth('get', $apiUrl);
            if ($response['code'] === 200) {
                $responseData = $this->helper->responseHandler($response['data']);

                return view('team::view_teams')->with(["accounts" => $responseData]);
            } else {
                return view('team::view_teams')->with(["ErrorMessage" => 'Can not complete the process, please reload page']);
            }
        } catch (Exception $e) {
            $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'viewTeams() {TeamController}');
        }
    }

    public function teamView($id)
    {
        $teamName = '';
        $teamLogo = '';

        try {
            $apiUrl = ApiConfig::get('/team/get-team-details?teamId=' . $id);
            $response = $this->helper->postApiCallWithAuth('get', $apiUrl);
            if ($response['data']->code === 200) {
                $teamName = $response['data']->data->teamSocialAccountDetails[0]->team_name;
                $teamLogo = $response['data']->data->teamSocialAccountDetails[0]->team_logo;
                $data = array('teamName' => $teamName, 'teamLogo' => $teamLogo);
                $result['code'] = 200;
                $result['message'] = 'Success';
                $result['data'] = $data;
            } else if ($response['data']->code === 400) {
                $result['code'] = 400;
                $result['message'] = 'failed';
            } else {
                $result['code'] = 500;
                $result['message'] = 'failed';
            }
            return view('team::view_particular_team')->with(['team_id' => $id, 'data' => $result]);
        } catch (\Exception $e) {
            $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'teamView() {TeamController}');
            return view('team::view_particular_team')->with('team_id', $id);
        }
    }

    public function viewTeam()
    {
        return view('team::index');
    }

    public function createTeam(Request $request)
    {
        if ($request->isMethod('get')) {
            return view('team::create_team');
        } elseif ($request->isMethod('post')) {
            $result = [];
            if ($request->team_name == "") {
                $result['code'] = 204;
                $result['message'] = "Team name is required";
                return $result;
            }

            try {

                if (isset($request->profile_avatar)) {
                    $file = $request->profile_avatar;
                    $team = Session::get('team');
                    $pathToStorage = public_path('media/uploads');
                    if (!file_exists($pathToStorage))
                        mkdir($pathToStorage, 0777, true);
                    $publishimage = $file->getClientOriginalName();
                    $data['media'] = $pathToStorage . "/" . $publishimage;;
                    file_put_contents($data['media'], file_get_contents($file->path()));
                    $filedata = array("name" => "media",
                        "file" => $data['media']);
                    $apiUrl = env('API_URL_PUBLISH') . env('API_VERSION') . '/upload/media?title=' . $team['teamName'] . '&teamId=' . $team["teamid"] . '&privacy=3';
                    $response = $this->helper->postApiCallWithAuth('post', $apiUrl, $filedata, true);
                    $responseData = $this->helper->responseHandler($response['data']);
                    if ($responseData['code'] == 200) {
                        $str=substr(env('APP_URL'), 0, 30);
                        $mediaUrl = $str . "media/uploads/".$publishimage;;
                        $data['TeamInfo'] = array(
                            "name" => $request->team_name,
                            "description" => "Short note about the team activity",
                            "logoUrl" => $mediaUrl
                        );
                    } else {
                        $data['TeamInfo'] = array(
                            "name" => $request->team_name,
                            "description" => "Short note about the team activity",
                            "logoUrl" => null
                        );
                    }

                } else {
                    $data['TeamInfo'] = array(
                        "name" => $request->team_name,
                        "description" => "Short note about the team activity",
                        "logoUrl" => 'https://i.imgur.com/eRkLsuQ.png'
                    );
                }
            } catch (\GuzzleHttp\Exception\RequestException $e) {
                $this->helper->logException($e, 'createTeam() {TeamController}');
                return redirect()->back()->with("ErrorMessage", 'Can not complete the process, please check default team is set or not');
            }
            $apiUrl = ApiConfig::get('/team/create');
            try {
                $response = $this->helper->postApiCallWithAuth('post', $apiUrl, $data);
                $responseData = $this->helper->responseHandler($response['data']);

                if ($responseData['code'] == 200) {
                    $team = array(
                        'team_name' => $responseData['data']->team_name,
                        'team_id' => $responseData['data']->team_id,
                    );
                    $user = Session::get('user');
                    $responseData['admin'] = $user['userDetails']['first_name']." ". $user['userDetails']['last_name'];
                    $responseData['admin_profile'] = $user['userDetails']['profile_picture'];
                    $responseData['admin_id'] = $user['userDetails']['user_id'];
                    $responseData['email'] = $user['userDetails']['email'];
                    return $responseData;
                } else {
                    return $responseData;
                }

            } catch (\GuzzleHttp\Exception\RequestException $e) {
                $this->helper->logException($e, 'createTeam() {TeamController}');
                return redirect()->back()->with("ErrorMessage", 'Can not complete the process, please reload page');
            }
        }

    }

    public function getParticularTeamDetails(Request $request)
    {

        try {
            $adminIds = [];
            $adminData = [];
            $socialAccounts = [];
            $teamMembersAcceptedIDs = [];
            $teamMembersPendingIds = [];
            $leftFromTeamIds = [];
            $teamMembersAcceptedDatas = [];
            $teamMembersPendingDatas = [];
            $leftFromTeamDatas = [];
            $availableSocialAccounts = [];
            $availableSocialAccountsDatas = [];
            $teamDetails = [];
            $teamId = $request->teamid;
            $apiUrl = ApiConfig::get('/team/get-team-details?teamId=' . $teamId);
            $response = $this->helper->postApiCallWithAuth('get', $apiUrl);
            if ($response['data']->code === 200) {
                $socialAccounts = $response['data']->data->teamSocialAccountDetails[0]->SocialAccount;
                $availableSocialAccounts = $this->getAvailableSocialAccounts();
                if ($availableSocialAccounts['code'] === 200) {
                    $availableSocialAccounts = $availableSocialAccounts['data'];
                    if (count($socialAccounts) > 0) {
                        for ($i = 0; $i < count($availableSocialAccounts); $i++) {
                            $count = 0;
                            for ($j = 0; $j < count($socialAccounts); $j++) {
                                if ($availableSocialAccounts[$i]->account_id !== $socialAccounts[$j]->account_id) {
                                    $count++;
                                    if ($count === count($socialAccounts)) {
                                        array_push($availableSocialAccountsDatas, $availableSocialAccounts[$i]);
                                    }
                                }
                            }
                        }
                    } else {
                        $availableSocialAccountsDatas = $availableSocialAccounts;
                    }

                } else {
                    $availableSocialAccountsDatas = [];
                }

                foreach ($response['data']->data->teamMembers as $data) {
                    if ($data->permission === 2 && $data->left_from_team === 0 && $data->invitation_accepted === 1 ) {
                        array_push($adminIds, $data->user_id);
                    }
                    if ($data->invitation_accepted === 1 && $data->left_from_team === 0) {
                        array_push($teamMembersAcceptedIDs, (object)array('teamMembersAcceptedIDs' => $data->user_id, 'permissions' => $data->permission));
                    }
                    if ($data->invitation_accepted === 0 ) {
                        array_push($teamMembersPendingIds, (object)array('teamMembersPendingIds' => $data->user_id, 'permissions' => $data->permission));
                    }
                    if ($data->left_from_team === 1) {
                        array_push($leftFromTeamIds, $data->user_id);
                    }
                }
                foreach ($response['data']->data->memberProfileDetails as $data2) {
                    for ($i = 0; $i < count($adminIds); $i++) {
                        if ($adminIds[$i] === $data2->user_id) {
                            array_push($adminData, $data2);
                        }
                    }
                    for ($i = 0; $i < count($leftFromTeamIds); $i++) {
                        if ($leftFromTeamIds[$i] === $data2->user_id) {
                            array_push($leftFromTeamDatas, $data2);
                        }
                    }
                    for ($i = 0; $i < count($teamMembersAcceptedIDs); $i++) {
                        if ($teamMembersAcceptedIDs[$i]->teamMembersAcceptedIDs === $data2->user_id) {
                            if ($teamMembersAcceptedIDs[$i]->permissions === 1) {
                                array_push($teamMembersAcceptedDatas, array('label' => 'Full permissions', 'user' => $data2));
                            } else {
                                array_push($teamMembersAcceptedDatas, array('label' => 'Admin', 'user' => $data2));
                            }
                        }
                    }
                    for ($i = 0; $i < count($teamMembersPendingIds); $i++) {
                        if ($teamMembersPendingIds[$i]->teamMembersPendingIds === $data2->user_id) {
                            array_push($teamMembersPendingDatas, $data2);
                        }
                    }
                }
                $teamDetails['code'] = 200;
                $teamDetails['teamMembersAcceptedDatas'] = $teamMembersAcceptedDatas;
                $teamDetails['teamMembersPendingDatas'] = $teamMembersPendingDatas;
                $teamDetails['adminData'] = $adminData;
                $teamDetails['teamSocialAccounts'] = $socialAccounts;
                $teamDetails['availableSocialAccounts'] = $availableSocialAccountsDatas;
                $teamDetails['leftFromTeamDatas'] = $leftFromTeamDatas;
                return $teamDetails;
            } else if ($response['data']->code === 400) {
                $result['code'] = 400;
                $result['message'] = $response['data']->error;
                return $result;
            } else {
                $result['code'] = 500;
                $result['message'] = 'Some error occurred while fetching data Please reload it...';
                return $result;
            }

        } catch (\Exception $e) {
            return $this->helper->errorHandler($e->getLine(), $e->getCode(), $e->getMessage(), 'getParticularTeamDetails(){TeamController}');
        }
    }

    public function getAvailableSocialAccounts()
    {

        try {
            $apiUrl = ApiConfig::get('/team/get-available-social-accounts');
            $response = $this->helper->postApiCallWithAuth('get', $apiUrl);
            $socialAccounts = [];
            if ($response['data']->code === 200) {
                $socialAccounts = $response['data']->data;
                $result['code'] = 200;
                $result['data'] = $socialAccounts;
                return $result;
            }
        } catch (\Exception $e) {
            return $this->helper->errorHandler($e->getLine(), $e->getCode(), $e->getMessage(), 'getAvailableSocialAccounts(){TeamController}');
        }

    }

    public function dragDopTeamOperation(Request $request)
    {
        $sourcevalue = $request->sourceValue;
        $targetValue = $request->targetValue;
        $accid = (int)$request->id;
        $teamid = (int)$request->teamid;
        $currentUserid = session::get('user')['userDetails']['user_id'];
        $usertype = 'Member';
        try {
            $apiUrl = ApiConfig::get('/team/get-team-details?teamId=' . $teamid);
            $response = $this->helper->postApiCallWithAuth('get', $apiUrl);
            if ($response['data']->code === 200) {
                foreach ($response['data']->data->teamMembers as $data) {
                    if ($data->permission === 2) {
                        if ($data->user_id === $currentUserid) {
                            $usertype = 'Admin';
                            break;
                        }
                    }
                }
            }

        } catch (\Exception $e) {
            return $this->helper->errorHandler($e->getLine(), $e->getCode(), $e->getMessage(), 'dragDopTeamOperation(){TeamController}');
        }
        if ($sourcevalue === '_allSocialAccounts' && $targetValue === '_teamSocialAccounts') {
            $apiUrl = ApiConfig::get('/team/add-other-team-account?accountId=' . $accid . '&teamId=' . $teamid);
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl);
            return $this->helper->responseHandler($response['data']);
        } else if ($sourcevalue === '_teamSocialAccounts' && $targetValue === '_allSocialAccounts') {
            $apiUrl = ApiConfig::get('/team/delete-team-social-profile?accountId=' . $accid . '&teamId=' . $teamid);
            $response = $this->helper->postApiCallWithAuth('delete', $apiUrl);
            if ($response['data']->code === 200) {
                $result['code'] = 200;
                $result['message'] = 'Account Removed from Team';
            } else if ($response['data']->code === 400) {
                $result['code'] = 400;
                $result['message'] = $response['data']->error;
            } else {
                $result['code'] = 500;
                $result['message'] = 'some error occured';
            }
            return $result;

        } else if ($sourcevalue === '_teamSocialAccounts' && $targetValue === '_teamMembers') {
            $result['code'] = 501;
            $result['message'] = 'We can not Move Social Accounts to Team members';
            return $result;
        } else if ($sourcevalue === '_allSocialAccounts' && $targetValue === '_teamMembers') {
            $result['code'] = 501;
            $result['message'] = 'We can not Move Social Accounts to Team members';
            return $result;
        } else if ($sourcevalue === '_allSocialAccounts' && $targetValue === '_pendingTeamMembers') {
            $result['code'] = 501;
            $result['message'] = 'We can not Move Social Accounts to Pending Team members';
            return $result;
        } else if ($sourcevalue === '_teamSocialAccounts' && $targetValue === '_pendingTeamMembers') {
            $result['code'] = 501;
            $result['message'] = 'We can not Move Social Accounts to Pending Team members';
            return $result;
        } else if ($sourcevalue === '_teamSocialAccounts' && $targetValue === '_leftTeamMembers') {
            $result['code'] = 501;
            $result['message'] = 'We can not Move Social Accounts to Left Team members';
            return $result;
        } else if ($sourcevalue === '_admin') {
            if (($targetValue === '_allSocialAccounts' || $targetValue === '_teamSocialAccounts')) {
                $result['code'] = 501;
                $result['message'] = 'We can not move the Admin to Accounts';
                return $result;
            } else {
                if ($targetValue === '_teamMembers') {
                    if ($accid === $currentUserid) {
                        $result['code'] = 501;
                        $result['message'] = 'We can not Move Main admin';
                        return $result;
                    } else {
                        try {
                            $apiUrl = ApiConfig::get('/team/edit-member-permission?teamId=' . $teamid . '&memberId=' . $accid . '&Permission=1');
                            $response = $this->helper->postApiCallWithAuth('post', $apiUrl);
                            if ($response['data']->code === 200) {
                                $result['code'] = 200;
                                $result['message'] = 'Added to Team members';
                            } else if ($response['data']->code === 400) {
                                $result['code'] = 400;
                                $result['message'] = $response['data']->error;
                            } else {
                                $result['code'] = 500;
                                $result['message'] = 'some error occured';
                            }
                            return  $result;
                        } catch (\Exception $e) {
                            return $this->helper->errorHandler($e->getLine(), $e->getCode(), $e->getMessage(), 'dragDopTeamOperation(){TeamController}');
                        }
                    }
                } else if ($targetValue === '_pendingTeamMembers') {
                    $result['code'] = 501;
                    $result['message'] = 'We can not perform operations from Pending Team members';
                    return $result;
                } else {
                    if ($accid === $currentUserid) {
                        $result['code'] = 501;
                        $result['message'] = 'We can not Move Main admin';
                        return $result;
                    } else {
                        try {
                            $apiUrl = ApiConfig::get('/team/removeTeamMember?teamId=' . $teamid . '&memberId=' . $accid);
                            $response = $this->helper->postApiCallWithAuth('delete', $apiUrl);
                            if ($response->code === 200) {
                                $result['code'] = 200;
                                $result['message'] = 'You have  left from Team';
                            } else if ($response->code === 400) {
                                $result['code'] = 400;
                                $result['message'] = $response->message;
                            } else {
                                $result['code'] = 500;
                                $result['message'] = 'some error occured';
                            }
                            return $result;
                        } catch (\Exception $e) {
                            return $this->helper->errorHandler($e->getLine(), $e->getCode(), $e->getMessage(), 'dragDopTeamOperation(){TeamController}');
                        }
                    }
                }
            }


        } else if ($sourcevalue === '_leftTeamMembers') {
            $result['code'] = 501;
            $result['message'] = 'We can not move the Left/removed Members';
            return $result;
        } else if ($sourcevalue === '_teamMembers') {
            if (($targetValue === '_allSocialAccounts' || $targetValue === '_teamSocialAccounts')) {
                $result['code'] = 501;
                $result['message'] = 'We can not add Team members to Social accounts';
                return $result;
            } else if ($targetValue === '_admin') {
                try {
                    $apiUrl = ApiConfig::get('/team/edit-member-permission?teamId=' . $teamid . '&memberId=' . $accid . '&Permission=2');
                    $response = $this->helper->postApiCallWithAuth('post', $apiUrl);
                    if ($response['data']->code === 200) {
                        $result['code'] = 200;
                        $result['message'] = 'Added to Admin';
                    } else if ($response['data']->code === 400) {
                        $result['code'] = 400;
                        $result['message'] = $response['data']->error;
                    } else {
                        $result['code'] = 500;
                        $result['message'] = 'some error occured';
                    }
                   return  $result;
                } catch (\Exception $e) {
                    return $this->helper->errorHandler($e->getLine(), $e->getCode(), $e->getMessage(), 'dragDopTeamOperation(){TeamController}');
                }

            } else if ($targetValue === '_pendingTeamMembers') {
                $result['code'] = 501;
                $result['message'] = 'We can not add Team members to Pending Members';
                return $result;
            } else {
                if ($accid === $currentUserid) {
                    $result['code'] = 501;
                    $result['message'] = 'We can not remove  Main admin';
                    return $result;
                } else {
                    try {
                        $apiUrl = ApiConfig::get('/team/remove-teamMember?teamId=' . $teamid . '&memberId=' . $accid);
                        $response = $this->helper->postApiCallWithAuth('delete', $apiUrl);
                        if ($response['data']->code === 200) {
                            $result['code'] = 200;
                            $result['message'] = 'You have  left from Team';
                        } else if ($response['data']->code === 400) {
                            $result['code'] = 400;
                            $result['message'] = $response['data']->error;
                        } else {
                            $result['code'] = 500;
                            $result['message'] = 'some error occured';
                        }
                        return $result;
                    } catch (\Exception $e) {
                        return $this->helper->errorHandler($e->getLine(), $e->getCode(), $e->getMessage(), 'dragDopTeamOperation(){TeamController}');
                    }
                }
            }
        } else if ($sourcevalue === '_pendingTeamMembers') {
            $result['code'] = 501;
            $result['message'] = 'We can not perform oprations from Pending Team members';
            return $result;

        } else if ($sourcevalue === '_teamSocialAccounts' || $sourcevalue === '_allSocialAccounts') {
            if ($targetValue === '_admin') {
                $result['code'] = 501;
                $result['message'] = 'We can not add Social Accounts to the Admin';
                return $result;
            }
        } else {
            if (($targetValue === '_allSocialAccounts' || $targetValue === '_teamSocialAccounts')) {
                $result['code'] = 501;
                $result['message'] = 'We can not add Team Members to Social accounts';
                return $result;
            } else if ($targetValue === '_leftTeamMembers') {
                if ($accid === $currentUserid) {
                    $result['code'] = 501;
                    $result['message'] = 'We can not Move Main admin';
                    return $result;
                } else {
                    try {
                        $apiUrl = ApiConfig::get('/team/remove-teamMember?teamId=' . $teamid . '&memberId=' . $accid);
                        $response = $this->helper->postApiCallWithAuth('delete', $apiUrl);
                        if ($response['data']->code === 200) {
                            $result['code'] = 200;
                            $result['message'] = 'You have  left from Team';
                        } else if ($response['data']->code === 400) {
                            $result['code'] = 400;
                            $result['message'] = $response->error;
                        } else {
                            $result['code'] = 500;
                            $result['message'] = 'some error occured';
                        }
                        return $result;
                    } catch (\Exception $e) {
                        return $this->helper->errorHandler($e->getLine(), $e->getCode(), $e->getMessage(), 'dragDopTeamOperation(){TeamController}');
                    }
                }

            }
        }


    }
//    public function teamModal(ModalTeamRequest $request)
//    {
//        $html = null;
//        if ($request['modal'] === 'create')
//        {
//            $html = view('team::createModal')->render();
//        }
//        if ($request['modal'] === 'invite')
//        {
//            $html = view('team::inviteModal')->render();
//        }
//        return response()->json([
//            'html' => $html,
//            'status' => true,
//            'modal' => $request['modal']
//        ]);
//    }

    public function getAvailableMembers()
    {
//        $apiUrl = $this->API_URL . env('API_VERSION') . '/team/getAvailableTeamMembers';
        $apiUrl = ApiConfig::get('/team/get-available-team-members');
        try {
            $response = $this->helper->postApiCallWithAuth('get', $apiUrl);
            return $this->helper->responseHandler($response['data']);
        } catch (\GuzzleHttp\Exception\RequestException $e) {
            $this->helper->errorHandler($e, 'getAvailableMembers(){TeamController}');
            return redirect()->back()->with("ErrorMessage", 'Can not complete the process, please reload page');
        }
    }


    public function getInvitedMembers()
    {
        $apiUrl = ApiConfig::get('/team/get-available-invited-members');
        try {
            $response = $this->helper->postApiCallWithAuth('get', $apiUrl);
            return $this->helper->responseHandler($response['data']);

        } catch (\GuzzleHttp\Exception\RequestException $e) {
            $this->helper->errorHandler($e, 'getInvitedMembers(){TeamController}');
            return redirect()->back()->with("ErrorMessage", 'Can not complete the process, please reload page');
        }
    }

    public function deleteTeams($id)
    {
        $team = Session::get('team');
        if ($team['teamid'] == $id) {
            $response['code'] = '500';
            $response['error'] = ' Current Team you cannot delete, switch to other Team to delete this Team';
            return $response;
        } else {
            $apiUrl = ApiConfig::get('/team/delete?teamId=');
            $apiUrl = $apiUrl . $id;
            try {
                $response = $this->helper->postApiCallWithAuth('delete', $apiUrl);
                return $this->helper->responseHandler($response['data']);
            } catch (\GuzzleHttp\Exception\RequestException $e) {
                $this->helper->logException($e, 'deleteTeams() {TeamController}');
                return redirect()->back()->with("ErrorMessage", 'Can not complete the process, please reload page');
            }
        }
    }

    public function updateTeams(Request $request)
    {
        $apiUrlupdate = ApiConfig::get('/team/edit?teamId=');
        $apiUrlupdate = $apiUrlupdate . $request->id;
        $logo = '';
        $team = Session::get('team');
        if (isset($request->profile_avatar)) {
            $file = $request->profile_avatar;
            $pathToStorage = public_path('media/uploads');
            if (!file_exists($pathToStorage))
                mkdir($pathToStorage, 0777, true);
            $publishimage = $file->getClientOriginalName();
            $data['media'] = $pathToStorage . "/" . $publishimage;;
            file_put_contents($data['media'], file_get_contents($file->path()));
            $filedata = array("name" => "media",
                "file" => $data['media']);
            $apiUrl = env('API_URL_PUBLISH') . env('API_VERSION') . '/upload/media?title=' . $team['teamName'] . '&teamId=' . $team["teamid"] . '&privacy=3';
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl, $filedata, true);
            $responseData = $this->helper->responseHandler($response['data']);
            if ($responseData['code'] == 200) {
                $mediaUrl = 'https://feedsv5.socioboard.com' . $responseData['data'][0]->media_url;
                $details['TeamInfo'] = array(
                    "name" => $request->team_name,
                    "logoUrl" => $mediaUrl
                );
                $logo = $mediaUrl;
            } else {
                $details['TeamInfo'] = array(
                    "name" => $request->team_name,
                    "logoUrl" => null
                );
            }
        } else {
            $details['TeamInfo'] = array(
                "name" => $request->team_name,
                "logoUrl" => $request->old_pic
            );
            $logo = $request->old_pic;
        }
        try {
            $response = $this->helper->postApiCallWithAuth('post', $apiUrlupdate, $details);
            $respons = $this->helper->responseHandler($response['data']);
            if ($respons['code'] === 200) {
                if ($team['teamid'] === (int)$request->id) {
                    $team['teamLogo'] = $logo;
                    session()->put('team', $team);
                }
            }
            return $respons;

        } catch (\GuzzleHttp\Exception\RequestException $e) {
            $this->helper->logException($e, 'updateTeams() {TeamController}');
            return redirect()->back()->with("ErrorMessage", 'Can not complete the process, please reload page');
        }
    }

    public function holdTeams($id)
    {
        $apiUrl = ApiConfig::get('/team/lock-team');
        try {
            $parameters = [$id];
            $response = $this->helper->postApiCallWithAuth('put', $apiUrl, $parameters);
            return $this->helper->responseHandler($response['data']);

        } catch (\GuzzleHttp\Exception\RequestException $e) {
            $this->helper->logException($e, 'holdTeams() {TeamController}');
            return redirect()->back()->with("ErrorMessage", 'Can not complete the process, please reload page');
        }
    }

    public function unholdTeams($id)
    {
        $apiUrl = ApiConfig::get('/team/unlock-team');
        try {
            $parameters = [$id];
            $response = $this->helper->postApiCallWithAuth('put', $apiUrl, $parameters);
            return $this->helper->responseHandler($response['data']);
        } catch (\GuzzleHttp\Exception\RequestException $e) {
            $this->helper->logException($e, 'unholdTeams() {TeamController}');
            return redirect()->back()->with("ErrorMessage", 'Can not complete the process, please reload page');
        }
    }

    public function dragToInviteMembers(Request $request)
    {
        if (str_contains($request['targetValue'], '_team')) {
            $id = trim($request['targetValue'], '_team');
            $apiUrl = ApiConfig::get('/team/invite?teamId=');
            $apiUrl = $apiUrl . $id . '&Permission=1&Email=' . $request['email'];
            try {
                $response = $this->helper->postApiCallWithAuth('post', $apiUrl);
                return $this->helper->responseHandler($response['data']);
            } catch (\GuzzleHttp\Exception\RequestException $e) {
                $this->helper->logException($e, 'dragToInviteMembers() {TeamController}');
                return redirect()->back()->with("ErrorMessage", 'Can not complete the process, please reload page');
            }
        } else {
            $result = array("code" => "500", "message" => "You can't make non-members as Admins");
            return $result;
        }

    }

    public function inviteMembers(Request $request)
    {
        if ($request['member_email'] == "") {
            $result['code'] = 204;
            $result['message'] = "Email is required";
            return $result;
        }
        $name = $request->member_name !== null ? $request->member_name : "";
        $apiUrl = ApiConfig::get('/team/invite?teamId=');
        $apiUrl = $apiUrl . $request['team_id'] . '&Permission=' . $request['permission'] . '&Email=' . $request['member_email'].'&name='.$name;
        try {
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl);
            return $this->helper->responseHandler($response['data']);
        } catch (\GuzzleHttp\Exception\RequestException $e) {
            $this->helper->logException($e, 'inviteMembers() {TeamController}');
            return redirect()->back()->with("ErrorMessage", 'Can not complete the process, please reload page');
        }
    }


    public function changeTeamSession(Request $request)
    {
        try {
            $teamID = (int)$request->teamid;
            $apiUrl = ApiConfig::get('/team/get-team-details?teamId=' . $teamID);
            $response = $this->helper->postApiCallWithAuth('get', $apiUrl);
            if ($response['data']->code === 200) {
                $teamid = $response['data']->data->teamSocialAccountDetails[0]->team_id;
                $teamname = $response['data']->data->teamSocialAccountDetails[0]->team_name;
                $teamlogo = $response['data']->data->teamSocialAccountDetails[0]->team_logo;
                $teamDetails['teamid'] = $teamid;
                $teamDetails['teamName'] = $teamname;
                $teamDetails['teamLogo'] = $teamlogo;
                session()->put('team', $teamDetails);
                Session::save();
                $result['code'] = 200;
                $result['message'] = 'Successfully Switched Team';
            } else if ($response->code === 400) {
                $result['code'] = 400;
                $result['message'] = $response->message;
            } else {
                $result['code'] = 500;
                $result['message'] = 'Some error occured';
            }
            return $result;

        } catch (\Exception $e) {
            return $this->helper->errorHandler($e->getLine(), $e->getCode(), $e->getMessage(), 'changeTeamSession(){TeamController}');
        }

    }


    public function searchTeam(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'team_name' => 'required',
        ]);
        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }
        $apiUrl = ApiConfig::get('/team/search-team?teamName=' . $request->team_name);
        try {
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl);
            if ($response['code'] === 200) {
                $responseData = $this->helper->responseHandler($response['data']);
                return view('team::view_teams')->with(["accounts" => $responseData]);
            } else {
                return view('team::view_teams')->with(["ErrorMessage" => 'Can not complete the process, please reload page']);
            }
        } catch (Exception $e) {
            $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'viewTeams() {TeamController}');
        }
    }
    function withDrawInvitation(Request $request)
    {
        try {
            $teamid=(integer)$request->teamId;
            $email=$request->email;
            $apiUrl = ApiConfig::get('/team/withdraw-invitation?teamId=' . $teamid.'&Email='.$email);
            $response = $this->helper->postApiCallWithAuth('delete', $apiUrl);
            if ($response['data']->code === 200) {
                $result['code'] = 200;
                $result['message'] = 'Invitation Withdrawn';
            } else if ($response['data']->code === 400) {
                $result['code'] = 400;
                $result['message'] = $response->error;
            } else {
                $result['code'] = 500;
                $result['message'] = 'some error occured';
            }
            return $result;
        }
        catch (Exception $e) {
            $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'withDrawInvitation() {TeamController}');
        }

    }
}
