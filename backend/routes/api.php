<?php

use App\Http\Controllers\Api\Admin\PaperAdminController;
use App\Http\Controllers\Api\Admin\PaperImportController;
use App\Http\Controllers\Api\Admin\QuestionAdminController;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Student\AttemptController;
use App\Http\Controllers\Api\Student\CatalogController;
use App\Http\Controllers\Api\Student\PaperController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

Route::middleware(['auth:sanctum', 'role:student'])->prefix('student')->group(function () {
    Route::get('/catalog', [CatalogController::class, 'index']);
    Route::get('/papers', [PaperController::class, 'index']);
    Route::get('/papers/{paper}', [PaperController::class, 'show']);

    Route::post('/papers/{paper}/attempts', [AttemptController::class, 'store']);
    Route::get('/attempts/{attempt}', [AttemptController::class, 'show'])->can('view', 'attempt');
    Route::put('/attempts/{attempt}/answers', [AttemptController::class, 'updateAnswers'])->can('update', 'attempt');
    Route::post('/attempts/{attempt}/answer-assets', [AttemptController::class, 'storeAsset'])->can('update', 'attempt');
    Route::post('/attempts/{attempt}/submit', [AttemptController::class, 'submit'])->can('submit', 'attempt');
    Route::get('/attempts/{attempt}/results', [AttemptController::class, 'result'])->can('review', 'attempt');
    Route::get('/attempts/{attempt}/result', [AttemptController::class, 'result'])->can('review', 'attempt');
    Route::get('/attempts/{attempt}/review', [AttemptController::class, 'review'])->can('review', 'attempt');
});

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/papers', [PaperAdminController::class, 'index']);
    Route::post('/papers', [PaperAdminController::class, 'store']);
    Route::get('/papers/{paper}', [PaperAdminController::class, 'show']);
    Route::put('/papers/{paper}', [PaperAdminController::class, 'update']);
    Route::delete('/papers/{paper}', [PaperAdminController::class, 'destroy']);
    Route::post('/papers/{paper}/publish', [PaperAdminController::class, 'publish']);
    Route::post('/papers/{paper}/unpublish', [PaperAdminController::class, 'unpublish']);

    Route::post('/papers/{paper}/questions', [QuestionAdminController::class, 'store']);
    Route::get('/questions/{question}', [QuestionAdminController::class, 'show']);
    Route::put('/questions/{question}', [QuestionAdminController::class, 'update']);
    Route::put('/questions/{question}/rubric', [QuestionAdminController::class, 'updateRubric']);
    Route::delete('/questions/{question}', [QuestionAdminController::class, 'destroy']);

    Route::get('/imports', [PaperImportController::class, 'index']);
    Route::post('/imports/json', [PaperImportController::class, 'store']);
    Route::get('/imports/{import}', [PaperImportController::class, 'show']);
    Route::get('/imports/{import}/items', [PaperImportController::class, 'items']);
    Route::put('/import-items/{item}', [PaperImportController::class, 'updateItem']);
    Route::post('/import-items/{item}/visuals', [PaperImportController::class, 'uploadVisuals']);
    Route::delete('/import-item-visuals/{visual}', [PaperImportController::class, 'destroyVisual']);
    Route::post('/imports/{import}/approve', [PaperImportController::class, 'approve']);
});
