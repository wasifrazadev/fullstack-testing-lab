<?php

use App\Http\Controllers\Api\TodoController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/health', function (Request $request) {
    return response()->json([
        'status' => 'ok',
        'backend' => 'Laravel',
        'port' => $request->getPort(),
    ]);
});


Route::apiResource('todos', TodoController::class);