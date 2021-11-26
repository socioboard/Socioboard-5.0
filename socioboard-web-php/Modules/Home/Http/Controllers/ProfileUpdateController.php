<?php

namespace Modules\Home\Http\Controllers;

use App\Classes\AuthUsers;
use App\Models\User;
use App\Traits\RegisterUser;
use App\Http\Requests\RegistrationRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;
use Modules\User\helper;

class ProfileUpdateController extends Controller
{
    protected $helper;
    private $API_URL;
    protected $API_VERSION;

    public function __construct()
    {
        $this->API_URL = env('API_URL');
        $this->helper = Helper::getInstance();
        $this->API_VERSION = env('API_VERSION');
    }

    public function profileUpdate()
    {
        $getProfileData = $this->getProfileData();
        return view("home::ProfileUpdate.my_profile")->with(array("getProfileData" => $getProfileData));
    }

    public function getProfileData()
    {
        try {
            $apiUrl = $this->API_URL . env('API_VERSION') . '/user/get-user-info';
            try {
                $response = $this->helper->postApiCallWithAuth('get', $apiUrl);
                return $this->helper->responseHandlerWithIfElse($response);
            } catch (\GuzzleHttp\Exception\RequestException $e) {
                return $this->helper->guzzleErrorHandler($e, ' ProfileUpdateController => getProfileData => Method-get ');
            }
        } catch (\Exception $e) {
            return $this->helper->callingErrorHandler($e, ' ProfileUpdateController => getProfileData => Method-get ');
        }
    }

    public function changePassword(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                "current_passwords" => 'required',
                "new_passwords" => 'required |regex:/^(?=.*\d)(?=.*[!-\/:-@\[-`{-~]).{8,}$/',
                "confirm_passwords" => 'required|same:new_passwords'
            ], [
                'current_passwords.required' => 'Current Password is required',
                'new_passwords.required' => 'New password is required',
                'new_passwords.regex' => 'Password must consist atleast 1 uppercase, 1 lowercase, 1 special character, 1 numeric value and minimum 8 charecters',
                'confirm_passwords.required' => 'confirm password is required',
                'confirm_passwords.same' => 'password mismatch',
            ]);
            if ($validator->fails()) {
                $response['code'] = 201;
                $response['message'] = $validator->errors()->all();
                $response['data'] = null;
                return Response::json($response, 200);
            }
            $data['currentPassword'] = md5($request->current_passwords);
            $data['newPassword'] = md5($request->new_passwords);
            $apiUrl = $this->API_URL . env('API_VERSION') . '/user/change-password';
            try {
                $response = $this->helper->postApiCallWithAuth('post', $apiUrl, $data);

                $result = $this->helper->responseHandlerWithIfElse($response);
                $result['new_password'] = $data['newPassword'];
                Session::put('user.userDetails.password', $result['new_password']);
                return $result;
            } catch (\GuzzleHttp\Exception\RequestException $e) {
                return $this->helper->guzzleErrorHandler($e, ' ProfileUpdateController => changePassword => Method-post ');
            }
        } catch (\Exception $e) {
            return $this->helper->callingErrorHandler($e, ' ProfileUpdateController => changePassword => Method-post ');
        }
    }

    public function updateProfileData(Request $request)
    {
        try {
            if($request->profileType == 1) {
                $validator = Validator::make($request->all(), [
                    "first_name" => 'min:3|regex:/^[a-zA-Z-,]+(\s{0,1}[a-zA-Z-, ])*$/',
                    "last_name" => 'regex:/^[a-zA-Z-,]+(\s{0,1}[a-zA-Z-, ])*$/',
                    "location" => 'min:3|regex:/^[a-zA-Z-,]+(\s{0,1}[a-zA-Z-, ])*$/',
                    "phone_number" => 'required',
                    "company_name" => 'required'
                ], [
                    'first_name.min' => 'Minimum 3 Characters Required',
                    'first_name.regex' => 'First name should contain Only alphabets',
                    'last_name.regex' => 'Last name should contain Only alphabets',
                    'location.regex' => 'Location name should contain Only alphabets',
                    'location.min' => 'Location name should contain Minimum 3 Characters',
                    'phone_number.required' => 'Phone Number is required',
                    'company_name.required' => 'Company Name is required'
                ]);
            } elseif ($request->profileType == 2) {
                $validator = Validator::make($request->all(), [
                    "user_name" => 'required',
                    "language" => 'required',
                    "timezone" => 'required',
                ], [
                    'user_name.required' => 'User Name is required',
                    'language.required' => 'Language is required',
                    'timezone.required' => 'Timezone is required',
                ]);
            }
            if ($validator->fails()) {
                $response['code'] = 201;
                $response['message'] = $validator->errors()->all();
                $response['data'] = null;
                return Response::json($response, 200);
            }
            if($request->profileType == 1) {
                $data['firstName'] = $request->first_name;
                $data['lastName'] = $request->last_name;
                $data['company'] = $request->company_name;
                $data['phoneNo'] = $request->phone_number;
                $data['phoneCode'] = $request->phone_code;
                $data['country'] = $request->country;
                $data['location'] = $request->location;
                if($request->remove_avatar_value == 1) $data['profilePicture'] = "media/svg/avatars/001-boy.svg";
                else {
                    $file = $request->file;
                    if ($file != "undefined") {
                        $fname = $file->getClientOriginalName();
                        $destinationPath = public_path('media/svg/avatars');
                        $file->move($destinationPath, $fname);
                        $data['profilePicture'] = 'media/svg/avatars/' . $fname;
                    }
                }
            } elseif ($request->profileType == 2) {
                $data['username'] = $request->user_name;
                $data['language'] = $request->language;
                $data['timezone'] = $request->timezone;
            }

            $apiUrl = $this->API_URL . env('API_VERSION') . '/user/update-profile-details';
            try {
                $response = $this->helper->postApiCallWithAuth('post', $apiUrl, $data);
                if ($response['data']->code == 200) {
                    $response['data']->data->user->Activations = (array)$response['data']->data->user->Activations;
                    $response['data']->data->user->userPlanDetails = (array)($response['data']->data->user->userPlanDetails);
                    $user = array(
                        'userDetails' => (array)($response['data']->data->user),
                        'accessToken' => Session::get("user")['accessToken']
                    );
                    AuthUsers::login($user);
                    $this->helper->getTeamNewSession();
                }
                return $this->helper->responseHandlerWithIfElse($response);
            } catch (\GuzzleHttp\Exception\RequestException $e) {
                return $this->helper->guzzleErrorHandler($e, ' ProfileUpdateController => changePassword => Method-post ');
            }
        } catch (\Exception $e) {
            return $this->helper->callingErrorHandler($e, ' ProfileUpdateController => changePassword => Method-post ');
        }
    }

    public function deleteUser(Request $request)
    {
        try {
            $apiUrl = $this->API_URL . env('API_VERSION') . '/user/delete-user';
            try {
                $response = $this->helper->postApiCallWithAuth('delete', $apiUrl);
                return $this->helper->responseHandlerWithIfElse($response);
            } catch (\GuzzleHttp\Exception\RequestException $e) {
                return $this->helper->guzzleErrorHandler($e, ' ProfileUpdateController => deleteUser => Method-delete ');
            }
        } catch (\Exception $e) {
            return $this->helper->callingErrorHandler($e, ' ProfileUpdateController => deleteUser => Method-delete ');
        }
    }

    public function holdUser(Request $request)
    {
        try {
            $apiUrl = $this->API_URL . env('API_VERSION') . '/user/hold-user';
            try {
                $response = $this->helper->postApiCallWithAuth('post', $apiUrl);
                return $this->helper->responseHandlerWithIfElse($response);
            } catch (\GuzzleHttp\Exception\RequestException $e) {
                return $this->helper->guzzleErrorHandler($e, ' ProfileUpdateController => holdUser => Method-post ');
            }
        } catch (\Exception $e) {
            return $this->helper->callingErrorHandler($e, ' ProfileUpdateController => holdUser => Method-post ');
        }
    }
}
