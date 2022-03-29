<?php

namespace Modules\Boards\Http\Controllers;

use App\Http\Requests\RegistrationRequest;
use App\ApiConfig\ApiConfig;
use Illuminate\Contracts\Support\Renderable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Modules\User\helper;
use Illuminate\Routing\Controller;
use Modules\Boards\Http\Requests\createBoards;
use Exception;

class BoardsController extends Controller
{
    /**
     * Display a listing of the resource.
     * @return Renderable
     */

    protected $helper;

    public function __construct()
    {
        $this->helper = Helper::getInstance();
    }
    /**
     * Show the form for creating a new resource.
     * @return Renderable
     */
    public function create()
    {
        return view('boards::create_boards');
    }

    /**
     * TODO we've to create boards for a particular team.
     * * This function is used for creating boards for a particular team
     * By Requesting the /boards/create-board external NODE API from controller.
     * @param {string} boardName- Name of a board to be created.
     * @param {string} keywords-  Keyword fo board to be created.
     * !Do not change this function without referring API format getting the particular feeds from feeds servies.
     * @return {Object} Returns created board data in JSON object format.
    */
    public function createBoards(createBoards $request)
    {
            $team = Session::get('team');
            $apiUrl = ApiConfig::getFeeds('/boards/create-board');
            $keyword = urlencode($request->keywords);
            $apiUrl = $apiUrl.'?boardName='.$request->boardname.'&Keyword='.$keyword.'&teamId='.$team['teamid'];
            $boardInfo = array(
                "boardName" => $request->boardname,
                "Keyword" => $keyword,
                "teamId"=>$team['teamid']
            );
            try {
                $response = $this->helper->postApiCallWithAuth('post', $apiUrl, $boardInfo);
                return $this->helper->responseHandler($response['data']);

            } catch (\GuzzleHttp\Exception\RequestException $e) {
                $this->helper->logException($e, 'createBoards() {BoardsController}');
                return redirect()->back()->with("ErrorMessage", 'Can not fetch accounts, please reload page');
            }
    }

    /**
     * TODO we've to show all boards for a particular team.
     * * This function is used for fetching boards for a particular team
     * By Requesting the /boards/get-all-boards external NODE API from controller.
     * @param {string} boardName- Name of a board to be created.
     * @param {string} keywords-  Keyword fo board to be created.
     * !Do not change this function without referring API format getting the particular feeds from feeds servies.
     * @return {Object} Returns all boards data in JSON object format.
    */
    public function show()
    {
        $apiUrl = ApiConfig::getFeeds('/boards/get-all-boards');
        $team = Session::get('team');
        $apiUrl = $apiUrl.'?teamId='.$team['teamid'];
        try {
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl);
            if ($response['code'] === 200) {
                $responseData = $this->helper->responseHandler($response['data']);
                return view('boards::view_boards')->with(["accounts" => $responseData]);
            } else {
                return view('boards::view_boards')->with(["ErrorMessage" => 'Can not fetch accounts, please reload page']);
            }
        } catch (Exception $e) {
            $this->helper->logException($e->getLine(),$e->getCode(),$e->getMessage(), 'show() {BoardsController}');
            return view('boards::view_boards')->with(["ErrorMessage" => 'Can not fetch accounts, please reload page']);
        }
    }

    /**
     * TODO we've to update boards for a particular team.
     * * This function is used for updating board details for a particular team
     * By Requesting the /boards/update-board external NODE API from controller.
     * @param {string} boardName- Name of a board to be updated.
     * @param {string} keywords-  Keyword for board to be updated.
     * @param {number} id-  id for board to be updated.
     * !Do not change this function without referring API format getting the particular feeds from feeds servies.
     * @return {Object} Returns updated board data in JSON object format.
    */
    public function updateBoards(Request $request)
    {
        $team = Session::get('team');
        $apiUrl = ApiConfig::getFeeds('/boards/update-board');
        $keyword = urlencode($request->keywords);
        $apiUrl = $apiUrl . '?boardId=' . $request->id . '&teamId='.$team['teamid'].'&Keyword='.$keyword;
        $boardInfo = array(
            "Keyword" => $keyword,
            "teamId" => $team['teamid']
        );
        try {
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl, $boardInfo);

            return $this->helper->responseHandler($response['data']);

        } catch (\GuzzleHttp\Exception\RequestException $e) {
            $this->helper->logException($e, 'updateBoards() {BoardsController}');
            return redirect()->back()->with("ErrorMessage", 'Can not fetch accounts, please reload page');
        }
    }

    /**
     * TODO we've to delete a perticular board for a particular team.
     * * This function is used for deleting board details for a particular team
     * By Requesting the /boards/delete-board/ NODE API from controller.
     * @param {number} id- id of a board to be deleted..
     * !Do not change this function without referring API format getting the particular feeds from feeds servies.
     * @return {Object} Returns deleted board data in JSON object format.
    */
    public function deleteBoards($id)
    {
        $apiUrl = ApiConfig::getFeeds('/boards/delete-board/');
        $team = Session::get('team');
        $apiUrl = $apiUrl.'?boardId='.$id.'&teamId='.$team['teamid'];
        try {
            $response = $this->helper->postApiCallWithAuth('delete', $apiUrl);
            return $this->helper->responseHandler($response['data']);
        } catch (\GuzzleHttp\Exception\RequestException $e) {
            $this->helper->logException($e, 'deleteBoards() {BoardsController}');
            return redirect()->back()->with("ErrorMessage", 'Can not fetch accounts, please reload page');
        }
    }

    /**
     * TODO we've to search for youtube data a perticular board's keyword.
     * * This function is used for fetching the youtube data based on the keyword
     * By Requesting the /trends/get-youtube NODE API from controller.
     * @param {string} keyword- keyword for a perticular board to be searched
     * @param {int} id- id of a perticular board to be searched
     * !Do not change this function without referring API format getting the particular feeds from feeds servies.
     * @return {Object} Returns searched youtube data in JSON object format.
    */
    public function viewPerticularBoard($keyword, $type, $id)
    {
        $sortBy = array('relevance','rating','title','viewcount','date');
        $randomElement = $sortBy[array_rand($sortBy, 1)];
        $pageId = '';
        ($type === "real") ? $pageId = 1 : $pageId = rand(1, 9);
        $apiUrl = ApiConfig::getFeeds('/trends/get-youtube');
        $apiUrl = $apiUrl.'?keyword='.$keyword.'&ccode=IN&pageId='.$pageId.'&sortBy='.$randomElement;
        $socialAccounts = $this->getSocialAccounts();
        try {
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl);
            if ($response['code'] === 200) {
                $responseData = $this->helper->responseHandler($response['data']);
                return view('boards::boards',compact('responseData', 'id', 'keyword', 'socialAccounts'));
            } else {
                return view('boards::boards')->with(["ErrorMessage" => 'Can not fetch accounts, please reload page']);
            }
        } catch (Exception $e) {
            $this->helper->logException($e->getLine(),$e->getCode(),$e->getMessage(), 'viewPerticularBoard() {BoardsController}');
            return redirect()->back()->with(["ErrorMessage" => 'Can not fetch accounts, please reload page']);
        }

    }

    /**
     * TODO we've to search for more youtube data a perticular board's keyword on scrolling down to the window.
     * * This function is used for fetching the youtube data based on the keyword on scrolling down
     * By Requesting the /trends/get-youtube NODE API from controller.
     * @param {string} keyword- keyword for a perticular board to be searched
     * @param {integer} id- id of a perticular board to be searched
     * !Do not change this function without referring API format getting the particular feeds from feeds servies.
     * @return {Object} Returns searched youtube data in JSON object format.
    */
    public function getMoreYoutubeFeeds(Request $request){
        $apiUrl = ApiConfig::getFeeds('/trends/get-youtube');
        $apiUrl = $apiUrl.'?keyword='.$request->keyword.'&ccode=IN&pageId='.$request->pageid.'&sortBy=relevance';

        try {
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl);
                return $this->helper->responseHandler($response['data']);
        } catch (Exception $e) {
            $this->helper->logException($e->getLine(),$e->getCode(),$e->getMessage(), 'getMoreYoutubeFeeds() {BoardsController}');
            return redirect()->back()->with(["ErrorMessage" => 'Can not fetch accounts, please reload page']);
        }
    }

    /**
     * TODO we've to get the social accounts added to the perticula profile.
     * * This function is used for fetching the youtube data based on the keyword on scrolling down
     * By Requesting the /team/get-team-details NODE API from controller.
     * !Do not change this function without referring API format getting the particular feeds from feeds servies.
     * @return {Object} Returns searched social accounts data in JSON object format.
    */
    public function getSocialAccounts(){
        try {
            $team = \Session::get('team');
            $apiUrl = ApiConfig::get('/team/get-team-details?teamId=' . $team['teamid']);
            try {
                $response = $this->helper->postApiCallWithAuth('get', $apiUrl);
                if ($response['code'] === 200) {
                    $responseData = $this->helper->responseHandler($response['data']);
                    $socialAccounts = [];
                    $accounts = $responseData['data']->teamSocialAccountDetails[0]->SocialAccount;

                    if(!empty($accounts)){
                        foreach ($accounts as $social){
                            foreach ($responseData['data']->SocialAccountStats as $stats){
                                if ($social->account_id === $stats->account_id && $social->account_type !== 9){
                                    $social->friendship_counts = isset($stats->follower_count) && $stats->follower_count !== null ? $stats->follower_count : "0";
                                }
                            }
                        }
                        foreach ($accounts as $key => $account) {
                            if (!$account->join_table_teams_social_accounts->is_account_locked) {
                                switch ($account->account_type) {
                                    case 2:
                                        $socialAccounts['facebook']['page'][] = $account;
                                        break;
                                    case 3:
                                        $socialAccounts['facebook']['group'][] = $account;
                                        break;
                                    case 4:
                                        $socialAccounts['twitter']['account'][] = $account;
                                        break;
                                    case 6:
                                        $socialAccounts['linkedin']['account'][] = $account;
                                        break;
                                    case 7:
                                        $socialAccounts['linkedin']['page'][] = $account;
                                        break;
                                    case 12:
                                        $socialAccounts['instagram']['business account'][] = $account;
                                        break;
                                    case 16:
                                        $socialAccounts['tumblr']['account'][] = $account;
                                        break;
                                }
                            }
                        }
                    }
                    return $socialAccounts;
                } else {
                    return response()->json(["ErrorMessage" => 'Can not fetch accounts, please reload page'], 401);
                }
            } catch (AppException $e) {
                $this->helper->logException($e->getLine(),$e->getCode(),$e->getMessage(), 'index() {BoardsController}');
                return response()->json(["ErrorMessage" => 'Can not fetch accounts, please reload page'], 401);
            }
        } catch (AppException $e) {
            $this->helper->logException($e->getLine(),$e->getCode(),$e->getMessage(), 'index() {BoardsController}');
            return response()->json(["ErrorMessage" => 'Can not fetch accounts, please reload page'], 401);
        }
    }

}

