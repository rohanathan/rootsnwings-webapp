from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Form, Body, Request
from typing import Optional, Dict, Any
import os
import uuid
import json
from pathlib import Path
from datetime import datetime
from app.services.user_service import (
    create_user, get_user_by_id, get_user_flexible, update_user_flexible, 
    get_all_users, delete_user
)
from app.services.firestore import db

router = APIRouter(
    prefix="/users",
    tags=["Users "]
)

def is_admin_user(user_id: str = None) -> bool:
    """
    Check if user has admin role.
    For now, return True for testing. In production, check user roles.
    """
    # TODO: Check actual user roles from database
    # For now, allow admin access for testing
    return True

# ==========================================
# SIMPLIFIED USER API - 3 ENDPOINTS ONLY
# ==========================================

@router.post("/")
def create_user(user_data: Dict[str, Any]):
    """
    Create new user account - used by Firebase auth registration and admin user creation.
    
    FRONTEND USAGE PATTERNS:
    - Firebase Auth Registration: POST /users/
      Creates user with uid (Firebase UID), email, displayName, roles after Firebase account creation
      
    - Admin User Creation: POST /users/
      Administrative user creation with full profile data and role assignment
      
    - Signup Flow Integration: POST /users/
      User registration with basic profile data, preferences, and role selection
      
    REQUEST FIELDS USAGE:
    - uid, email, displayName: Core identity fields (always provided)
    - roles: Role assignment for authentication navigation (student, mentor, parent, admin)
    - preferences: User settings for language, privacy, notifications
    - location: Geographic data for directory and matching features
    - Custom fields: Flexible data for future features and integrations
    
    RESPONSE: Returns complete user object for immediate authentication flow
    """
    try:
        # Generate UID if not provided
        uid = user_data.get("uid") or f"user_{uuid.uuid4().hex[:12]}"
        
        # Check if user already exists
        existing_user = db.collection("users").document(uid).get()
        if existing_user.exists:
            raise HTTPException(status_code=400, detail="User already exists")
        
        # Pure flexible creation - no validation
        now = datetime.now().isoformat()
        user_doc = user_data.copy()
        user_doc.update({
            "uid": uid,
            "createdAt": now,
            "updatedAt": now,
            "lastLogin": None
        })
        
        # Minimal defaults only if not provided
        user_doc.setdefault("status", "active")
        user_doc.setdefault("roles", [])
        user_doc.setdefault("preferences", {
            "language": "en",
            "currency": "GBP", 
            "privacy": {
                "showEmail": False,
                "showPhone": False,
                "showLocation": True,
                "showProfileInSearch": True,
                "allowDirectMessages": True,
                "showOnlineStatus": False
            }
        })
        
        # Save to Firestore
        db.collection("users").document(uid).set(user_doc)
        
        return {"user": user_doc}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create user: {str(e)}")

@router.get("/{user_id}")
def get_user(
    user_id: str,
    profile_type: Optional[str] = Query(None, description="Profile type filter - USED BY: Student profile (?profile_type=student), Parent profile (?profile_type=parent)"),
    include_profiles: bool = Query(True, description="Include role-specific data - USED BY: Profile management (true), Basic info (false)")
):
    """
    Universal user profile retrieval used across profile management, saved mentors, and admin interfaces.
    
    FRONTEND USAGE PATTERNS:
    - Profile Management: GET /users/me
      Returns complete user profile (uses: displayName, photoURL, email, phoneNumber, location, preferences)
      
    - Student Profile Access: GET /users/{uid}?profile_type=student
      Returns student-specific data (uses: savedMentors, interests, learningGoals for mentor directory functionality)
      
    - Parent Profile Access: GET /users/{uid}?profile_type=parent  
      Returns parent account data (uses: youngLearners for family account management)
      
    - Admin User Management: GET /users/{uid}
      Returns complete user data (uses: status, roles, email, location for admin user management)
      
    - Messaging Context: GET /users/{uid}?include_profiles=false
      Returns basic user info for messaging interfaces (uses: displayName, photoURL for user identification)
      
    - Saved Mentors Feature: GET /users/me?profile_type=student
      Returns student profile with savedMentors array for mentor directory heart icons
      
    FILTERING BEHAVIOR:
    - No profile_type: Returns core user data + all role-specific profiles
    - profile_type=student: Returns core user + student profile data only
    - profile_type=parent: Returns core user + parent profile data only
    - include_profiles=false: Returns only core user fields
    
    RESPONSE FIELD USAGE:
    - Profile management: Core identity fields + settings + personal info
    - Student features: Student profile fields + saved mentors functionality  
    - Admin interface: Complete user data for management and support
    - Messaging: Basic identity fields for user recognition
    """
    try:
        # Handle 'me' as current user placeholder
        if user_id == "me":
            user_id = "user001"  # Default for testing, replace with JWT parsing
        
        # Get base user data
        user = get_user_flexible(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # If profile_type filter requested, get specific profile only
        if profile_type:
            valid_types = ["student", "parent", "mentor"]
            if profile_type not in valid_types:
                raise HTTPException(status_code=400, detail=f"Invalid profile type. Must be one of: {valid_types}")
            
            # Check if user has this role
            if profile_type not in user.get("roles", []):
                raise HTTPException(status_code=403, detail=f"User does not have {profile_type} role")
            
            # Get specific profile data
            collection_mapping = {
                "student": "student_profiles",
                "parent": "parent_profiles", 
                "mentor": "mentors",
                "young_learner": "young_learner_profiles"
            }
            
            doc = db.collection(collection_mapping[profile_type]).document(user_id).get()
            if doc.exists:
                profile_data = doc.to_dict()
                return {"user": user, "profile": profile_data, "profile_type": profile_type}
            else:
                return {"user": user, "profile": None, "profile_type": profile_type}
        
        # Include all role-specific profiles if requested
        if include_profiles and user.get("roles"):
            profiles = {}
            for role in user.get("roles", []):
                if role in ["student", "parent", "mentor"]:
                    collection_mapping = {
                        "student": "student_profiles",
                        "parent": "parent_profiles", 
                        "mentor": "mentors"
                    }
                elif role == "parent":
                    # For parents, also include young learner profiles
                    collection_mapping = {
                        "parent": "parent_profiles"
                    }
                    doc = db.collection(collection_mapping[role]).document(user_id).get()
                    if doc.exists:
                        profiles[f"{role}Profile"] = doc.to_dict()
            
            user["profiles"] = profiles
        
        return {"user": user}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user: {str(e)}")

@router.put("/{user_id}")
async def update_user(
    request: Request,
    user_id: str,
    profile_type: Optional[str] = Query(None, description="Update specific profile: student, parent, mentor"),
    delete_account: bool = Query(False, description="Set true to delete account"),
    file: Optional[UploadFile] = File(None, description="Profile image file"),
    json_data: Optional[str] = Form(None, description="JSON data when uploading file")
):
    """
    Universal user updater - handles everything in one endpoint.
    
    Supports:
    - Basic updates: PUT /users/user123 with JSON body
    - Profile updates: PUT /users/user123?profile_type=student with JSON body
    - Image upload: PUT /users/user123 with multipart/form-data + file + json_data
    - Account deletion: PUT /users/user123?delete_account=true
    - Any combination: image + profile update + core user update
    
    Complete MongoDB flexibility - accepts ANY fields.
    """
    try:
        # Handle 'me' as current user placeholder
        if user_id == "me":
            user_id = "user001"  # Default for testing
        
        # Handle account deletion
        if delete_account:
            success = delete_user(user_id)
            if not success:
                raise HTTPException(status_code=500, detail="Failed to delete account")
            return {"message": "Account deleted successfully"}
        
        # Parse update data from request body
        update_data = {}
        
        # Check content type to determine how to parse the body
        content_type = request.headers.get("content-type", "")
        
        if "multipart/form-data" in content_type:
            # Handle multipart form data (file uploads)
            if json_data:
                try:
                    update_data = json.loads(json_data)
                except json.JSONDecodeError:
                    raise HTTPException(status_code=400, detail="Invalid JSON data in form")
        else:
            # Handle JSON request body
            try:
                body = await request.body()
                if body:
                    update_data = await request.json()
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid JSON in request body")
        
        
        # Handle file upload
        image_url = None
        if file:
            # Validate file
            allowed_types = ["image/jpeg", "image/png", "image/gif"]
            if file.content_type not in allowed_types:
                raise HTTPException(status_code=400, detail="Invalid file type. Only JPG, PNG, and GIF allowed")
            
            max_size = 5 * 1024 * 1024  # 5MB
            if file.size and file.size > max_size:
                raise HTTPException(status_code=400, detail="File too large. Maximum size is 5MB")
            
            # Save file
            upload_dir = Path("uploads/profile-images")
            upload_dir.mkdir(parents=True, exist_ok=True)
            
            file_extension = Path(file.filename).suffix.lower()
            unique_filename = f"{user_id}_{uuid.uuid4().hex[:8]}{file_extension}"
            file_path = upload_dir / unique_filename
            
            with open(file_path, "wb") as buffer:
                content = file.file.read()
                buffer.write(content)
            
            image_url = f"/uploads/profile-images/{unique_filename}"
            update_data["photoURL"] = image_url
        
        # Handle profile-specific updates
        if profile_type:
            valid_types = ["student", "parent", "mentor", "young_learner"]
            if profile_type not in valid_types:
                raise HTTPException(status_code=400, detail=f"Invalid profile type. Must be one of: {valid_types}")
            
            # Get user to check roles
            user = get_user_flexible(user_id)
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            if profile_type not in user.get("roles", []):
                raise HTTPException(status_code=403, detail=f"User does not have {profile_type} role")
            
            # Update specific profile
            collection_mapping = {
                "student": "student_profiles",
                "parent": "parent_profiles",
                "mentor": "mentors",
                "young_learner": "young_learner_profiles"
            }
            
            doc_ref = db.collection(collection_mapping[profile_type]).document(user_id)
            
            # Create profile if doesn't exist
            if not doc_ref.get().exists:
                base_profile = {
                    "uid": user_id,
                    "createdAt": datetime.now().isoformat(),
                    "updatedAt": datetime.now().isoformat()
                }
                # Add defaults based on profile type
                if profile_type == "student":
                    base_profile.update({
                        "isYoungLearner": False,
                        "activeBookingsSummary": {"count": 0},
                        "upcomingSessions": {"items": []}
                    })
                elif profile_type == "mentor":
                    base_profile.update({
                        "displayName": user.get("displayName", ""),
                        "subjects": [],
                        "pricing": {"oneOnOneRate": 0, "groupRate": 0, "currency": "GBP"},
                        "stats": {"avgRating": 0, "totalReviews": 0, "totalStudents": 0},
                        "status": "draft"
                    })
                
                profile_data = {**base_profile, **update_data}
                doc_ref.set(profile_data)
            else:
                # Get existing profile data
                existing_profile = doc_ref.get().to_dict()
                # Merge with update data
                merged_data = {**existing_profile, **update_data}
                merged_data["updatedAt"] = datetime.now().isoformat()
                
                try:
                    doc_ref.set(merged_data)  # Use set instead of update to ensure all fields are saved
                except Exception as e:
                    raise e
            
            # Get updated profile
            updated_profile = doc_ref.get().to_dict()
            return {"user": user, "profile": updated_profile, "profile_type": profile_type}
        
        # Handle core user updates
        if update_data:
            user = update_user_flexible(user_id, update_data)
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
        else:
            user = get_user_flexible(user_id)
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
        
        response = {"user": user}
        if image_url:
            response["imageUrl"] = image_url
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update user: {str(e)}")

# ==========================================
# SIMPLIFIED TO 3 ENDPOINTS TOTAL
# POST /users/ - Create user
# GET /users/{user_id} - Get user (supports filtering)
# PUT /users/{user_id} - Update everything (core, profiles, images, deletion)
# ==========================================