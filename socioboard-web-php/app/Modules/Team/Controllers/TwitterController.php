<?php

namespace App\Modules\Team\Controllers;

use App\Modules\User\Helper;
use function foo\func;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
//use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
//use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Session;
//use Illuminate\Support\Facades\Validator;
use App\Modules\Team\Controllers\TeamController;
use PhpParser\Node\Stmt\Throw_;

class TwitterController extends Controller
{
    protected $client;
    protected $API_URL;
    protected $store;

    public function __construct()
    {
        $this->client = new Client();
        $this->API_URL = env('API_URL') . env('VERSION') . '/';

    }

    public function viewPage($account_id, $page_id)
    {
        $team_id = Session::get('currentTeam')['team_id'];

        try {
            $help = Helper::getInstance();
            $params = [
                'pageId' => 1,
                'accountId' => $account_id,
                'teamId' => $team_id
            ];

            $response = $help->apiCallPostFeeds(null, "feeds/getRecentTweets?".http_build_query($params), null, "GET");
//            $socioboard_accounts = TeamController::getAllSocialAccounts();
//            $socialAccount = Session::get('currentTeam')['SocialAccount'];
            return view('Team::Twitter.index',

                [
                    'feeds' => $response->data->data->posts,
                    'userProfile' => TeamController::getProfileInfo($account_id, 14),
                    'socioboard_accounts' => TeamController::getAllSocialAccounts(),
                    'account_id' => $account_id,
                    "socialAccount"=> Session::get('currentTeam')['SocialAccount'],
                    "pinterestBoards"=> Session::get('pinterestBoards'),

                ]);


        } catch (\Exception $e) {
            TeamController::showErrorPage($e /*, ['link' => '/', 'message' => '/'] */);
        }
    }


    public function viewPosts(Request $request, $account_id, $page_id)
    {
        $team_id = Session::get('currentTeam')['team_id'];
        try {
            $help = Helper::getInstance();
            $params = [
                'pageId' => $page_id,
                'accountId' => $account_id,
                'teamId' => $team_id,
            ];


            $response = $help->apiCallPostFeeds(null, "feeds/getTweets?" . http_build_query($params), null, "GET");


            if ($response->statusCode == 200) {
                if ($response->data->code == 200 && $response->data->status == "success") {
                    return view('Team::Twitter.inc_posts',
                        [
                            'feeds' => $response->data->posts, //Changed $response->data->posts to $response->data->data->posts for getting recent posts (Aishwarya)
                            'userProfile' => TeamController:: getProfileInfo($account_id, 14),
                            'socioboard_accounts' => TeamController::getAllSocialAccounts(),
                        ]);

                } else {
                    throw new \Exception($response->message);
                }
            } else {
                throw new \Exception('Unknown error');
            };

            //return redirect('dashboard/' . $teamid)->with('FBError', "Currently not able to add your account");
        } catch (\Exception $e) {
            return TeamController::showErrorPage($e /*, ['link' => '/', 'message' => '/'] */);
        }
    }


    public function getProfileInfo($account_id)
    {
        $help = Helper::getInstance();
        $socialAccs = Session::get('currentTeam');
        $team_id = $socialAccs['team_id'];

        // included function to get stats
        function getAccAdditionalInfo($statsArr)
        {
            $out = array();

            if (sizeof($statsArr) > 0) {
                foreach ($statsArr as $row) {
                    $out = null;
                    if ($row->account_id == 14) {
                        $out = $row;
                    }
                }
            }
            return (array)$out;
        }

        function accMainInfo($account_id, $response)
        {
            $value = Session::get('currentTeam')['SocialAccount'];
            for ($i = 0; $i < count($value); $i++) {
                if ($value[$i]->account_id == $account_id) {
                    $out[$i] = array_merge((array)$value[$i], getAccAdditionalInfo($response->SocialAccountStats));
                }
            }

            foreach ($out as $row) {
                $r[] = $row;
            }
            return $r;
        };


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
    }


    public function sendLike($postId, $accountId)
    {
        /*
          for like the comment
          https://nodefeeds.socioboard.com/v1/likecomments/twtlike
          For dislike the comment
          https://nodefeeds.socioboard.com/v1/likecomments/twtdislike
          */

        $help = Helper::getInstance();
        $params = [
            'accountId' => $accountId,
            'teamId' => Session::get('currentTeam')['team_id'],
            'tweetId' => $postId,

        ];

        try {
            $apiResponse = $help->apiCallPostFeeds($params, "likecomments/twtlike?" . http_build_query($params), null, 'POST');
            if ($apiResponse->statusCode == 200) {
                if (!empty($apiResponse->data->error)) {
                    $apiResponse->data->message = $apiResponse->data->error;
                }

                return json_encode($apiResponse->data);
            } else {
                return json_encode(['status' => $apiResponse->data->status, 'message' => $apiResponse->data->message]);
            }

        } catch (\Exception $e) {
            return json_encode(['status' => 'error', 'message' => 'code: ' . $apiResponse->statusCode . ', error: ' . $e->getMessage()]);
        }

    }

// send Comment
    public function sendComment(Request $request)
    {
        $help = Helper::getInstance();
        $params = [
            'accountId' => $request->input('accountId'),
            'teamId' => Session::get('currentTeam')['team_id'],
            'tweetId' => $request->input('postId'),
            'comment' => $request->input('comment')
        ];

        if ($request->input('comment') != null) {
            try {
                $apiResponse = $help->apiCallPostFeeds($params, "likecomments/twtcomment?" . http_build_query($params), null, 'POST');

                // try this row with data!{
                if ($apiResponse->statusCode == 200) {
                    switch ($apiResponse->data->code) {
                        case 200:
                            return json_encode(['status' => $apiResponse->data->status, 'message' => $apiResponse->data->message]);
                            break;
                        default:
                            return json_encode(['status' => $apiResponse->data->status, 'message' => $apiResponse->data->error]);
                            break;
                    }
                } else {
                    return json_encode(['status' => $apiResponse->data->status, 'message' => $apiResponse->data->message]);
                }

            } catch (\Exception $e) {
                return json_encode(['status' => 'Sytem error', 'message' => $e->getMessage()]);
            }
        }
    }

    public function viewProfiles()
    {
        $help = Helper::getInstance();
        $result = null;

        try {
            //Get all social acc
            $allSocioAcc = $help->apiCallGet('team/getDetails');
            //

            if ($allSocioAcc->code == 200 && $allSocioAcc->status == "success") {
                //
                //print_r($allSocioAcc); die;

                foreach ($allSocioAcc->teamSocialAccountDetails as $i) {
                    foreach ($i as $j) {
                        foreach ($j->SocialAccount as $profile) {
                            // if facebook profile of facebook page
                            if ($profile->account_type == 1) {
                                // if non-locked
                                if ($profile->join_table_teams_social_accounts->is_account_locked != true) {
                                    $result[] = $profile;
                                }
                            }
                        }
                    }
                }

                return (object)$result;
            } else {
                return null;
            }
        } catch (\Exception $e) {
            return null;
        }
    }

    public function twitterGet($teamid, Request $request)
    {
        try {
            $help = Helper::getInstance();
            $response = $help->apiCallGet('team/getProfileRedirectUrl?teamId=' . $teamid . "&network=" . env('ACCOUNT_ADD_TWITTER'));
            if ($response->code == 200 && $response->status == "success") {
                $twitterReqData = array("teamId" => $teamid,
                    "state" => $response->state);
                Session::put('twitterState', $twitterReqData);
                $request->session()->save(); //coz session wil not get saved if yu immediately redirect
                header('Location: ' . $response->redirectUrl);
                exit(0);
            } else if ($response->code == 400 && $response->status == "failed") {
                return redirect('dashboard/' . $teamid)->with('FBError', "Access denied. You can not add account to this team");
            }
            return redirect('dashboard/' . $teamid)->with('FBError', "Currently not able to add your account");
        } catch (\Exception $e) {
            Log::error('Exception' . $e->getCode() . " @=> " . $e->getLine() . " message=> " . $e->getMessage());
            return redirect('dashboard/' . $teamid)->with('FBError', "Currently not able to add your account");
        }
    }


    // TODO to get msg if account is already added
    public
    function twittercallback(Request $request)
    {

        $state = Session::get('twitterState')['state'];
        $code = $request['oauth_verifier'];
        $team = Session::get('currentTeam')['team_id'];
        try {
            $help = Helper::getInstance();

            $response = $help->apiCallGet('team/addSocialProfile?state=' . $state . '&code=' . $code);
            if ($response->code == 200 && $response->status == "success") {

                Session::forget('twitterState');
                //to get new team data after adding a account to a team
                $team = Helper::getInstance()->getTeamNewSession();
                return redirect('dashboard/' . $response->teamDetails->team_id);
            } else if ($response->code == 400 && $response->status == "failed") {
                Session::forget('twitterState');
                return redirect('dashboard/' . $team)->with('FBError', $response->error); //warning do not remove space here=> ' . $team
//                return redirect('dashboard/'.$teamId)->with('FBerror',$response->error );
            } else if ($response->code == 403) {
                Session::forget('twitterState');
                return redirect('dashboard/' . $team)->with('FBError', $response->message); //warning do not remove space here=> ' . $team
            }
            return redirect('dashboard/' . $team)->withErrors([$response->error]);
        } catch (\Exception $e) {
            Log::error('Exception' . $e->getCode() . " @=> " . $e->getLine() . " message=> " . $e->getMessage());
            return Redirect::back()->withErrors(['Not able to add tour account']);
        }

    }
}
