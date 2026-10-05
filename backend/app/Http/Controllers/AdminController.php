<?php

namespace App\Http\Controllers;

use App\Models\Institution;
use App\Models\University;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    //List all pending institution verification requests.

    public function pendingInstitutions(){
        $pending=Institution::with('user:id,email,created_at')
        ->where('is_approved',false)
        ->orderBy('institution_id', 'desc')
        ->get();

        return response()->json(['data'=> $pending]);
    }

    //Approve a pending institution and create initial university record.

    public function approveInstitution(Request $request, int $id){
        $institution = Institution::find($id);
        if(!$institution){
            return response()-> json(['message'=> 'Institution not found.'], 404);
        }
        if($institution->is_approved){
            return response()-> json(['message'=> 'Institution already approved.'], 400);
        }

        DB::transaction(function () use ($institution){

            //1. Mark insti as approved.
            $institution-> is_approved = true;
            $institution->save();
            
            //2. Check if university with a matching name already exist to claim it.
            $university = University::where('name', 'ILIKE', $institution->institution_name)->first();

            if($university){
                //Exist.
                $university->institution_id = $institution->institution_id;
                $university->save();
            }else{
                //Create new university for new university.
                University::create([
                    'institution_id' => $institution->institution_id,
                    'name'=> $institution->institution_name,
                    'abbreviation'=> $institution->institution_name,
                    'institution_type' => 'Private',
                    'address'=> $institution->address,
                ]);
            }
        });

        return response()->json(['message'=>"Institution '{$institution->institution_name}' has been approved successfully."]);
    }

    //Reject and delete a pending application
    public function rejectInstitution(int $id){
        $institution = Institution::with('user')->find($id);
        if(!$institution){
            return response()->json(['message'=>'Institution not found.'],404);
        }

        DB::transaction(function() use ($institution){
            $user = $institution->user;
            $institution->delete();
            if($user){
                $user->delete();
            }
            
        });

        return response()->json(['message'=> "Institution application rejected and removed."]);
    }
}
