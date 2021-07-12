<?php

namespace App\Classes;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use phpDocumentor\Reflection\Types\Object_;

class AuthUsers
{
    public static function has() {
        return session()->has('user') ? true : false;
    }

    public static function id() {
        return session()->has('user') ? session()->get('user')['userDetails']['user_id'] : null;
    }

    public static function user() {
        return session()->has('user') ? (object)session()->get('user')['userDetails'] : null;
    }

    public static function __token() {
        return session()->has('user') ? session()->get('user')['accessToken'] : null;
    }

    public static function login($user) {
        session()->put('user', $user);
        return true;
    }

    public static function logout() {
        Session::flush();
        return true;
    }

    public static function this()
    {
        $result = new AuthUsers();
        return $result;
    }
}
