<?php

namespace App\Http\Controllers;

use App\Traits\RegisterUser;
use App\Http\Requests\RegistrationRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Http\Request;

class RegistrationController extends Controller
{
    use RegisterUser;

    public function show()
    {
        return view('Register/Register');
    }

    public function register(Request $requestFields)
    {
        $response = Http::post(ApiConfig::get('/register'), [
            'email' => $requestFields->email,
            'password' => $requestFields->password,
            'name' => $requestFields->fullname,
        ]);
        $data = $response->json();
        if($response->status() === 200){
            Session::flash('success', "you have successfuly created user {$data['email']}");
            return  Redirect::to('login');
        }
        else{
            $errors = $data;
            Session::flash('apiError', $errors);
            return back();
        }
    }
}
