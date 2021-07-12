<?php

namespace Modules\User\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class NewPassword extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            "new_password" => 'required |regex:/^(?=.*\d)(?=.*[!-\/:-@\[-`{-~]).{8,}$/',
            "confirm_password" => 'required|same:new_password'
        ];
    }

    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }


    public function messages()
    {
        return [
            'new_password.required' => 'password is required',
            'new_password.regex' => 'Password must consist atleast 1 uppercase, 1 lowercase, 1 special character, 1 numeric value and minimum 8 charecters',
            'confirm_password.required' => 'confirm password is required',
            'confirm_password.same' => 'password mismatch',
        ];
    }
}
