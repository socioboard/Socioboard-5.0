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

class TeamController extends Controller
{

    /*
     * Author: Aishwarya_M <aishwarya@globussoft.in>
     * Desc: */
    protected $client;
    protected $API_URL;

    public function __construct()
    {
        $this->client = new Client();
        $this->API_URL = env('API_URL') . env('VERSION') . '/';
    }


    public function createTeam(Request $request){
        if($request->isMethod('get')){
            return view('createTeam');
        }elseif($request->isMethod('post')){

        }
    }





}
