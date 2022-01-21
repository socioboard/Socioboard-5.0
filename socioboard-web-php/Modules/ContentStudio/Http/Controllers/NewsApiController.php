<?php

namespace Modules\ContentStudio\Http\Controllers;

use Illuminate\Routing\Controller;
use Modules\ContentStudio\Http\Requests\SearchRequest;
use App\ApiConfig\ApiConfig;
use Modules\User\helper;
use Exception;

class NewsApiController extends Controller
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
        $title = 'NewsApi';

        $rating = ['entertainment' => 'Entertainment', 'business' => 'Business', 'general' => 'General', 'health' => 'Health', 'science' => 'Science', 'sports' => 'Sports', 'technology' => 'Technology' ];

        $html = view('contentstudio::components.search')
            ->with(compact('rating','title'))
            ->render();

        return view('contentstudio::newsApi.index')->with(compact('html'));
    }

    public function search(SearchRequest $request){
        return $this->getSearchSessionApi($request->all());
    }

    public function searchNext(){
        return $this->getSearchSessionApi(request()->all());
    }

    public function getSearchSessionApi($request)
    {
        $apiUrl = $this->apiUrl.'/trends/get-news-api?keyword='.$request['keyword'].'&pageId='.$request['pageId'].'&category='.$request['rating'];
        try {
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl, null);
            $data = $this->helper->responseHandler($response['data'])['data'];
            if (!$data->newsApiDetails)
                return response()->json(['error'=>'No data available']);

            $html = view('contentstudio::newsApi.components.listing', ['data' => $data, 'helperClass' => $this->helper])->render();
            return response()->json($html);

        } catch (Exception $e) {
            $this->helper->logException($e->getLine(),$e->getCode(),$e->getMessage(), 'getSearchSessionApi() {NewsApiController}');
            return response()->json(['error'=>'<p id="notification">'.$e->getMessage().'</p>']);
        }
    }
}
