<?php

namespace Modules\User;

use App\ApiConfig\ApiConfig;
use App\Classes\AuthUsers;
use GuzzleHttp\Client;
use GuzzleHttp\RequestOptions;
use Illuminate\Support\Facades\Log;
use \GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\Session;

class helper
{
    private static $instance;
    public $token;
    protected $client;
    protected $helper;

    public function __construct()
    {
        $this->client = new Client();
    }

    public static function getInstance(): helper
    {
        if (!isset(self::$instance)) {
            self::$instance = new helper();
        }
        return self::$instance;
    }

    public function authUser(): AuthUsers
    {
        return authUser();
    }

    //for authorized APIS which are requiring Access token

    public function postApiCall($method, $api_url, $data = null, $is_multipart = false)
    {
        $response = null;
        $responseBody = null;
        switch (strtolower($method)) {
            case "get":
                try {
                    $response = $this->client->get($api_url);
                    return json_decode($response->getBody()->getContents(), true);
                } catch (GuzzleException $e) {
                    return $this->exceptionResponse($response, $e, $e->getLine(), $e->getCode(), $e->getMessage(), 400);
                }
            case "post":
                try {
                    if ($is_multipart) {
                        $response = $this->client->request('POST', $api_url, [
                            'multipart' => [
                                [
                                    'name' => $data['name'],
                                    'contents' => fopen($data['file'], 'r')
                                ]
                            ],
                        ]);

                    } else {
                        $response = $this->client->post($api_url, [RequestOptions::JSON => $data]);
                    }
                    if ($response->getStatusCode() == 200) {
                        return json_decode($response->getBody()->getContents(), true);
                    } else {
                        return (['status' => 'failed', 'code' => 500, 'message' => 'The Server is temporarily unable to service your request due to maintenance downtime. Please try later']);
                    }
                } catch (GuzzleException $e) {
                    return $this->exceptionResponse($response, $e, $e->getLine(), $e->getCode(), $e->getMessage(), 400);
                }
            case "put":
                try {
                    if ($is_multipart) {
                        $response = $this->client->request('put', $api_url, [
                            'multipart' => [
                                [
                                    'name' => $data['name'],
                                    'contents' => fopen($data['file'], 'r')
                                ]
                            ],
                        ]);
                    } else {
                        $response = $this->client->put($api_url, [RequestOptions::JSON => $data]);
                    }
                    if ($response->getStatusCode() == 200) {
                        return json_decode($response->getBody()->getContents(), true);
                    } else {
                        return (['status' => 'failed', 'code' => 500, 'message' => 'The Server is temporarily unable to service your request due to maintenance downtime. Please try later']);
                    }
                } catch (GuzzleException $e) {
                    return $this->exceptionResponse($response, $e, $e->getLine(), $e->getCode(), $e->getMessage(), 400);
                }
            case "delete":
                try {
                    $response = $this->client->delete($api_url);
                    $responseBody = json_decode($response->getBody()->getContents(), true);
                    return $responseBody;
                } catch (GuzzleException $e) {
                    return $this->exceptionResponse($response, $e, $e->getLine(), $e->getCode(), $e->getMessage(), 400);
                }
        }
        return false;
    }

    //for APIs that are not using Access Token

    public function exceptionResponse($response, $e, $exceptionGetLine, $exceptionGetCode, $exceptionGetMessage, $code, $functionName = null)
    {
        Log::info('Exception ' . $exceptionGetLine . " => Function Name => " . $functionName . " => code =>" . $exceptionGetCode . " => message =>  " . $exceptionGetMessage);
//        $response->code = $code;
//        $response->message = $e;
        return $response;
    }

    public function successResponse($code, $data): array
    {
        if ($code === 200)
        {
            $response = [];
            $response['code'] = $code;
            $response['data'] = json_decode($data);
            return $response;
        }
        else
        {
            return (['status' => 'failed', 'code' => 500, 'message' => 'The Server is temporarily unable to service your request due to maintenance downtime. Please try later']);
        }

    }

    public function responseHandlerApi($response): array
    {
        $result['code'] = $response['data']['code'];
        switch ($result['code']) {
            case 200:
                $result['data'] = $response['data']['data'];
                $result['message'] = $response['data']['message'];
                if (isset($response['data']['totalCount'])) {
                    $result['count'] = $response['data']['totalCount'];
                }
                break;
            case 400:
                $result['data'] = $response['data']['data'];
                $result['message'] = $response['data']['message'];
                $result['error'] = $response['data']['error'];
                break;
            default:
                $result['message'] = $response['data']['code'] === 400 ? $response['data']['message'] : $result['message'] = $response['data']['code'] == 404 ? $response['data']['error'] : $response['data']['message'];
                break;
        }
        return $result;
    }

    public function responseHandlerStatusCode($response): array
    {
        $result = [];
        isset($response['data']->code) ? $result['code'] = $response['data']->code : null;
        isset($response['data']->message) ? $result['message'] = $response['data']->message : null;
        isset($response['data']->error) ? $result['error'] = $response['data']->error : null;
        isset($response['data']->data) ? $result['data'] = $response['data']->data : null;
        return $result;
    }

    public function responseHandler($response): array
    {
        $result = [];
        isset($response->code) ? $result['code'] = $response->code : null;
        isset($response->message) ? $result['message'] = $response->message : null;
        isset($response->error) ? $result['error'] = $response->error : null;
        isset($response->data) ? $result['data'] = $response->data : null;
        return $result;
    }

    public function responseHandlerWithIfElse($response): array
    {
        $result = [];
        isset($response['data']->code) ? $result['code'] = $response['data']->code : null;
        $result['message'] = (isset($response['data']->code) && $response['data']->code == 200) ? (isset($response['data']->message) ? $response['data']->message : null) : (isset($response['data']->error) ? $response['data']->error : null);
        isset($response['data']->data) ? $result['data'] = $response['data']->data : null;
        return $result;
    }

    public function responseHandlerWithArrayIfElse($response): array
    {
        $result = [];
        isset($response['code']) ? $result['code'] = $response['code'] : null;
        $result['message'] = (isset($response['code']) && $response['code'] == 200) ? (isset($response['message']) ? $response['message'] : null) : (isset($response['error']) ? $response['error'] : null);
        isset($response['data']) ? $result['data'] = $response['data'] : null;
        return $result;
    }

    public function responseHandlerWithArray($response): array
    {
        $result = [];
        isset($response['code']) ? $result['code'] = $response['code'] : null;
        isset($response['message']) ? $result['message'] = $response['message'] : null;
        isset($response['error']) ? $result['error'] = $response['error'] : null;
        isset($response['data']) ? $result['data'] = $response['data'] : null;
        return $result;
    }

    public function getTeamNewSession(): array
    {
        $teamid = 0;
        $teamname = "";
        $teamlogo = "";
        $teamDetails = [];
        $apiUrl = ApiConfig::get('/team/get-details');
        $response = $this->postApiCallWithAuth('get', $apiUrl);
        if ($response['data']->code=== 200) {
            $teamid = $response['data']->data->teamSocialAccountDetails[0][0]->team_id;
            $teamname = $response['data']->data->teamSocialAccountDetails[0][0]->team_name;
            $teamlogo = $response['data']->data->teamSocialAccountDetails[0][0]->team_logo;
        }
        $teamDetails['teamid'] = $teamid;
        $teamDetails['teamName'] = $teamname;
        $teamDetails['teamLogo'] = $teamlogo;
        Session::put('team',$teamDetails); //putting data in team session
        return $teamDetails;
    }

    public function postApiCallWithAuth($method, $api_url, $data = null, $is_multipart = false)
    {
        $response = [];
        switch (strtolower($method)) {
            case "get":
                try {
                    $response = $this->client->get($api_url, [
                        'headers' => ['x-access-token' => $this->authUser()->__token()],
                    ]);
                    return $this->successResponse($response->getStatusCode(),$response->getBody()->getContents());
                    return json_decode($response->getStatusCode(),$response->getBody()->getContents());
                } catch (GuzzleException  $e) {
                    return $this->exceptionResponse($response, $e, $e->getLine(), $e->getCode(), $e->getMessage(), 400);
                }
            case "post":
                try {
                    if ($is_multipart) {
                        $response = $this->client->request('POST', $api_url, [
                            'multipart' => [
                                [
                                    'name' => $data['name'],
                                    'contents' => fopen($data['file'], 'r')
                                ]
                            ],
                            'headers' => ['x-access-token' => $this->authUser()->__token()],
                        ]);
                    } else {
                        $response = $this->client->post($api_url, [RequestOptions::JSON => $data,
                            'headers' => ['x-access-token' => $this->authUser()->__token()],
                        ]);
                    }
                    return $this->successResponse($response->getStatusCode(),$response->getBody()->getContents());
                } catch (GuzzleException $e) {
                    return $this->exceptionResponse($response, $e, $e->getLine(), $e->getCode(), $e->getMessage(), 400);
                }
            case "delete":
                try {
                    $response = $this->client->delete($api_url, [

                        'headers' => ['x-access-token' => $this->authUser()->__token()],
                        'json' => $data
                    ]);
                    return $this->successResponse($response->getStatusCode(),$response->getBody()->getContents());
                } catch (GuzzleException $e) {
                    return $this->exceptionResponse($response, $e, $e->getLine(), $e->getCode(), $e->getMessage(), 400);
                }
            case "put":
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
                            'headers' => ['x-access-token' => $this->authUser()->__token()],
                        ]);
                    } else {
                        $response = $this->client->put($api_url, [RequestOptions::JSON => $data,
                            'headers' => ['x-access-token' => $this->authUser()->__token()],
                        ]);
                    }
                    return $this->successResponse($response->getStatusCode(),$response->getBody()->getContents());
                } catch (GuzzleException $e) {
                    return $this->exceptionResponse($response, $e, $e->getLine(), $e->getCode(), $e->getMessage(), 400);
                }
        }
        return false;
    }

    public function errorHandler($exceptionGetLine, $exceptionGetCode, $exceptionGetMessage, $functionName): array
    {
        Log::info('Exception ' . $exceptionGetLine . " => Function Name => " . $functionName . " => code =>" . $exceptionGetCode . " => message =>  " . $exceptionGetMessage);
        $result['code'] = 500;
        $result['message'] = "Some error occurred while fetching data Please reload it...";
        $result['data'] = null;
        return $result;
    }

    public function logException($exceptionGetLine, $exceptionGetCode, $exceptionGetMessage, $functionName)
    {
        Log::info('Exception ' . $exceptionGetLine . " => Function Name => " . $functionName . " => code =>" . $exceptionGetCode . " => message =>  " . $exceptionGetMessage);
    }

    public function guzzleErrorHandler($guzzleExceptionGetMessage, $functionName): array
    {
        $result['code'] = 403;
        $result['message'] = $guzzleExceptionGetMessage;
        $result['data'] = null;
        Log::info("GuzzleException => Function Name => " . $functionName . "=> code =>" . $result['code'] . " => message =>  " . $result['message']);
        return $result;
    }

    public function callingErrorHandler($exception, $functionName)
    {
        Log::info('Exception ' . $exception->getLine() . " => Function Name => " . $functionName . " => code =>" . $exception->getCode() . " => message =>  " . $exception->getMessage());
        $result['code'] = 500;
        $result['message'] = "Some error occurred while fetching data Please reload it...";
        $result['data'] = null;
        return $result;
    }

    public function time_elapsed_string($datetime, $full = false) {
        $now = new \DateTime;
        $ago = new \DateTime($datetime);
        $diff = $now->diff($ago);

        $diff->w = floor($diff->d / 7);
        $diff->d -= $diff->w * 7;

        $string = array(
            'y' => 'year',
            'm' => 'month',
            'w' => 'week',
            'd' => 'day',
            'h' => 'hour',
            'i' => 'minute',
            's' => 'second',
        );
        foreach ($string as $k => &$v) {
            if ($diff->$k) {
                $v = $diff->$k . ' ' . $v . ($diff->$k > 1 ? 's' : '');
            } else {
                unset($string[$k]);
            }
        }

        if (!$full) $string = array_slice($string, 0, 1);
        return $string ? implode(', ', $string) . ' ago' : 'just now';
    }
}
