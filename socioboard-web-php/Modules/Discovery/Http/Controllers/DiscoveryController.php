<?php

namespace Modules\Discovery\Http\Controllers;
use Illuminate\Contracts\Support\Renderable;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use app\ApiConfig\ApiConfig;
use Illuminate\Support\Facades\Session;
use Modules\User\helper;
use Modules\Discovery\Http\Requests\Twitter;



class DiscoveryController extends Controller
{
    /**
     * Display a listing of the resource.
     * @return Renderable
     */

    protected $helper;
    protected $apiPublishUrl;
    protected $apifeedshUrl;

    public function __construct()
    {
        $this->helper = Helper::getInstance();
        $this->apiPublishUrl = env('API_URL_PUBLISH').env('API_VERSION');
        $this->apifeedshUrl = env('API_URL_FEEDS').env('API_VERSION');
    }

    /**
     * Show the specified resource.
     * @param int $id
     * @return Renderable
     */
    public function showYoutube()
    {
        $keyword = env('YOUTUBE_TRENDS_KEYWORD');
        $apiUrl = ApiConfig::getFeeds('/trends/get-youtube');
        $socialAccounts = $this->getSocialAccounts();
        $apiUrl = $apiUrl.'?keyword='.$keyword.'&pageId=1&ccode=IN&sortBy=relevance';
        try {
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl);
            if ($response['code'] === 200) {
                $responseData = $this->helper->responseHandler($response['data']);
                $keyword = $keyword;
                return view('discovery::youtube',compact('responseData','keyword','socialAccounts'));
            } else {
                return view('discovery::youtube')->with(["ErrorMessage" => 'Can not fetch accounts, please reload page']);
            }
        } catch (Exception $e) {
            $this->helper->logException($e->getLine(),$e->getCode(),$e->getMessage(), 'showYoutube() {DiscoveryController}');
            return view('discovery::youtube')->with(["ErrorMessage" => 'Can not fetch accounts, please reload page']);
        }
    }

    /**
     * Show the form for editing the specified resource.
     * @param int $id
     * @return Renderable
     */
    public function showTwitter()
    {
        $keyword = env('TWITTER_TRENDS_KEYWORD');
        $apiUrl = ApiConfig::getFeeds('/trends/get-Twitter');
        $apiUrl = $apiUrl . '?keyword=' . $keyword;
        $socialAccounts = $this->getSocialAccounts();
        try {
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl);
            if ($response['code'] === 200) {
                $responseData = $this->helper->responseHandler($response['data']);
                $keyword= $keyword;
                return view('discovery::twitter',compact('responseData','keyword','socialAccounts'));
            } else {
                return view('discovery::twitter')->with(["ErrorMessage" => 'Can not fetch accounts, please reload page']);
            }
        } catch (Exception $e) {
            $this->helper->logException($e->getLine(),$e->getCode(),$e->getMessage(), 'searchYoutube() {DiscoveryController}');
            return view('discovery::twitter')->with(["ErrorMessage" => 'Can not fetch feeds, please reload page']);
        }
    }

    /**
     * Update the specified resource in storage.
     * @param Request $request
     * @param int $id
     * @return Renderable
     */
    public function searchYoutube(Twitter $request)
    {
        $apiUrl = ApiConfig::getFeeds('/trends/get-youtube');
        $socialAccounts = $this->getSocialAccounts();
        $apiUrl = $apiUrl.'?keyword='.$request->keyword.'&ccode=IN&pageId=1&sortBy='.$request->sortby;
        try {
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl);

            if ($response['code'] === 200) {
                $responseData = $this->helper->responseHandler($response['data']);
                $keyword = $request->keyword;
                $sortBy = $request->sortby;

                return view('discovery::youtube',compact('responseData','keyword','sortBy','socialAccounts'));
            } else {
                return view('discovery::youtube')->with(["ErrorMessage" => 'Can not fetch accounts, please reload page']);
            }
        } catch (Exception $e) {
            $this->helper->logException($e->getLine(),$e->getCode(),$e->getMessage(), 'searchYoutube() {DiscoveryController}');
            return view('discovery::youtube')->with(["ErrorMessage" => 'Can not fetch feeds, please reload page']);
        }

    }

    public function getMoreYoutubeFeeds(Request $request){
        $apiUrl = ApiConfig::getFeeds('/trends/get-youtube');
        $apiUrl = $apiUrl.'?keyword='.$request->keyword.'&ccode=IN&pageId='.$request->pageid.'&sortBy=relevance';

        try {
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl);
            return $this->helper->responseHandler($response['data']);
        } catch (Exception $e) {
            $this->helper->logException($e->getLine(),$e->getCode(),$e->getMessage(), 'searchYoutube() {DiscoveryController}');
            return view('discovery::youtube')->with(["ErrorMessage" => 'Can not fetch feeds, please reload page']);
        }
    }

    /**
     * Remove the specified resource from storage.
     * @param int $id
     * @return Renderable
     */
    public function searchTwitter(Twitter $request)
    {
        $apiUrl = ApiConfig::getFeeds('/trends/get-Twitter');
        $socialAccounts = $this->getSocialAccounts();
            $apiUrl = $apiUrl . '?keyword=' . $request->keyword;
        try {
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl);

            if ($response['code'] === 200) {
                $responseData = $this->helper->responseHandler($response['data']);
                $keyword= $request->keyword;

                return view('discovery::twitter',compact('responseData','keyword','socialAccounts'));
            } else {
                return view('discovery::twitter')->with(["ErrorMessage" => 'Can not fetch accounts, please reload page']);
            }
        } catch (Exception $e) {
            $this->helper->logException($e->getLine(),$e->getCode(),$e->getMessage(), 'searchYoutube() {DiscoveryController}');
            return view('discovery::twitter')->with(["ErrorMessage" => 'Can not fetch feeds, please reload page']);
        }
    }

    public function getMoreTwitterFeeds(Twitter $request){

        $apiUrl = ApiConfig::getFeeds('/trends/get-Twitter?keyword=' . $request->keyword.'&max_id='.$request->maxId);
        try {
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl);
            if ($response['code'] === 200) {
                return  $this->helper->responseHandler($response['data']);
            } else {
                return view('discovery::twitter')->with(["ErrorMessage" => 'Can not fetch accounts, please reload page']);
            }
        } catch (Exception $e) {
            $this->helper->logException($e->getLine(),$e->getCode(),$e->getMessage(), 'searchYoutube() {DiscoveryController}');
            return view('discovery::twitter')->with(["ErrorMessage" => 'Can not fetch feeds, please reload page']);
        }
    }

    public function showRssFeeds()
    {
        $url = env('RSS_TRENDS_KEYWORD');
        $apiUrl = ApiConfig::getFeeds('/feeds/get-recent-rssurls');
        $apiUrlFeeds = ApiConfig::getFeeds('/feeds/get-rss-feeds?rssUrl='.env('RSS_TRENDS_KEYWORD'));
        $socialAccounts = $this->getSocialAccounts();
        try {
            $response = $this->helper->postApiCallWithAuth('get', $apiUrl);
            $responseFeeds = $this->helper->postApiCallWithAuth('get', $apiUrlFeeds);

            if ($response['code'] === 200) {
                $responseData =   $this->helper->responseHandler($response['data']);
            }
            else {
                return view('discovery::rss-feeds')->with(["ErrorMessageUels" => 'Can not fetch the recent searched Urls, please reload page']);
            }
            if ($responseFeeds['code'] === 200) {
                $responseFeedsData =   $this->helper->responseHandler($responseFeeds['data']);
            }
            else {
                return view('discovery::rss-feeds')->with(["ErrorMessageFeeds" => 'Can not fetch rss feeds, please reload page']);
            }
            return view('discovery::rss-feeds',compact('responseData','responseFeedsData','url','socialAccounts'));

        } catch (Exception $e) {
            $this->helper->logException($e->getLine(),$e->getCode(),$e->getMessage(), 'searchYoutube() {DiscoveryController}');
            return view('discovery::rss-feeds')->with(["ErrorMessage" => 'Can not fetch feeds, please reload page']);
        }
    }

    public function searchRssFeeds(Request $request)
    {
        $apiUrl = ApiConfig::getFeeds('/feeds/get-rss-feeds?rssUrl='.$request->url);

        try {
            $response = $this->helper->postApiCallWithAuth('get', $apiUrl);
            $socialAccounts = $this->getSocialAccounts();
            if ($response['code'] === 200) {
                return  $this->helper->responseHandler($response['data']);
            } else {
                return view('discovery::rss-feeds')->with(["ErrorMessage" => 'Can not fetch accounts, please reload page']);
            }
        } catch (Exception $e) {
            $this->helper->logException($e->getLine(),$e->getCode(),$e->getMessage(), 'searchYoutube() {DiscoveryController}');
            return view('discovery::rss-feeds')->with(["ErrorMessage" => 'Can not fetch feeds, please reload page']);
        }
    }

    public function editRssTitle(Request $request)
    {
        $parameters = array(
            'title' => $request['title'],
            'rssUrl' => $request['url'],
            'description' => $request['description'],
            'isBookMarked' => false,
        );
        $apiUrl = ApiConfig::getFeeds('/feeds/update-rss-urls?id=' . $request->id);
        try {
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl, $parameters);
            return $this->helper->responseHandler($response['data']);

        } catch (Exception $e) {
            $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'editRssTitle() {DiscoveryController}');
            return view('discovery::rss-feeds')->with(["ErrorMessage" => 'Can not fetch feeds, please reload page']);
        }
    }

    public function publishModel(Request $request)
        {
            $socialAccounts = [];
                $mediaData = [
                    'mediaUrl' => $request->has('mediaUrl') ? $request->get('mediaUrl') : null,
                    'sourceUrl' => $request->has('sourceUrl') ? $request->get('sourceUrl') : null,
                    'publisherName' => $request->has('publisherName') ? $request->get('publisherName') : null,
                    'title' => $request->has('title') ? $request->get('title') : null,
                    'description' => $request->has('description') ? $request->get('description') : null,
                    'type' => $request->has('type') ? $request->get('type') : null,
                    'socioalAccount' => $socialAccounts
                ];
            return $mediaData;
        }

        public function getSocialAccounts(){
            try {
                $team = \Session::get('team');
                $apiUrl = ApiConfig::get('/team/get-team-details?teamId=' . $team['teamid']);
                try {
                    $response = $this->helper->postApiCallWithAuth('get', $apiUrl);
                    $socialAccounts = [];
                    if ($response['code'] === 200) {
                        $responseData = $this->helper->responseHandler($response['data']);
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
                                        case 7:
                                            $socialAccounts['linkedin']['account'][] = $account;
                                            break;
                                        case 12:
                                            $socialAccounts['instagram']['business account'][] = $account;
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
                    $this->helper->logException($e->getLine(),$e->getCode(),$e->getMessage(), 'index() {DashboardController}');
                    return response()->json(["ErrorMessage" => 'Can not fetch accounts, please reload page'], 401);
                }
            } catch (AppException $e) {
                $this->helper->logException($e->getLine(),$e->getCode(),$e->getMessage(), 'index() {DashboardController}');
                return response()->json(["ErrorMessage" => 'Can not fetch accounts, please reload page'], 401);
            }
        }

    /**
     * Show the created newspapers.
     * @return Renderable
     */
    public function automatedRssFeeds()
    {
        try {
            $apiUrl = ApiConfig::getFeeds('/feeds/rss/channels');
            $responsess = $this->helper->postApiCallWithAuth('get', $apiUrl);
            $result = $this->helper->responseHandler($responsess['data']);
            return view('discovery::automated-rss-feeds',['channels' => $result]);
        }catch (AppException $e) {
            $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'automatedRssFeeds() {DashboardController}');
            return response()->json(["ErrorMessage" => 'Can not fetch accounts, please reload page'], 401);
        }

    }

    /**
     * Create the specified Newspaper in db.
     * @param Request $request
     * @type post
     * @return Renderable
     */
    public function saveNewsPapers(Request $request)
    {
        $result = [];
        if (!isset($request->profile_avatar)){
            $result['code'] = 401;
            $result['message'] = "Avatar Picture is required";
            $result['error'] = "Avatar Picture is required";
            return $result;
        }
        if ($request['newspaper'] === null){
            $result['code'] = 401;
            $result['message'] = "Newspaper Title is required";
            $result['error'] = "Newspaper Title is required";
            return $result;
        }
        if(filter_var($request['newspaper'], FILTER_VALIDATE_URL)){
            $result['code'] = 401;
            $result['message'] = "Newspaper Title should be a string";
            $result['error'] = "Newspaper Title should be a string";
            return $result;
        }
        $input_urls_length = sizeof($request->rss_url);
        $input_keywords_length = sizeof($request->keywords);

        if ($input_urls_length !== $input_keywords_length){
            $result['code'] = 401;
            $result['message'] = "Please check the Urls and Keywords properly";
            $result['error'] = "Please check the Urls and Keywords properly";
            return $result;
        }
        $linkUrls = [];
        if ($input_urls_length === 2){
            $linkUrls[0]['url'] = $request->rss_url[0];
            $linkUrls[0]['category'] = $request->keywords[0];
        }else{
            for ($i=0 ; $i < $input_urls_length ; $i++){
                if ($i > 1) {
                    $linkUrls[$i-1]['url'] = $request->rss_url[$i];
                    $linkUrls[$i-1]['category'] = $request->keywords[$i];
                }else{
                    $linkUrls[$i]['url'] = $request->rss_url[$i];
                    $linkUrls[$i]['category'] = $request->keywords[$i];
                }
            }
        }
        $file = $request->profile_avatar;
        $pathToStorage = public_path('media/uploads');
        $team = Session::get('team')['teamid'];
        if (!file_exists($pathToStorage))
            mkdir($pathToStorage, 0777, true);
        $publishimage = $file->getClientOriginalName();
        $data['media'] = $pathToStorage . "/" . $publishimage;
        file_put_contents($data['media'], file_get_contents($file->path()));
        $filedata = array("name" => "media",
            "file" => $data['media']);
        try {
            $team = \Session::get('team');

            $apiUrl = $this->apiPublishUrl.'/upload/media?title=sample&teamId='.$team['teamid'].'&privacy=3';
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl, $filedata, true);
            $responseData = $this->helper->responseHandler($response['data']);
            unlink(public_path('media/uploads/' . $publishimage));
            $apiUrl = ApiConfig::getFeeds('/feeds/rss/channels');
            $parameters = [
                "title" => $request['newspaper'],
                "logo_url" =>$this->apifeedshUrl.$responseData['data'][0]->media_url,
                "links"=> $linkUrls
            ];
            $responsess = $this->helper->postApiCallWithAuth('post', $apiUrl, $parameters);
            return $this->helper->responseHandler($responsess['data']);
        }
        catch (AppException $e) {
            $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'saveNewsPapers() {DashboardController}');
            return response()->json(["ErrorMessage" => 'Can not fetch accounts, please reload page'], 401);
        }
    }

    /**
     * Delete the specified Newspaper in db.
     * @param $id
     * @type delete
     * @return Renderable
     */

    public function deleteNewsPapers($id)
    {
        $apiUrl = ApiConfig::getFeeds('/feeds/rss/channels');
        $linkIds = [
            "channelsIds" => [$id]
        ];
        try {
            $response = $this->helper->postApiCallWithAuth('delete', $apiUrl,$linkIds);
            return $this->helper->responseHandler($response['data']);
        } catch (\GuzzleHttp\Exception\RequestException $e) {
            $this->helper->logException($e, 'deleteTeams() {TeamController}');
            return redirect()->back()->with("ErrorMessage", 'Can not complete the process, please reload page');
        }
    }

    /**
     * get the specified Newspaper channels in db.
     * @type get
     * @return Renderable
     */
    public function RssFeedsArticle()
    {
        try {
            $apiUrl = ApiConfig::getFeeds('/feeds/rss/channels');
            $responsess = $this->helper->postApiCallWithAuth('get', $apiUrl);
            $result = $this->helper->responseHandler($responsess['data']);
            return view('discovery::rss-feeds-articles',['channels' => $result]);
        }catch (AppException $e) {
            $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'RssFeedsArticle() {DashboardController}');
            return response()->json(["ErrorMessage" => 'Can not fetch accounts, please reload page'], 401);
        }

    }

    /**
     * get the specified keywords for newspaper in db.
     * @param $id
     * @type get
     * @return Renderable
     */
    public function getKeywordsForNewsPaper($id){
        $apiUrl = ApiConfig::getFeeds('/feeds/rss/channels/'.$id);
        try {
            $response = $this->helper->postApiCallWithAuth('get', $apiUrl);
            return $this->helper->responseHandler($response['data']);
        } catch (\GuzzleHttp\Exception\RequestException $e) {
            $this->helper->logException($e, 'deleteTeams() {TeamController}');
            return redirect()->back()->with("ErrorMessage", 'Can not complete the process, please reload page');
        }
    }

    /**
     * get the specified keywords for rs link in db.
     * @param Request $request
     * @type get
     * @return Renderable
     */
    public function RssFeedsByLink(Request $request){
        $apiUrl = ApiConfig::getFeeds('/feeds/get-rss-feeds?rssUrl='.$request->url);
        try {
            $response = $this->helper->postApiCallWithAuth('get', $apiUrl);
            return $this->helper->responseHandler($response['data']);
        } catch (\GuzzleHttp\Exception\RequestException $e) {
            $this->helper->logException($e, 'deleteTeams() {TeamController}');
            return redirect()->back()->with("ErrorMessage", 'Can not complete the process, please reload page');
        }
    }

    /**
     * Update the newspaper Data.
     * @param Request $request
     * @type Post
     * @return Renderable
     */
    public function updateNewsPapers(Request $request)
    {
        if ($request['newspaper'] === null) {
            $result['code'] = 401;
            $result['message'] = "Newspaper Title is required";
            $result['error'] = "Newspaper Title is required";
            return $result;
        }
        $input_urls_length = sizeof($request->rss_url);
        $input_keywords_length = sizeof($request->keywords);
        $linkUrls = [];
        for ($i=0 ; $i < $input_urls_length ; $i++){
            $linkUrls[$i]['url'] = $request->rss_url[$i];
            $linkUrls[$i]['category'] = $request->keywords[$i];
            $linkUrls[$i]['id'] = $request->link_ids[$i];
        }
        if (isset($request->profile_avatar)) {
            $file = $request->profile_avatar;
            $pathToStorage = public_path('media/uploads');
            $team = Session::get('team')['teamid'];
            if (!file_exists($pathToStorage))
                mkdir($pathToStorage, 0777, true);
            $publishimage = $file->getClientOriginalName();
            $data['media'] = $pathToStorage . "/" . $publishimage;
            file_put_contents($data['media'], file_get_contents($file->path()));
            $filedata = array("name" => "media",
                "file" => $data['media']);
            $team = \Session::get('team');
            $apiUrl = $this->apiPublishUrl . '/upload/media?title=sample&teamId=' . $team['teamid'] . '&privacy=3';
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl, $filedata, true);
            $responseData = $this->helper->responseHandler($response['data']);
            unlink(public_path('media/uploads/' . $publishimage));
            $logo_url = $this->apifeedshUrl . $responseData['data'][0]->media_url;
        }else{
            $logo_url = $request['logo_url'];
        }
        try {
            $apiUrl = ApiConfig::getFeeds('/feeds/rss/channels/'.$request['id']);
            $parameters = (object)[ "channel" =>[
                "title" => $request['newspaper'],
                "logo_url" => $logo_url,
                "links" => $linkUrls
            ]
            ];

            $responsess = $this->helper->postApiCallWithAuth('patch', $apiUrl, $parameters);
            return $this->helper->responseHandler($responsess['data']);
        } catch (AppException $e) {
            $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'saveNewsPapers() {DashboardController}');
            return response()->json(["ErrorMessage" => 'Can not fetch accounts, please reload page'], 401);
        }
    }

    public function showTwitterSubscription(){
        try {
            $socialAccounts = $this->getSocialAccounts();
            $twitterAccounts = null;
            $accountId = '';
            if (isset($socialAccounts['twitter'])){
                $twitterAccounts = ($socialAccounts['twitter']);
                $accountId = $twitterAccounts['account'][0]->account_id;
            }

            return view('discovery::twitter_subscription',compact( 'twitterAccounts','accountId'));
        } catch (AppException $e) {
            $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'showTwitterSubscription() {DashboardController}');
            return response()->json(["ErrorMessage" => 'Can not fetch accounts, please reload page'], 401);
        }
    }

    public function getTwitterInfuencers(Request $request)
    {
        try {
            $team = \Session::get('team');
            $apiUrl = ApiConfig::getFeeds('/feeds/twitter/users/search?accountId=' . $request->id . '&teamId=' . $team['teamid'] . '&page='.$request->pageId.'&count=20&query=' . $request->keywordValue);
            return $this->helper->postApiCallWithAuth('get', $apiUrl);
        } catch (AppException $e) {
            $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'getTwitterInfuencers() {DashboardController}');
            return response()->json(["ErrorMessage" => 'Can not fetch accounts, please reload page'], 401);
        }
    }

    public function followTwitterInfuencersByusername(Request $request){
        try {
            $team = \Session::get('team');
            $apiUrl = ApiConfig::getFeeds('/feeds/twitter/users/'.$request->status);
            $parameters = (object)[
                "accountId" =>$request->id ,
                "teamId"=> $team['teamid'],
                "user" =>[
                    "screenName"=> $request->screenName
                ]
            ];
            $response =  $this->helper->postApiCallWithAuth('post', $apiUrl, $parameters);
            return $this->helper->responseHandler($response['data']);
        } catch (AppException $e) {
            $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'getTwitterInfuencers() {DashboardController}');
            return response()->json(["ErrorMessage" => 'Can not fetch accounts, please reload page'], 401);
        }
    }
}
