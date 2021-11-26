<?php

namespace Modules\ContentStudio\Http\Controllers;

use Illuminate\Routing\Controller;
use Modules\ContentStudio\Http\Requests\SearchRequest;
use App\ApiConfig\ApiConfig;
use Modules\User\helper;
use Exception;

class GiphyController extends Controller
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
        $title = 'Giphy';
        $type = [
            'gifs' => 'Gifs', 
            'stickers' => 'Stickers'
        ];
        $rating = [
            'g' => 'G',
            'pg' => 'PG',
            'pg-13' => 'Pg-13',
            'R' => 'R'
        ];

        $html = view('contentstudio::components.search')
        ->with(compact('type','rating','title'))
        ->render();

        return view('contentstudio::giphy.index')->with(compact('html'));
    }

    public function search(SearchRequest $request){
        return $this->getSearchSessionApi($request->all());
    }

    public function searchNext(){
        return $this->getSearchSessionApi(request()->all());
    }

    public function getSearchSessionApi($request)
    {
        $apiUrl = $this->apiUrl.'/trends/get-giphy?keyword='.$request['keyword'].'&type='.$request['type'].'&pageId='.$request['pageId'].'&rating='.$request['rating'];
        
        try {
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl, null);
            $data = $this->helper->responseHandler($response['data'])['data'];
            if (sizeof($data) === 0){
                return response()->json(['error' => 'No data available']);
//                return view('contentstudio::giphy.components.listing',compact('error'));
            }else{
                $html = view('contentstudio::giphy.components.listing', ['data' => $data, 'helperClass' => $this->helper])->render();
                return response()->json($html);
            }


        } catch (Exception $e) {
            $this->helper->logException($e->getLine(),$e->getCode(),$e->getMessage(), 'getSearchSessionApi() {GiphyController}');
            return response()->json(['error'=>'<p id="notification">'.$e->getMessage().'</p>']);
        }
    }
}
