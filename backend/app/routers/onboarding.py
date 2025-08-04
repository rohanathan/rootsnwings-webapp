"""
User and mentor onboarding APIs for saving progress and completing profiles
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid
import os
from pathlib import Path
from app.services.firestore import db

router = APIRouter(
    prefix="/onboarding",
    tags=["Onboarding"]
)

# Request Models
class MentorOnboardingProgress(BaseModel):
    userId: str
    step: int
    subjects: Optional[List[str]] = []
    teachingLevels: Optional[List[str]] = []
    ageGroups: Optional[List[str]] = []
    classTypes: Optional[List[str]] = []
    bio: Optional[str] = None
    experience: Optional[str] = None
    location: Optional[Dict[str, Any]] = {}
    teachingModes: Optional[List[str]] = []
    languages: Optional[List[str]] = []
    dbsCheck: Optional[bool] = False
    pricing: Optional[Dict[str, Any]] = {}
    photoUrl: Optional[str] = None

class UserOnboardingProgress(BaseModel):
    userId: str
    step: int
    interests: Optional[List[str]] = []
    learningGoals: Optional[str] = None
    preferredLanguages: Optional[List[str]] = []
    ageGroup: Optional[str] = None
    location: Optional[Dict[str, Any]] = {}
    learningPreferences: Optional[Dict[str, Any]] = {}

class OnboardingComplete(BaseModel):
    userId: str
    userType: str  # "mentor" or "student"
    data: Dict[str, Any]

# Helper Functions
def save_onboarding_progress(user_id: str, progress_data: dict, user_type: str):
    """Save onboarding progress to Firestore"""
    try:
        collection_name = f"{user_type}_onboarding_progress"
        progress_doc = {
            **progress_data,
            "userId": user_id,
            "userType": user_type,
            "lastUpdated": datetime.utcnow().isoformat(),
            "isComplete": False
        }
        
        db.collection(collection_name).document(user_id).set(progress_doc, merge=True)
        return progress_doc
    except Exception as e:
        print(f"Error saving onboarding progress: {str(e)}")
        return None

def get_onboarding_progress(user_id: str, user_type: str):
    """Get onboarding progress from Firestore"""
    try:
        collection_name = f"{user_type}_onboarding_progress"
        doc = db.collection(collection_name).document(user_id).get()
        
        if doc.exists:
            return doc.to_dict()
        return None
    except Exception as e:
        print(f"Error getting onboarding progress: {str(e)}")
        return None

# Mentor Onboarding Endpoints
@router.post("/mentor/save-progress")
def save_mentor_progress(progress: MentorOnboardingProgress):
    """
    Save mentor onboarding progress.
    Allows mentors to save their progress and resume later.
    """
    try:
        progress_data = progress.dict()
        saved_progress = save_onboarding_progress(
            progress.userId, 
            progress_data, 
            "mentor"
        )
        
        if not saved_progress:
            raise HTTPException(status_code=500, detail="Failed to save progress")
        
        return {
            "message": "Progress saved successfully",
            "step": progress.step,
            "progress": saved_progress
        }
        
    except Exception as e:
        print(f"Error saving mentor progress: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save progress")

@router.get("/mentor/progress/{user_id}")
def get_mentor_progress(user_id: str):
    """
    Get saved mentor onboarding progress.
    Allows mentors to resume where they left off.
    """
    try:
        progress = get_onboarding_progress(user_id, "mentor")
        
        if not progress:
            return {
                "message": "No progress found",
                "step": 1,
                "progress": {}
            }
        
        return {
            "message": "Progress retrieved",
            "step": progress.get("step", 1),
            "progress": progress
        }
        
    except Exception as e:
        print(f"Error getting mentor progress: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get progress")

@router.post("/mentor/submit")
def submit_mentor_application(completion: OnboardingComplete):
    """
    Submit complete mentor application.
    
    - Validates required fields
    - Creates mentor profile
    - Sets status to pending approval
    - Marks onboarding as complete
    """
    try:
        user_id = completion.userId
        mentor_data = completion.data
        
        # Validate required fields
        required_fields = ['subjects', 'bio', 'pricing', 'location']
        missing_fields = [field for field in required_fields if not mentor_data.get(field)]
        
        if missing_fields:
            raise HTTPException(
                status_code=400, 
                detail=f"Missing required fields: {', '.join(missing_fields)}"
            )
        
        # Get user data for displayName
        user_doc = db.collection('users').document(user_id).get()
        user_data = user_doc.to_dict() if user_doc.exists else {}
        
        # Create displayName as "FirstName LastInitial"
        first_name = user_data.get("firstName", "User")
        last_name = user_data.get("lastName", "")
        last_initial = last_name[0].upper() if last_name else ""
        display_name = f"{first_name} {last_initial}" if last_initial else first_name
        
        # Create mentor profile
        mentor_profile = {
            "uid": user_id,
            "displayName": display_name,
            "category": mentor_data.get("subjects", [])[0] if mentor_data.get("subjects") else "other",
            "subjects": mentor_data.get("subjects", []),
            "teachingLevels": mentor_data.get("teachingLevels", []),
            "ageGroups": mentor_data.get("ageGroups", []),
            "teachingModes": mentor_data.get("teachingModes", []),
            "bio": mentor_data.get("bio"),
            "experience": mentor_data.get("experience"),
            "languages": mentor_data.get("languages", ["en"]),
            "city": mentor_data.get("location", {}).get("city"),
            "region": mentor_data.get("location", {}).get("region"),
            "country": mentor_data.get("location", {}).get("country"),
            "pricing": {
                "oneOnOneRate": float(mentor_data.get("pricing", {}).get("oneOnOne", 0)),
                "groupRate": float(mentor_data.get("pricing", {}).get("group", 0)),
                "currency": "GBP",
                "firstSessionFree": mentor_data.get("pricing", {}).get("firstSessionFree", False)
            },
            "photoURL": mentor_data.get("photoUrl"),
            "backgroundChecked": mentor_data.get("dbsCheck", False),
            "status": "pending_approval",  # Needs admin approval
            "isVerified": False,
            "acceptingNewStudents": {"group": True, "oneOnOne": True},
            "stats": {
                "avgRating": 0,
                "totalReviews": 0,
                "totalStudents": 0,
                "totalSessions": 0,
                "responseTimeMinutes": 999,
                "repeatStudentRate": 0
            },
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat()
        }
        
        # Save mentor profile
        db.collection('mentors').document(user_id).set(mentor_profile)
        
        # Update user profile
        db.collection('users').document(user_id).update({
            "userType": "mentor",
            "profileComplete": True,
            "mentorStatus": "pending_approval",
            "updatedAt": datetime.utcnow().isoformat()
        })
        
        # Mark onboarding as complete
        db.collection('mentor_onboarding_progress').document(user_id).update({
            "isComplete": True,
            "completedAt": datetime.utcnow().isoformat()
        })
        
        return {
            "message": "Mentor application submitted successfully",
            "status": "pending_approval",
            "mentorId": user_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error submitting mentor application: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to submit application")

# Student Onboarding Endpoints
@router.post("/student/save-progress")
def save_student_progress(progress: UserOnboardingProgress):
    """
    Save student onboarding progress.
    """
    try:
        progress_data = progress.dict()
        saved_progress = save_onboarding_progress(
            progress.userId, 
            progress_data, 
            "student"
        )
        
        if not saved_progress:
            raise HTTPException(status_code=500, detail="Failed to save progress")
        
        return {
            "message": "Progress saved successfully",
            "step": progress.step,
            "progress": saved_progress
        }
        
    except Exception as e:
        print(f"Error saving student progress: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save progress")

@router.get("/student/progress/{user_id}")
def get_student_progress(user_id: str):
    """
    Get saved student onboarding progress.
    """
    try:
        progress = get_onboarding_progress(user_id, "student")
        
        if not progress:
            return {
                "message": "No progress found",
                "step": 1,
                "progress": {}
            }
        
        return {
            "message": "Progress retrieved",
            "step": progress.get("step", 1),
            "progress": progress
        }
        
    except Exception as e:
        print(f"Error getting student progress: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get progress")

@router.post("/student/submit")
def complete_student_onboarding(completion: OnboardingComplete):
    """
    Complete student onboarding and create student profile.
    """
    try:
        user_id = completion.userId
        student_data = completion.data
        
        # Create student profile
        student_profile = {
            "userId": user_id,
            "interests": student_data.get("interests", []),
            "learningGoals": student_data.get("learningGoals"),
            "preferredLanguages": student_data.get("preferredLanguages", ["en"]),
            "ageGroup": student_data.get("ageGroup"),
            "location": student_data.get("location", {}),
            "learningPreferences": student_data.get("learningPreferences", {}),
            "isYoungLearner": student_data.get("ageGroup") == "under_13",
            "bookingSummary": {
                "totalBookings": 0,
                "completedClasses": 0,
                "upcomingClasses": 0,
                "cancelledBookings": 0
            },
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat()
        }
        
        # Save student profile
        db.collection('student_profiles').document(user_id).set(student_profile)
        
        # Update user profile
        db.collection('users').document(user_id).update({
            "profileComplete": True,
            "updatedAt": datetime.utcnow().isoformat()
        })
        
        # Mark onboarding as complete
        db.collection('student_onboarding_progress').document(user_id).update({
            "isComplete": True,
            "completedAt": datetime.utcnow().isoformat()
        })
        
        return {
            "message": "Student onboarding completed successfully",
            "studentProfile": student_profile
        }
        
    except Exception as e:
        print(f"Error completing student onboarding: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to complete onboarding")

# File Upload Endpoint
@router.post("/upload-photo")
async def upload_profile_photo(
    file: UploadFile = File(...),
    user_id: str = Form(...)
):
    """
    Upload profile photo for onboarding.
    
    - Accepts image files (jpg, png, etc.)
    - Saves to uploads/profile-images/
    - Returns URL for frontend to use
    """
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="Only image files are allowed")
        
        # Create upload directory
        upload_dir = Path("uploads/profile-images")
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
        filename = f"{user_id}_{uuid.uuid4().hex[:8]}.{file_extension}"
        file_path = upload_dir / filename
        
        # Save file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Return file URL
        file_url = f"/uploads/profile-images/{filename}"
        
        return {
            "message": "Photo uploaded successfully",
            "photoUrl": file_url,
            "filename": filename
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error uploading photo: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to upload photo")