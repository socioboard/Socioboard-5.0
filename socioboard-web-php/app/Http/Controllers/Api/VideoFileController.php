<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Requests\FilePostRequest;
use Exception;

class VideoFileController
{
    public function store(FilePostRequest $request): array
    {
        try {
            $name = uniqid() . '.' . request()->video->extension();
            request()->video->storeAs('chat', $name, 'public');
            return ['path' => "storage/chat/{$name}"];
        } catch (Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }
}
