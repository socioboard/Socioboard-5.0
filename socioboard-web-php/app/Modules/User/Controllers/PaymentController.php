<?php

namespace App\Modules\User\Controllers;

use App\Modules\User\Helper;
use GuzzleHttp\Client;
use GuzzleHttp\RequestOptions;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;
use Laravel\Socialite\Facades\Socialite;
use Mockery\CountValidator\Exception;

class PaymentController extends Controller
{
    /*
     * Author: Aishwarya_M <aishwarya@globussoft.in>
     * Desc: unauthorized users authorization: signup, login, forgotpassword, account activation
     * NOTE: DOnnot forget to update team session after adding or deleting a social account*/
    protected $client;
    protected $API_URL;

    public function __construct()
    {
        $this->client = new Client();
        $this->API_URL = env('API_URL') . env('VERSION') . '/payment/';
    }


    public function pricetable(){

    }

    public function paymentSuccess(Request $request)
    {
        $help = Helper::getInstance();
//        "/payment/paypalPaymentSuccess?token=ss&payerId=ss";
        try {
            $response = $help->apiCallGet('payment/paypalPaymentSuccess?token=' . $request['token'] . '&payerId=' . $request['PayerID']);
            if ($response->code == 200 && $response->status == "success") {
                // TODO continue here (Reg: Loading )
//                if($response->has)

                if ($response->hasNewAccesstoken) {
                    $response = $help->apiCallGet('user/getUserInfo');
                    Session::forget('user');
                    $user = array(
                        'accessToken' => $response->accessToken,
                        'userDetails' => $response->userDetails,
                    );
                    Session::put('user', $user);

                } else {
                    $pay = 'payment/paypalPaymentSuccess?token=' . $request['token'] . '&payerId=' . $request['PayerID'];
                    Session::put('payment', $pay);
                    return redirect('/loader');
                }
            }

        } catch (\Exception $e) {
        }


    }


    //for loading
    public function paymentajax()
    {
        $res = [];

        if (Session::has("payment")) {
            $help = Helper::getInstance();
//        "/payment/paypalPaymentSuccess?token=ss&payerId=ss";
            try {
                $response = $help->apiCallGet(Session::get('payment'));
                if ($response->code == 200 && $response->status == "success") {
                    // TODO continue here (Reg: Loading )
//                if($response->has)

                    if ($response->hasNewAccesstoken) {
                        $team = Session::get('currentTeam')['team_id'];
                        $response = $help->apiCallGet('user/getUserInfo');
                        Session::forget('user');
                        $user = array(
                            'accessToken' => $response->accessToken,
                            'userDetails' => $response->userDetails,
                        );
                        Session::put('user', $user);
                        Session::forget('payment');

                        $res['code'] = 200;
                        $res['team'] = $team;


                    } else {
                        $res['code'] = 400;
                        $res['team'] = 0;
                    }
                }


            } catch (\Exception $e) {
               return json_encode($e->getMessage());
            }
        } else {
            $res['code'] = 401;
            $re['team'] = 0;
        }

return ($res);
    }


    public function updatePlan(Request $request)
    {

        if($request->isMethod('get')){
            return view('User::dashboard.priceTable',['currentPlan'=>Session::get('user')['userDetails']->userPlanDetails
            ]);
        }else if($request->isMethod('post')){
            $response = [];
            $result = [];
            try {
                $help = Helper::getInstance();
                if ((int)$request->currentPlan > (int)$request->newPlan) {
                    //Higher to lower
                    $response = Helper::getInstance()->apiCallGet('user/changePlan?currentPlan=' . $request->currentPlan . "&newPlan=" . $request->newPlan);
//                return json_encode($response);
                    if ($response->code == 200 && $response->status == "success") {
                        Session::forget('user');
                        $user = array(
                            'accessToken' => $response->accessToken,
                            'userDetails' => $response->userDetails,
                        );
                        Session::put('user', $user);

                        $result["code"] = 200;
                        $result["message"] = "Plan updated successfully";
                        return $result;

                    } else if ($response->code == 400 && $response->status == "failed") {
                        $result["code"] = 400;
                        $result["message"] = $response->message;
                        return $result;
                    } else if ($response->code == 404 && $response->status = "failed") {
//                    return json_encode($response);
                        $result['code'] = 400;
                        $result['message'] = $response->error;
                        return $result;
                    }
                } else {
                    //lower to higher

                    /*202 => on success
                    400 => on failure
                    */

                    $response = $help->apiCallGet('payment/getPaymentRedirectUrl?newPlanId=' . $request->newPlan . '&paymentMode=' . $request->paymentMode);
//                return json_encode($response);
                    if ($response->code == 200 && $response->status == "success") {
                        $result['code'] = 202;
                        $result['redirectUrl'] = $response->redirectUrl;
                        return $result;
                    } else if($response->code == 400 && $response->status == "failed") {
//                    return json_encode($response);error
                        $result['code'] = 400;
                        $result['message'] = $response->error;
                        return $result;
                    }else{
                        $result['code'] = 400;
                        $result['message'] = "Oops, something went wrong";
                        return $result;
                    }
                }
            } catch (\Exception $e) {
                $result['code'] = 500;
                $result['message'] = "Something went wrong";
                return $result;
            }
        }

    }


    public function loader()
    {
        if(Session::has('payment')){
            return view('User::dashboard.loader');
        }else{
            $team = Session::get('currentTeam')['team_id'];
            return redirect('dashboard/'.$team);
        }
    }


}
