<?php

namespace Modules\ContentStudio\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PublishRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
//            'content' => 'required|string|max:140',
            'content' => 'required|string',
            'outgoingUrl' => 'nullable|url',
            'socialAccount' => 'required', 
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
