<?php

namespace Modules\ContentStudio\Http\Controllers;

use Illuminate\Contracts\Support\Renderable;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\User\helper;
use GuzzleHttp\Client;

class FileUploadingsController extends Controller
{
    private $helper;
    private $apiUrl;
    private $url;

    public function __construct()
    {
        $this->helper = Helper::getInstance();
        $this->apiUrl = env('API_URL_PUBLISH') . env('API_VERSION');
        $this->url = env("API_URL");
    }


    public function uploadMedia(Request $request)
    {
        $mediaImages = [];
        $mediaVideos = [];
        $file_path = null;
        $file = $request['file'];
        $mediaFile = $this->uploadMediaFile($file);
        $team = \Session::get('team');
        if ($mediaFile && \File::exists($mediaFile['path'])) {
            $rand = md5(time());
            $media = $this->uploadMediaToApi([
                'name' => 'media',
                'filePath' => $mediaFile['path'],
                'title' => $rand,
                'privacy' => 3,
                'teamId' => $team['teamid'],
            ]);
            if (isset($media) && $media['code'] == 200 && !empty($media['data'])) {
                if (strstr($media['data'][0]->mime_type, "image/")) {
                    return [
                        'mdia_path' => $media['data'][0]->media_url,
                        'type' => 'image',
                        'media_url' => $this->url . $media['data'][0]->media_url
                    ];
                    return $media;

                } elseif (strstr($media['data'][0]->mime_type, "video/")) {
                    return [
                        'mdia_path' => $media['data'][0]->media_url,
                        'type' => 'video',
                        'media_url' => $this->url . $media['data'][0]->media_url
                    ];
                }
            }
        }
    }

    public function downloadMediFromURL()
    {
        if (request()->has('mediaUrl') && !empty(request()->get('mediaUrl'))) {
            $mediaFile = $this->downloadMediaUrl(request()->get('mediaUrl'), request()->get('feedtype'));
            $team = \Session::get('team');
            if ($mediaFile && \File::exists($mediaFile['path'])) {
                $rand = md5(time());
                $media = $this->uploadMediaToApi([
                    'name' => 'media',
                    'filePath' => $mediaFile['path'],
                    'title' => $rand,
                    'privacy' => 3,
                    'teamId' => $team['teamid'],
                ]);

                if (isset($media) && $media['code'] == 200 && !empty($media['data'])) {
                    if (strstr($media['data'][0]->mime_type, "image/")) {
                        return [
                            'mdia_path' => $media['data'][0]->media_url,
                            'type' => 'image',
                            'media_url' => $this->url . $media['data'][0]->media_url
                        ];
                    } elseif (strstr($media['data'][0]->mime_type, "video/")) {
                        return [
                            'mdia_path' => $media['data'][0]->media_url,
                            'type' => 'video',
                            'media_url' => $this->url . $media['data'][0]->media_url
                        ];
                    }
                }
            }
        }
    }

    private function uploadMediaToApi($data)
    {
        $result = [];

        $filedata = array("name" => $data['name'], "file" => $data['filePath']);
        $apiUrl = $this->apiUrl . '/upload/media?title=' . $data["title"] . '&teamId=' . $data["teamId"] . '&privacy=' . $data["privacy"];

        try {
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl, $filedata, true);

            unlink($data['filePath']);
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
            $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), ' uploadImage() {PublishContentController}');
            return false;
        }
    }

    private function uploadMediaFile($file)
    {
        $mimeType = null;
        $pathToStorage = public_path('media/uploads');
        if (!file_exists($pathToStorage))
            mkdir($pathToStorage, 0777, true);

        $mime = $file->getMimeType();
        if (strstr($mime, "video/")) {
            $mimeType = 'video';
        } else if (strstr($mime, "image/")) {
            $mimeType = 'image';
        }
        if ($mimeType) {
            $mediFile = $file->getClientOriginalName();
            $direction = $pathToStorage . '/' . $mediFile;
            file_put_contents($direction, file_get_contents($file->path()));

            return ['type' => $mimeType, 'path' => $direction];
        }
        return false;
    }


    private function downloadMediaUrl($mediaUrl, $feedtype)
    {
        if ($feedtype === 'fb') {
            $mediaUrl2 = strtok($mediaUrl, '?');
        } else {
            $mediaUrl2 = $mediaUrl;
        }
        $pathToStorage = public_path('media/uploads');
        if (!file_exists($pathToStorage))
            mkdir($pathToStorage, 0777, true);
        $publishimage = substr($mediaUrl2, strrpos($mediaUrl2, '/') + 1);
        $direction = $pathToStorage . "/" . $publishimage;
        file_put_contents($direction, file_get_contents($mediaUrl));
        return ['type' => 'image', 'path' => $direction];
    }


}
