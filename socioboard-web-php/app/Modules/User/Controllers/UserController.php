<?php

namespace App\Modules\User\Controllers;

use App\Modules\User\Helper;
use GuzzleHttp\Client;
use GuzzleHttp\RequestOptions;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;
use Laravel\Socialite\Facades\Socialite;
use Mockery\CountValidator\Exception;

class UserController extends Controller
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
        $this->API_URL = env('API_URL') . env('VERSION') . '/';
    }

    public function signup(Request $request)
    {
        if ($request->isMethod('get')) {
            return view('User::signup');
        } else if ($request->isMethod('post')) {
            $rules = array(

                "username" => 'required|max:32|min:2|regex:/([a-zA-Z]+)([0-9]*)/', ///([0-9]*)([a-zA-Z]+)([0-9]*)/
                "first_name" => 'required|regex:/([a-zA-Z]+)([0-9]*)/',
                "email_id" => 'required|email',
//                "passwd" => 'required|max:20|min:8|regex:/^(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z])(?=.*[#$^+=!*()@%&]).*$/',
                "passwd" => 'required|max:20|min:8|regex:/^(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z])(?=.*[\/!@#$%^&*()`~\s_+\-=\[\]{};:"\\\,.<>\?\']).*$/',
//                "passwd" => ['required'=>'regex:/^(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\?]).*$/'],
                "c_passwd" => 'required_with:passwd|same:passwd',
            );
            try {
                $customMessage =[
                    'passwd.regex' => 'Password must consist atleast 1 uppercase, 1 lowercase and 1 special character',
                    'c_passwd.required_with' =>'Please confirm your password!',
                    'c_passwd.same'=>'Password missmatch',
                    'username.regex' =>'Username should be alphanumeric',
                    'first_name.regex' => 'First name should not contain special characters and numbers.'
                ];

                $validator = Validator::make($request->all(), $rules,$customMessage);

                if ($validator->fails()) {
                    return $validator->errors();
                } else {
//                    $iterations = 1000;
//// Generate a random IV using openssl_random_pseudo_bytes()
//// random_bytes() or another suitable source of randomness
//                    $salt = openssl_random_pseudo_bytes(16);
//
//                    $hash = hash_pbkdf2("sha256", $request->passwd, $salt, $iterations, 20);

                    $user = array(
                        "userName" => $request->username,
                        "email" => $request->email_id,
                        "password" =>md5($request->passwd),
                        "firstName" => $request->first_name,
                        "profilePicture" =>env('APP_URL')."assets/imgs/user-avatar.png",
                        "phoneCode" => $request->dialcode,
                        "phoneNo" => $request->phone,
                        "country" => 'NA',
                        "timeZone" => 'NA',
                        "aboutMe" => ""
//                        "isAdminUser"=>false
                    );
//                    $userActivation = array(
//                        'activationStatus' =>0,
//                        'paymentStatus' => 0,
//                        'IsTwoStepVerify' => false,
//                        'signupType' => 0,
//                        'userPlan' => (int)$request->plan,
//                        'expireDate' => date("Y-m-d", strtotime("+4 weeks"))
//                    );
//                    $reward = array(
//                        'eWalletValue'=>0,
//                        'isAdsEnabled'=>false,
//                        'referedBy'=>"NA",
//                        'referalStatus'=>false
//                    );
                    $data['user'] = ($user);
//                    $data['activations'] = ($userActivation);
//                    $data['rewards'] = ($reward);

                    $api_url = $this->API_URL . 'register';

                    $response = $this->client->put($api_url,  [RequestOptions::JSON => $data]);

                    $result =json_decode($response->getBody()->getContents()) ;


                    if($result->code == 400){
                        $res['code'] = 400;
                        $res['error'] = $result->error;
                        return $res;
                    }

                    if($response->getStatusCode() == 200){
                        $res['code'] = 200;
                        $res['message'] = 'Registered Successfully!';
                        return $res;
                    }else if($response->getStatusCode() == 400){
                        $res['code'] = 400;
                        $res['error'] = 'Registration failed:(';
                        return $res;
                    }else{
                        $res['code'] = 400;
                        $res['error'] = 'Registration failed:(';
                        return $res;
                    }
                }
            } catch (\Exception $e) {
                Log::info("Sign up Exception ".$e->getLine()." => ".$e->getMessage());
                $res['code'] = 400;
                $res['error'] = 'Registration failed:(';
                return $result;
                throw new \Exception("Exception " . $e->getMessage());
            }
        }
    }

    public function updateTwoWayAuth(Request $request){
        $result = [];
        if($request->customRadio == 'no_auth') $twoStepActivate = 0;
        else if($request->customRadio == 'm_otp') $twoStepActivate = 1;
        else if($request->customRadio == 'email_auth') $twoStepActivate = 2;
        $helper = Helper::getInstance();
        try{
            $response = $helper->apiCallGet("user/changeTwoStepOptions?twoStepActivate=".$twoStepActivate);
            if($response->code == 200 && $response->status == "success"){
                $result['code'] = $response->code;
                $result['message'] = $response->messag;

                //update session
            }
            elseif ($response->code == 404 && $response->status == 'failed'){
                $result['code'] = $response->code ;
                $result['error'] = $response->error;
            }
            else{
                $result['code'] = 201;
                $result['error'] = $response->error;
            }
            return $result;
        }catch(\Exception $e){

        }
    }

    public function emailOtpLogin(Request $request){
        $email = $request->mobile_otp_email;
        $mobToken = $request->mobile_otp;
        $emailToken = $request->email_otp;

        $twoWayData = [];

        $api_url = $this->API_URL . 'twoStepLoginValidate?email='.urlencode($email).'&emailtoken='.$emailToken.'&mobiletoken='.$mobToken;
        $response = $this->client->post($api_url);
        $result = json_decode($response->getBody()->getContents());
        if ($response->getStatusCode() == 200) {
            if ($result->code == 404 ){
                $twoWayData = [
                    'email'  => "",
                    'twoWayChoice'   => 0,
                    'mobileOtpError' => "",
                    'emailOtpError' => $result->error
                ];
                return view('User::login')->with('twoWayData',$twoWayData);
//                return redirect('login')->with('twoWayData', $twoWayData);
            }
            else if ($result->code == 400 && $result->status = "failure")
                return redirect('login')->with('email_act', $result->message);


            //TODO get ip and system address of client


            $user = array(
                'accessToken' => $result->accessToken,
                'userDetails' => $result->user
            );
            Session::put('user', $user);
            Session::put('twoWayAuth', $result->user->Activations->activate_2step_verification);
            $team = Helper::getInstance()->getTeamNewSession();
            for ($i = 0; $i < count($team['teamSocialAccountDetails']); $i++) {
                if ($team['teamSocialAccountDetails'][$i][0]->team_admin_id == $result->user->user_id) {
                    Session::put('ownerTeamId', $team['teamSocialAccountDetails'][$i][0]->team_id);
                    $teamOwner = Session::get('ownerTeamId');
                    break;
                }
            }

            //                        Session::put('ownerTeam',)

            if ($teamOwner != "") {
                return redirect('dashboard/' . $teamOwner);
            } else {
                Session::forget('user');
                Session::forget('team');
                return redirect('login')->with('EmailOtpError', 'Default Socioboard team does not exist');
            }


        } else {
            return redirect('login')->with('error', 'Something went wrong');
        }
    }


    public function MobOtpLogin(Request $request){
        $email = $request->mobile_otp_email;
        $mobToken = $request->mobile_otp;
        $twoWayData = [];

        $api_url = $this->API_URL . 'twoStepLoginValidate?email='.urlencode($email).'&mobiletoken='.$mobToken;
        $response = $this->client->post($api_url);
        $result = json_decode($response->getBody()->getContents());
        if ($response->getStatusCode() == 200) {
            if ($result->code == 404 && $result->status = "failure"){
                $twoWayData = [
                    'email'  => "",
                    'twoWayChoice'   => 0,
                    'mobileOtpError' => $result->error,
                    'emailOtpError' => ""
                ];
                return redirect('login')->with('twoWayData', $twoWayData);
            }
            else if ($result->code == 400 && $result->status = "failure")
                return redirect('login')->with('email_act', $result->message);


            //TODO get ip and system address of client


            $user = array(
                'accessToken' => $result->accessToken,
                'userDetails' => $result->user
            );
            Session::put('user', $user);
            Session::put('twoWayAuth', $result->user->Activations->activate_2step_verification);
            $team = Helper::getInstance()->getTeamNewSession();
            for ($i = 0; $i < count($team['teamSocialAccountDetails']); $i++) {
                if ($team['teamSocialAccountDetails'][$i][0]->team_admin_id == $result->user->user_id) {
                    Session::put('ownerTeamId', $team['teamSocialAccountDetails'][$i][0]->team_id);
                    $teamOwner = Session::get('ownerTeamId');
                    break;
                }
            }

            //                        Session::put('ownerTeam',)

            if ($teamOwner != "") {
                return redirect('dashboard/' . $teamOwner);
            } else {
                Session::forget('user');
                Session::forget('team');
                return redirect('login')->with('EmailOtperror', 'Default Socioboard team does not exist');
            }


        } else {
            return redirect('login')->with('error', 'Something went wrong');
        }
    }




    public function login(Request $request)
    {
        if (Session::has('user')) {
            $team = Helper::getInstance()->getTeamNewSession();
            return redirect('dashboard/' . $team['teamSocialAccountDetails'][0][0]->team_id);
        }
        if ($request->isMethod('GET')) {
            $twoWayData = [
                'email'  => "",
                'twoWayChoice'   => 0,
                'mobileOtpError' => "",
                'emailOtpError' => ""
            ];
            return view('User::login')->with('twoWayData',$twoWayData);
        } elseif ($request->isMethod('POST')) {
            $user = [];
            $team = [];
            $teamOwner="";
            //accout activation condition must be added here
            $rules = array(
                "email" => 'required',
                "passwd" => 'required'
            );
            try {
                $validator = Validator::make($request->all(), $rules);
                if ($validator->fails()) {
                    return redirect()->back()->withErrors($validator)->withInput();
                } else {

                    $loginData = array(
                        "user" => $request->email,
                        "password" => md5($request->passwd)
                    );
//                    $data = json_encode($loginData);


                    $api_url = $this->API_URL . 'login';
                    $response = $this->client->post($api_url, [RequestOptions::JSON => $loginData]);
                    $result = json_decode($response->getBody()->getContents());
                    if ($response->getStatusCode() == 200) {
                        //if not admin
                            if (isset($result->isTwoStepEnabled)) {
                                $twoWayData = [
                                    'email'  => $result->user->email,
                                    'twoWayChoice'   => $result->isTwoStepEnabled,
                                ];
                                return view('User::login')->with('twoWayData', $twoWayData);
                            }
                            if ($result->code == 404 && $result->status = "failure")
                                return redirect('login')->with('invalid', $result->message);
                            else if ($result->code == 400 && $result->status = "failure")
                                return redirect('login')->with('email_act', $result->message);


                            //TODO get ip and system address of client


                            $user = array(
                                'accessToken' => $result->accessToken,
                                'userDetails' => $result->user
                            );
                            Session::put('user', $user);
                            Session::put('twoWayAuth', $result->user->Activations->activate_2step_verification);
                            $team = Helper::getInstance()->getTeamNewSession();
                            for ($i = 0; $i < count($team['teamSocialAccountDetails']); $i++) {
                                if ($team['teamSocialAccountDetails'][$i][0]->team_admin_id == $result->user->user_id) {
                                    Session::put('ownerTeamId', $team['teamSocialAccountDetails'][$i][0]->team_id);
                                    $teamOwner = Session::get('ownerTeamId');
                                    break;
                                }
                            }

                            //                        Session::put('ownerTeam',)

                            if ($teamOwner != "") {
                                return redirect('dashboard/' . $teamOwner);
                            } else {
                                Session::forget('user');
                                Session::forget('team');
                                return redirect('login')->with('error', 'Default Socioboard team does not exist');
                            }


                    } else {
                        return redirect('login')->with('error', 'Something went wrong');
                    }
                }
            } catch (\Exception $e) {

                Log::info('Exception ' . $e->getLine() . "=> code =>" . $e->getCode() . " => message =>  " . $e->getMessage());
                return redirect('login')->with('error', 'Something went wrong');
            }
        }
    }

    public function getUserInfo(){
        $help = Helper::getInstance();
        try{
            $responseForParticular = $help->apiCallGet("user/getUserInfo");

            if ($responseForParticular->code == 200 && $responseForParticular->status == "success") {
                $result['code']=200;
                $result['details']=$responseForParticular->userDetails;
                return $result;
            } else {
                $result['code']=201;
                $result['message']='Something went wrong';
                return $result;
            }

        }
        catch (\Exception $e){
        }
    }

    public function dashboard(Request $request,$team){
        $user = [];
        $currentTeam=[];
        $teamDetails=[];
        $teamId=[];
        $fbp=0;
        $lnc=0;
        $gac=0;
        $yc=0;
        $insta=0;
        $user = (array)Session::get('user')['userDetails'];
        $teamSession =Session::get('team');

        $help = Helper::getInstance();
        try{

           //TODO change handing of c-team session
            $responseForParticular = $help->apiCallGet("team/getTeamDetails?TeamId=".$team);
            if($responseForParticular->code==200&& $responseForParticular->status == "success"){

                $currentTeam =(array)$responseForParticular->teamSocialAccountDetails[0];


                if(Session::has($currentTeam)){
                    Session::forget('currentTeam');
                    Session::forget('pinterestBoards');
                }
                Session::put('currentTeam',$currentTeam);
                Session::put('pinterestBoards',(array)$responseForParticular->pinterestBoards);
            }else{
                //TODO work here
                return view('User::dashboard.dashboard',[
                    'user'=>$user,
                    'activation'=>(array)$user['Activations'],
                    'teams'=>$teamSession['teamSocialAccountDetails'],

                    'currentTeam'=>""]);
            }

            if(Session::has('facebookPage')){

                $fbp = 1;
            }
            if(Session::has('linkedCompany')){
                $lnc =1;
            }
            if(Session::has('GoogleAnalytics')){
                $gac =1;
            }
            if(Session::has('youtubeChannels')){
                $yc =1;
            }
            if(Session::has('InstaBusiness')){
                $insta =1;

            }
            foreach($teamSession['teamSocialAccountDetails'] as $team){
               $teamId[] = $team[0]->team_id;
            }
//            $socialAccount = Session::get('currentTeam')['SocialAccount'];
//            for($i=0;$i<count($socialAccount);$i++){
//                if($socialAccount[$i]->account_type == env('FACEBOOK') )
//                    if($socialAccount[$i]->join_table_teams_social_accounts->is_account_locked == false)
//            }
//            dd(Session::get('currentTeam')['SocialAccount']);

            return view('User::dashboard.dashboard',[
                'user'=>$user,
                'activation'=>(array)$user['Activations'],
                'teams'=>$teamSession['teamSocialAccountDetails'],
                'currentTeam'=>$currentTeam,
                'totalAccount'=>count($currentTeam['SocialAccount']),
                'fbpcount'=>$fbp,
                'lnccount' => $lnc,
                'ganalyticscount' => $gac,
                "youtubeChannels" => $yc,
                "teamid"=>$teamId,
                "instaBusiness" => $insta,
                "socialAccount"=>Session::get('currentTeam')['SocialAccount'],
                "pinterestBoards" => Session::get('pinterestBoards')]);  // taking current team social account


        }catch (\Exception $e){
            Log::info("Exception  ".$e->getLine()."=> ".$e->getCode()." => ".$e->getMessage());
//            return view('User::dashboard.dashboard',['user'=>$user,'activation'=>(array)$user['Activations']]);
        }

    }



    public function getTeamDetails(Request $request){
        $help = Helper::getInstance();
        try {
            $responseForParticular = $help->apiCallGet("team/getTeamDetails?TeamId=".$request->teamId);
            if ($responseForParticular->code == 200 && $responseForParticular->status == "success") {
                $currentTeam = (array)$responseForParticular->teamSocialAccountDetails[0];
                $result['code']=200;
                $result['data']=$currentTeam;
                return $result;
            } else {
                //TODO work here
            }
        }catch (\Exception $e){
        }
    }


    public function account(Request $request){
        $user = [];
        $helper = Helper::getInstance();
        if($request->isMethod('get')){
            $helper->getNewSession();
            return view('User::dashboard.settings');
        }
    }

    public function logout()
    {
        Session::forget('user');
        Session::forget('team');
        Session::forget('currentTeam');
        if (Session::has('facebookPage'))
            Session::forget('facebookPage');
        if (Session::has('linkedCompany'))
            Session::forget('linkedCompany');
        Session::forget('GoogleAnalytics');
        Session::forget('youtubeChannels');
        Session::flush();

        $twoWayData = [
            'email'  => "",
            'twoWayChoice'   => 0,
            'mobileOtpError' => "",
            'emailOtpError' => "",
            'logout' => 'Come back soon:('
        ];
        return redirect('login')->with('twoWayData', $twoWayData);
    }


    public function forgotpassword(Request $request){
        $email = urlencode($request->fp_email);
        $result = [];
        $api_url = $this->API_URL . 'forgotPassword?email='.$email;
        try{
            $response = $this->client->get($api_url);
            if($response->getStatusCode() == 200){
                $response1 = json_decode($response->getBody()->getContents() );
                $result['code']= 200;
                $result['message'] = "We have mailed you a link. Please click on the link to change your password :)";
                return $result;
            }
        }catch (\Exception $e){
           if($e->getCode() === 404){
               $result['code']=404;
               $result['message']="This mail id is not registered";
               return $result;
           }

        }
    }

    public function verifyPasswordToken(Request $request){
        $email = urlencode($request['email']);
        $activationToken = $request['activationToken'];
        $api_url = $this->API_URL.'verifyPasswordToken?email='.$email.'&activationToken='.$activationToken;
        try {
            $response = $this->client->get($api_url);
            if($response->getStatusCode() == 200){
                $resp = json_decode($response->getBody()->getContents());
                $resetEmail = $request['email'] ;
                return redirect('login')->with('resetPassword', $resetEmail);
            }
        } catch(\Exception $e){
            if($e->getCode() === 404){
                Log::info('Exception ' . $e->getLine() . "=> code =>" . $e->getCode() . " => message =>  " . $e->getMessage());
                return redirect('login')->with('error', 'Could not verify!!!Try again.."');
            }
        }


    }

    public function resetPassword(Request $request){
        $email = urlencode($request['reset_email']);
        $api_url = $this->API_URL.'resetPassword?email='.$email.'&newPassword='.md5($request['reset_password']) ;
        try {
            $response = $this->client->post($api_url);
            $resp = $response->getBody()->getContents();
            if($response->getStatusCode() == 200){
                $resp1  = json_decode($resp);
                if($resp1->code == 200){
                    if($resp1->code == 200){
                        return redirect('login')->with('restPwdMsg', "Password Reset Successfull Please Login.....");
                    }
                }
                else{
                    return redirect('login')->with('restPwdMsgError', $resp1->error);
                }

            }
        } catch(\Exception $e) {
            Log::info('Exception ' . $e->getLine() . "=> code =>" . $e->getCode() . " => message =>  " . $e->getMessage());
            return redirect('login')->with('error', 'Could not change password!!!Try again..');
        }
    }





    public function social($network){
        if($network == "google" || $network == "facebook"){
            $api_url = $this->API_URL . 'Sociallogin?network='.$network;
            try{
                $response = $this->client->get($api_url);
                if($response->getStatusCode() == 200){
                    $response = json_decode($response->getBody()->getContents());
                    header('Location: '.$response->navigateUrl);
                    exit();
                }else{
                    return redirect('signup')->with('invalidSocial','Sorry something went wrong:(');
                }
            }catch (\Exception $e){
                Log::info('Exception in social login '.$e->getLine()." => ".$e->getMessage());
                return redirect('signup')->with('invalidSocial','Sorry something went wrong:(');
            }
        }else{
            return redirect('signup')->with('invalidSocial','Sorry something went wrong:(');
        }
    }

    //for facebook login...
    public function facebookCallback(Request $request){
        try{
            $api_url = $this->API_URL . 'auth/facebook/callback?code='.$request["code"];
            $response = $this->client->get($api_url);

            if ($response->getStatusCode() == 200){
                $result= json_decode($response->getBody()->getContents());

                if($result->code == 200 ){
                    $user = array(
                        'accessToken'=>$result->accessToken,
                        'userDetails'=>$result->user
                    );
                    Session::put('user',$user);
                    $response = Helper::getInstance()->apiCallGet("team/getDetails");
                    if($response->code == 200 && $response->status =="success"){
                        for($i = 0; $i<count($response->teamSocialAccountDetails); $i++){
                            $teamDetails[] =   $response->teamSocialAccountDetails[$i];
                        }
                        $team = array(
                            'teamSocialAccountDetails'=>$response->teamSocialAccountDetails,
                            'teamMembers'=>$response->teamMembers,
                            'memberProfileDetails'=>$response->memberProfileDetails
                        );
                        Session::put('team',$team);
                    }
                    return redirect('dashboard/'.$team['teamSocialAccountDetails'][0][0]->team_id);
                }else{
                    return redirect('login')->with('invalidSocial',$result->error);

                }

            }
        }catch (\Exception $e){
            return redirect('login')->with('invalidSocial','Sorry something went wrong:(');
        }
    }

    //google callback for login...
    public function googlecallback(Request $request){
        try{

            $api_url = $this->API_URL . 'auth/google/callback?code='.$request["code"];
            $response = $this->client->get($api_url);

            if ($response->getStatusCode() == 200){
                $result= json_decode($response->getBody()->getContents());

                if($result->code == 200){
                    $user = array(
                        'accessToken'=>$result->accessToken,
                        'userDetails'=>$result->user
                    );
                    Session::put('user',$user);
                    $response = Helper::getInstance()->apiCallGet("team/getDetails");
                    if($response->code == 200 && $response->status =="success"){
                        for($i = 0; $i<count($response->teamSocialAccountDetails); $i++){
                            $teamDetails[] =   $response->teamSocialAccountDetails[$i];
                        }
                        $team = array(
                            'teamSocialAccountDetails'=>$response->teamSocialAccountDetails,
                            'teamMembers'=>$response->teamMembers,
                            'memberProfileDetails'=>$response->memberProfileDetails
                        );
                        Session::put('team',$team);
                    }
                    return redirect('dashboard/'.$team['teamSocialAccountDetails'][0][0]->team_id);
                }else if($result->code == 401){
                    return redirect('login')->with('invalidSocial','Sorry something went wrong:(');
                }else{
                    if(isset($result->error))
                        return redirect('login')->with('invalidSocial',$result->error);
                    else
                        return redirect('login')->with('invalidSocial',"Something went wrong");

                }


            }else{
                return redirect('login')->with('invalidSocial','Sorry something went wrong:(');
            }
        }catch (\Exception $e){
            return redirect('login')->with('invalidSocial','Sorry something went wrong:(');
        }
    }


    public function twoStepAuthentication(Request $request){

        if($request->isMethod('post')){
            $user = array('csrf'=>$request->csrf,
                "code"=>$request->code);
            $help = Helper::getInstance();
            try{
                $response = $help->apiCallPostInsecure($user, 'twoStepLoginSuccess');
                if($response['data']->code ==403){
                    return redirect('login')->with('invalid','Phone number not matching');
                }elseif($response['data']->code ==200){
                    $user = array(
                        'accessToken'=>$response['data']->accessToken,
                        'userDetails'=>$response['data']->userDetails
                    );
                    Session::put('user',$user);
                    return redirect('getDetails');
                }
            }catch (Exception $e){
                return redirect('login')->with('invalid','Authentication Failed');

            }

        }elseif($request->isMethod('get')){
            return view('User::twoStep',['csrf'=>$request->csrf, 'email' => $request->email]);
        }
    }



    // this function is written cause after 2 step auth we cannot hit another api directly so we
    //we are redirecting it to a new page and from here we are moving to dahboard page based on the team id
    public function getDetailsForDashboard(){
        try{
            $response = Helper::getInstance()->apiCallGet("team/getDetails");
            if($response->code == 200 && $response->status =="success"){
                for($i = 0; $i<count($response->teamSocialAccountDetails); $i++){
                    $teamDetails[] =   $response->teamSocialAccountDetails[$i];
                }
                $team = array(
                    'teamSocialAccountDetails'=>$response->teamSocialAccountDetails,
                    'teamMembers'=>$response->teamMembers,
                    'memberProfileDetails'=>$response->memberProfileDetails,
                    'socialAccounts'=>$response->socialAccounts
                );
                Session::put('team',$team);

                return redirect('dashboard/'.$team['teamSocialAccountDetails'][0][0]->team_id);
            }else if($response->code == 401 && $response->status == "failure"){
                return redirect('login')->with('invalid','Authentication failed');
            }
        }catch (\Exception $e){
        }
    }


    //changing plan, password and
    //TODO design has to be integrated
    public function changePassword(Request $request){

        if($request->isMethod('post')){ //TODO change this to post
            $rules = array(
                "old_password" => 'required',
                "new_password" => 'required|max:20|min:8|regex:/^(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z])(?=.*[\/!@#$%^&*()`~\s_+\-=\[\]{};:"\\\,.<>\?\']).*$/',
                "confirm_password" => 'required_with:new_password|same:new_password',
            );
            try{
                $customMessage =[
                    'new_password.regex' => 'Password must consist atleast 1 uppercase, 1 lowercase and 1 special character',
                    'confirm_password.required_with' =>'Please confirm your password!',
                    'confirm_password.same'=>'Password missmatch',
                ];
                $validator = Validator::make($request->all(), $rules,$customMessage);
                if ($validator->fails()) {
                    return Response::json(array(
                        'code'=>202,
                        'success' => false,
                        'errors' => $validator->getMessageBag()->toArray()

                    ), 202);
                }else{

                    $user = array(
                        "userId"=> 1,
                        "currentPassword"=>$request->old_password,
                        "newPassword"=>$request->new_password
                    );
                    try{
                        $response = Helper::getInstance()->apiCallPost($user, 'user/changePassword?userId=1&currentPassword='.md5($user['currentPassword']).'&newPassword='.md5($user['newPassword']));
                        if($response['statusCode'] == 200){
                            if($response['data']['code']==400){
                                Log::info('Change password exception ');
                                Log::info($response['data']);
//                                $result['code']=400;
//                                $result['message']="Sorry, You have entered a wrong password";
                                return Response::json(array(
                                    'code' =>203,
                                    'success' => false,
                                    'errors' => $response['data']['message']

                                ), 203);
                            }
                            if($response['data']['code']==200){
                                return Response::json(array(
                                    'code' =>200,
                                    'success' => false,
                                    'message' => "We have updated your password:)"

                                ), 200);
                            }
                        }
                    }catch (\Exception $e){
                        Log::info('Exception changePw: '.$e->getLine()." => code ".$e->getCode()." => ".$e->getMessage());
                    }
                }

            }catch (\Exception $e){
            }
        }else{
        }
    }


    public function TwoStepActivation(Request $request){

        if($request->isMethod('post')){
            try{
                $response = Helper::getInstance()->apiCallGet('user/changeTwoStepOptions?userId='.Session::get('user')['userDetails']->user_id."&twoStepActivate=".(int)$request->twoStepActivate);

               if($response->code == 200 && $response->status =="success"){
                   return 200;
               }else{
                   return 400;
               }

            }catch (\Exception $e){
                //TODO redirect to settings page with error
                Log::info('Exception '.$e->getCode()."=> ".$e->getLine()."=> ".$e->getMessage());
                return 500;
            }
        }
    }

    //Profile updation
    public function profileUpdate(Request $request){
        $result =[];
        $rules = array(
            "firstName" => 'max:15|min:2|regex:/^[a-zA-Z]+$/', ///([0-9]*)([a-zA-Z]+)([0-9]*)/ Alphanumeeric
            "lastName" => 'max:15|min:2|regex:/^[a-zA-Z]+$/',
            "phone" => 'size:10',
        );
        $customMessage =[
            'firstName' => 'Please provide valid characters as input with atleast 2 and atmost 15 characters ',
            'lastName' => 'Please provide valid characters as input with atleast 2 and atmost 15 characters  ',
            'lastName.regex' => 'Please provide valid characters',
            'firstName.regex' => 'Please provide valid characters ',
            'phone.regex' =>'Your phone number is invalid:('
        ];

        $validator = Validator::make($request->all(), $rules,$customMessage);
        if ($validator->fails()) {
            return Response::json(array(
                'code'=>202,
                'success' => false,
                'errors' => $validator->getMessageBag()->toArray()
            ), 202);
        }else{
            try{

                $help = Helper::getInstance();
                $updatedata['user'] = array(
                    "firstName"=> $request->firstName,
                    "lastName"=>$request->lastName,
                    "DateOfBirth"=>$request->dob,
                    "profilePicture"=>env('APP_URL')."assets/imgs/user-avatar.png",
                    "phoneCode"=>$request->code,
                    "phoneNumber"=>$request->phone,
                    "aboutMe"=>$request->bio
                );
//                return json_encode($updatedata);
                $response = $help->apiCallPostUpdate($updatedata,'user/updateProfileDetails');
//                return $response;

                if($response->code==200 && $response->status == "success"){
//                    $data = (Session::get("user")["userDetails"]);
//                    $data->first_name = $response['data']['user']['first_name'];
//                    $data->last_name = $response['data']['user']['last_name'];
//                    $data->profile_picture = $response['data']['user']['profile_picture'];
//                  $acc =Session::get("user")["accessToken"];
//                    $acc = $response['data']['accessToken'];
//                    Session::push('user',$data);
//                    Session::push('user',$acc);

                    $user = array(
                        'accessToken' => $response->accessToken,
                        'userDetails' => $response->user
                    );


                    Session::forget('user');
                    Session::put('user', $user);
                    return Response::json(array(
                        'code'=>200,
                        'success' => true,
                        'message' => "Profile Updated Successfully!"
                    ), 200);
                }else if($response->code == 404){
                    return Response::json(array(
                        'code'=>201,
                        'success' => false,
                        'message' => $response->error
                    ), 201);
                }else{
                    return Response::json(array(
                        'code'=>201,
                        'success' => false,
                        'message' =>"Profile updation failed :("
                    ), 201);
                }
            }catch (\Exception $e){
//                return ($e->getMessage());
                Log::info("Proile updation exceptio  ===> ".$e->getMessage()." in line ".$e->getLine()." in file ".$e->getFile());
                return Response::json(array(
                    'code'=>500,
                    'success' => false,
                    'message' => "Something went wrong"
                ), 500);
            }
        }

    }

    public function notification(Request $request){
        if($request->isMethod('GET')){
            return view('User::notification');
        }
    }

    public function seeAllNotifications(Request $request){
        if($request->isMethod('GET')){
            $userDetails = array(Session::get('user')['userDetails']);
            $userId = $userDetails[0]->user_id;
            $result=[];
            try{
                $responseForParticular = Helper::getInstance()->apiCallGetNotification("notify/getUserNotification?userId=".$userId."&pageId=1");
                if($responseForParticular->code == 200 && $responseForParticular->status == "success"){
                    $result['code'] =200;
                    $result['status'] ="success";
                    $result['notifications'] = $responseForParticular->notifications;
                }
                else if($responseForParticular->code == 404 && $responseForParticular->status == "failed"){
                    $result['code'] =400;
                    $result['status'] ="failed";
                    $result['message'] =$responseForParticular->error;
                    Log::info("Could not fetch notifications!!!". $responseForParticular->error);
                }
                $teamSess = Session::get('team');
                return view('User::dashboard.seeAllNotifications',['result'=> $result]);
            }catch (\Exception $e){
                Log::info("Exception :: ".$e->getFile()." => ".$e->getLine()." => ".$e->getMessage());
                $result['code'] =500;
                $result['status'] ="failed";
                $result['message'] =$e->getMessage();
                return view('User::dashboard.seeAllNotifications',['result'=>$result]);
            }

        }
    }

    //get User NOtification
    public function getUserNotification(Request $request){
        $userDetails = array(Session::get('user')['userDetails']);
        $userId = $userDetails[0]->user_id;
        $result=[];
        try{
            $responseForParticular = Helper::getInstance()->apiCallGetNotification("notify/getUserNotification?userId=".$userId."&pageId=".$request['pageId']);
            if($responseForParticular->code == 200 && $responseForParticular->status == "success"){
                $result['code'] =200;
                $result['status'] ="success";
                foreach($responseForParticular->notifications as $notification){
                    $time = $notification->dateTime;
                    $notification->dateTime = \Carbon\Carbon::parse($time)->diffForHumans();
                }
                $result['notifications'] = $responseForParticular->notifications;
            }
            else if($responseForParticular->code == 404 && $responseForParticular->status == "failed"){

                $result['code'] =400;
                $result['status'] ="failed";
                $result['message'] =$responseForParticular->error;
                Log::info("Could not fetch notifications!!!". $responseForParticular->error);
            }
            return $result;
        }catch (\Exception $e){
            Log::info("Exception :: ".$e->getFile()." => ".$e->getLine()." => ".$e->getMessage());
            $result['code'] =500;
            $result['status'] ="failed";
            $result['message'] =$e->getMessage();
            return $result;
        }
    }

    //get Team Notification
    public function getTeamNotification(Request $request){
        $teamId = Session::get('currentTeam')['team_id'];
        $result=[];
        try{
            $responseForParticular = Helper::getInstance()->apiCallGetNotification("notify/getTeamNotification?teamId=".$teamId."&pageId=".$request['pageId']);
            if($responseForParticular->code == 200 && $responseForParticular->status == "success"){
                $result['code'] =200;
                $result['status'] ="success";
                foreach($responseForParticular->notifications as $notification){
                    $time = $notification->dateTime;
                    $notification->dateTime = \Carbon\Carbon::parse($time)->diffForHumans();
                }
                $result['notifications'] = $responseForParticular->notifications;
            }
            else if($responseForParticular->code == 404 && $responseForParticular->status == "failed"){

                $result['code'] =400;
                $result['status'] ="failed";
                $result['message'] =$responseForParticular->error;
                Log::info("Could not fetch notifications!!!". $responseForParticular->error);
            }else{

            }
            return $result;
        }catch (\Exception $e){
            Log::info("Exception :: ".$e->getFile()." => ".$e->getLine()." => ".$e->getMessage());
            $result['code'] =500;
            $result['status'] ="failed";
            $result['message'] =$e->getMessage();
            return $result;
        }
    }


//    public function getNewSession(Request $request){
//        if (Session::has('user')) {
//            $team = Helper::getInstance()->getTeamNewSession();
//            return redirect('dashboard/' . $team['teamSocialAccountDetails'][0][0]->team_id);
//        }
//    }


    public function lockUnlockAccount(Request $request){

        $result=[];
        try{
            //creating account data
            $help = Helper::getInstance();
            $addingSocialIds = [$request->accId];

            //unlock account
            if($request->lockStat == 0){
                $response = $help->apiCallPut($addingSocialIds,'team/unlockProfiles');
                if($response['data']['code'] == 200 && $response['data']['status']== "success"){
                    $result['code']= 200;
                    $result['message']= "Profile unlocked";
                    return $result;
                }else{
                        $result['code']= $response['data']['code'];
                    if(isset($response['data']['message']))
                        $result['message']= $response['data']['message'];
                    else
                        $result['message']= $response['data']['error'];
                        return $result;

                }
            }else if($request->lockStat == 1){ //lock account
                $response = $help->apiCallPut($addingSocialIds,'team/lockProfiles');
                if($response['data']['code'] == 200 && $response['data']['status']== "success"){
                    $result['code']= 201;
                    $result['message']= "Profile locked";
                    return $result;
                }else{
                    $result['code']= $response['data']['code'];
                    if(isset($response['data']['message']))
                        $result['message']= $response['data']['message'];
                    else
                        $result['message']= $response['data']['error'];
                    return $result;
                }
            }

            return $result;
        }catch (\Exception $e){
            $result['code']= 500;
            $result['message']= "Something went wrong";
            return $result;

        }
    }

    public function getInvoice(Request $request){
        if($request->isMethod('post')){
            $result = [];
            $helper = Helper::getInstance();

            try {
                $response = $helper->apiGetInvoice("payment/paymentInvoiceDownloader");
                if ($response->code == 200 && $response->status == "success") {
                    $result['code'] = 200;
                    $result['messaage'] = $response->data->message;
                    $result['file'] = $response->data->file;
                } else {
                    $result['code'] = 400;
                    if (isset($response->error))
                        $result['message'] = $response->error;
                    else if (isset($response->error))
                        $result['message'] = "Something went wrong";
                    else
                        $result['message'] = "Something went wrong";
                }
            } catch (\Exception $e) {
                Log::info(" Invoice download Exception " . $e->getMessage() . " in file " . $e->getFile() . " at line " . $e->getLine());
                $result['code'] = 200;
                $result['message'] = "Something went wrong";

            }
        }
            return $result;
    }


    public function linkShortening(Request $request){
        if ($request->isMethod('get')) {
            return view("User::dashboard.linkShortening", ['status' => (int)Session::get('user')['userDetails']->Activations->shortenStatus]);
        } else if ($request->isMethod('post')) {
            $result = [];
            $data =[];
            $helper = Helper::getInstance();
            try {
                $response = $helper->apiCallPut($data,'user/changeShortenStatus?status=' . $request->status);
                if ($response['data']['code'] == 200 && $response['data']['status']== "success") {
                    $responseInfo = $helper->apiCallGet('user/getUserInfo');
                    Session::forget('user');
                    $user = array(
                        'accessToken' => $responseInfo->accessToken,
                        'userDetails' => $responseInfo->userDetails
                    );
                    Session::put('user', $user);
                    $result['code'] = 200;
                    $result['message'] = $response['data']['message'];
                } else {
                    $result['code'] = 400;
                    if (isset($response['data']['error']))
                        $result['message'] = $response['data']['error'];
                    else if (isset($response['data']['message']))
                        $result['message'] = $response['data']['message'];
                    else
                        $result['message'] = "Something went wrong";
                }
            } catch (\Exception $e) {
                Log::info(" Link shortening exception " . $e->getMessage() . " in file " . $e->getFile() . " at line " . $e->getLine());
                $result['code'] = 200;
                $result['message'] = "Something went wrong";

            }
            return $result;

        }
    }

}
