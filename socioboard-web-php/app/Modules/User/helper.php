<?php

/**
 *
 *    User Helper
 */


namespace App\Modules\User;

use GuzzleHttp\Client;
use GuzzleHttp\RequestOptions;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Mockery\CountValidator\Exception;


class Helper
{

    protected $client;
    protected $token;
    private static $_instance = null;

    public function __construct()
    {
        $this->client = new Client();
        $this->token = Session::get(('user'))['accessToken'];
        $this->API_URL = env('API_URL') . env('VERSION') . '/';

        $this->API_URL_PUBLISH = env('API_URL_PUBLISH') . env('VERSION_PUBLISH') . '/';
        $this->API_URL_FEEDS = env('API_URL_FEEDS') . env('VERSION_FEEDS') . '/';
        $this->API_URL_NOTIFY = env('API_URL_NOTIFY').env('VERSION_NOTIFY') . '/';


//        $this->API_URL_PUBLISH=env('API_URL_PUBLISH') . env('VERSION_PUBLISH') . '/';

    }


    public static function getInstance()
    {

        if (!is_object(self::$_instance))
            self::$_instance = new Helper();
        return self::$_instance;
    }

    public function getBuildBody($data)
    {
        //TODO checkkk this func is underconstruction
        $buildBody = array();
        foreach ($data as $key => $value) {
            $multiFormData = [];
            if ($key == 'filePath' && !empty($value)) {
                $multiFormData['name'] = 'post_file';
                $multiFormData['contents'] = fopen($value, 'r');
            } else {
                $multiFormData['name'] = $key;
                $multiFormData['contents'] = $value;
            }
            array_push($buildBody, $multiFormData);
        }
        return $buildBody;
    }


    public function apiCallPost($data, $route, $is_multipart = false, $query = false)
    {
        $api_url = $this->API_URL . $route;
        $result = [];
        $response = null;
        try {
            if ($is_multipart) {
                $response = $this->client->request('POST', $api_url, [
                    'multipart' => [
                        [
                            'name' => $data['name'],
                            'contents' => fopen($data['file'], 'r')
                        ]
                    ],
                    'headers' => ['x-access-token' => $this->token],
                ]);
            } else {

                $response = $this->client->post($api_url, [RequestOptions::JSON => $data,
                    'headers' => ['x-access-token' => $this->token],
                ]);

            }

            if ($response->getStatusCode() == 200) {
                $data = json_decode($response->getBody()->getContents(), true);
                $result['statusCode'] = $response->getStatusCode();
                $result['data'] = $data;

                return $result;
            } else {
                return (['status' => 'failed', 'code' => 500, 'message' => 'The Server is temporarily unable to service your request due to maintenance downtime. Please try later']);
            }

        } catch (Exception $e) {


            $result['code'] = $e->getCode();
            $result['message'] = $e->getMessage();
            $result['status'] = "failed";
            return $result;
        }
    }
    public function apiCallPostUpdate($data, $route, $is_multipart = false, $query = false)
    {
        $api_url = $this->API_URL . $route;
        $result = [];
        $response = null;
        try {
            if ($is_multipart) {
                $response = $this->client->request('POST', $api_url, [
                    'multipart' => [
                        [
                            'name' => $data['name'],
                            'contents' => fopen($data['file'], 'r')
                        ]
                    ],
                    'headers' => ['x-access-token' => $this->token],
                ]);
            } else {

                $response = $this->client->post($api_url, [RequestOptions::JSON => $data,
                    'headers' => ['x-access-token' => $this->token],
                ]);

            }

            if ($response->getStatusCode() == 200) {
                $result = json_decode($response->getBody()->getContents());

                return $result;
            } else {
                return (['status' => 'failed', 'code' => 500, 'message' => 'The Server is temporarily unable to service your request due to maintenance downtime. Please try later']);
            }

        } catch (Exception $e) {


            $result['code'] = $e->getCode();
            $result['message'] = $e->getMessage();
            $result['status'] = "failed";
            return $result;
        }
    }
    public function apiCallPut($data, $route, $is_multipart = false, $query = false)
    {

        $api_url = $this->API_URL . $route;

        $result = [];
        $response = null;
        try {
            if ($is_multipart) {
                $response = $this->client->request('POST', $api_url, [
                    'multipart' => [
                        [
                            'name' => $data['name'],
                            'contents' => fopen($data['file'], 'r')
                        ]
                    ],
                    'headers' => ['x-access-token' => $this->token],
                ]);
            } else {

                $response = $this->client->put($api_url, [RequestOptions::JSON => $data,
                    'headers' => ['x-access-token' => $this->token],
                ]);

            }

            if ($response->getStatusCode() == 200) {
                $data = json_decode($response->getBody()->getContents(), true);
                $result['statusCode'] = $response->getStatusCode();
                $result['data'] = $data;

                return $result;
            } else {
                return (['status' => 'failed', 'code' => 500, 'message' => 'The Server is temporarily unable to service your request due to maintenance downtime. Please try later']);
            }

        } catch (Exception $e) {


            $result['code'] = $e->getCode();
            $result['message'] = $e->getMessage();
            $result['status'] = "failed";
            return $result;
        }
    }
    public function apiCallPublishPut($data, $route, $is_multipart = false, $query = false)
    {
        $api_url = $this->API_URL_PUBLISH . $route;
        $result = [];
        $response = null;
        try {
            if ($is_multipart) {
                $response = $this->client->request('POST', $api_url, [
                    'multipart' => [
                        [
                            'name' => $data['name'],
                            'contents' => fopen($data['file'], 'r')
                        ]
                    ],
                    'headers' => ['x-access-token' => $this->token],
                ]);
            } else {

                $response = $this->client->put($api_url, [RequestOptions::JSON => $data,
                    'headers' => ['x-access-token' => $this->token],
                ]);

            }

            if ($response->getStatusCode() == 200) {
                $data = json_decode($response->getBody()->getContents(), true);
                $result['statusCode'] = $response->getStatusCode();
                $result['data'] = $data;

                return $result;
            } else {
                return (['status' => 'failed', 'code' => 500, 'message' => 'The Server is temporarily unable to service your request due to maintenance downtime. Please try later']);
            }

        } catch (Exception $e) {


            $result['code'] = $e->getCode();
            $result['message'] = $e->getMessage();
            $result['status'] = "failed";
            return $result;
        }
    }
    public function apiCallPostPublish($data, $route, $is_multipart = false)
    {
        $api_url = $this->API_URL_PUBLISH . $route;
        $result = [];
        $response = null;
        try {
            if ($is_multipart) {

                $response = $this->client->request('POST', $api_url, [
                    'multipart' => [
                        [
                            'name' => $data['name'],

                            'contents' => fopen($data['file'], 'r')
                        ]
                    ],
                    'headers' => ['x-access-token' => $this->token],
                ]);
            } else {
                $response = $this->client->post($api_url, [RequestOptions::JSON => $data,
                    'headers' => ['x-access-token' => $this->token],
                ]);
            }
            if ($response->getStatusCode() == 200) {
                $data = json_decode($response->getBody()->getContents(), true);
                $result['statusCode'] = $response->getStatusCode();
                $result['data'] = $data;

                return $result;
            } else {

                return (['status' => 'failed', 'code' => 500, 'message' => 'The Server is temporarily unable to service your request due to maintenance downtime. Please try later']);
            }

        } catch (Exception $e) {


            $result['code'] = $e->getCode();
            $result['message'] = $e->getMessage();
            $result['status'] = "failed";
            return $result;
        }

    }


    public function apiCallPostFeeds($data, $route, $is_multipart = false, $method = 'POST')
    {
        $api_url = $this->API_URL_FEEDS . $route;
        $result = [];
        $response = null;
        try {
            if ($is_multipart) {

                $response = $this->client->request('POST', $api_url, [
                    'multipart' => [
                        [
                            'name' => $data['name'],

                            'contents' => fopen($data['file'], 'r')
                        ]
                    ],
                    'headers' => ['x-access-token' => $this->token],
                ]);

            } else {
                // data to send
                $requestData = [
                    RequestOptions::JSON => $data,
                    'headers' => ['x-access-token' => $this->token],
                ];
                // select method
                if ($method == 'POST') {
                    $response = $this->client->post($api_url, $requestData);
                } else {
                    $response = $this->client->get($api_url, $requestData);
                }
            }
            if ($response->getStatusCode() == 200) {
                $result = new \stdClass;

                $result->statusCode = $response->getStatusCode();
                $result->data = json_decode($response->getBody()->getContents());
                return $result;
            } else {
                return (object)(['status' => 'failed', 'code' => 500, 'message' => 'The Server is temporarily unable to service your request due to maintenance downtime. Please try later']);
            }
        } catch (Exception $e) {


            $result['code'] = $e->getCode();
            $result['message'] = $e->getMessage();
            $result['status'] = "failed";

            return (object)$result;

        }

    }
    public function apiCallFeedsPut($data, $route, $is_multipart = false, $query = false)
    {
        $api_url = $this->API_URL_FEEDS . $route;

        $result = [];
        $response = null;
        try {
            if ($is_multipart) {
                $response = $this->client->request('POST', $api_url, [
                    'multipart' => [
                        [
                            'name' => $data['name'],
                            'contents' => fopen($data['file'], 'r')
                        ]
                    ],
                    'headers' => ['x-access-token' => $this->token],
                ]);
            } else {

                $response = $this->client->put($api_url, [RequestOptions::JSON => $data,
                    'headers' => ['x-access-token' => $this->token],
                ]);

            }

        return $response;

        } catch (Exception $e) {


            $result['code'] = $e->getCode();
            $result['message'] = $e->getMessage();
            $result['status'] = "failed";
            return $result;
        }
    }
    public function apiCallGetFeeds($route)
    {
        $api_url = $this->API_URL_FEEDS . $route;
        $result = [];
        $response = null;
        try {
            $response = $this->client->get($api_url, [

                'headers' => ['x-access-token' => $this->token],
            ]);
            $responseBody = json_decode($response->getBody()->getContents());
            return $responseBody;


        } catch (\Exception $e) {
            Log::info("Exception apiget " . $e->getLine() . " => " . $e->getCode() . " => " . $e->getMessage());
            throw new \Exception($e->getMessage());
        }
    }

    public function apiCallGetNotification($route){
        $api_url = $this->API_URL_NOTIFY . $route;
        $result = [];
        $response = null;
        try {
            $response = $this->client->get($api_url, [

                'headers' => ['x-access-token' => $this->token],
            ]);
            $responseBody = json_decode($response->getBody()->getContents());
            return $responseBody;


        } catch (\Exception $e) {
            Log::info("Exception apiget " . $e->getLine() . " => " . $e->getCode() . " => " . $e->getMessage());
            throw new \Exception($e->getMessage());
        }
    }


    public function apiCallPostInsecure($data, $route)
    {
        //query data

        $api_url = $api_url = $this->API_URL . $route;
        $result = [];
        $response = null;
        try {
            $response = $this->client->post($api_url, ['query' => [
                "csrf" => $data['csrf'],
                "code" => $data['code']
            ]]);
            if ($response->getStatusCode() == 200) {
                $data = json_decode($response->getBody()->getContents());
                $result['statusCode'] = $response->getStatusCode();
                $result['data'] = $data;

                return $result;
            } else {
                return (['status' => 'failed', 'code' => 500, 'message' => 'The Server is temporarily unable to service your request due to maintenance downtime. Please try later']);
            }

        } catch (Exception $e) {


            $result['code'] = $e->getCode();
            $result['message'] = $e->getMessage();
            $result['status'] = "failed";
            return $result;
        }

    }

    public function apiCallGet($route)
    {
        $api_url = $api_url = $this->API_URL . $route;
        $result = [];
        $response = null;
        try {
            $response = $this->client->get($api_url, [
                'headers' => ['x-access-token' => $this->token],
            ]);
            $responseBody = json_decode($response->getBody()->getContents());
            return $responseBody;

        } catch (\Exception $e) {
            Log::info("Exception apiget " . $e->getLine() . " => " . $e->getCode() . " => " . $e->getMessage());

            throw new \Exception($e->getMessage());
        }
    }

    public function apiCallPublishGet($route)
    {
        $api_url = $this->API_URL_PUBLISH . $route;
        $result = [];
        $response = null;
        try {
            $response = $this->client->get($api_url, [
                'headers' => ['x-access-token' => $this->token],
            ]);
            $responseBody = json_decode($response->getBody()->getContents());
            return $responseBody;

        } catch (\Exception $e) {
            Log::info("Exception apiget " . $e->getLine() . " => " . $e->getCode() . " => " . $e->getMessage());
            return $e->getLine() . " => " . $e->getCode() . " => " . $e->getMessage();
//            throw new \Exception($e->getMessage());
        }
    }


    public function apiDelete($route)
    {
        $api_url = $this->API_URL . $route;
        $response = null;
        try {
            $response = $this->client->delete($api_url, [

                'headers' => ['x-access-token' => $this->token],
            ]);
            $responseBody = json_decode($response->getBody()->getContents());
            return $responseBody;


        } catch (\Exception $e) {
            Log::info("Exception apiget " . $e->getLine() . " => " . $e->getCode() . " => " . $e->getMessage());

            throw new \Exception($e->getMessage());
        }
    }

    public function apiPostLeave($route)
    {
        $api_url = $this->API_URL . $route;
        $response = null;
        try {
            $response = $this->client->post($api_url, [

                'headers' => ['x-access-token' => $this->token],
            ]);
            $responseBody = json_decode($response->getBody()->getContents());
            return $responseBody;


        } catch (\Exception $e) {
            Log::info("Exception apiget " . $e->getLine() . " => " . $e->getCode() . " => " . $e->getMessage());

            throw new \Exception($e->getMessage());
        }
    }


    public function apiCallPublishDelete($route)
    {
        $api_url = $this->API_URL_PUBLISH . $route;
        $response = null;
        try {
            $response = $this->client->delete($api_url, [

                'headers' => ['x-access-token' => $this->token],
            ]);
            $responseBody = json_decode($response->getBody()->getContents());
            return $responseBody;


        } catch (\Exception $e) {
            Log::info("Exception apiget " . $e->getLine() . " => " . $e->getCode() . " => " . $e->getMessage());

            throw new \Exception($e->getMessage());
        }
    }

    public function apiDeleteFeeds($route)
    {
        $api_url = $this->API_URL_FEEDS . $route;
        $response = null;
        try {
            $response = $this->client->delete($api_url, [

                'headers' => ['x-access-token' => $this->token],
            ]);
            $responseBody = json_decode($response->getBody()->getContents());
            return $responseBody;


        } catch (\Exception $e) {
            Log::info("Exception apiget " . $e->getLine() . " => " . $e->getCode() . " => " . $e->getMessage());

            throw new \Exception($e->getMessage());
        }
    }
//
//    public function apiUpdateFeeds($route){
//        $api_url = $this->API_URL_FEEDS . $route;
//        $response = null;
//        try {
//            $response = $this->client->update($api_url, [
//                'headers' => ['x-access-token' => $this->token],
//            ]);
//            $responseBody = json_decode($response->getBody()->getContents());
//            return $responseBody;
//
//
//        } catch (\Exception $e) {
//            Log::info("Exception apiget " . $e->getLine() . " => " . $e->getCode() . " => " . $e->getMessage());
//
//            throw new \Exception($e->getMessage());
//        }
//
//    }
    public function apiGetInvoice($route)
    {
        $api_url = $this->API_URL . $route;
        $result = [];
        $response = null;
        try {
            $response = $this->client->get($api_url, [
                'headers' => ['x-access-token' => $this->token],
            ]);
            $responseBody = json_decode($response->getBody()->getContents());
            return $responseBody;

        } catch (\Exception $e) {
            Log::info("Exception apiget " . $e->getLine() . " => " . $e->getCode() . " => " . $e->getMessage());

            throw new \Exception($e->getMessage());
        }
    }

    public function getNewSession(){
        $res = Helper::getInstance()->apiCallGet('user/getUserInfo');
        $user = array(
            'accessToken' => $res->accessToken,
            'userDetails' => $res->userDetails
        );
        Session::put('user', $user);
        Session::put('twoWayAuth', $res->userDetails->Activations->activate_2step_verification);
    }

    public function getTeamNewSession()
    {
        $response = Helper::getInstance()->apiCallGet("team/getDetails");

        if ($response->code == 200 && $response->status == "success") {
            for ($i = 0; $i < count($response->teamSocialAccountDetails); $i++) {
                $teamDetails[] = $response->teamSocialAccountDetails[$i];
            }
            $team = array(
                'teamSocialAccountDetails' => $response->teamSocialAccountDetails,
                'teamMembers' => $response->teamMembers,
                'memberProfileDetails' => $response->memberProfileDetails,
                'socialAccounts' => $response->socialAccounts
            );

            if (Session::has('team')) {
                Session::forget('team');
            }
            Session::put('team', $team);

            return $team;
        }
    }
}
