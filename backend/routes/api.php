<?php

use App\Enums\UserRole;
use App\Http\Controllers\Api\Admin\ImportController;
use App\Http\Controllers\Api\Admin\ImportItemController;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Student\AttemptController;
use App\Http\Controllers\Api\Student\PaperController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

Route::middleware(['auth:sanctum', 'role:'.UserRole::Student->value])->prefix('student')->group(function () {
    Route::get('/papers', [PaperController::class, 'index']);
    Route::get('/papers/{paper}', [PaperController::class, 'show']);
    Route::post('/papers/{paper}/attempts', [AttemptController::class, 'store']);
    Route::get('/attempts/{attempt}', [AttemptController::class, 'show']);
    Route::put('/attempts/{attempt}/answers', [AttemptController::class, 'updateAnswers']);
    Route::post('/attempts/{attempt}/submit', [AttemptController::class, 'submit']);
});

Route::middleware(['auth:sanctum', 'role:'.UserRole::Admin->value])->prefix('admin')->group(function () {
    Route::get('/imports', [ImportController::class, 'index']);
    Route::post('/imports', [ImportController::class, 'store']);
    Route::get('/imports/{import}', [ImportController::class, 'show']);
    Route::get('/imports/{import}/items', [ImportController::class, 'items']);
    Route::put('/import-items/{item}', [ImportItemController::class, 'update']);
    Route::post('/imports/{import}/approve', [ImportController::class, 'approve']);
});
