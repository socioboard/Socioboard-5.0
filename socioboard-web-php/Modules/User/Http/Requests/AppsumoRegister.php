<?php

namespace Modules\User\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AppsumoRegister extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            "firstName" => 'required|max:32|min:2|regex:/^[a-zA-Z0-9-_]*$/',
            "lastName" => 'required|max:32|min:1|regex:/^[a-zA-Z0-9-_]*$/',
            "userName" => 'required|regex:/([a-zA-Z]+)([0-9]*)/',
            "email" => 'required|email',
            "password" => 'required|max:20|min:6|regex:/^(?=.*[a-z])(?=.*[0-9])(?=.*[A-Z])(?=.*[\/!@#$%^&*()`~\s_+\-=\[\]{};:"\\\,.<>\?\']).*$/',
            "passwordConfirmation" => 'required_with:password|same:password',
            "agree" => 'required'
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
            'password.regex' => 'Password must consist atleast 1 uppercase, 1 lowercase and 1 special character and i numeric value',
            'passwordConfirmation.required_with' => 'Please confirm your password!',
            'passwordConfirmation.same' => 'Password missmatch',
            'userName.regex' => 'Username should be alphanumeric',
            'firstName.regex' => 'First Name should not contain special characters.',
            'lastName.regex' => 'Last Name should not contain special characters.',
            "agree" => 'Please check the terms and conditions!!'
        ];
    }
}
