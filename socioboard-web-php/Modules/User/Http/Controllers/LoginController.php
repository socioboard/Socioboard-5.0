<?php

namespace Modules\User\Http\Controllers;

use App\ApiConfig\ApiConfig;
use App\Classes\AuthUsers;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Modules\User\helper;
use Modules\User\Http\Requests\DirectLogin;
use Modules\User\Http\Requests\ForgotPasswordEmail;
use Modules\User\Http\Requests\Login;
use Modules\User\Http\Requests\VerifyPasswordToken;
use Modules\User\Http\Requests\VrifyDirectLogin;
use Exception;

class LoginController extends Controller
{
    protected $helper;
    protected $requestToken;
    protected $requestSecret;

    public function __construct()
    {
        $this->helper = helper::getInstance();
    }

    public function social($network)
    {
        if ($network == "Google" || $network == "Facebook" || $network == "Twitter" || $network == "GitHub") {
            try {
                $apiUrl = ApiConfig::get('/social-Login?network=' . $network);
                $response = $this->helper->postApiCall('GET', $apiUrl);
                if ($response['code'] === 200) {
                    if ($network === "Twitter") {
                        Session::put("requestToken", $response['token']['requestToken']);
                        Session::put("requestSecret", $response['token']['requestSecret']);
                    }
                    return redirect($response['navigateUrl']);
                } else if ($response['code'] === 400) {
                    return redirect('login')->with('invalidSocial', $response['error']);
                }
            } catch (Exception $e) {
                $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), 'social() {LoginController}');
                return redirect('login')->with('invalidSocial', 'Sorry some Error occurred , Please reload the page');
            }
        } else {
            return redirect('login')->with('invalidSocial', 'Sorry some Error occurred , Please reload the page');
        }
    }

    public function facebookCallBack(Request $request)
    {
        try {
            $apiUrl = ApiConfig::get('/facebook-callback?code=' . $request['code']);
            $response = $this->helper->postApiCall('post', $apiUrl);
            if ($response['code'] === 200) {
                $user = array(
                    'userDetails' => $response['data']['user'],
                    'accessToken' => $response['data']['accessToken']
                );
                session()->put('socialUser', $user);
                $response2 = $this->checkPlanExpirySocial();
                if ($response2 === "true") {
                    AuthUsers::login($user);
                    return redirect('plan-details-view');
                } else {
//                    if (($user['userDetails']['phone_code'] === '0' || $user['userDetails']['phone_code'] === null || $user['userDetails']['phone_code'] === '')|| $user['userDetails']['phone_code'] === 'nil' || ($user['userDetails']['phone_no'] === '0' || $user['userDetails']['phone_no'] === null || $user['userDetails']['phone_no'] === ''|| $user['userDetails']['phone_no'] === 'nil')) {
//                        return redirect('login')->with('NocontactNumber', 'NO');
//                    } else {
                        AuthUsers::login($user);
                        $result = $this->checkPlanExpiry();
                        if ($result === "true") {
                            return redirect('plan-details-view');
                        } else {
                            $this->helper->getTeamNewSession();
                            return redirect('dashboard');
                        }
//                    }
                }
            } else if ($response['code'] === 400) {
                return redirect('login')->with('invalidSocial', $response['error']);
            } else {
                return redirect('login')->with('invalidSocial', 'Sorry some Error occurred , Please reload the page');
            }
        } catch (Exception $e) {
            $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), ' facebookCallBack() {LoginController}');
            return redirect('login')->with('invalidSocial', 'Sorry some Error occurred , Please reload the page');
        }
    }

    public function googleCallBack(Request $request)
    {
        try {
            $apiUrl = ApiConfig::get('/google-callback?code=' . $request['code']);
            $response = $this->helper->postApiCall('post', $apiUrl);
            if ($response['code'] === 200) {
                $user = array(
                    'userDetails' => $response['data']['user'],
                    'accessToken' => $response['data']['accessToken']
                );
                session()->put('socialUser', $user);
                $response2 = $this->checkPlanExpirySocial();
                if ($response2 === "true") {
                    AuthUsers::login($user);
                    return redirect('plan-details-view');
                } else {
//                    if (($user['userDetails']['phone_code'] === '0' || $user['userDetails']['phone_code'] === null || $user['userDetails']['phone_code'] === ''||$user['userDetails']['phone_code'] === 'nil') || ($user['userDetails']['phone_no'] === '0' || $user['userDetails']['phone_no'] === null || $user['userDetails']['phone_no'] === ''||
//                            $user['userDetails']['phone_no'] === 'nil')) {
//                        return redirect('login')->with('NocontactNumber', 'NO');
//                    } else {
                        AuthUsers::login($user);
                        $result = $this->checkPlanExpiry();
                        if ($result === "true") {
                            return redirect('plan-details-view');
                        } else {
                            $this->helper->getTeamNewSession();
                            return redirect('dashboard');
                        }
//                    }
                }
            } else if ($response['code'] === 400) {
                return redirect('login')->with('invalidSocial', $response['error']);
            } else {
                return redirect('login')->with('invalidSocial', 'Sorry some Error occurred , Please reload the page');
            }
        } catch (Exception $e) {
            $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), ' googleCallBack() {LoginController}');
            return redirect('login')->with('invalidSocial', 'Sorry some Error occurred , Please reload the page');
        }
    }

    public function gitHubCallBack(Request $request)
    {

        try {
            $apiUrl = ApiConfig::get('/github-callback?code=' . $request['code']);
            $response = $this->helper->postApiCall('POST', $apiUrl);
            if ($response['code'] === 200) {
                $user = array(
                    'userDetails' => $response['data']['user'],
                    'accessToken' => $response['data']['accessToken']
                );
                session()->put('socialUser', $user);
                $response2 = $this->checkPlanExpirySocial();
                if ($response2 === "true") {
                    AuthUsers::login($user);
                    return redirect('plan-details-view');
                } else {
//                    if (($user['userDetails']['phone_code'] === '0' || $user['userDetails']['phone_code'] === null || $user['userDetails']['phone_code'] === ''||$user['userDetails']['phone_code'] === 'nil') || ($user['userDetails']['phone_no'] === '0' || $user['userDetails']['phone_no'] === null || $user['userDetails']['phone_no'] === ''||
//                            $user['userDetails']['phone_no'] === 'nil')) {
//                        return redirect('login')->with('NocontactNumber', 'NO');
//                    } else {
                        AuthUsers::login($user);
                        $result = $this->checkPlanExpiry();
                        if ($result === "true") {
                            return redirect('plan-details-view');
                        } else {
                            $this->helper->getTeamNewSession();
                            return redirect('dashboard');
                        }
                    }
//                }
            } else if ($response['data']->code === 400) {
                return redirect('login')->with('invalidSocial', $response['data']->message);
            } else {
                return redirect('login')->with('invalidSocial', 'Sorry some Error occurred , Please reload the page');
            }
        } catch (Exception $e) {
            $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), ' gitHubCallBack() {LoginController}');
            return redirect('login')->with('gitHubCallBack', 'Sorry some Error occurred , Please reload the page');
        }
    }

    public function show()
    {
        return view("user::login");
    }

    public function checkLogin(Login $request)
    {
        $apiUrl = ApiConfig::get('/login');
        $response = null;
        $result = null;
        if (str_contains($request['emailOrUsername'], '@')) {
            $parameters = array(
                "email" => $request['emailOrUsername'],
                "password" => md5($request['password'])
            );
        } else {
            $parameters = array(
                "username" => $request['emailOrUsername'],
                "password" => md5($request['password'])
            );
        }
        try {
            $response = $this->helper->postApiCall('post', $apiUrl, $parameters);
            if ($response['code'] == 200) {
                $data = array(
                    'userDetails' => $response['data']['user'],
                    'accessToken' => $response['data']['accessToken']
                );
                session()->put('socialUser', $data);
                session()->put('timezone', $request['timezone']);
                $response2 = $this->checkPlanExpirySocial();
                if ($response2 === "true") {
                    AuthUsers::login($data);
                    $result['code'] = 403;
                    return $result;
                } else {
//                    if (($data['userDetails']['phone_code'] === '0' || $data['userDetails']['phone_code'] === null || $data['userDetails']['phone_code'] === ''||$data['userDetails']['phone_code'] === 'nil') || ($data['userDetails']['phone_no'] === '0' || $data['userDetails']['phone_no'] === null || $data['userDetails']['phone_no'] === ''||$data['userDetails']['phone_no'] === 'nil')) {
//                        $result['code'] = 501;
//                        return $result;
//                    } else {
                        AuthUsers::login($data);
                        $expiry_date = $response['data']['user']['Activations']['account_expire_date'];
                        $today = date('d-m-Y');
                        $exp = date('d-m-Y', strtotime($expiry_date));
                        $expDate = date_create($exp);
                        $todayDate = date_create($today);
                        $diff = date_diff($todayDate, $expDate);
                        if ($diff->format("%R%a") <= 0) {
                            $responses['code'] = 403;
                            Session::put('expired', 'true');
                            return $responses;
                        } else {
                            $this->helper->getTeamNewSession();
                            Session::put('expired', 'false');
                            return $response;
                        }
//                    }
                }
            } else if ($response['code'] == 400 || $response['code'] == 401) {
                return $response;
            } else {
                return $this->helper->errorHandler('166', $response['code'], 'Response Code Mismatch ', 'checkLogin() {LoginController}');
            }
        } catch (Exception $e) {
            return $this->helper->errorHandler($e->getLine(), $e->getCode(), $e->getMessage(), ' checkLogin() {LoginController}');
        }
    }

    public function twitterCallBack(Request $request)
    {
        $requestToken = Session::get('requestToken');
        $requestSecret = Session::get('requestSecret');
        $apiUrl = ApiConfig::get('/twitter-callback?requestToken=' . $requestToken . '&requestSecret=' . $requestSecret . '&verifier=' . $request['oauth_verifier']);
        try {
            $response = $this->helper->postApiCall('post', $apiUrl);
            if ($response['code'] === 200) {
                $user = array(
                    'userDetails' => $response['data']['user'],
                    'accessToken' => $response['data']['accessToken']
                );
                session()->put('socialUser', $user);
                $response2 = $this->checkPlanExpirySocial();
                if ($response2 === "true") {
                    AuthUsers::login($user);
                    return redirect('plan-details-view');
                } else {
//                    if (($user['userDetails']['phone_code'] === '0' || $user['userDetails']['phone_code'] === null || $user['userDetails']['phone_code'] === ''||$user['userDetails']['phone_code'] === 'nil') || ($user['userDetails']['phone_no'] === '0' || $user['userDetails']['phone_no'] === null || $user['userDetails']['phone_no'] === ''||$user['userDetails']['phone_no'] === 'nil')) {
//                        return redirect('login')->with('NocontactNumber', 'NO');
//                    } else {
                        AuthUsers::login($user);
                        $result = $this->checkPlanExpiry();
                        if ($result === "true") {
                            return redirect('plan-details-view');
                        } else {
                            $this->helper->getTeamNewSession();
                            return redirect('dashboard');
                        }
                    }
//                }
            } else if ($response['code'] === 400) {
                return redirect('login')->with('invalidSocial', $response['data']->error);
            } else {
                return redirect('login')->with('invalidSocial', 'Sorry some Error occurred , Please reload the page');
            }
        } catch (Exception $e) {
            $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), ' twitterCallBack() {LoginController}');
            return redirect('login')->with('invalidSocial', 'Sorry some Error occurred , Please reload the page');
        }
    }

    public function checkPlanExpiry()
    {
        $response = Session::get('user');
        $expiry_date = $response['userDetails']['Activations']['account_expire_date'];
        $today = date('d-m-Y');
        $exp = date('d-m-Y', strtotime($expiry_date));
        $expDate = date_create($exp);
        $todayDate = date_create($today);
        $diff = date_diff($todayDate, $expDate);
        if ($diff->format("%R%a") <= 0) {
            Session::put('expired', 'true');
            $success = "true";
            return $success;
        } else {
            $success = "false";
            return $success;
        }
    }

    public function checkPlanExpirySocial()
    {
        $response = session()->get('socialUser');
        $expiry_date = $response['userDetails']['Activations']['account_expire_date'];
        $today = date('d-m-Y');
        $exp = date('d-m-Y', strtotime($expiry_date));
        $expDate = date_create($exp);
        $todayDate = date_create($today);
        $diff = date_diff($todayDate, $expDate);
        if ($diff->format("%R%a") <= 0) {
            Session::put('expired', 'true');
            $success = "true";
        } else {
            $success = "false";
        }
        return $success;
    }

    public function logout(): RedirectResponse
    {
        Session::forget('user');
        Session::put('offer_session', false);
        authUser()->logout();
        if (env('APP_ENV') === 'main') {
            return redirect(env('APP_URL') . "amember/logout");
        }
        return Redirect::to('/login');
    }

    public function forgotPassword()
    {
        return view("user::forgot_password");
    }

    public function resetPassword()
    {
        return view("user::reset_password");
    }

    public function forgotPasswordEmail(ForgotPasswordEmail $request): array
    {
        $apiUrl = ApiConfig::get('/forgot-password?email=' . $request->emailId);
        try {
            $response = $this->helper->postApiCall('get', $apiUrl);
            return $this->helper->responseHandlerWithArrayIfElse($response);
        } catch (Exception $e) {
            return $this->helper->callingErrorHandler($e, ' LoginController => forgotPasswordEmail => Method-get ');
        }
    }

    public function verifyPasswordToken(VerifyPasswordToken $request)
    {
        $apiUrl = ApiConfig::get('/verify-password-token?email=' . $request->input("email") . '&activationToken=' . $request->input("activationToken"));
        try {
            $response = $this->helper->postApiCall('get', $apiUrl);
            $response = $this->helper->responseHandlerWithArrayIfElse($response);
            session()->put('forgot_password_user_email', $request->input("email"));
            if ($response['code'] == 200) session()->put('otherToken', $request->input('activationToken'));
            if ($response['code'] == 200) return redirect("reset-password")->with('email', $request->input("email"));
            else return redirect("forgot-password")->with('message', $response["message"]);
        } catch (Exception $e) {
            $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), ' verifyPasswordToken() {LoginController}');
            return redirect('forgot-password')->with('message', 'Sorry some Error occurred , Please reload the page');
        }
    }

    public function newPassword(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                "new_password" => 'required |regex:/^(?=.*\d)(?=.*[!-\/:-@\[-`{-~]).{8,}$/',
                "confirm_password" => 'required|same:new_password'
            ], [
                'new_password.required' => 'password is required',
                'new_password.regex' => 'Password must consist atleast 1 uppercase, 1 lowercase, 1 special character, 1 numeric value and minimum 8 charecters',
                'confirm_password.required' => 'confirm password is required',
                'confirm_password.same' => 'password mismatch',
            ]);
            if ($validator->fails()) {
                $response['code'] = 201;
                $response['message'] = $validator->errors()->all();
                $response['data'] = null;
                return Response::json($response, 200);
            }
            $apiUrls = ApiConfig::get('/reset-password?email=' . $request->input("email") . '&newPassword=' . md5($request->input("new_password")));
            $apiUrl = $apiUrls.'&activationToken='.\session()->get('otherToken');
            try {
                $response = $this->helper->postApiCall('post', $apiUrl);
                return $this->helper->responseHandlerWithArrayIfElse($response);
            } catch (Exception $e) {
                return $this->helper->guzzleErrorHandler($e->getMessage(), ' LoginController => newPassword => Method-post ');
            }
        } catch (\Exception $e) {
            return $this->helper->callingErrorHandler($e, ' LoginController => newPassword => Method-post ');
        }
    }

    public function emailLogin(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'emailID' => 'required|email',
            ], [
                'emailID.required' => 'Email is required',
                'emailID.email' => 'Invalid Email',
            ]);
            if ($validator->fails()) {
                $response['code'] = 201;
                $response['message'] = $validator->errors()->all();
                $response['data'] = null;
                return Response::json($response, 200);
            }
            $apiUrl = ApiConfig::get('/direct-login-mail?email=' . $request->input("emailID"));
            try {
                $response = $this->helper->postApiCall('get', $apiUrl);
                return $this->helper->responseHandlerWithArrayIfElse($response);
            } catch (Exception $e) {
                return $this->helper->guzzleErrorHandler($e->getMessage(), ' LoginController => emailLogin => Method-get ');
            }
        } catch (\Exception $e) {
            return $this->helper->callingErrorHandler($e, ' LoginController => emailLogin => Method-post ');
        }
    }

    public function getEmailActivationLink(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
            ], [
                'email.required' => 'Email is required',
                'email.email' => 'Invalid Email',
            ]);
            if ($validator->fails()) {
                $response['code'] = 201;
                $response['message'] = $validator->errors()->all();
                $response['data'] = null;
                return Response::json($response, 200);
            }
            $apiUrl = ApiConfig::get('/get-mail-activation-link?email=' . $request->input("email"));
            try {
                $response = $this->helper->postApiCall('get', $apiUrl);
                return $this->helper->responseHandlerWithArrayIfElse($response);
            } catch (Exception $e) {
                return $this->helper->guzzleErrorHandler($e->getMessage(), ' LoginController => getEmailActivationLink => Method-get ');
            }
        } catch (\Exception $e) {
            return $this->helper->callingErrorHandler($e, ' LoginController => getEmailActivationLink => Method-post ');
        }
    }

    public function verifyDirectLogin(VrifyDirectLogin $request)
    {
        $apiUrl = ApiConfig::get('/verify-direct-login-token?email=' . $request->input("email") . '&activationToken=' . $request->input("activationToken"));
        try {
            $response = $this->helper->postApiCall('get', $apiUrl);
            $response = $this->helper->responseHandlerWithArrayIfElse($response);
            if ($response['code'] == 200) {
                $data = array(
                    'userDetails' => $response['data']['user'],
                    'accessToken' => $response['data']['accessToken']
                );
                AuthUsers::login($data);
                session()->put('socialUser', $data);
                $response2 = $this->checkPlanExpirySocial();
                if ($response2 === "true") {
                    return redirect('/plan-details-view');
                }
                $this->helper->getTeamNewSession();
                return redirect('/dashboard');
            } else return view('user::login', ['result' => $response['message'], 'code' => $response['code']]);

        } catch (Exception $e) {
            $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), ' verifyDirectLogin() {LoginController}');
            return view('user::login', ['result' => 'Sorry some Error occurred , Please reload the page', 'code' => 403]);
        }
    }

    public function directLogin($email)
    {
        $validator = Validator::make($email, [
            'email' => 'required|email',
        ], [
            'email.required' => 'Email is required',
            'email.email' => 'Invalid Email',
        ]);
        if ($validator->fails()) {
            $response['code'] = 201;
            $response['message'] = $validator->errors()->all();
            $response['data'] = null;
            return Response::json($response, 200);
        }
        $apiUrl = ApiConfig::get('/direct-login');
        try {
            $response = $this->helper->postApiCall('post', $apiUrl, $email);
            if ($response['code'] == 200) {
                $data = array(
                    'userDetails' => $response['data']['user'],
                    'accessToken' => $response['data']['accessToken']
                );
                AuthUsers::login($data);
                $this->helper->getTeamNewSession();
                return true;
            } else  return view('user::login', ['result' => $response['message'], 'code' => $response['code']]);
        } catch (Exception $e) {
            $this->helper->logException($e->getLine(), $e->getCode(), $e->getMessage(), ' directLogin() {LoginController}');
            return view('user::login', ['result' => 'Sorry some Error occurred , Please reload the page', 'code' => 500]);
        }
    }

    function sendMobileOtp(Request $request)
    {
        try {
            $mobileno = $request->phoneno;
            $mobileCode = "%2B" . $request->code;
            $apiUrl = ApiConfig::get('/otp/get-otp-phone-number?countryCode=' . $mobileCode . '&phoneNumber=' . $mobileno);
            $response = $this->helper->postApiCall('get', $apiUrl);
            return $this->helper->responseHandlerWithArray($response);
        } catch (\Exception $e) {
            return $this->helper->callingErrorHandler($e, ' LoginController => sendMobileOtp => Method-get ');
        }

    }

    public function verifyMobileOtp(Request $request)
    {
        try {
            $mobileno = $request->phoneno;
            $mobileCode = "%2B" . $request->code;
            $OTP = $request->otp;
            $apiUrl = ApiConfig::get('/otp/verify-otp-phone-number?countryCode=' . $mobileCode . '&phoneNumber=' . $mobileno . '&otp=' . $OTP);
            $response = $this->helper->postApiCall('post', $apiUrl);
            return $this->helper->responseHandlerWithArray($response);
        } catch (\Exception $e) {
            return $this->helper->callingErrorHandler($e, ' LoginController => sendMobileOtp => Method-get ');
        }
    }

    public function updateUserSession(Request $request)
    {
        try {
            $session_var = session()->get('socialUser');
            $session_var['userDetails']['phone_code'] = '+' . $request->code;
            $session_var['userDetails']['phone_no'] = $request->phoneno;
            $session_var['userDetails']['country'] = $request->countryName;
            session()->put('user', $session_var);
            session()->save();
            $this->helper->getTeamNewSession();
            $data['phoneNo'] = $request->phoneno;
            $data['phoneCode'] = '+' . $request->code;
            $data['country'] =  $request->countryName;
            $data2 = (object)$data;
            $apiUrl = ApiConfig::get('/user/update-profile-details');
            $response = $this->helper->postApiCallWithAuth('post', $apiUrl, $data2);
            if ($response['data']->code === 200) {
                $result['code'] = 200;
                $result['data'] = 'success';
            } else if ($response['data']->code === 400) {
                Session::flush();
                $result['code'] = 400;
                $result['data'] = $response['data']->error;
            } else {
                Session::flush();
                $result['code'] = 500;
                $result['data'] = 'Some error occured , please reload the page';
            }
            return $result;
        } catch (\Exception $e) {
            Session::flush();
            return $this->helper->callingErrorHandler($e, ' LoginController => updateUserSession => Method-get ');
        }
    }


}





