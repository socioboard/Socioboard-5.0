<?php

namespace Modules\Discovery\Http\Controllers;
use Illuminate\Contracts\Support\Renderable;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use app\ApiConfig\ApiConfig;
use Modules\User\helper;
use Modules\Discovery\Http\Requests\Twitter;



class DiscoveryController extends Controller
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
     * Show the specified resource.
     * @param int $id
     * @return Renderable
     */
    public function showYoutube()
    {
        $keyword = env('YOUTUBE_TRENDS_KEYWORD');
        $apiUrl = ApiConfig::getFeeds('/trends/get-youtube');
        $socialAccounts = $this->getSocialAccounts();
        $apiUrl = $apiUrl.'?keyword='.$keyword.'&pageId=1&sortBy=relevance';
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
        $apiUrl = $apiUrl.'?keyword='.$request->keyword.'&pageId=1&sortBy='.$request->sortby;
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
        $apiUrl = $apiUrl.'?keyword='.$request->keyword.'&pageId='.$request->pageid.'&sortBy=relevance';

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
                            foreach ($accounts as $key => $account) {
                                switch ($account->account_type) {
                                    case 1:
                                        $socialAccounts['facebook']['user'][] = $account;
                                        break;
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
}
