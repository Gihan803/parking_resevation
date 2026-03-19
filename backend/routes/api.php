<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ParkingSlotController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\AdminController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Public Auth Routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Public Parking Slot Routes
Route::prefix('slots')->group(function () {
    Route::get('/', [ParkingSlotController::class, 'index']);
    Route::get('/available', [ParkingSlotController::class, 'available']);
    Route::get('/{id}', [ParkingSlotController::class, 'show']);
});

// Protected Routes (Authenticated Users)
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth Routes
    Route::prefix('auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });

    // Customer Reservation Routes
    Route::prefix('reservations')->group(function () {
        Route::get('/', [ReservationController::class, 'index']);
        Route::post('/', [ReservationController::class, 'store']);
        Route::get('/{id}', [ReservationController::class, 'show']);
        Route::post('/{id}/cancel', [ReservationController::class, 'cancel']);
        Route::post('/{id}/extend', [ReservationController::class, 'extend']);
        Route::delete('/{id}', [ReservationController::class, 'destroy']);
    });

    // Admin Routes
    Route::middleware('admin')->prefix('admin')->group(function () {
        
        // Slot Management
        Route::prefix('slots')->group(function () {
            Route::post('/', [AdminController::class, 'createSlot']);
            Route::put('/{id}', [AdminController::class, 'updateSlot']);
            Route::delete('/{id}', [AdminController::class, 'deleteSlot']);
        });

        // User Management
        Route::prefix('users')->group(function () {
            Route::get('/', [AdminController::class, 'getUsers']);
            Route::put('/{id}', [AdminController::class, 'updateUser']);
        });

        // Dashboard
        Route::get('/dashboard/stats', [AdminController::class, 'getDashboardStats']);
        Route::delete('/reservations/{id}', [ReservationController::class, 'destroy']);
    });
});
