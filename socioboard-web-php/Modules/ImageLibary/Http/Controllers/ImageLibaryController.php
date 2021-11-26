<?php

namespace Modules\ImageLibary\Http\Controllers;

use App\ApiConfig\ApiConfig;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Contracts\Support\Renderable;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;
use Modules\User\helper;
use Exception;
use Modules\ContentStudio\Http\Controllers\HistoryController;

class ImageLibaryController extends Controller
{
    private $helper;
    private $PUBLISH_API_URL;

    public function __construct()
    {
        $this->helper = Helper::getInstance();
        $this->PUBLISH_API_URL = env('API_URL_PUBLISH');
    }

    /**
     * Display a listing of the resource.
     * @return Renderable
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     * @return Renderable
     */
    public function create()
    {
        return view('imagelibary::create');
    }

    /**
     * Store a newly created resource in storage.
     * @param Request $request
     * @return Renderable
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Show the specified resource.
     * @param int $id
     * @return Renderable
     */
    public function show($id)
    {
        return view('imagelibary::show');
    }

    /**
     * Show the form for editing the specified resource.
     * @param int $id
     * @return Renderable
     */
    public function edit($id)
    {
        return view('imagelibary::edit');
    }

    /**
     * Update the specified resource in storage.
     * @param Request $request
     * @param int $id
     * @return Renderable
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     * @param int $id
     * @return Renderable
     */
    public function destroy($id)
    {
        //
    }

    public function privateImages(Request $request)
    {
        $socialAccountsData = new HistoryController();
        $socialAccounts = $socialAccountsData->getTeamSocialAccounts();
        $result = [];
        if($request->isMethod('get')) {
            $apiUrl = $this->PUBLISH_API_URL . env('API_VERSION') . '/upload/get-media-details?teamId=' . Session::get('team')['teamid'] . '&privacy=1&pageId=1';
            $data["pageId"] = 1;
        } else {
            $apiUrl = $this->PUBLISH_API_URL . env('API_VERSION') . '/upload/get-media-details?teamId=' . Session::get('team')['teamid'] . '&privacy=1&pageId=' . $request->pageID;
            $data["pageId"] = $request->pageID;
        }
        $data["teamId"] = Session::get('team')['teamid'];
        $data["privacy"] = 1;

        try {
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl, $data);
            if ($response['code'] == 200) {
                $result["code"] = $response["data"]->code;
                $result["data"] = $response["data"]->data;
                $result["message"] = $response["data"]->message;
                $result["error"] = $response["data"]->error;
            } else {
                $result["code"] = $response["data"]->code;
                $result["data"] = $response["data"]->data;
                $result["message"] = $response["data"]->error;
            }
        } catch (Exception $e) {
            $result = $this->helper->callingErrorHandler($e, ' ImageLibaryController => privateImages => Method-post ');
        }
        if($request->isMethod('get')) return view("imagelibary::ImageLibrary.private_images")->with(["images" => $result, 'socialAccounts' => $socialAccounts]);
        else return $result;
    }

    public function deleteImage(Request $request)
    {
        $data = [];
        $result = [];
        $apiUrl = $this->PUBLISH_API_URL . env('API_VERSION') . '/upload/delete-media?mediaId=' . $request->mediaId . '&isForceDelete=' . $request->isForceDelete;
        $data["mediaId"] = $request->mediaId;
        $data["isForceDelete"] = $request->isForceDelete;
        try {
            $response = $this->helper->postApiCallWithAuth('delete', $apiUrl, $data);
            if ($response['code'] == 200) {
                $result["code"] = $response["data"]->code;
                $result["data"] = $response["data"]->data;
                $result["message"] = $response["data"]->message;
                $result["error"] = $response["data"]->error;
            } else {
                $result = $response;
            }
            return $result;
        } catch (Exception $e) {
            return $this->helper->callingErrorHandler($e, ' ImageLibaryController => deleteImage => Method-delete ');
        }
    }

    public function uploadImage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required',
            'file' => 'required|mimes:jpeg,jpg,png'
        ], [
            'title.required' => 'File name is Required',
        ]);
        if ($validator->fails()) {
            $response['code'] = 201;
            $response['msg'] = $validator->errors()->all();
            $response['data'] = null;
            return Response::json($response, 200);
        }
        if($request->file == null || $request->file == "undefined" ) {
            $response['code'] = 202;
            $response['msg'] = 'Please upload Image';
            return $response;
        }
        $data = [];
        $result = [];
        $data["title"] = $request->title;
        $data["teamId"] = Session::get('team')['teamid'];
        $data["privacy"] = $request->privacy;
        $file = $request->file;
        $pathToStorage = public_path('media/uploads');
        if (!file_exists($pathToStorage))
            mkdir($pathToStorage, 0777, true);
        $publishimage = $file->getClientOriginalName();
        $data['media'] = $pathToStorage . "/" . $publishimage;;
        file_put_contents($data['media'], file_get_contents($file->path()));
        $filedata = array("name" => "media",
            "file" => $data['media']);
        $apiUrl = $this->PUBLISH_API_URL . env('API_VERSION') . '/upload/media?title=' . $data["title"] . '&teamId=' . $data["teamId"] . '&privacy=' . $data["privacy"];
        try {
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl, $filedata, true);
            unlink(public_path('media/uploads/' . $publishimage));
            if ($response['code'] == 200) {
                $result["code"] = $response["data"]->code;
                $result["data"] = $response["data"]->data;
                $result["message"] = $response["data"]->message;
                $result["error"] = $response["data"]->error;
            } else {
                $result = $response;
            }
            return $result;
        } catch (Exception $e) {
            return $this->helper->callingErrorHandler($e, ' ImageLibaryController => uploadImage => Method-post ');
        }
    }

    public function publicImages(Request $request)
    {
        Session::put('view', 'grid');
        $socialAccountsData = new HistoryController();
        $socialAccounts = $socialAccountsData->getTeamSocialAccounts();
        $result = [];
        if($request->isMethod('get')) {
            $apiUrl = $this->PUBLISH_API_URL . env('API_VERSION') . '/upload/get-media-details?teamId=' . Session::get('team')['teamid'] . '&privacy=0&pageId=1';
            $data["pageId"] = 1;
        } else {
            $apiUrl = $this->PUBLISH_API_URL . env('API_VERSION') . '/upload/get-media-details?teamId=' . Session::get('team')['teamid'] . '&privacy=0&pageId=' . $request->pageID;
            $data["pageId"] = $request->pageID;
        }

        $data["teamId"] = Session::get('team')['teamid'];
        $data["privacy"] = 0;

        try {
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl, $data);
            if ($response['code'] == 200) {
                $result["code"] = $response["data"]->code;
                $result["data"] = $response["data"]->data;
                $result["message"] = $response["data"]->message;
                $result["error"] = $response["data"]->error;
            } else {
                $result["code"] = $response["data"]->code;
                $result["data"] = $response["data"]->data;
                $result["message"] = $response["data"]->error;
            }
        } catch (Exception $e) {
            $result = $this->helper->callingErrorHandler($e, ' ImageLibaryController => publicImages => Method-post ');
        }
        if($request->isMethod('get')) return view("imagelibary::ImageLibrary.public_images")->with(["images" => $result, 'socialAccounts' => $socialAccounts]);
        else return $result;
    }

    public function galleryImages(Request $request)
    {
        $socialAccountsData = new HistoryController();
        $socialAccounts = $socialAccountsData->getTeamSocialAccounts();
        $result = [];
        if($request->isMethod('get')) {
            $apiUrl = $this->PUBLISH_API_URL . env('API_VERSION') . '/upload/get-social-gallery?pageId=1';
            $data["pageId"] = 1;
        } else {
            $apiUrl = $this->PUBLISH_API_URL . env('API_VERSION') . '/upload/get-social-gallery?pageId=' . $request->pageID;
            $data["pageId"] = $request->pageID;
        }
        try {
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl, $data);
            $result['code'] = isset($response['data']->code) ? $response['data']->code : null;
            $result['message'] = (isset($response['data']->code) && $response['data']->code == 200) ? (isset($response['data']->message) ? $response['data']->message : null) : (isset($response['data']->error) ? $response['data']->error : null);
            $result['data'] = isset($response['data']->data) ? $response['data']->data : null;
        } catch (Exception $e) {
            $result = $this->helper->callingErrorHandler($e, ' ImageLibaryController => galleryImages => Method-post ');
        }
        if($request->isMethod('get'))  return view("imagelibary::ImageLibrary.socio_gallery")->with(["images" => $result, 'socialAccounts' => $socialAccounts]);
        else return $result;
    }

    public function draftPostFunction(Request $request)
    {
        try {
            $team = \Session::get('team');
            if ($request->outgoing_url !== null){
                $validator = Validator::make($request->all(), [
                    'normal_text_area' => 'required',
                    'selected_image' => 'required',
                    'socialAccount' => 'required',
                    'outgoing_url' =>  'url'
                ], [
                    'normal_text_area.required' => 'Text is required',
                    'selected_image.required' => 'Image is required',
                    'socialAccount.required' => 'Please select Social Accounts',
                    'outgoing_url.url' => 'URl format should be valid'
                ]);
            } else {
                $validator = Validator::make($request->all(), [
                    'normal_text_area' => 'required',
                    'selected_image' => 'required',
                    'socialAccount' => 'required',
                ], [
                    'normal_text_area.required' => 'Text is required',
                    'selected_image.required' => 'Image is required',
                    'socialAccount.required' => 'Please select Social Accounts'
                ]);
            }
            if ($validator->fails()) {
                $response['code'] = 201;
                $response['msg'] = $validator->errors()->all();
                $response['data'] = null;
                return Response::json($response, 200);
            }
            $apiUrl = $this->PUBLISH_API_URL . env('API_VERSION') . '/publish/publishPosts?teamId=' . $team['teamid'];
            $outgoing_url = $request->outgoing_url === null ? "" : $request->outgoing_url;
            $requestData = (object)[
                'postType' => 'Image',
                'message' => $request->normal_text_area .' '. $outgoing_url ,
                'mediaPaths' => [$request->selected_image],
                'accountIds' => $request->socialAccount,
                'postStatus' => intval($request->postStatus) == 1 ? "1" : "0",
                'pinBoards' => [
                    'accountId' => 0,
                    'boardId' => [],
                ],
            ];
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl, $requestData);
            return $this->helper->responseHandler($response['data']);
        } catch (Exception $e) {
            return $this->helper->callingErrorHandler($e, ' ImageLibaryController => draftPostFunction => Method-post ');
        }
    }

    public function searchPublic(Request $request){
        $search = [];
        $search['order'] = isset($request->order) ? $request->order : "";
        $search['rating'] = isset($request->rating) ? $request->rating : "";
        $search['title'] = isset($request->title) ? $request->title : "";
        $result = $this->SearchImages($request);
        $socialAccountsData = new HistoryController();
        $socialAccounts = $socialAccountsData->getTeamSocialAccounts();
        return view("imagelibary::ImageLibrary.public_images")->with(["images" => $result, 'socialAccounts' => $socialAccounts, 'search' =>$search]);
    }

    public function searchPrivte(Request $request){
        $search = [];
        $search['order'] = isset($request->order) ? $request->order : "";
        $search['rating'] = isset($request->rating) ? $request->rating : "";
        $search['title'] = isset($request->title) ? $request->title : "";
        $result = $this->SearchImages($request);
        $socialAccountsData = new HistoryController();
        $socialAccounts = $socialAccountsData->getTeamSocialAccounts();
        return view("imagelibary::ImageLibrary.private_images")->with(["images" => $result, 'socialAccounts' => $socialAccounts, 'search' =>$search]);
    }

    public function SearchImages(Request $request){
        try {
            \session()->put('view',$request->typeofview);
            $team = \Session::get('team');
            $sortBy = $request->order;
            $rating = isset($request->rating) ? [$request->rating] : [];
            $apiUrl = $request->datepicker != null ? $this->PUBLISH_API_URL . env('API_VERSION') . '/upload/search-media-details?teamId=' . $team['teamid'].'&filterPeriod='.$request->datepicker.'&sortBy='.$sortBy.'&pageId=1' :$this->PUBLISH_API_URL . env('API_VERSION') . '/upload/search-media-details?teamId=' . $team['teamid'].'&sortBy='.$sortBy.'&pageId=1';
            $requestData = (object)
            [
                'SocialImageInfo' => [
                    'rating' => $rating,
                    'imagePrivacyType' => [
                        $request->type
                    ],
                    "imageTitle" => $request->title !== null ? $request->title : ""
                ]
            ];
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl, $requestData);
            return $this->helper->responseHandler($response['data']);

        }catch (Exception $e){
            return $this->helper->guzzleErrorHandler($e->getMessage(), ' ImageLibaryController => SearchImages => Method-post ');
        }
    }

    public function rateImages(Request $request)
    {
        $api_url = $this->PUBLISH_API_URL . env('API_VERSION') . '/upload/update-media?mediaId=' . $request['accountId'] . '&rating=' . $request['rating'];
        $data = ($request->all());
        try {
            $response = $this->helper->postApiCallWithAuth("PUT", $api_url, $data);
            return response()->json($response["data"]);
        } catch (RequestException $e) {
            return $this->helper->guzzleErrorHandler($e->getMessage(), ' ImageLibaryController => rateImages => Method-PUT ');
        }
    }
}
