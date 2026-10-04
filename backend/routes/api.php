<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\SavedUniversityController;
use App\Http\Controllers\UniversityController;
use Illuminate\Support\Facades\Route;

// Public Authentication Routes (Rate limited to 10 requests per minute per IP)
Route::middleware('throttle:10,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/student/login', [AuthController::class, 'loginStudent']);
    Route::post('/institution/login', [AuthController::class, 'loginInstitution']);
});

// Public School Directory Routes
Route::get('/universities', [UniversityController::class, 'index']);
Route::get('/universities/{id}', [UniversityController::class, 'show'])->whereNumber('id');
Route::get('/courses', [CourseController::class, 'index']);

// Authenticated Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'me']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::match(['post', 'put'], '/user/profile', [AuthController::class, 'updateProfile']);
    Route::post('/user/password', [AuthController::class, 'changePassword'])->middleware('throttle:6,1');
    Route::post('/user/verify-email', [AuthController::class, 'verifyEmail']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Saved Schools (students)
    Route::get('/saved-universities', [SavedUniversityController::class, 'index']);
    Route::post('/saved-universities/{id}', [SavedUniversityController::class, 'store'])->whereNumber('id');
    Route::delete('/saved-universities/{id}', [SavedUniversityController::class, 'destroy'])->whereNumber('id');
});
