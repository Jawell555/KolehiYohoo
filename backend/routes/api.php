<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\InstitutionPortalController;
use App\Http\Controllers\SavedUniversityController;
use App\Http\Controllers\UniversityController;
use Illuminate\Support\Facades\Route;

// Public Authentication Routes (Rate limited to 10 requests per minute per IP)
Route::middleware('throttle:10,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/student/login', [AuthController::class, 'loginStudent']);
    Route::post('/institution/login', [AuthController::class, 'loginInstitution']);
    Route::post('/admin/login', [AuthController::class, 'loginAdmin']);
});

// Public School Directory Routes
// (throttled because a typed starting location calls the geocoding API)
Route::get('/universities', [UniversityController::class, 'index'])->middleware('throttle:60,1');
Route::get('/universities/{id}', [UniversityController::class, 'show'])->whereNumber('id');
Route::get('/courses', [CourseController::class, 'index']);

// Authenticated Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'me']);
    Route::match(['post', 'put'], '/user/profile', [AuthController::class, 'updateProfile']);
    Route::post('/user/password', [AuthController::class, 'changePassword'])->middleware('throttle:6,1');
    Route::post('/user/verify-email', [AuthController::class, 'verifyEmail']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Saved Schools (students)
    Route::get('/saved-universities', [SavedUniversityController::class, 'index']);
    Route::post('/saved-universities/{id}', [SavedUniversityController::class, 'store'])->whereNumber('id');
    Route::delete('/saved-universities/{id}', [SavedUniversityController::class, 'destroy'])->whereNumber('id');

    // Admin Routes
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/stats', [AdminController::class, 'stats']);
        Route::get('/pending-institutions', [AdminController::class, 'pendingInstitutions']);
        Route::patch('/institutions/{id}/approve', [AdminController::class, 'approveInstitution'])->whereNumber('id');
        Route::delete('/institutions/{id}/reject', [AdminController::class, 'rejectInstitution'])->whereNumber('id');
        Route::put('/universities/{id}', [AdminController::class, 'updateUniversity'])->whereNumber('id');
    });

    //Institution Portal Routes
    Route::middleware('role:institution')->prefix('institution')->group(function(){
        Route::get('/my-school', [InstitutionPortalController::class,'mySchool']);
        Route::put('/my-school', [InstitutionPortalController::class,'updateSchool']);
        Route::post('/my-school/courses',[InstitutionPortalController::class,'addCourse']);
        Route::delete('/my-school/courses/{courseId}',[InstitutionPortalController::class,'removeCourse'])->whereNumber('courseId');
    });

});

