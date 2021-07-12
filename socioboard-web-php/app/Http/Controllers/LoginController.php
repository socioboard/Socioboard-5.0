<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;

class LoginController extends Controller
{
    public function show()
    {
        return view('Login/login');
    }

    public function authenticate(Request $requestFields)
    {
        $response = Http::post(ApiConfig::get('/login'), [
            'email' => $requestFields->email,
            'password' => $requestFields->password,
        ]);
        $data = $response->json();
        if($response->status() === 200){
            Session::put('user_id', $response['id']);
            if ($response['role'] === "admin") {
                return  Redirect::to('admin')->with('user', $data);
            } else{
                return  Redirect::to('dashboard')->with('user', $data);
            }
        }
        else{
            $errors = $data;
            dd($errors);
            Session::flash('apiError', $errors);
            return back();
        }
    }

    public function logout()
    {
        Session::flush();
        return Redirect::to('login');
    }
}
