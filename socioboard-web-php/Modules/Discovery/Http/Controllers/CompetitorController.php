<?php

namespace Modules\Discovery\Http\Controllers;

use Illuminate\Contracts\Support\Renderable;
use Illuminate\Routing\Controller;
use app\ApiConfig\ApiConfig;
use Modules\User\helper;


class CompetitorController extends Controller
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

    public function index()
    {
        try {
            return view('discovery::competitor.analytics');
        } catch (Exception $e) {
            $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'index() {CompetitorController}');
            return view('discovery::competitor.analytics')->with(["ErrorMessage" => 'Can not Redirect to Analytics page']);
        }
    }

    public function addCompetitor(\Illuminate\Http\Request $request)
    {
        $apiUrl = ApiConfig::apiAnalytics('/add/competitor');
        try {
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl, $request->only(['sb_userid', 'competitorId', 'platform']));
            if ($response['code'] === 200) {
                $result['code'] = 200;
                $result['message'] = $response['data']->status->message;
                return $response;
            }
            return view('discovery::competitor.analytics')->with(["ErrorMessage" => "Can't able to add Competitors"]);
        } catch (Exception $e) {
            $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'addCompetitor() {CompetitorController}');
            return view('discovery::competitor.analytics')->with(["ErrorMessage" => 'Can not able to add Competitor, please reload page']);
        }
    }

    public function deleteCompetitor(\Illuminate\Http\Request $request)
    {
        $apiUrl = ApiConfig::apiAnalytics('/remove/competitor');
        try {
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl, $request->only(['sb_userid', 'competitorId', 'platform']));
            if ($response['code'] === 200) {
                $result['code'] = 200;
                $result['message'] = $response['data']->status->message;
                return $response;
            }
            return view('discovery::competitor.analytics')->with(["ErrorMessage" => "Can't able to delete Competitors"]);
        } catch (Exception $e) {
            $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'deleteCompetitor() {CompetitorController}');
            return view('discovery::competitor.analytics')->with(["ErrorMessage" => "Can't delete Competitors, please reload page"]);
        }
    }

    public function getCompetitors(\Illuminate\Http\Request $request)
    {
        $apiUrl = ApiConfig::apiAnalytics('/get/competitor');
        try {
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl, $request->only(['platform', 'sb_userid']));
            if ($response['code'] === 200) {
                return $this->helper->responseHandler($response['data']);
            }
            return view('discovery::competitor.analytics')->with(["ErrorMessage" => "Can't able to fetch Competitors"]);
        } catch (Exception $e) {
            $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'getCompetitors() {CompetitorController}');
            return view('discovery::competitor.analytics')->with(["ErrorMessage" => 'Can not fetch Competitors, please reload page']);
        }
    }

    public function getPlatforms()
    {
        $apiUrl = ApiConfig::apiAnalytics('/get/platform');
        try {
            $response = $this->helper->postApiCallWithAuth('get', $apiUrl);
            if ($response['code'] === 200) {
                return $this->helper->responseHandler($response['data']);
            }
            return view('discovery::competitor.analytics')->with(["ErrorMessage" => "Can't able to get Platforms"]);
        } catch (Exception $e) {
            $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'showYoutube() {CompetitorController}');
            return view('discovery::competitor.analytics')->with(["ErrorMessage" => 'Can not fetch Platforms, please reload page']);
        }
    }

    public function getAnalytics(\Illuminate\Http\Request $request)
    {
        $apiUrl = ApiConfig::apiAnalytics("analyze");
        $apiUrl .= '?filterPeriod=' . $request->filterPeriod . '&since=' . $request->startDate . '&until=' . $request->endDate . '';
        try {
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl, $request->only(['sb_userid', 'platform', 'competitorId']));
            if ($response['code'] === 200) {
                return $this->helper->responseHandler($response['data']);
            }
            return view('discovery::competitor.analytics')->with(["ErrorMessage" => "Can't able to get analytics"]);
        } catch (Exception $e) {
            $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'getAnalytics() {CompetitorController}');
            return view('discovery::competitor.analytics')->with(["ErrorMessage" => 'Can not fetch analytics, please reload page']);
        }
    }
}
