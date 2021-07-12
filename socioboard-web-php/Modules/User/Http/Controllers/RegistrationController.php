<?php

namespace Modules\User\Http\Controllers;

use App\ApiConfig\ApiConfig;
use Exception;
use Illuminate\Http\Request;
use Modules\User\helper;
use Modules\User\Http\Requests\SignUp;


class RegistrationController extends Controller
{
    private $helper;

    public function __construct()
    {
        $this->helper = Helper::getInstance();
    }

    public function show()
    {
        return view("user::sign_up");
    }

    public function signUp(SignUp $requestFields): array
    {
        $apiUrl = ApiConfig::get('/register');
        try {
            $parameters = array(
                    'username' => $requestFields['userName'],
                    'email' => $requestFields['email'],
                    'password' => md5($requestFields['password']),
                    'firstName' => $requestFields['firstName'],
                    'lastName' => $requestFields['lastName'],
            );
            try {
                $response = $this->helper->postApiCall('post', $apiUrl, $parameters);
            } catch (Exception $e) {
                return $this->helper->errorHandler($e->getLine(),$e->getCode(),$e->getMessage(), ' signUp() {RegistrationController}');
            }
            if (in_array($response['code'], [200, 400, 401])) {
                return $this->helper->responseHandlerWithArray($response);
            } else {
                return $this->helper->errorHandler('47', $response['code'], 'Response Code Mismatch ', 'signUp() {RegistrationController}');
            }
        } catch (Exception $e) {
            return $this->helper->errorHandler($e->getLine(),$e->getCode(),$e->getMessage(), ' signUp() {RegistrationController}');
        }
    }

    public function verify(Request $request)
    {
        $email = $request['email'];
        $activationToken = $request['activationToken'];
        $apiUrl = ApiConfig::get('/verify-email?email='.$email.'&activationToken='.$activationToken);
        try {
            $response = $this->helper->postApiCall('get', $apiUrl);
            if ($response['code'] == 200) {
                return view('user::login');
            }else{
                return view('user::login')->with(["ErrorMessage" => $response['error']]);;
            }
        } catch (Exception $e) {
            return $this->helper->errorHandler($e->getLine(),$e->getCode(),$e->getMessage(), ' verify() {RegistrationController}');
        }
    }
}

