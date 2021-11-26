<?php

namespace Modules\ContentStudio\Http\Controllers;

use Illuminate\Routing\Controller;
use Modules\ContentStudio\Http\Requests\ImgurSearchRequest;
use App\ApiConfig\ApiConfig;
use Modules\User\helper;
use Exception;

class ImgurController extends Controller
{
    private $helper;
    private $apiUrl;

    public function __construct()
    {
        $this->helper = Helper::getInstance();
        $this->apiUrl = env('API_URL_FEEDS').env('API_VERSION');
    }


    public function index()
    {
        $title = 'Imgur';
        $rating = [
            'viral' => 'Viral',
            'top' => 'Top',
            'time' => 'Time'
        ];

        $html = view('contentstudio::components.search')
        ->with(compact('rating','title'))
        ->render();

        return view('contentstudio::imgur.index')->with(compact('html'));
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
        $apiUrl = $this->apiUrl.'/trends/get-imgur?keyword='.$request['keyword'].'&pageId='.$request['pageId'].'&sortBy='.$request['rating'];

        try {
            $response = $this->helper->postApiCallWithAuth('POST', $apiUrl);
            $data = $this->helper->responseHandler($response['data'])['data'];
            $html = view('contentstudio::imgur.components.listing', ['data' => $data, 'helperClass' => $this->helper])->render();

            if ($data == null)
                return response()->json(['error'=>'No data available']);

            return response()->json($html);

        } catch (Exception $e) {
            $this->helper->logException($e->getLine(),$e->getCode(),$e->getMessage(), 'getSearchSessionApi() {ImgurController}');
            return response()->json(['error'=>'<p id="notification">'.$e->getMessage().'</p>']);

        }
    }
}
