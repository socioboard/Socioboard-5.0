<?php

namespace Modules\Reports\Http\Controllers;

use App\ApiConfig\ApiConfig;
use function App\Modules\User\Http\Controllers\makeReportPage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Validator;
use Modules\Team\Http\Requests\ModalTeamRequest;
use Illuminate\Routing\Controller;
use Modules\Team\Http\Requests\CreatTeamRequest;
use Illuminate\Support\Facades\Session;
use Modules\User\helper;
use Exception;
use function GuzzleHttp\Promise\all;

class ReportsController extends Controller
{
    protected $helper;

    public function __construct()
    {
        $this->helper = Helper::getInstance();
        $this->API_URL = env('API_URL');
        $this->API_URL_FEEDS = env('API_URL_FEEDS');
        $this->API_URL_PUBLISH = env('API_URL_PUBLISH');
    }

    public function getTeamReports()
    {
        $memberProfileDetails = [];
        $teamid = 0;
        try {
            $apiUrl = ApiConfig::get('/team/get-details');
            $response = $this->helper->postApiCallWithAuth('get', $apiUrl);
            if ($response['code'] === 200) {
                $responseData = $this->helper->responseHandler($response['data']);
                $teamid = $responseData['data']->teamSocialAccountDetails[0][0]->team_id;
                $apiUrl2 = ApiConfig::get('/team/get-team-details?teamId=' . $teamid);
                $apiUrl3 = ApiConfig::getFeeds('/networkinsight/get-team-insight?teamId=' . $teamid . '&filterPeriod=1');
                $response2 = $this->helper->postApiCallWithAuth('get', $apiUrl2);
                $response3 = $this->helper->postApiCallWithAuth('post', $apiUrl3);
                $memberProfileDetails = $response2['data'];
                return view('reports::teamReports')->with(["teams" => $responseData, 'members' => $memberProfileDetails, 'memberDetails' => $response3]);
            }
        } catch (Exception $e) {
            return $this->helper->callingErrorHandler($e, 'getTeamReports() {ReportsController}');
        }
    }


    public function getScheduleReports(Request $request)
    {
        try {
            $teamId = $request->teamid;
            $timeInterval = intval($request->filterPeriod);
            $startDate = $request->startDate;
            $endDate = $request->endDate;
            if ($timeInterval === 7) {
                $apiUrl = $this->API_URL . env('API_VERSION') . '/teamreport/get-team-scheduler-stats?teamId=' . $teamId . '&filterPeriod=' . $timeInterval . '&since=' . $startDate . '&until=' . $endDate;
            } else {
                $apiUrl = $this->API_URL . env('API_VERSION') . '/teamreport/get-team-scheduler-stats?teamId=' . $teamId . '&filterPeriod=' . $timeInterval;

            }
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl);
            return $this->helper->responseHandler($response['data']);
        } catch (Exception $e) {
            return $this->helper->callingErrorHandler($e, 'getScheduleReports() {ReportsController}');
        }
    }

    public function getTwitterReportsByTeam(Request $request)
    {
        try {
            $teamid = $request->teamid;
            $timeInterval = intval($request->filterPeriod);
            $accid = $request->accid;
            $startDate = $request->startDate;
            $endDate = $request->endDate;
            if ($timeInterval === 7) {
                $apiUrl = ApiConfig::getFeeds('/networkinsight/get-twitter-insight?accountId=' . $accid . '&teamId=' . $teamid . '&filterPeriod=' . $timeInterval . '&since=' . $startDate . '&until=' . $endDate);
            } else {
                $apiUrl = ApiConfig::getFeeds('/networkinsight/get-twitter-insight?accountId=' . $accid . '&teamId=' . $teamid . '&filterPeriod=' . $timeInterval);
            }
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl);
            return $this->helper->responseHandler($response['data']);
        } catch (Exception $e) {
            return $this->helper->callingErrorHandler($e, 'getTwitterReportsByTeam() {ReportsController}');
        }
    }

    public function getFacebookReportsByTeam(Request $request)
    {
        try {
            $teamid = $request->teamid;
            $timeInterval = intval($request->filterPeriod);
            $accid = $request->accid;
            $startDate = $request->startDate;
            $endDate = $request->endDate;
            if ($timeInterval === 7) {
                $apiUrl = ApiConfig::getFeeds('/networkinsight/get-facebook-page-insight?accountId=' . $accid . '&teamId=' . $teamid . '&filterPeriod=' . $timeInterval . '&since=' . $startDate . '&until=' . $endDate);
            } else {
                $apiUrl = ApiConfig::getFeeds('/networkinsight/get-facebook-page-insight?accountId=' . $accid . '&teamId=' . $teamid . '&filterPeriod=' . $timeInterval);
            }
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl);
            return $this->helper->responseHandler($response['data']);
        } catch (Exception $e) {
            return $this->helper->callingErrorHandler($e, 'getFacebookReportsByTeam() {ReportsController}');
        }
    }

    public function getTeamReportsByTeamID(Request $request)
    {
        try {
            $result = [];
            $twitterAccs = [];
            $fbaccs = [];
            $teamid = $request->teamid;
            $apiUrl1 = ApiConfig::get('/team/get-team-details?teamId=' . $teamid);
            $apiUrl2 = ApiConfig::getFeeds('/networkinsight/get-team-insight?teamId=' . $teamid . '&filterPeriod=1');
            $response1 = $this->helper->postApiCallWithAuth('get', $apiUrl1);
            $response2 = $this->helper->postApiCallWithAuth('post', $apiUrl2);
            $result2 = $response1['data'];
            if ($result2->code === 200) {
                foreach ($result2->data->teamSocialAccountDetails[0]->SocialAccount as $item) {
                    if ($item->account_type === 4) {
                        array_push($twitterAccs, $item);
                    }
                    if ($item->account_type === 2) {
                        array_push($fbaccs, $item);
                    }
                }
            }
            $result['teamsData'] = $result2;
            $result['teamInsight'] = $response2;
            $result['twitterAccs'] = $twitterAccs;
            $result['fbaccs'] = $fbaccs;
            return $result;
        } catch (Exception $e) {
            return $this->helper->callingErrorHandler($e, 'getTeamReportsByTeamID() {ReportsController}');
        }
    }

    public function getTwitterReports()
    {
        try {
            $team = Session::get('team');
            $teamID = $team['teamid'];
            $apiUrl = ApiConfig::get('/team/get-team-details?teamId=' . $teamID);
            $response = $this->helper->postApiCallWithAuth('get', $apiUrl);
            return view("reports::twitterReports")->with(["teamsSocialAccounts" => $response['data']]);
        } catch (Exception $e) {
            return $this->helper->callingErrorHandler($e, 'getTwitterReports() {ReportsController}');
        }

    }

    public function getYoutubeReports()
    {
        try {
            $team = Session::get('team');
            $teamID = $team['teamid'];
            $apiUrl = ApiConfig::get('/team/get-team-details?teamId=' . $teamID);
            $response = $this->helper->postApiCallWithAuth('get', $apiUrl);
            return view("reports::youtubeReports")->with(["teamsSocialAccounts" => $response['data']]);
        } catch (Exception $e) {
            return $this->helper->callingErrorHandler($e, 'getYoutubeReports() {ReportsController}');

        }
    }

    public function getCommulativeReports(Request $request)
    {
        try {
            $team = Session::get('team');
            $accID = $request->accid;
            $teamID = $team['teamid'];
            $timeInterval = intval($request->filterPeriod);
            $startDate = $request->startDate;
            $endDate = $request->endDate;

            if ($timeInterval === 7) {
                $apiUrl = ApiConfig::getFeeds('/networkinsight/get-twitter-stats?accountId=' . $accID . '&teamId=' . $teamID . '&filterPeriod=' . $timeInterval . '&since=' . $startDate . '&until=' . $endDate);
            } else {
                $apiUrl = ApiConfig::getFeeds('/networkinsight/get-twitter-stats?accountId=' . $accID . '&teamId=' . $teamID . '&filterPeriod=' . $timeInterval);
            }
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl);
            return $this->helper->responseHandler($response['data']);
        } catch (Exception $e) {
            return $this->helper->callingErrorHandler($e, 'getCommulativeReports() {ReportsController}');
        }
    }

    public function getYoutubeReportsByTeam(Request $request)
    {

        try {
            $teamID = $request->teamid;
            $timeInterval = intval($request->filterPeriod);
            $accID = $request->accid;
            $startDate = $request->startDate;
            $endDate = $request->endDate;
            if ($timeInterval === 7) {
                $apiUrl = ApiConfig::getFeeds('/networkinsight/get-youtube-insight?accountId=' . $accID . '&teamId=' . $teamID . '&filterPeriod=' . $timeInterval . '&since=' . $startDate . '&until=' . $endDate);
            } else {
                $apiUrl = ApiConfig::getFeeds('/networkinsight/get-youtube-insight?accountId=' . $accID . '&teamId=' . $teamID . '&filterPeriod=' . $timeInterval);
            }
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl);
            return $this->helper->responseHandler($response['data']);
        } catch (Exception $e) {
            return $this->helper->callingErrorHandler($e, 'getYoutubeReportsByTeam() {ReportsController}');
        }
    }

    public function getFacebookReports(Request $request)
    {
        try {
            $team = Session::get('team');
            $teamID = $team['teamid'];
            $apiUrl = ApiConfig::get('/team/get-team-details?teamId=' . $teamID);
            $response = $this->helper->postApiCallWithAuth('get', $apiUrl);
            return view("reports::facebookReports")->with(["teamsSocialAccounts" => $response['data']]);
        } catch (Exception $e) {
            return $this->helper->callingErrorHandler($e, 'getFacebookReports() {ReportsController}');
        }

    }

    /**
     * TODO we've to show the reports settings pages along with the user details onload of the page.
     * This function is used for showing the reports settings blade page along with the userdetails show onload.
     * ! Do not change this function without referring UI and directory structure and API for showing user details.
     */
    public function getReportsSettings(Request $request)
    {
        try {
            $apiUrl = ApiConfig::get('/user/get-user-info');
            $response = $this->helper->postApiCallWithAuth('get', $apiUrl);
            return view('reports::reportsSettings')->with(["userDetails" => $response['data']]);
        } catch (Exception $e) {
            return $this->helper->callingErrorHandler($e, 'getReportsSettings() {ReportsController}');
        }

    }

    /**
     * TODO we've to  the update the reports  settings of the user with company name and comapany logo.
     * This function is used for updating the company logo and comapny user of the website from fornt end.
     * @param {string} companyName- compamy name of that particular user account.
     * @param {file} file- compamy logo of that in file .
     * ! Do not change function without referring the API format of the updating comapny logo and company name.
     */
    public function updateReportsSettings(Request $request)
    {

        try {
            $data['company_name'] = $request->companyName;
            if ($request->remove_avatar_value == "1") $data['company_logo'] = "media/logos/sb-icon.svg";
            else {
                $file = $request->file;
                if ($file != "undefined") {
                    $fname = $file->getClientOriginalName();
                    $destinationPath = public_path('media/logos');
                    $file->move($destinationPath, $fname);
                    $data['company_logo'] = 'media/logos/' . $fname;
                }
            }
            $apiUrl = $this->API_URL . env('API_VERSION') . '/user/update-profile-details';
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl, $data);
            return $this->helper->responseHandler($response['data']);
        } catch (Exception $e) {
            return $this->helper->callingErrorHandler($e, 'updateReportsSettings() {ReportsController}');
        }
    }


    public function uploadScreenShots(Request $request)
    {
        $title = $request->get('title');
        $image = $request->get('image');
        $image_parts = explode(";base64,", $image);
        $ssData = (object)array(
            "media" => $image_parts[1]
        );
        $data = (object)array(
            "mediaDetails" => $ssData
        );
        try {
            $apiUrl = $this->API_URL_PUBLISH . env('API_VERSION') . '/upload/ss_template?title=' . $title;
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl, $data);
            return $this->helper->responseHandler($response['data']);
        } catch (\Exception $e) {
            return $this->helper->errorHandler($e, 'uploadScreenShots(){ScreenShotsController}');
        }
    }


    public function getReportImagesPage(Request $request)
    {
        try {
            return view("reports::reports_generated");
        } catch (\Exception $e) {
            return $this->helper->callingErrorHandler($e, 'getReportImages() {ReportsController}');
        }
    }

    public function getReportImagesOnload()
    {
        try {
            $apiUrl = $this->API_URL_PUBLISH . env('API_VERSION') . '/upload/get-ss-templates';
            $response = $this->helper->postApiCallWithAuth('get', $apiUrl);
            if ($response['data']->code === 200) {
                return Response::json(array(
                    'code' => 200,
                    'status' => 'Success',
                    'data' => $response['data']->message,
                ), 200);
            } else {
                return Response::json(array(
                    'code' => 400,
                    'status' => 'Failed',
                    'data' => '<div class="card-body pd-y-7">
                                  <div class="alert alert-danger mg-b-0" role="alert">
                                  <strong>NO  Canvas Reports  Data Present for this account!</strong>
                                  </div>
	                              <br>
	                               <img src="assets/img/ic_notfound.png">
	                           </div>',
                ), 203);
            }
        } catch (\Exception $e) {
            return $this->helper->callingErrorHandler($e, 'getReportImagesOnload() {ReportsController}');
        }
    }

    public function deleteThisCardFromTemplate(Request $request){
        try {
            $apiUrl = $this->API_URL_PUBLISH . env('API_VERSION') . '/upload/delete-particular-template?templateId='.$request->id;
            $response = $this->helper->postApiCallWithAuth('delete', $apiUrl);
            return $this->helper->responseHandler($response['data']);
        }
        catch (\Exception $e) {
            return $this->helper->callingErrorHandler($e, 'getReportImagesOnload() {ReportsController}');

        }
    }
    public function deleteAllTheCards()
    {
        try {
            $apiUrl = $this->API_URL_PUBLISH . env('API_VERSION') . '/upload/delete-ss-templates';
            $response = $this->helper->postApiCallWithAuth('delete', $apiUrl);
            return $this->helper->responseHandler($response['data']);
        }
        catch (\Exception $e) {
            return $this->helper->callingErrorHandler($e, 'getReportImagesOnload() {ReportsController}');

        }
    }    /**
     * TODO we've to get the details to send the email reports automatically.
     * ! Do not change function without referring the API format of the updating comapny logo and company name.
     */
    public function autoEmailReports()
    {
        try {
            $twitterAccounts = [];
            $youtubeAccounts = [];
            $teamdetails = [];
            $i = 0;
            $j = 0;
            $k = 0;
            $apiUrl = ApiConfig::get('/team/get-details');
            $response = $this->helper->postApiCallWithAuth('get', $apiUrl);
            $responseData = $this->helper->responseHandler($response['data']);
            foreach ($responseData['data']->socialAccounts as $social) {
                if ($social->account_type === 4) {
                    $twitterAccounts[$i] = $social;
                    $i++;
                }
            }
            foreach ($responseData['data']->socialAccounts as $social) {
                if ($social->account_type === 9) {
                    $youtubeAccounts[$j] = $social;
                    $j++;
                }
            }
            foreach ($responseData['data']->teamSocialAccountDetails as $team) {
                $teamdetails[$k] = $team[0];
                $k++;
            }
            $apiUrl = env('API_URL_UPDATE').env('API_VERSION').'/report/get-reports?pageId=1';
            $response = $this->helper->postApiCallWithAuth('get', $apiUrl);
            $reports = $this->helper->responseHandler($response['data']);
            $data = [];
            $x = 0;
            foreach ($reports['data'] as $report){
                $data[$x][0]['id'] = $report->id;
                $data[$x][0]['report_title'] = $report->report_title;
                $data[$x][0]['report_type'] = $report->report_type;
                $data[$x][0]['frequency'] = $report->frequency;
                $content = json_decode($report->content);
                $data[$x][0]['emails'] = $content->email;
                $data[$x][0]['teamReport'] = isset($content->teamReport) ? $content->teamReport : null;
                $data[$x][0]['youTube'] = isset($content->youTube) ? $content->youTube : null;
                $data[$x][0]['twitterReport'] = isset($content->twitterReport) ? $content->twitterReport : null;
                $x++;
            }
            return view('reports::autoEmailReports', compact('twitterAccounts', 'youtubeAccounts', 'teamdetails','data'));
        } catch (Exception $e) {
            return $this->helper->callingErrorHandler($e, 'autoEmailReports() {ReportsController}');
        }
    }
    /**
     * TODO we've to  the save the reports  settings for sending reports automatically to the emails.
     * This function is used for saving the details to send emails automatically.
     *  @param {string} reportstitle- Title of the report.
     *  @param {number} frequency- Frequency of the email to be sent.
     *  @param {string} recipient_emails- email-ids to which report should be sent.
     *  @param {string} recipient_emails- email-ids to which report should be sent.
     * @param {numbber} type- Type of a file to be sent to emails.
     * ! Do not change function without referring the API format of the updating comapny logo and company name.
     */
    public function saveAutoEmailReports(Request $request)
    {
        try {
            $validator = Validator::make($request->only('reportstitle', 'frequency','recipient_emails','type'), [
                "reportstitle" => "required",
                "frequency" => "required",
                "recipient_emails" => "required",
                "type" => "required",
            ], [
                'reportstitle.required' => 'Report Title is Required',
                'frequency.required' => 'Frequency field is Required',
                'recipient_emails.required' => 'Recipient Field is Required',
                'type.required' => 'Report Type is Required',
            ]);
            if ($validator->fails()) {
                $response['code'] = 201;
                $response['msg'] = $validator->errors()->all();
                $response['data'] = null;
                return Response::json($response, 200);
            }
            $reportstitle = isset($request->reportstitle) ? $request->reportstitle : null;
            $frequency =  isset($request->frequency) ? $request->frequency : null;
            $recipient_emails = isset($request->recipient_emails) ? $request->recipient_emails : null;
            $teams = isset($request->teams) ? $request->teams : null;
            $twitter =  isset($request->twitter) ? $request->twitter : null;
            $youtube = isset($request->youtube) ? $request->youtube : null;
            $type =  isset($request->type) ? $request->type : null;

            $apiUrl = env('API_URL_UPDATE').env('API_VERSION').'/report/create?reportTitle='.$reportstitle.'&frequency='.$frequency.'&report='.$type.'&testMail='.$request->submit_type;

            $requestData = [
                "autoReport" => [
                    "email" => $recipient_emails,
                    "teamReport" => $teams,
                    "twitterReport" => $twitter,
                    "facebookPageReport" => [],
                    "youTube" => $youtube
                ]
            ];
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl,$requestData);

            return $this->helper->responseHandler($response['data']);
        } catch (Exception $e) {
            return $this->helper->callingErrorHandler($e, 'saveAutoEmailReports() {ReportsController}');
        }
    }

    /**
     * TODO we've to  delete the details.
     * This function is used for sdelete the details saved by user
     *  @param {number} id- Id of the particular data.
     * ! Do not change function without referring the API format of the updating comapny logo and company name.
     */
    public function deleteAutoEmailReports($id){
        try {
            $apiUrl = env('API_URL_UPDATE').env('API_VERSION').'/report/delete?id='.$id;
            $response = $this->helper->postApiCallWithAuth('delete', $apiUrl);
            return $this->helper->responseHandler($response['data']);
        } catch (Exception $e) {
            return $this->helper->callingErrorHandler($e, 'saveAutoEmailReports() {ReportsController}');
        }
    }

    /**
     * TODO we've to  update the details.
     * This function is used for updating the details to send emails automatically.
     *  @param {string} reportstitle- Title of the report.
     *  @param {number} frequency- Frequency of the email to be sent.
     *  @param {string} recipient_emails- email-ids to which report should be sent.
     *  @param {string} recipient_emails- email-ids to which report should be sent.
     * @param {numbber} type- Type of a file to be sent to emails.
     * ! Do not change function without referring the API format of the updating comapny logo and company name.
     */
    public function updateAutoEmailReports(Request $request){
            try {
                $validator = Validator::make($request->only('update_reportstitle', 'update_frequency','update_recipient_emails','update_type'), [
                    "update_reportstitle" => "required",
                    "update_frequency" => "required",
                    "update_recipient_emails" => "required",
                    "update_type" => "required",
                ], [
                    'update_reportstitle.required' => 'Report Title is Required',
                    'update_frequency.required' => 'Frequency field is Required',
                    'update_recipient_emails.required' => 'Recipient Field is Required',
                    'update_type.required' => 'Report Type is Required',
                ]);
                if ($validator->fails()) {
                    $response['code'] = 201;
                    $response['msg'] = $validator->errors()->all();
                    $response['data'] = null;
                    return Response::json($response, 200);
                }
                $email = (explode(",",$request->update_recipient_emails));
                $emails = [];
                $i = 0;
                foreach ($email as $value){
                    if ($value !== "") {
                        $emails[$i] = $value;
                        $i++;
                    }
                }
                $reportstitle = isset($request->update_reportstitle) ? $request->update_reportstitle : null;
                $frequency =  isset($request->update_frequency) ? $request->update_frequency : null;
                $recipient_emails = isset($emails) ? $emails : null;
                $teams = isset($request->update_teams) ? $request->update_teams : null;
                $twitter =  isset($request->update_twitter) ? $request->update_twitter : null;
                $youtube = isset($request->update_youtube) ? $request->update_youtube : null;
                $type =  isset($request->update_type) ? $request->update_type : null;

                $apiUrl = env('API_URL_UPDATE').env('API_VERSION').'/report/edit?id='.$request->id.'&reportTitle='.$reportstitle.'&frequency='.$frequency.'&report='.$type.'&testMail=1';
                $requestData = [
                    "autoReport" => [
                        "email" => $recipient_emails,
                        "teamReport" => $teams,
                        "twitterReport" => $twitter,
                        "youTube" => $youtube
                    ]
                ];
                $response = $this->helper->postApiCallWithAuth('put', $apiUrl,$requestData);
                return $this->helper->responseHandler($response['data']);
        } catch (Exception $e) {
            return $this->helper->callingErrorHandler($e, 'saveAutoEmailReports() {ReportsController}');
        }
    }
}
