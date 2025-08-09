from fastapi import APIRouter, HTTPException, Depends, Query, UploadFile, File
from typing import Optional, Dict, Any
import os
import uuid
from pathlib import Path
from datetime import datetime
from app.services.user_service import (
    create_user, get_user_by_id, get_user_flexible, update_user_flexible, 
    get_all_users, delete_user
)
from app.services.auth_service import get_current_user, get_current_user_optional, require_admin
from app.services.firestore import db

router = APIRouter(
    prefix="/users",
    tags=["Users Clean API"]
)

# Current user detection - flexible for testing and production
def get_current_user_id(request_headers=None, user_id_param: Optional[str] = None) -> str:
    """
    Get current user ID from various sources:
    1. user_id parameter (for testing)
    2. Authorization header (for production)
    3. Default to user001 (for backward compatibility)
    """
    # 1. If user_id parameter provided, use it
    if user_id_param:
        return user_id_param
    
    # 2. TODO: Add JWT token parsing from Authorization header
    # if request_headers and 'authorization' in request_headers:
    #     token = request_headers['authorization'].replace('Bearer ', '')
    #     return extract_user_id_from_jwt(token)
    
    # 3. Default for backward compatibility
    return "user001"

def is_admin_user(user_id: str = None) -> bool:
    """
    Check if user has admin role.
    For now, return True for testing. In production, check user roles.
    """
    # TODO: Check actual user roles from database
    # user = get_user_flexible(user_id)
    # return "admin" in user.get("roles", [])
    
    # For now, allow admin access for testing
    return True

# ==========================================
# CORE USER ENDPOINTS - MongoDB Style
# ==========================================

@router.post("/")
def create_new_user(user_data: Dict[str, Any]):
    """
    Create a new user with FULL flexibility - no Pydantic validation.
    Frontend sends exactly what it wants:
    {
        "uid": "firebase_uid",
        "email": "user@example.com", 
        "displayName": "John D",  // firstName + lastName[0]
        "roles": ["student"],
        "firstName": "John",
        "lastName": "Doe",
        "preferences": {...},
        "customField": "any value"
    }
    """
    try:
        # Generate UID if not provided
        import uuid
        uid = user_data.get("uid") or f"user_{uuid.uuid4().hex[:12]}"
        
        # Check if user already exists
        existing_user = db.collection("users").document(uid).get()
        if existing_user.exists:
            raise HTTPException(status_code=400, detail="User already exists")
        
        # PURE FLEXIBLE CREATION - No Pydantic validation
        now = datetime.now()
        user_doc = user_data.copy()
        user_doc.update({
            "uid": uid,
            "createdAt": now.isoformat(),
            "updatedAt": now.isoformat(),
            "lastLogin": None
        })
        
        # Ensure required defaults if not provided
        user_doc.setdefault("status", "active")
        user_doc.setdefault("profileComplete", False)
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
                "showOnlineStatus": False,
                "shareDataForAnalytics": True
            }
        })
        
        # Save to Firestore directly - no validation
        db.collection("users").document(uid).set(user_doc)
        
        # Return clean response using migration
        from app.services.user_migration import clean_user_response
        cleaned_user = clean_user_response(user_doc)
        
        return {"success": True, "user": cleaned_user}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create user: {str(e)}")

@router.get("/me")
def get_my_profile(user_id: Optional[str] = None):
    """
    Get complete user profile with all data.
    Returns everything: core fields + flexible fields + nested profiles.
    
    Response structure:
    {
        "success": true,
        "user": {
            "uid": "user123",
            "email": "user@example.com",
            "displayName": "John Doe",
            "roles": ["student", "parent"],
            "preferences": {...},
            "studentProfile": {...},
            "parentProfile": {...},
            "customFields": {...}
        }
    }
    """
    try:
        current_user_id = get_current_user_id(user_id_param=user_id)
        user = get_user_flexible(current_user_id)
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {"success": True, "user": user}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get profile: {str(e)}")

@router.put("/me")
def update_my_profile(update_data: Dict[str, Any], user_id: Optional[str] = None):
    """
    MongoDB-style flexible user updates.
    Frontend has complete control over what to update.
    
    Examples:
    - Basic: {"displayName": "New Name"}
    - Complex: {"roles": ["student"], "preferences.theme": "dark"}
    - Nested: {"studentProfile.interests": ["coding", "art"]}
    - Any field: {"customField": "any value", "deeply.nested.field": "data"}
    
    No validation - frontend decides what's valid.
    """
    try:
        current_user_id = get_current_user_id(user_id_param=user_id)
        
        # Direct flexible update - no validation
        user = update_user_flexible(current_user_id, update_data)
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {"success": True, "user": user, "updated_fields": list(update_data.keys())}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")

@router.delete("/me")
def delete_my_account(user_id: Optional[str] = None):
    """
    Delete my own account and all associated data.
    """
    try:
        current_user_id = get_current_user_id(user_id_param=user_id)
        success = delete_user(current_user_id)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete account")
            
        return {"success": True, "message": "Account deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete account: {str(e)}")

# ==========================================
# ADMIN ENDPOINTS (Internal Management Only)
# ==========================================

@router.get("/{user_id}")
def get_user_by_id_admin(user_id: str):
    """
    Get any user by ID (Admin/Internal only).
    Used for admin dashboard and internal user management.
    """
    try:
        if not is_admin_user():
            raise HTTPException(status_code=403, detail="Admin access required")
        
        user = get_user_flexible(user_id)
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {"success": True, "user": user}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user: {str(e)}")


# ==========================================
# UTILITY ENDPOINTS
# ==========================================

@router.post("/me/upload-image")
def upload_profile_image(file: UploadFile = File(...), user_id: Optional[str] = None):
    """
    Upload profile image.
    Updates user's photoURL field automatically.
    """
    try:
        current_user_id = get_current_user_id(user_id_param=user_id)
        
        # Validate file type
        allowed_types = ["image/jpeg", "image/png", "image/gif"]
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Invalid file type. Only JPG, PNG, and GIF allowed")
        
        # Validate file size (5MB max)
        max_size = 5 * 1024 * 1024
        if file.size and file.size > max_size:
            raise HTTPException(status_code=400, detail="File too large. Maximum size is 5MB")
        
        # Create uploads directory
        upload_dir = Path("uploads/profile-images")
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        file_extension = Path(file.filename).suffix.lower()
        unique_filename = f"{user_id}_{uuid.uuid4().hex[:8]}{file_extension}"
        file_path = upload_dir / unique_filename
        
        # Save file
        with open(file_path, "wb") as buffer:
            content = file.file.read()
            buffer.write(content)
        
        # Update user's photoURL
        image_url = f"/uploads/profile-images/{unique_filename}"
        user = update_user_flexible(user_id, {"photoURL": image_url})
        
        return {
            "success": True,
            "message": "Profile image uploaded successfully",
            "imageUrl": image_url,
            "user": user
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")

# ==========================================
# ROLE-SPECIFIC PROFILE ENDPOINTS
# ==========================================

@router.get("/me/profiles/{profile_type}")
def get_my_profile_by_type(profile_type: str, user_id: Optional[str] = None):
    """
    Get current user's profile by type (student, parent, mentor).
    Unified endpoint for all role-specific profiles.
    """
    try:
        current_user_id = get_current_user_id(user_id_param=user_id)
        
        # Validate profile type
        valid_types = ["student", "parent", "mentor"]
        if profile_type not in valid_types:
            raise HTTPException(status_code=400, detail=f"Invalid profile type. Must be one of: {valid_types}")
        
        # Check if user exists first
        user = get_user_flexible(current_user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if user has required role
        if profile_type not in user.get("roles", []):
            raise HTTPException(status_code=403, detail=f"User does not have {profile_type} role")
        
        # Get profile from appropriate collection
        collection_mapping = {
            "student": "student_profiles",
            "parent": "parent_profiles", 
            "mentor": "mentors"
        }
        
        collection_name = collection_mapping[profile_type]
        doc = db.collection(collection_name).document(current_user_id).get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail=f"{profile_type.title()} profile not found")
        
        profile_data = doc.to_dict()
        return {"success": True, "profile": profile_data}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get {profile_type} profile: {str(e)}")

@router.put("/me/profiles/{profile_type}")
def update_my_profile_by_type(profile_type: str, update_data: Dict[str, Any], user_id: Optional[str] = None):
    """
    Update current user's profile by type with flexible data.
    Unified endpoint for all role-specific profile updates.
    """
    try:
        current_user_id = get_current_user_id(user_id_param=user_id)
        
        # Validate profile type
        valid_types = ["student", "parent", "mentor"]
        if profile_type not in valid_types:
            raise HTTPException(status_code=400, detail=f"Invalid profile type. Must be one of: {valid_types}")
        
        # Check if user exists first
        user = get_user_flexible(current_user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if user has required role
        if profile_type not in user.get("roles", []):
            raise HTTPException(status_code=403, detail=f"User does not have {profile_type} role")
        
        # Get profile from appropriate collection
        collection_mapping = {
            "student": "student_profiles",
            "parent": "parent_profiles",
            "mentor": "mentors"
        }
        
        collection_name = collection_mapping[profile_type]
        doc_ref = db.collection(collection_name).document(current_user_id)
        
        # Check if profile exists
        if not doc_ref.get().exists:
            # CREATE profile if user has role but no profile
            print(f"Creating new {profile_type} profile for user {current_user_id}")
            
            # Create base profile structure
            base_profile = {
                "uid": current_user_id,
                "createdAt": datetime.now().isoformat(),
                "updatedAt": datetime.now().isoformat()
            }
            
            # Add profile-specific defaults
            if profile_type == "student":
                base_profile.update({
                    "learningGoals": "",
                    "interests": [],
                    "learningStyle": None,
                    "isYoungLearner": False,
                    "activeBookingsSummary": {
                        "count": 0,
                        "nextSession": {
                            "bookingId": None,
                            "classId": None,
                            "classTitle": None,
                            "mentorName": None,
                            "sessionDate": None,
                            "format": None
                        }
                    },
                    "upcomingSessions": {"items": []}
                })
            elif profile_type == "parent":
                base_profile.update({
                    "emergencyContact": {"name": "", "phone": ""},
                    "preferredContactMethod": "email"
                })
            elif profile_type == "mentor":
                base_profile.update({
                    "displayName": user.get("displayName", ""),
                    "headline": "",
                    "bio": "",
                    "subjects": [],
                    "teachingLevels": [],
                    "ageGroups": [],
                    "teachingModes": [],
                    "languages": ["english"],
                    "pricing": {"oneOnOneRate": 0, "groupRate": 0, "currency": "GBP", "firstSessionFree": False},
                    "stats": {"avgRating": 0, "totalReviews": 0, "totalStudents": 0, "totalSessions": 0},
                    "status": "draft",
                    "isVerified": False,
                    "backgroundChecked": False
                })
            
            # Merge with user data
            profile_data = {**base_profile, **update_data}
            profile_data["updatedAt"] = datetime.now().isoformat()
            
            # Create the profile
            doc_ref.set(profile_data)
            created = True
        else:
            # UPDATE existing profile
            update_data["updatedAt"] = datetime.now().isoformat()
            doc_ref.update(update_data)
            created = False
        
        # Return updated profile
        updated_doc = doc_ref.get()
        return {
            "success": True, 
            "profile": updated_doc.to_dict(), 
            "updated_fields": list(update_data.keys()),
            "created": created
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update {profile_type} profile: {str(e)}")