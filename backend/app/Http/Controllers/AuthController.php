<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request){
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
        ]);
        $user = User::create(['name'=> $validated['first_name']. ' ' . $validated['last_name'],
            'email'=>$validated['email'],
            'password'=>Hash::make($validated['password'])
        ]);

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user,
        ],201);
    }

    public function login(Request $request){
        $validated = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string|min:6',
        ]);
        $user = User::where('email',$validated['email'])->first();
        if(!$user || !Hash::check($validated['password'],$user->password)){
            return response()->json([
                'message' => 'Invalid credentials',
            ],401);
        }
        $token = $user->createToken('auth_token')->plainTextToken;
        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request){
        $request -> user()->currentAccessToken()->delete();
        return response()->json([
            'message' => 'Logout successful',
        ]);
    }
}
