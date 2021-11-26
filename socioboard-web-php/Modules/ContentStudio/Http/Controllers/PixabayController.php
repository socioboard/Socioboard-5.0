<?php

namespace Modules\ContentStudio\Http\Controllers;

use Illuminate\Routing\Controller;
use Modules\ContentStudio\Http\Requests\SearchRequest;
use App\ApiConfig\ApiConfig;
use Modules\User\helper;
use Exception;

class PixabayController extends Controller
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
        $title = 'Pixabay';
        $type = [
            'fashion' => 'Fashion',
            'backgrounds' => 'Backgrounds',
            'nature' => 'Nature',
            'science' => 'Science',
            'education' => 'Education',
            'feelings' => 'Feelings',
            'health' => 'Health',
            'people' => 'People',
            'religion' => 'Religion',
            'places' => 'Places',
            'animals' => 'Animals',
            'industry' => 'Industry',
            'computer' => 'Computer',
            'food' => 'Food',
            'sports' => 'Sports',
            'transportation' => 'Transportation',
            'travel' => 'Travel',
            'buildings' => 'Buildings',
            'business' => 'Business',
            'music' => 'Music',
        ];

        $rating = ['popular' => 'Popular', 'latest' => 'Latest'];

        $html = view('contentstudio::components.search')
        ->with(compact('type','rating','title'))
        ->render();

        return view('contentstudio::pixabay.index')->with(compact('html'));
    }

    public function search(SearchRequest $request){
        return $this->getSearchSessionApi($request->all());
    }

    public function searchNext(){
        return $this->getSearchSessionApi(request()->all());
    }

    public function getSearchSessionApi($request)
    {
        $apiUrl = $this->apiUrl.'/trends/get-pixabay?keyword='.$request['keyword'].'&category='.$request['type'].'&pageId='.$request['pageId'].'&sortBy='.$request['rating'];
        
        try {
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl, null);
            $data = $this->helper->responseHandler($response['data'])['data'];
            if (!$data->pixabayDetails)
                return response()->json(['error'=>'No data available']);
            
            $html = view('contentstudio::pixabay.components.listing', ['data' => $data, 'helperClass' => $this->helper])->render();
            return response()->json($html);

        } catch (Exception $e) {
            $this->helper->logException($e->getLine(),$e->getCode(),$e->getMessage(), 'getSearchSessionApi() {PixabayController}');
            return response()->json(['error'=>'<p id="notification">'.$e->getMessage().'</p>']);
        }
    }
}
