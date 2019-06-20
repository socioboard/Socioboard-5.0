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
//            dd(22);
            $rules = array(

                "username" => 'required|max:32|min:2|regex:/([a-zA-Z]+)([0-9]*)/', ///([0-9]*)([a-zA-Z]+)([0-9]*)/
                "first_name" => 'required',
                "email_id" => 'required',
//                "passwd" => 'required|max:20|min:8|regex:/^(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z])(?=.*[#$^+=!*()@%&]).*$/',
                "passwd" => 'required|max:20|min:8|regex:/^(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z])(?=.*[\/!@#$%^&*()`~\s_+\-=\[\]{};:"\\\,.<>\?\']).*$/',
//                "passwd" => ['required'=>'regex:/^(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\?]).*$/'],
                "c_passwd" => 'required_with:passwd|same:passwd',
            );
//            dd($rules);
            try {
                $customMessage =[
                    'passwd.regex' => 'Password must consist atleast 1 uppercase, 1 lowercase and 1 special character',
                    'c_passwd.required_with' =>'Please confirm your password!',
                    'c_passwd.same'=>'Password missmatch',
                    'username.regex' =>'Username should be alphanumeric'
                ];

                $validator = Validator::make($request->all(), $rules,$customMessage);

                if ($validator->fails()) {

                    return redirect()->back()->withErrors($validator)->withInput();
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
                        "password" =>$request->passwd,
                        "firstName" => $request->first_name,
                        "profilePicture"=>env('APP_URL')."assets/imgs/user-avatar.png",
                        "phoneCode"=>'NA',
                        "phoneNo"=>0,
                        "country"=>'NA',
                        "timeZone"=>'NA',
                        "aboutMe"=>""
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
                        return redirect('signup')->with('error', $result->error);

                    }

                    if($response->getStatusCode() == 200){

                        return redirect('login')->with('status', 'Registered Successfully!');
                    }else if($response->getStatusCode() == 400){
                        return redirect('signup')->with('error', 'Registration failed:(');
                    }else{
                        return redirect('signup')->with('error', 'Registration failed:(');
                    }
                }
            } catch (\Exception $e) {
//                dd($e->getLine());
                Log::info("Sign up Exception ".$e->getLine()." => ".$e->getMessage());
                return redirect('signup')->with('error', 'Registration failed:(');
                throw new \Exception("Exception " . $e->getMessage());
            }
        }
    }

    public function login(Request $request)
    {

        if (Session::has('user')) {
            $team = Helper::getInstance()->getTeamNewSession();
            return redirect('dashboard/' . $team['teamSocialAccountDetails'][0][0]->team_id);
        }
        if ($request->isMethod('GET')) {
            return view('User::login');
        } elseif ($request->isMethod('POST')) {
            $user = [];
            $team = [];
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
                        "password" => $request->passwd
                    );
                    $data = json_encode($loginData);


                    $api_url = $this->API_URL . 'login';

                    $response = $this->client->post($api_url, [RequestOptions::JSON => $loginData]);
                    $result = json_decode($response->getBody()->getContents());
//                    dd($result);
                    if ($response->getStatusCode() == 200) {
                        if (isset($result->isTwoStepEnabled)) {
                            return redirect($result->redirectUrl);
                        }
//                        dd($result );
                        if ($result->code == 404 && $result->status = "failure")
                            return redirect('login')->with('invalid', $result->message);
                        else if ($result->code == 400 && $result->status = "failure")
                            return redirect('login')->with('email_act', $result->message);


                        //TODO get ip and system address of client



                        $user = array(
                            'accessToken' => $result->accessToken,
                            'userDetails' => $result->user
                        );
//dd($user);
                        Session::put('user', $user);
//                        dd(    Session::get('user')['userDetails']->userPlanDetails);

                        $team = Helper::getInstance()->getTeamNewSession();

                        return redirect('dashboard/' . $team['teamSocialAccountDetails'][0][0]->team_id);


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

    public function dashboard(Request $request,$team){
//        dd(Session::get('team'));
        $user = [];
        $currentTeam=[];
        $teamDetails=[];
        $teamId=[];
        $fbp=0;
        $lnc=0;
        $gac=0;
        $yc=0;
        $insta=0;
//        dd(Session::get('user'));
        $user = (array)Session::get('user')['userDetails'];
        $teamSession =Session::get('team');
//dd($user['userPlanDetails']);

        $help = Helper::getInstance();
        try{

           //TODO change handing of c-team session
            $responseForParticular = $help->apiCallGet("team/getTeamDetails?TeamId=".$team);
            if($responseForParticular->code==200&& $responseForParticular->status == "success"){

                $currentTeam =(array)$responseForParticular->teamSocialAccountDetails[0];
//dd($currentTeam );

                if(Session::has($currentTeam)){
                    Session::forget('currentTeam');
                    Session::put('currentTeam',$currentTeam);
                }
                Session::put('currentTeam',$currentTeam);

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
//            dd($insta);
//            dd($teamSession['teamSocialAccountDetails']);
            foreach($teamSession['teamSocialAccountDetails'] as $team){
               $teamId[] = $team[0]->team_id;
            }
//            dd(Session::get('currentTeam')['SocialAccount']);
//            if((array)$user['userPlanDetails']->is_plan_active){
//                return redirect('updatePlan');
//            }

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
                "socialAccount"=>Session::get('currentTeam')['SocialAccount']]);  // taking current team social account


        }catch (\Exception $e){
            Log::info("Exception  ".$e->getLine()."=> ".$e->getCode()." => ".$e->getMessage());
            dd($e->getMessage());
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
//            dd($responseForParticular );
        }catch (\Exception $e){
            dd($e->getMessage());
        }
    }


    public function account(Request $request){
        if($request->isMethod('get')){
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

        return redirect('login')->with('logout', 'Come back soon:(');
    }

    public function forgotpassword(Request $request){
        $email = $request->fp_email;
        $result = [];
        $api_url = $this->API_URL . 'forgotPassword?email='.$email;
        try{
            $response = $this->client->get($api_url);
//            dd($response->getStatusCode());
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
                dd($e->getMessage());
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
//                dd($result);
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
            dd($e->getMessage());
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
                }else if($result->code == 404){
                    return redirect('login')->with('invalidSocial',$result->error);
                }else{
                    return redirect('login')->with('invalidSocial',$result->error);

                }


            }else{
                return redirect('login')->with('invalidSocial','Sorry something went wrong:(');
            }
        }catch (\Exception $e){
            dd($e->getMessage());
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
            return view('User::twoStep',['csrf'=>$request->csrf]);
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
            dd($e->getMessage());
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
                        $response = Helper::getInstance()->apiCallPost($user, 'user/changePassword?userId=1&currentPassword='.urlencode($user['currentPassword']).'&newPassword='.urlencode($user['newPassword']));
                        if($response['statusCode'] == 200){
                            if($response['data']['code']==400){
                                Log::info('Change password exception ');
                                Log::info($response['data']);
//                                dd(11);
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
                        dd("Exception");
                    }
                }

            }catch (\Exception $e){
                dd("Exception".$e->getMessage());
            }

        }else{
            dd("invalid method");
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
            "phone" => 'regex:/[0-9]{10}/',
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
//                    dd(Session::get("user")["accessToken"]);
//                    $data->first_name = $response['data']['user']['first_name'];
//                    $data->last_name = $response['data']['user']['last_name'];
//                    $data->profile_picture = $response['data']['user']['profile_picture'];
//                  $acc =Session::get("user")["accessToken"];
//                    $acc = $response['data']['accessToken'];
//                    Session::push('user',$data);
//                    Session::push('user',$acc);
//                    dd(Session::get("user"));

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
//                    dd($response);
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


}
