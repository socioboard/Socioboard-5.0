<?php

namespace Modules\Boards\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class searchYoutube extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            "keyword" => 'required|max:32|min:1|regex:/^[a-zA-Z0-9-_]*$/'
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
