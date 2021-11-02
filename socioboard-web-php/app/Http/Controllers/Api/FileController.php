<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Requests\FilePostRequest;
use Exception;

class FileController
{
    public function store(FilePostRequest $request): array
    {
        try {
            $name = uniqid() . '.' . request()->image->extension();
            request()->image->storeAs('chat', $name, 'public');
            return ['path' => "storage/chat/{$name}"];
        } catch (Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }
}