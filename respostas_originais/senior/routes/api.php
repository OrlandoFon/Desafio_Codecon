<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserAnalysisController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');



Route::post('/users', [UserAnalysisController::class, 'store']);
Route::get('/superusers', [UserAnalysisController::class, 'superusers']);
Route::get('/top-countries', [UserAnalysisController::class, 'topCountries']);
Route::get('/team-insights', [UserAnalysisController::class, 'teamInsights']);
Route::get('/active-users-per-day', [UserAnalysisController::class, 'loginsPerDay']);
Route::get('/evaluation', [UserAnalysisController::class, 'evaluation']);
