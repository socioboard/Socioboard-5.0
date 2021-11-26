<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FileController extends Controller
{
    public function store(Request $request)
    {
        if (!file_exists($request['folder']))
        {
            mkdir($request['folder'], 0755, true);
        }
        define('UPLOAD_DIR', $request['folder'].'/');
        $image_parts = explode(";base64,", $request['response']);
        $image_base64 = base64_decode($image_parts[1]);
        $fileName = UPLOAD_DIR  . uniqid() . '.png';
        file_put_contents($fileName, $image_base64);
        return $fileName;
    }

    public function destroy(Request $request)
    {
        $path = public_path() .'/'.$request['dataUrl'];
        unlink($path);
        return '/media/logos/sb-icon.svg';
    }

}
