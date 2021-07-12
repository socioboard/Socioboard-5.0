<?php

namespace Modules\Discovery\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class Twitter extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            "keyword" => ['required']
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

}
