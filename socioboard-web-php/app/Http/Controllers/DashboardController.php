<?php

namespace App\Http\Controllers;
use  App\Models\User;
use App\Traits\RegisterUser;
use App\Http\Requests\RegistrationRequest;
use Illuminate\Support\Facades\Session;

class DashboardController extends Controller
{

    public function index()
    {
        $user = User::where('id', Session::get('user_id'))->first();
        $role = $user->role;
        if($role == "user"){
            return view('UserDashboard/UserDashboard')->with('user', $user);
        }else if($role == "admin"){
            return view('admin')->with('user', $user);
        }
    }

    public function create(RegistrationRequest $requestFields)
    {
        $user = $this->registerUser($requestFields);
        return back();
    }
}
