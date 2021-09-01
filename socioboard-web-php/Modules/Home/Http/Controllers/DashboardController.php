<?php

namespace Modules\Home\Http\Controllers;

use App\Classes\AuthUsers;
use App\ApiConfig\ApiConfig;
use App\Exceptions\AppException;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Modules\User\helper;
use GuzzleHttp\Exception\RequestException;

class DashboardController extends Controller
{
    protected $helper;

    public function __construct()
    {
        $this->helper = Helper::getInstance();
        $this->API_URL_NOTIFICATION = env('API_URL_NOTIFICATION');
    }

    /**
     * TODO we've to display dashboard page onload of route URL.
     * This function is used for displaying dashboard page and its all contents onload of page and pass data to view blade by hitting API.
     * @return Returns the blade view dashboard with data passed in array to blade view.
     */
    public function index()
    {

        try {
            $team = Session::get('team');
            $teamID = $team['teamid'];
            $fbp = 0;
            $inp = 0;
            $linp = 0;
            $apiUrls = ApiConfig::getFeeds('/feeds/get-recent-rssurls');
            $apiReports = (env('API_URL_PUBLISH') . env('API_VERSION') . '/schedule/get-filtered-schedule-details?fetchPageId=1&scheduleStatus=6');
            try {
                if (Session::has('pages')) {
                    $fbp = 1;
                }
                if (Session::has('instagramPages')) {
                    $inp = 1;
                }
                if (Session::has('LinkedInpages')) {
                    $linp = 1;
                }
                $apiUrl = ApiConfig::get('/team/get-team-details?teamId=' . $teamID);
                $response = $this->helper->postApiCallWithAuth('get', $apiUrl);
                $rssurls = $this->helper->postApiCallWithAuth('get', $apiUrls);
                $schedule = $this->helper->postApiCallWithAuth('get', $apiReports);
                $scheduleHistory = $this->helper->responseHandler($schedule['data']);
                $responseDatas = $this->helper->responseHandler($rssurls['data']);
                if ($response['code'] === 200) {
                    $responseData = $this->helper->responseHandler($response['data']);
                    return view('home::UserDashboard')->with(["accounts" => $responseData, "rssurls" => $responseDatas, 'scheduleHistory' => $scheduleHistory, 'facebookpages' => $fbp, 'instagrampages' => $inp, 'LinkedInpages' => $linp]);
                } else {
                    return view('home::UserDashboard')->with(["ErrorMessage" => 'Can not fetch accounts, please reload page']);
                }
            } catch (AppException $e) {
                $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'index() {DashboardController}');
                return view('home::UserDashboard')->with(["ErrorMessage" => 'Can not fetch accounts, please reload page']);
            }
        } catch (Exception $e) {
            $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'index() {DashboardController}');
            return view('home::UserDashboard')->with(["ErrorMessage" => 'Can not fetch accounts, please reload page']);
        }
    }

    /**
     * TODO we've to lock the particular Social account.
     * This function is used for locking particular social account by passing its social account id in API.
     * @return {object} Returns if account has been locked or not in JSON object format.
     */
    public function lockAccount($id)
    {
        try {
            $apiUrl = ApiConfig::get('/team/lock-profiles');
            $parameters = [$id];
            $response = $this->helper->postApiCallWithAuth('put', $apiUrl, $parameters);
            return $this->helper->responseHandler($response['data']);
        } catch (RequestException $e) {
            $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'index() {DashboardController}');
            return view('home::UserDashboard')->with(["ErrorMessage" => 'Can not fetch accounts, please reload page']);
        }
    }

    /**
     * TODO we've to unLock the particular Social account.
     * This function is used for unlocking particular social account by passing its social account id in API.
     * @return {object} Returns if account has been unlocked or not in JSON object format.
     */
    public function unlockAccount($id)
    {
        try {
            $apiUrl = ApiConfig::get('/team/unlock-profiles');
            $parameters = [$id];
            $response = $this->helper->postApiCallWithAuth('put', $apiUrl, $parameters);
            return $this->helper->responseHandler($response['data']);
        } catch (Exception $e) {
            $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'index() {DashboardController}');
            return view('home::UserDashboard')->with(["ErrorMessage" => 'Can not fetch accounts, please reload page']);
        }
    }

    /**
     * TODO we've to display all social accounts added in Socioboard in accounts page.
     * This function is used for displaying the  all social accounts added in Socioboard in accounts page.
     * @return  accounts page view blade with all data required to display from controller to view.
     */
    public function getSocialAccountsDetails()
    {
        try {
            $team = Session::get('team');
            $teamID = $team['teamid'];
            $apiUrl = ApiConfig::get('/team/get-team-details?teamId=' . $teamID);
            $apiUrl2 = ApiConfig::get('/team/get-socialAccount-count?teamId=' . $teamID);
            $fbp = 0;
            if (Session::has('pages')) {
                $fbp = 1;
            }
            try {
                $response = $this->helper->postApiCallWithAuth('get', $apiUrl);
                $response2 = $this->helper->postApiCallWithAuth('post', $apiUrl2);
                return view('home::Accounts.accounts')->with(["accounts" => $response['data'], 'accountsCount' => $response2['data'], 'facebookpages' => $fbp]);
            } catch (\GuzzleHttp\Exception\RequestException $e) {
                $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'getSocialAccountsDetails() {DashboardController}');
                return view('home::Accounts.accounts')->with(["ErrorMessage" => 'Can not fetch accounts, please reload page']);
            }
        } catch (Exception $e) {
            $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'getSocialAccountsDetails() {DashboardController}');
            return view('home::Accounts.accounts')->with(["ErrorMessage" => 'Can not fetch accounts, please reload page']);
        }
    }

    public function calendarView()
    {
        return view('home::calendar_view');
    }

    /**
     * TODO we've to display all published events on the calendar.
     * This function is used for displaying the  all the publishing and scheduling events on the calendar by requesting /calenderView/schedule-details NODE API .
     * @return  calendar page view blade with all data required to display from controller to view.
     */
    public function getCalendarData(Request $request)
    {
        try {
            $url = env('API_URL_PUBLISH') . env('API_VERSION');
            switch ($request->id) {
                case '1':
                    $apiUrl = $url . '/calenderView/schedule-details?scheduleStatus=1&scheduleCategory=1';
                    break;
                case '0':
                    $apiUrl = $url . '/calenderView/schedule-details?scheduleStatus=1&scheduleCategory=0';
                    break;
                case '6':
                    $apiUrl = $url . '/calenderView/schedule-details?scheduleStatus=6';
                    break;
                default:
                    $apiUrl = $url . '/calenderView/schedule-details';
            }
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl);
            return $this->helper->responseHandler($response['data']);
        } catch (Exception $e) {
            $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'getCalendarData() {DashboardController}');
            return view('home::calendar_view')->with(["ErrorMessage" => 'Can not fetch data, please reload page']);
        }
    }

    /**
     * TODO we've to add Social accounts from dashboard page to socioboard and display.
     * This function is adding social accounts from front end and display in socioboard site(facebook,network,youtube).
     * @return  accounts page view blade with all data required to display from controller to view.
     */
    public function addSocialAccounts($network)
    {
        if ($network === 'twitterChecked') {
            Session::put('twitterChecked', 'true');
            $network = 'Twitter';
        }
        $teamid = 0;
        $team = Session::get('team');
        $teamID = $team['teamid'];
        if ($teamID !== 0) {
            $apiUrl = ApiConfig::get('/socialaccount/get-profile-redirect-url?teamId=' . $teamID . '&network=' . $network);
            try {
                $response = $this->helper->postApiCallWithAuth('post', $apiUrl);
                if ($response['data']->code === 200) {
                    session::put('state', $response['data']->state);
                    return redirect($response['data']->navigateUrl);
                } elseif ($response['data']->code === 400) {
                    return redirect('dashboard')->with("failed", $response['data']->error);
                } else {
                    return redirect('dashboard')->with("failed", 'Some Error Occured please,reload the page');
                }
            } catch (\Exception $e) {
                $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'addSocialAccounts() {Dashboardcontroller}');
                return redirect('dashboard')->with("failed", 'Some Error Occured please,reload the page');
            }
        } else {
            return redirect('dashboard')->with("failed", 'No team found for this User');
        }
    }

    /**
     * TODO we've to add Twitter accounts from dashboard page to socioboard and display.
     * This function is adding twitter accounts from front end and hit API to store in socioboard database.
     * @return  dashbaord page view blade with all data required to display from controller to view.
     */
    public function addTwitterCallback(Request $request)
    {
        if (isset($request['denied'])) {
            return redirect('dashboard');
        } else {
            try {
                if (Session::has('twitterChecked')) {
                    $apiUrl = ApiConfig::get('/socialaccount/add-social-profile?state=' . session::get('state') . '&code=' . $request['oauth_verifier'] . '&flag=1');
                } else {
                    $apiUrl = ApiConfig::get('/socialaccount/add-social-profile?state=' . session::get('state') . '&code=' . $request['oauth_verifier'] . '&flag=0');

                }
                $response = $this->helper->postApiCallWithAuth('post', $apiUrl);
                if ($response['data']->code === 200) {
                    Session::forget('twitterChecked');
                    return redirect('dashboard')->with("success", 'Added Account Successfully');
                } else if ($response['data']->code === 400) {
                    Session::forget('twitterChecked');
                    return redirect('dashboard')->with("failed", $response['data']->error);
                } else {
                    Session::forget('twitterChecked');
                    return redirect('dashboard')->with("failed", 'Some Error Occurred please,reload the page');
                }
            } catch (Exception $e) {
                Session::forget('twitterChecked');
                $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'addTwitterCallback() {DashboardController}');
                return redirect('dashboard')->with("failed", 'Some Error Occured please,reload the page');
            }
        }


    }

    /**
     * TODO we've to add Faceboook accounts from dashboard page to socioboard and display.
     * This function is adding Faceboook accounts from front end and hit API to store in socioboard database.
     * @return  dashbaord page view blade with all data required to display from controller to view.
     */
    public function addFacebookCallback(Request $request)
    {

        if ($request['error_reason'] === 'user_denied') {
            return redirect('dashboard');
        } else {
            try {
                $apiUrl = ApiConfig::get('/socialaccount/add-social-profile?state=' . session::get('state') . '&code=' . $request['code']);
                $response = $this->helper->postApiCallWithAuth('post', $apiUrl);
                if ($response['data']->code === 200) {
                    return redirect('dashboard')->with("success", 'Added Account Successfully');
                } else if ($response['data']->code === 400) {
                    return redirect('dashboard')->with("failed", $response['data']->error);
                } else {
                    return redirect('dashboard')->with("failed", 'Some Error Occurred please,reload the page');
                }
            } catch (Exception $e) {
                $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'addFacebookCallback() {DashboardController}');
                return redirect('dashboard')->with("failed", 'Some Error Occured please,reload the page');
            }
        }

    }

    /**
     * TODO we've to add Linked in accounts from dashboard page to socioboard and display.
     * This function is adding Linked in accounts from front end and hit API to store in socioboard database.
     * @return  dashbaord page view blade with all data required to display from controller to view.
     */
    public function addLinkedInCallback(Request $request)
    {
        if ($request['error'] === 'user_cancelled_login') {
            return redirect('dashboard');
        } else {
            try {
                $apiUrl = ApiConfig::get('/socialaccount/add-social-profile?state=' . session::get('state') . '&code=' . $request['code']);
                $response = $this->helper->postApiCallWithAuth('post', $apiUrl);
                if ($response['data']->code === 200) {
                    return redirect('dashboard')->with("success", 'Added Account Successfully');
                } else if ($response['data']->code === 400) {
                    return redirect('dashboard')->with("failed", $response['data']->error);
                } else if ($response['data']->code === 403) {
                    return redirect('dashboard')->with("failed", $response['data']->error);
                } else {
                    return redirect('dashboard')->with("failed", 'Some Error Occurred please,reload the page');
                }
            } catch (Exception $e) {
                $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'addLinkedInCallback() {DashboardController}');
                return redirect('dashboard')->with(["Errormessage" => 'Some Error Occurred please,reload the page']);
            }
        }

    }

    /**
     * TODO we've to add Facebook pages accounts from dashboard page to socioboard and display.
     * This function is adding Facebook pages  in accounts from front end and hit API to store in socioboard database.
     * @return  dashbaord page view blade with all data required to display from controller to view.
     */
    public function addFacebookPageCallBack(Request $request)
    {
        if ($request['error_reason'] === 'user_denied') {
            return redirect('dashboard');
        } else {
            try {
                $apiUrl = ApiConfig::get('/socialaccount/get-own-facebookpages?code=' . $request['code']);
                $response = $this->helper->postApiCallWithAuth('post', $apiUrl);
                if ($response['data']->code === 200) {
                    if (count($response['data']->pages) === count($response['data']->availablePages)) {
                        return redirect('dashboard')->with("failed", "Facebook Pages have Already added!");
                    } else {
                        Session::put('pages', $response['data']->pages);
                        return redirect('dashboard');
                    }
                } else if ($response['data']->code === 400) {
                    return redirect('dashboard')->with("failed", $response['data']->error);
                } else {
                    return redirect('dashboard')->with("failed", 'Some Error Occurred please,reload the page');
                }
            } catch (Exception $e) {
                $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'addFacebookPageCallBack() {DashboardController}');
                return redirect('dashboard')->with("failed", 'Some Error Occured please,reload the page');
            }
        }

    }

    /**
     * TODO we've to add Youtube accounts from dashboard page to socioboard and display.
     * This function is adding Youtube Accounts  in accounts from front end and hit API to store in socioboard database.
     * @return  dashbaord page view blade with all data required to display from controller to view.
     */
    public function addYoutubeCallback(Request $request)
    {

        try {
            $teamid = 0;
            $team = Session::get('team');
            $teamID = $team['teamid'];
            $apiUrl = ApiConfig::get('/socialaccount/get-Youtube-channels?code=' . $request['code']);
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl);
            if ($response['data']->code === 200) {
                $channelDetails = $response['data']->channels[0];
                $channelId = $channelDetails->channelId;
                $channelname = $channelDetails->channelName;
                $channelImageUrl = $channelDetails->channelImage;
                $channelProfileUrl = 'https://www.youtube.com/channel/' . $channelId;
                $friendShipCount = $channelDetails->friendshipCount->subscriberCount;
                $accessToken = $channelDetails->accessToken;
                $refreshToken = $channelDetails->refreshToken;
                $dataToPass = [];
                $data = array('account_type' => "9", 'user_name' => $channelId, 'first_name' => $channelname, 'email' => 'socioboard@socioboard.com', 'social_id' => $channelId,
                    'profile_pic_url' => $channelImageUrl, 'cover_pic_url' => 'https://www.socioboard.com/contents/socioboard/images/Socioboard.png',
                    'last_name' => '', 'profile_url' => $channelProfileUrl, 'access_token' => $accessToken, 'refresh_token' => $refreshToken, 'friendship_counts' => $friendShipCount,
                    'info' => 'Build the success life with using Smart utils like sociobord for Social Networks'
                );
                array_push($dataToPass, (object)$data);
                $apiUrl2 = ApiConfig::get('/socialaccount/add-bulk-social-profile?teamId=' . $teamID);
                $response = $this->helper->postApiCallWithAuth('post', $apiUrl2, $dataToPass);
                if ($response['data']->code === 200) {
                    if (count($response['data']->profileDetails) > 0) {
                        return redirect('dashboard')->with("success", 'Youtube channel added Successfully');
                    } else {
                        return redirect('dashboard')->with("failed", 'Youtube channel has already added');
                    }
                } else if ($response['data']->code === 400) {
                    return redirect('dashboard')->with("failed", $response['data']->error);
                } else {
                    return redirect('dashboard')->with("failed", 'Some Error Occured please,reload the page');
                }
            } else if ($response['data']->code === 400) {
                return redirect('dashboard')->with("failed", $response['data']->error);
            } else {
                return redirect('dashboard')->with("failed", 'Some Error Occured please,reload the page');
            }
        } catch (\Exception $e) {
            $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'addYoutubeCallback() {DashboardController}');
            return redirect('dashboard')->with("failed", 'Some Error Occured please,reload the page');
        }

    }

    public function addInstagramCallback(Request $request)
    {
        try {
            $apiUrl = ApiConfig::get('/socialaccount/add-social-profile?state=' . session::get('state') . '&code=' . $request['code']);
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl);
            if ($response['data']->code === 200) {
                return redirect('dashboard')->with("success", 'Added Account Successfully');
            } else if ($response['data']->code === 400) {
                return redirect('dashboard')->with("failed", $response['data']->error);
            } else {
                return redirect('dashboard')->with("failed", 'Some Error Occurred please,reload the page');
            }
        } catch (Exception $e) {
            $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'addLinkedInCallback() {DashboardController}');
            return redirect('dashboard')->with(["Errormessage" => 'Some Error Occurred please,reload the page']);
        }
    }

    public function addInstagramBusinessCallback(Request $request)
    {
        if ($request['error_reason'] === 'user_denied') {
            return redirect('dashboard');
        } else {
            try {
                $apiUrl = ApiConfig::get('/socialaccount/get-instagram-business-profile?code=' . $request['code']);
                $response = $this->helper->postApiCallWithAuth('post', $apiUrl);
                if ($response['data']->code === 200) {
                    if (count($response['data']->pages) > 0) {
                        if (count($response['data']->pages) === count($response['data']->availablePages)) {
                            return redirect('dashboard')->with("failed", "Instagram businees accounts have Already added!");
                        } else {
                            Session::put('instagramPages', $response['data']->pages);
                            return redirect('dashboard');
                        }
                    } else {
                        return redirect('dashboard')->with("failed", 'No Instagram businees pages found for this account');
                    }
                } else if ($response['data']->code === 400) {
                    return redirect('dashboard')->with("failed", $response['data']->error);
                } else {
                    return redirect('dashboard')->with("failed", 'Some Error Occurred please,reload the page');
                }
            } catch (Exception $e) {
                $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'addInstagramBusinessCallback() {DashboardController}');
                return redirect('dashboard')->with("failed", 'Some Error Occured please,reload the page');
            }
        }

    }

    function addLinkedInPagesCallback(Request $request)
    {
        if ($request['error'] === 'user_cancelled_login') {
            return redirect('dashboard');
        } else {
            try {
                $apiUrl = ApiConfig::get('/socialaccount/get-LinkedInCompany-Profiles?code=' . $request['code']);
                $response = $this->helper->postApiCallWithAuth('post', $apiUrl);
                if ($response['data']->code === 200) {
                    if (count($response['data']->company) > 0) {
                        if (count($response['data']->company) === count($response['data']->availablePages)) {
                            return redirect('dashboard')->with("failed", "LinkedIn Pages have Already added!");
                        } else {
                            Session::put('LinkedInpages', $response['data']->company);
                            return redirect('dashboard');
                        }
                    } else {
                        return redirect('dashboard')->with("failed", 'No LinkedIn Pages found for this account');
                    }
                } else if ($response['data']->code === 400) {
                    return redirect('dashboard')->with("failed", $response['data']->error);
                } else if ($response['data']->code === 403) {
                    return redirect('dashboard')->with("failed", $response['data']->error);
                } else {
                    return redirect('dashboard')->with("failed", 'Some Error Occurred please,reload the page');
                }
            } catch (Exception $e) {
                $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'addLinkedInCallback() {DashboardController}');
                return redirect('dashboard')->with(["failed" => 'Some Error Occurred please,reload the page']);
            }
        }
    }

    /**
     * TODO we've to update star rating of social account.
     * This function is used for updating star rating of the social Accounts  in accounts from front end and hit API to store in socioboard database.
     * @return {object} Returns if Star rating of social accounts with message in json object format.
     */
    public function updateRating(Request $request)
    {
        $api_url = ApiConfig::get('/team/update-ratings?accountId=' . $request['accountId'] . '&rating=' . $request['rating']);
        $method = "PUT";
        $data = ($request->all());
        try {
            $response = $this->helper->postApiCallWithAuth($method, $api_url, $data);
            return response()->json($response["data"]);
        } catch (RequestException $e) {
            return $this->helper->guzzleErrorHandler($e->getMessage(), ' UserController => get_pages => Method-post ');
        }
    }

    /**
     * TODO we've to update Crons for social account.
     * This function is updating the star Crons of social Accounts  in accounts from front end and hit API to store in socioboard database.
     * @return {object} Returns if updated the Crons of social accounts with message in json object format.
     */
    public function updateCron(Request $request)
    {
        $api_url = ApiConfig::get('/team/update-feed-cron?accountId=' . $request['accountId'] . '&cronvalue=' . $request['cronvalue']);
        try {
            $response = $this->helper->postApiCallWithAuth("put", $api_url, $request->all());
            return $this->helper->responseHandler($response['data']);
        } catch (RequestException $e) {
            return $this->helper->guzzleErrorHandler($e->getMessage(), ' UserController => get_pages => Method-post ');
        }
    }

    /**
     * TODO we've to get the invitation sent by other teams to join.
     * This function is to get the invitations sent by the other teams to join.
     * @return {object} Returns all the invitations in json object format.
     */
    public function getInvitations()
    {
        $apiUrl = ApiConfig::get('/team/get-team-invitations');
        try {
            $response = $this->helper->postApiCallWithAuth('get', $apiUrl);
            return $this->helper->responseHandler($response['data']);
        } catch (\GuzzleHttp\Exception\RequestException $e) {
            $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'getInvitations() {DashboardController}');
            return false;
        }
    }

    /**
     * TODO we've to accept the invitation sent by other teams to join.
     * This function is to accept the invitations sent by the other teams to join.
     * @return {object} Returns if accepted the invitations in json object format.
     */
    public function acceptInvitations(Request $request)
    {

        $apiUrl = ApiConfig::get('/team/accept-invitation?teamId=');
        $apiUrl = $apiUrl . $request['id'];
        try {
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl);
            return $this->helper->responseHandler($response['data']);
        } catch (\GuzzleHttp\Exception\RequestException $e) {
            $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'acceptInvitations() {DashboardController}');
            return false;
        }
    }

    /**
     * TODO we've to reject the invitation sent by other teams to join.
     * This function is to reject the invitations sent by the other teams to join.
     * @return {object} Returns if rejected the invitations in json object format.
     */
    public function rejectInvitations(Request $request)
    {
        $apiUrl = ApiConfig::get('/team/decline-team-invitation?teamId=');
        $apiUrl = $apiUrl . $request['id'];
        try {
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl);
            return $this->helper->responseHandler($response['data']);

        } catch (\GuzzleHttp\Exception\RequestException $e) {
            $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'rejectInvitations() {DashboardController}');
            return False;
        }
    }

    /**
     * TODO we've to delete particular social account.
     * @param(integer) The  Account id of the social account to be deleted.
     * @return {object} Returns if particular social acccount has been deleted or not with message in json object format.
     */
    public function deleteSocialAccount(Request $request)
    {

        try {
            $accountId = $request->accid;
            $team = Session::get('team');
            $teamID = $team['teamid'];
            $apiUrl = ApiConfig::get('/socialaccount/delete-social-profile?AccId=' . $accountId . '&teamId=' . $teamID);
            $response = $this->helper->postApiCallWithAuth('delete', $apiUrl);
            return $this->helper->responseHandler($response['data']);
        } catch (Exception $e) {
            $this->helper->errorHandler($e->getLine(), $e->getCode(), $e->getMessage(), 'deleteSocialAccount() {DashboardController}');
        }
    }


    /**
     * TODO we've to get all recently visited modules.
     * @return {object} Returns all recently visited modules data in json format.
     */
    public function recentActivities()
    {
        try {
            $apiUrl = ApiConfig::get('/recentvisited/get-recent-visited?limit=10');
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl);
            return $this->helper->responseHandler($response['data']);
        } catch (Exception $e) {
            return redirect('dashboard')->with(["Errormessage" => 'Some Error Occurred please,reload the page']);
        }
    }

    public function getScheduledReportsDashboard(Request $request)
    {
        try {
            $team = Session::get('team');
            $teamID = $team['teamid'];
            $timeInterval = intval($request->timeInterval);
            $socialAccsCount = 0;
            $result = [];
            $apiUrl = ApiConfig::get('/teamreport/get-team-scheduler-stats?teamId=' . $teamID . '&filterPeriod=' . $timeInterval);
            $apiUrl2 = ApiConfig::get('/team/get-team-details?teamId=' . $teamID);
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl);
            $response2 = $this->helper->postApiCallWithAuth('get', $apiUrl2);
            if ($response2['data']->code === 200) {
                $socialAccsCount = count($response2['data']->data->teamSocialAccountDetails[0]->SocialAccount);
            }
            $result['socialAccCount'] = $socialAccsCount;
            $result['data'] = $this->helper->responseHandler($response['data']);
            return $result;
        } catch (Exception $e) {
            return redirect('dashboard')->with(["Errormessage" => 'Some Error Occurred please,reload the page']);

        }
    }

    /**
     * TODO we've get all team details and counts.
     * @return {object} Returns all teams data in json format.
     */
    public function getTeamCounts()
    {
        try {
            $apiUrl = ApiConfig::get('/team/get-details');
            $response = $this->helper->postApiCallWithAuth('get', $apiUrl);
            $responseData = $this->helper->responseHandler($response['data']);

            if ($responseData['code'] == 200) {
                $teamCount = count($responseData['data']->teamSocialAccountDetails);
                $teamNames = [];
                $teamDetail = [];
                $i = 0;
                foreach ($responseData['data']->teamSocialAccountDetails as $details) {
                    $teamNames[$i]['teamName'] = $details[0]->team_name;
                    foreach ($responseData['data']->teamMembers as $members) {
                        if ($members[0]->team_id === $details[0]->team_id) {
                            $memberCount = count($members);
                        }
                    }
                    $teamNames[$i]['members'] = $memberCount;
                    $i++;
                }
                $teamDetail['count'] = $teamCount;
                $teamDetail['teams'] = $teamNames;
                return $teamDetail;
            }
        } catch (Exception $e) {
            return redirect('dashboard')->with(["Errormessage" => 'Some Error Occurred please,reload the page']);
        }
    }

    function addFacebookPageBulk(Request $request)
    {

        $team = Session::get('team');
        $teamID = $team['teamid'];
        $pages = [];
        $k = 0;
        $pages = $request->pages;
        $dataToPass = [];
        $pageSession = Session::get('pages');
        $SocialAccounts = [];
        if ($request->pages != null && $pageSession != null) {

            for ($i = 0; $i < count($pages); $i++) {
                /*account_type=2,user_name,last_name="",email="",social_id,profile_pic_url,cover_pic_url,access_token,refresh_token,friendship_counts,info=""*/
                for ($j = 0; $j < count($pageSession); $j++) {
                    if ($pageSession[$j]->pageName == $pages[$i]) {
                        //construct bulk facebook account
                        $SocialAccounts[$k] = (object)array(
                            "account_type" => "2",//fixed
                            "user_name" => $pageSession[$j]->pageId,
                            "first_name" => $pageSession[$j]->pageName,
                            "last_name" => "",
                            "email" => "",
                            "social_id" => $pageSession[$j]->pageId,
                            "profile_pic_url" => $pageSession[$j]->profilePicture,
                            "cover_pic_url" => $pageSession[$j]->profilePicture,
                            "profile_url" => $pageSession[$j]->pageUrl,
                            "access_token" => $pageSession[$j]->accessToken,
                            "friendship_counts" => $pageSession[$j]->fanCount,
                            "info" => ""
                        );
                        $k++;
                    }
                }
            }
            try {
                $apiUrl2 = ApiConfig::get('/socialaccount/add-bulk-social-profile?teamId=' . $teamID);
                $response = $this->helper->postApiCallWithAuth('post', $apiUrl2, $SocialAccounts);
                Session::forget('pages');
                if ($response['data']->code === 200) {
                    $result['code'] = 200;
                    if (isset($response['data']->errorProfileId)) $result['errorIds'] = $response['data']->errorProfileId;
                    else $response['errorIds'] = "";
                    return $result;
                } else if ($response['data']->code == 400) {
                    $result['code'] = 400;
                    $result['status'] = "failure";
                    $result['message'] = $response['data']->error;
                    return $result;
                }
            } catch (Exception $e) {
                $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'index() {DashboardController}');
//                return $e->getMessage();
                $result['code'] = 500;
                $result['status'] = "failure";
                return $result;
            }
        } else {
            $result['code'] = 400;
            $result['status'] = "failure";
            $result['message'] = "Please select at least 1 account";
            return $result;
            // ask user to select a page
        }
    }

    function addInstagramPageBulk(Request $request)
    {
        $team = Session::get('team');
        $teamID = $team['teamid'];
        $pages = [];
        $k = 0;
        $pages = $request->pages;
        $dataToPass = [];
        $pageSession = Session::get('instagramPages');
        $SocialAccounts = [];
        if ($request->pages != null && $pageSession != null) {
            for ($i = 0; $i < count($pages); $i++) {
                /*account_type=2,user_name,last_name="",email="",social_id,profile_pic_url,cover_pic_url,access_token,refresh_token,friendship_counts,info=""*/
                for ($j = 0; $j < count($pageSession); $j++) {
                    if ($pageSession[$j]->userName == $pages[$i]) {
                        //construct bulk facebook account
                        $SocialAccounts[$k] = (object)array(
                            "account_type" => "12",//fixed
                            "user_name" => $pageSession[$j]->social_id,
                            "first_name" => $pageSession[$j]->userName,
                            "last_name" => "",
                            "email" => "",
                            "social_id" => $pageSession[$j]->social_id,
                            "profile_pic_url" => $pageSession[$j]->profile_pic,
                            "cover_pic_url" => $pageSession[$j]->profile_pic,
                            "profile_url" => 'https://www.instagram.com/' . $pageSession[$j]->userName,
                            "access_token" => $pageSession[$j]->accessToken,
                            "refresh_token" => $pageSession[$j]->accessToken,
                            "friendship_counts" => $pageSession[$j]->fanCount,
                            "info" => ""
                        );
                        $k++;
                    }
                }
            }
            try {
                $apiUrl2 = ApiConfig::get('/socialaccount/add-bulk-social-profile?teamId=' . $teamID);
                $response = $this->helper->postApiCallWithAuth('post', $apiUrl2, $SocialAccounts);
                Session::forget('instagramPages');
                if ($response['data']->code === 200) {
                    $result['code'] = 200;
                    if (isset($response['data']->errorProfileId)) $result['errorIds'] = $response['data']->errorProfileId;
                    else $response['errorIds'] = "";
                    return $result;
                } else if ($response['data']->code == 400) {
                    $result['code'] = 400;
                    $result['status'] = "failure";
                    $result['message'] = $response['data']->error;
                    return $result;
                }
            } catch (Exception $e) {
                $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'addInstagramPageBulk() {DashboardController}');
                $result['code'] = 500;
                $result['status'] = "failure";
                return $result;
            }
        } else {
            $result['code'] = 400;
            $result['status'] = "failure";
            $result['message'] = "Please select at least 1 account";
            return $result;

        }
    }

    function addLinkedInPageBulk(Request $request)
    {
        $team = Session::get('team');
        $teamID = $team['teamid'];
        $pages = [];
        $k = 0;
        $pages = $request->pages;
        $dataToPass = [];
        $pageSession = Session::get('LinkedInpages');
        $SocialAccounts = [];
        $profilePic = [];
        if ($request->pages != null && $pageSession != null) {
            for ($i = 0; $i < count($pages); $i++) {
                /*account_type=2,user_name,last_name="",email="",social_id,profile_pic_url,cover_pic_url,access_token,refresh_token,friendship_counts,info=""*/
                for ($j = 0; $j < count($pageSession); $j++) {
                    if ($pageSession[$j]->companyName == $pages[$i]) {
                        //construct bulk facebook account
                        if ($pageSession[$j]->profilePicture === '' || $pageSession[$j]->profilePicture === null) {
                            $profilePic = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqkMttlQe6c9S_nTREIcq5AUfgkOfdg0HEVA&usqp=CAU';
                        } else {
                            $profilePic = $pageSession[$j]->profilePicture;
                        }
                        $SocialAccounts[$k] = (object)array(
                            "account_type" => "7",//fixed
                            "user_name" => $pageSession[$j]->companyId,
                            "first_name" => $pageSession[$j]->companyName,
                            "last_name" => "",
                            "email" => "",
                            "social_id" => $pageSession[$j]->companyId,
                            "profile_pic_url" => $profilePic,
                            "cover_pic_url" => $profilePic,
                            "profile_url" => $pageSession[$j]->profileUrl,
                            "access_token" => $pageSession[$j]->accessToken,
                            "refresh_token" => $pageSession[$j]->refresh_token,
                            "friendship_counts" => "",
                            "info" => ""
                        );
                        $k++;
                    }
                }
            }
            try {
                $apiUrl2 = ApiConfig::get('/socialaccount/add-bulk-social-profile?teamId=' . $teamID);
                $response = $this->helper->postApiCallWithAuth('post', $apiUrl2, $SocialAccounts);
                Session::forget('LinkedInpages');
                if ($response['data']->code === 200) {
                    $result['code'] = 200;
                    if (isset($response['data']->errorProfileId)) $result['errorIds'] = $response['data']->errorProfileId;
                    else $response['errorIds'] = "";
                    return $result;
                } else if ($response['data']->code == 400) {
                    $result['code'] = 400;
                    $result['status'] = "failure";
                    $result['message'] = $response['data']->error;
                    return $result;
                }
            } catch (Exception $e) {
                $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'addLinkedInPageBulk() {DashboardController}');
                $result['code'] = 500;
                $result['status'] = "failure";
                return $result;
            }
        } else {
            $result['code'] = 400;
            $result['status'] = "failure";
            $result['message'] = "Please select at least 1 account";
            return $result;

        }
    }

    function searchAccountsFilter(Request $request)
    {
        try {
            $selected_star = $request->selected_star;
            $username = $request->username;
            $acctypes = $request->selectedAccountTypes;
            if ($selected_star === null) {
                $selected_star = [];
            } else {
                $selected_star = [$request->selected_star];
            }
            if ($acctypes === null) {
                $acctypes = [];
            } else {
                $acctypes = $request->selectedAccountTypes;
            }
            if ($username === null) {
                $username = '';
            } else {
                $username = $request->username;
            }
            $team = Session::get('team');
            $teamID = $team['teamid'];
            $apiUrl2 = ApiConfig::get('/team/search-social-accounts?teamId=' . $teamID);
            $dataToPass = (object)array('rating' => $selected_star,
                'accountType' => $acctypes,
                "username" => $username
            );
            $data = (object)array(
                "SocialAccountInfo" => $dataToPass,
            );
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl2, $data);
            $result['data'] = $this->helper->responseHandler($response['data']);
            return $result;
        } catch (Exception $e) {
            return $this->helper->errorHandler($e->getLine(), $e->getCode(), $e->getMessage(), 'searchAccountsFilter() {DashboardController}');
        }
    }

    function checkTheEmailUser()
    {
        try {
            $userDetails = Session::get('user');
            $email = $userDetails['userDetails']['email'];
            $result['code'] = 200;
            $result['email'] = $email;
            return $result;
        } catch (Exception $e) {
            return $this->helper->errorHandler($e->getLine(), $e->getCode(), $e->getMessage(), 'searchAccountsFilter() {DashboardController}');
        }
    }

    function updateEmailUser(Request $request)
    {
        try {
            $data['email'] = $request->emailID;
            $apiUrl = ApiConfig::get('/user/update-profile-details');
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl, (object)$data);
            $userDetails = $this->helper->responseHandler($response['data']);
            $session = Session::get('user');
            $session['userDetails']['email'] = $userDetails['data']->user->email;
            session()->put('user', $session);
            Session::save();
            return $userDetails;
        } catch (Exception $e) {
            return $this->helper->errorHandler($e->getLine(), $e->getCode(), $e->getMessage(), 'updateEmailUser() {DashboardController}');
        }
    }

    function getPlanDetails(Request $request)
    {
        try {
            $apiUrl = ApiConfig::get('/get-plan-details?planId=' . $request->id);
            $response = $this->helper->postApiCallWithAuth('get', $apiUrl);
            $responseData = $this->helper->responseHandler($response['data']);
            return $responseData;
        } catch (Exception $e) {
            return $this->helper->errorHandler($e->getLine(), $e->getCode(), $e->getMessage(), 'getPlanDetails() {DashboardController}');

        }
    }

    /**
     * TODO we've to get all team id and user id of the User to use in socket connections.
     * This function is used for getting all team id and user id  of particular user to get socket connections.
     * by hitting API from controller.
     * @return {object} Returns data from APIS in JSON object format.
     */
    function getUserDatas()
    {
        try {
            $userSession = Session::get('user');
            $teamIDs = [];
            $teamIdValues = [];
            $userid = $userSession['userDetails']['user_id'];
            $apiUrl = ApiConfig::get('/team/get-details');
            $response = $this->helper->postApiCallWithAuth('get', $apiUrl);
            $responseData = $this->helper->responseHandler($response['data']);
            if ($responseData['code'] === 200) {
                $teamIDs = $responseData['data']->teamMembers;
                foreach ($teamIDs as $data) {
                    array_push($teamIdValues, (string)$data[0]->team_id);
                }
                $result['code'] = 200;
                $result['teamIds'] = $teamIdValues;
                $result['userId'] = $userid;
                return $result;
            } else if ($responseData['code'] === 400) {
                $result['code'] = 400;
                $result['error'] = $responseData['error'];
                return $result;
            } else {
                $result['code'] = 500;
                $result['error'] = 'some error occured';
                return $result;
            }
        } catch (Exception $e) {
            return $this->helper->errorHandler($e->getLine(), $e->getCode(), $e->getMessage(), 'getUserDatas() {DashboardController}');

        }
    }

    /**
     * TODO we've to get all notificationsof the teams onload and also on scroll.
     * @param {string) pageid for getting the first 12 nortifications passing in controller.
     * @return {object} Returns getNotifications from  in JSON object format.
     */
    function getAllNotificationsTeams(Request $request)
    {
        try {
            $pageid = $request->pageid;
            $teamID = 0;
            $team = Session::get('team');
            $teamID = $team['teamid'];
            $apiUrl2 = $this->API_URL_NOTIFICATION . '/v1/notify/get-team-notification?teamId=' . $teamID . '&pageId=' . $pageid;
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl2);
            $responseData = $this->helper->responseHandler($response['data']);
            return $responseData;
        } catch (Exception $e) {
            return $this->helper->errorHandler($e->getLine(), $e->getCode(), $e->getMessage(), 'getUserDatas() {DashboardController}');

        }
    }

    /**
     * TODO we've to get all notificationsof the users onload and also on scroll.
     * @param {string) pageid for getting the first 12 nortifications passing in controller.
     * @return {object} Returns getNotifications from  in JSON object format.
     */
    function getAllNotificationsUsers(Request $request)
    {
        try {
            $pageid = $request->pageid;
            $userSession = Session::get('user');
            $userid = $userSession['userDetails']['user_id'];
            $apiUrl2 = $this->API_URL_NOTIFICATION . '/v1/notify/get-user-notification?userId=' . $userid . '&pageId=' . $pageid;
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl2);
            $responseData = $this->helper->responseHandler($response['data']);
            return $responseData;
        } catch (Exception $e) {
            return $this->helper->errorHandler($e->getLine(), $e->getCode(), $e->getMessage(), 'getUserDatas() {DashboardController}');

        }
    }

    /**
     * TODO we've to make read all Users notifications on check box click.
     * This function makes read all Users notificaations on checked of checkboxes.
     * @return {object} Returns getNotifications from  in JSON object format.
     */
    function markAllNotificationsUserRead()
    {
        try {
            $userSession = Session::get('user');
            $userid = $userSession['userDetails']['user_id'];
            $apiUrl2 = $this->API_URL_NOTIFICATION . 'v1/notify/mark-all-user-notifications-as-read?userId=' . $userid;
            $response = $this->helper->postApiCallWithAuth('put', $apiUrl2);
            $responseData = $this->helper->responseHandler($response['data']);
            return $responseData;
        } catch (Exception $e) {
            return $this->helper->errorHandler($e->getLine(), $e->getCode(), $e->getMessage(), 'getUserDatas() {DashboardController}');

        }
    }

    /**
     * TODO we've to make read all teams notifications on check box click.
     * This function makes read all teams notificaations on checked of checkboxes.
     * @return {object} Returns getNotifications from  in JSON object format.
     */
    function markAllNotificationsTeamRead()
    {
        try {
            $teamID = 0;
            $team = Session::get('team');
            $teamID = $team['teamid'];
            $apiUrl2 = $this->API_URL_NOTIFICATION . 'v1/notify/mark-all-team-notifications-as-read?teamId=' . $teamID;
            $response = $this->helper->postApiCallWithAuth('put', $apiUrl2);
            $responseData = $this->helper->responseHandler($response['data']);
            return $responseData;
        } catch (Exception $e) {
            return $this->helper->errorHandler($e->getLine(), $e->getCode(), $e->getMessage(), 'getUserDatas() {DashboardController}');

        }
    }
}
