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

class PlanDetailsController extends Controller
{
    protected $helper;
    protected $DOMAIN;

    public function __construct()
    {
        $this->helper = Helper::getInstance();
        $this->DOMAIN = env('API_URL') . env('API_VERSION');
    }

    public function planDetailsView()
    {
        $userPlanData = "";
        $getPlanDetails = $this->getPlanDetails();
        if (isset($getPlanDetails['code']) && $getPlanDetails['code'] == 200) {
            $userPlanData = Session::get('user')['userDetails']['userPlanDetails'];
        }
        return view("home::PlanDetails.plan_details")->with(array("getPlanDetails" => $getPlanDetails, "userPlanData" => $userPlanData));
    }

    public function getPlanDetails()
    {
        try {
            $apiUrl = $this->DOMAIN . '/get-plan-details';
            try {
                $response = $this->helper->postApiCall('get', $apiUrl);
                return $this->helper->responseHandlerWithArrayIfElse($response);
            } catch (\GuzzleHttp\Exception\RequestException $e) {
                return $this->helper->guzzleErrorHandler($e, ' ProfileUpdateController => getProfileData => Method-get ');
            }
        } catch (\Exception $e) {
            return $this->helper->callingErrorHandler($e, ' ProfileUpdateController => getProfileData => Method-get ');
        }
    }
}
