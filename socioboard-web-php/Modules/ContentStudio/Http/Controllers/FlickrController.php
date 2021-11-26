<?php

namespace Modules\ContentStudio\Http\Controllers;

use Illuminate\Routing\Controller;
use Modules\ContentStudio\Http\Requests\FlickrSearchRequest;
use App\ApiConfig\ApiConfig;
use Modules\User\helper;
use Exception;

class FlickrController extends Controller
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
        $title = 'Flickr';
        $rating = array(
            'date-posted-desc'    => 'Date-posted-descending',
            'date-posted-asc'     => 'Date-posted-ascending',
            'date-taken-as'       => 'Date-taken-ascending',
            'date-taken-desc'     => 'Date-taken-descending',
            'interestingness-des' => 'Interestingness-descending',
            'interestingness-asc' => 'Interestingness-ascending',
            'relevance'           => 'Relevance'
        );

        $html = view('contentstudio::components.search')
        ->with(compact('rating','title'))
        ->render();

        return view('contentstudio::flickr.index')->with(compact('html'));
    }

    public function search(FlickrSearchRequest $request)
    {        
        return $this->getSearchSessionApi($request->all());
    }

    public function searchNext()
    {
        return $this->getSearchSessionApi(request()->all());
    }

    public function getSearchSessionApi($request)
    {
        $apiUrl = $this->apiUrl.'/trends/get-flickr?keyword='.$request['keyword'].'&pageId='.$request['pageId'].'&sortBy='.$request['rating'];
        $response = $this->helper->postApiCallWithAuth('post', $apiUrl, null);
        try {
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl, null);
            $data = $this->helper->responseHandler($response['data'])['data'];
            
            if ($data == null)
                return response()->json(['error'=>'No data available']);
            
            $html = view('contentstudio::flickr.components.listing', ['data' => $data, 'helperClass' => $this->helper])->render();
            return response()->json($html);
            
        } catch (Exception $e) {
            $this->helper->logException($e->getLine(),$e->getCode(),$e->getMessage(), 'getSearchSessionApi() {FlickrController}');
            return response()->json(['error'=>'<p id="notification">'.$e->getMessage().'</p>']);

        }
    }

}
