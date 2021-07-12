<?php

namespace Modules\User\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ForgotPasswordEmail extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'emailID' => ['required','email']
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
            'emailID.required' => 'Email is required',
            'emailID.email' => 'Email invalid',
        ];
    }
}
