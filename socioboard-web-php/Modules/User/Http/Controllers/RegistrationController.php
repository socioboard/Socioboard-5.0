<?php

namespace Modules\User\Http\Controllers;

use App\ApiConfig\ApiConfig;
use Exception;
use Illuminate\Http\Request;
use Modules\User\helper;
use Modules\User\Http\Requests\SignUp;
use Modules\User\Http\Requests\AppsumoRegister;


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
            $phone = explode("-", $requestFields['phone']);
//            $otp = $requestFields['otp'];
            $parameters = array(
                'username' => $requestFields['userName'],
                'email' => $requestFields['email'],
                'password' => md5($requestFields['password']),
                'firstName' => $requestFields['firstName'],
                'lastName' => $requestFields['lastName'],
                'phoneNo' => $requestFields['phone'],
                'phoneCode' => $requestFields['code'],
                'country' => $requestFields['country'] ?? '',
                'rfd' => $requestFields['rfd'],
                'kwd' => $requestFields['kwd'],
                'med' => $requestFields['med'],
                'src' => $requestFields['src'],
            );
            try {
                $mobileno = $requestFields['phone'];
                $mobileCode = "%2B" . $requestFields['code'];
                        $response = $this->helper->postApiCall('post', $apiUrl, $parameters);
            } catch (Exception $e) {
                return $this->helper->errorHandler($e->getLine(), $e->getCode(), $e->getMessage(), ' signUp() {RegistrationController}');
            }
            if (in_array($response['code'], [200, 400, 401])) {
                return $this->helper->responseHandlerWithArray($response);
            } else {
                return $this->helper->errorHandler('47', $response['code'], 'Response Code Mismatch ', 'signUp() {RegistrationController}');
            }
        } catch (Exception $e) {
            return $this->helper->errorHandler($e->getLine(), $e->getCode(), $e->getMessage(), ' signUp() {RegistrationController}');
        }
    }

    public function verify(Request $request)
    {
        $email = $request['email'];
        $activationToken = $request['activationToken'];
        $apiUrl = ApiConfig::get('/verify-email?email=' . $email . '&activationToken=' . $activationToken);
        try {
            $response = $this->helper->postApiCall('get', $apiUrl);
            if ($response['code'] == 200) {
                return redirect('/login')->with("SuccessMessage", "Email Activated Successfully");
            } else {
                return redirect('/login')->with(["ErrorMessage" => $response['error']]);;
            }
        } catch (Exception $e) {
            return $this->helper->errorHandler($e->getLine(), $e->getCode(), $e->getMessage(), ' verify() {RegistrationController}');
        }
    }

    public function appsumoRegister($email){
        return view("user::appsumo",compact('email'));
    }

    public function saveAppsumo(AppsumoRegister $requeest)
    {
        $apiUrl = ApiConfig::get('/register');
        $parameters = array(
            'username' => $requeest['userName'],
            'email' => $requeest['email'],
            'password' => md5($requeest['password']),
            'firstName' => $requeest['firstName'],
            'lastName' => $requeest['lastName'],
            'rfd' => $requeest['rfd'],
            'kwd' => $requeest['kwd'],
            'med' => $requeest['med'],
            'src' => $requeest['src'],
        );
        try {
            $response = $this->helper->postApiCall('post', $apiUrl, $parameters);
            return $this->helper->responseHandlerWithArray($response);
        } catch (Exception $e) {
            return $this->helper->errorHandler($e->getLine(), $e->getCode(), $e->getMessage(), ' saveAppsumo() {RegistrationController}');
        }
    }
}

