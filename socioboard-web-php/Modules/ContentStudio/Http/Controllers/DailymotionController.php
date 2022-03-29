<?php

namespace Modules\ContentStudio\Http\Controllers;

use Illuminate\Routing\Controller;
use Modules\ContentStudio\Http\Requests\ImgurSearchRequest;
use App\ApiConfig\ApiConfig;
use Modules\User\helper;
use Exception;

class DailymotionController extends Controller
{

    private $helper;
    private $apiUrl;
    
    public function __construct()
    {
        $this->helper = Helper::getInstance();
        $this->apiUrl = env('API_URL_FEEDS').env('API_VERSION');
    }

    /**
     * Display a listing of the resource.
     * @return Renderable
     */
    public function index()
    {
        $title = 'DailyMotion';
        $rating = [
            'recent' => 'Recent',
            'visited' => 'Visited',
            'visited-hour' => 'Visited-hour',
            'visited-today' => 'Visited-today',
            'visited-week' => 'Visited-week',
            'visited-month' => 'Visited-month',
            'relevance' => 'Relevance',
            'trending' => 'Trending',
            'random' => 'Random',
            'old' => 'Old',
            'live-audience' => 'Live-audience',
            'least-visited' => 'Least-visited',
        ];

        $html = view('contentstudio::components.search')
        ->with(compact('rating','title'))
        ->render();

        return view('contentstudio::dailyMotion.index')->with(compact('html'));
    }

    public function search(ImgurSearchRequest $request)
    {        
        return $this->getSearchSessionApi($request->all());
    }

    public function searchNext()
    {
        return $this->getSearchSessionApi(request()->all());
    }

    public function getSearchSessionApi($request)
    {
        $apiUrl = $this->apiUrl.'/trends/get-daily-motion?keyword='.$request['keyword'].'&pageId='.$request['pageId'].'&sortBy='.$request['rating'];

        try {
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl, null);
            $data = $this->helper->responseHandler($response['data'])['data'];
            if ($data->dailymotionDetails == null)
                return response()->json(['error'=>'No data available']);
            
            $html = view('contentstudio::dailyMotion.components.listing', ['data' => $data, 'helperClass' => $this->helper, 'pagetype' => 'DailyMotion'])->render();
            return response()->json($html);
            
        } catch (Exception $e) {
            $this->helper->logException($e->getLine(),$e->getCode(),$e->getMessage(), 'getSearchSessionApi() {DailymotioneController}');
            return response()->json(['error'=>'<p id="notification">'.$e->getMessage().'</p>']);

        }
    }
}
