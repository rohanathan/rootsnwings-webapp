from fastapi import APIRouter, HTTPException, Depends, Query, UploadFile, File
from typing import Optional
import os
import uuid
from pathlib import Path
from app.models.user_models import (
    User, UserCreate, UserUpdate, UserResponse, AdminUserListResponse,
    StudentProfile, StudentProfileCreate, StudentProfileUpdate, StudentProfileResponse,
    ParentProfile, ParentProfileCreate, ParentProfileUpdate, ParentProfileResponse,
    PrivacySettings
)
from app.services.user_service import (
    create_user, get_user_by_id, update_user_flexible, update_last_login, update_last_active,
    create_student_profile, get_student_profile, update_student_profile_flexible,
    create_parent_profile, get_parent_profile, update_parent_profile_flexible,
    get_all_users, delete_user
)
from app.services.auth_service import get_current_user, get_current_user_optional, require_admin

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

# Authentication is now handled by Firebase Auth middleware
# Legacy functions for backward compatibility during development

def get_current_user_id_legacy() -> str:
    """
    Legacy function for testing without authentication.
    DO NOT USE IN PRODUCTION.
    """
    # For testing only - return a known user ID
    return "user001"

def is_admin_user_legacy() -> bool:
    """
    Legacy function for testing without authentication.
    DO NOT USE IN PRODUCTION.
    """
    # For testing only - return True to allow testing
    return True

@router.post("/", response_model=UserResponse)
def create_new_user(user_data: UserCreate):
    """
    Create a new user account.
    This endpoint is typically used during registration process.
    """
    user = create_user(user_data)
    return {"user": user}

@router.get("/me/authenticated", response_model=UserResponse)
def get_current_user_profile_authenticated(current_user_uid: str = Depends(get_current_user)):
    """
    Get the current user's profile with Firebase authentication.
    This endpoint requires a valid Firebase ID token.
    """
    user = get_user_by_id(current_user_uid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user": user}

@router.get("/me", response_model=UserResponse)
def get_current_user_profile():
    """
    Get the current user's profile (Legacy - for testing).
    NOTE: This uses legacy authentication for development/testing.
    """
    user_id = get_current_user_id_legacy()
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user": user}

@router.put("/me")
def update_current_user(update_data: dict):
    """
    Pure MongoDB-style flexible user updates.
    
    Frontend can send ANY field it wants:
    - { "displayName": "New Name" }
    - { "email": "new@email.com", "customField": "value" }
    - { "preferences.theme": "dark", "anyField": "anyValue" }
    """
    user_id = get_current_user_id_legacy()
    user = update_user_flexible(user_id, update_data)
    return {"user": user}

@router.post("/me/login")
def record_user_login():
    """
    Record user login timestamp.
    Called when user successfully logs in.
    """
    user_id = get_current_user_id_legacy()
    update_last_login(user_id)
    return {"message": "Login recorded"}

@router.post("/me/activity")
def record_user_activity():
    """
    Update user's last active timestamp.
    Can be called periodically to track user activity.
    """
    user_id = get_current_user_id_legacy()
    update_last_active(user_id)
    return {"message": "Activity recorded"}

@router.post("/me/profile-image")
def upload_profile_image(file: UploadFile = File(...)):
    """
    Upload profile image for the current user.
    Accepts: JPG, PNG, GIF files up to 5MB
    """
    user_id = get_current_user_id_legacy()
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, 
            detail="Invalid file type. Only JPG, PNG, and GIF are allowed"
        )
    
    # Validate file size (5MB max)
    max_size = 5 * 1024 * 1024  # 5MB in bytes
    if file.size and file.size > max_size:
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 5MB"
        )
    
    try:
        # Create uploads directory if it doesn't exist
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
        
        # Update user profile with new image URL
        # In production, this would be a cloud storage URL
        image_url = f"/uploads/profile-images/{unique_filename}"
        
        user_update = UserUpdate(photoURL=image_url)
        updated_user = update_user(user_id, user_update)
        
        return {
            "message": "Profile image uploaded successfully",
            "imageUrl": image_url,
            "user": updated_user
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload image: {str(e)}"
        )

@router.get("/me/privacy")
def get_privacy_settings():
    """
    Get current user's privacy settings.
    """
    user_id = get_current_user_id_legacy()
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Return privacy settings or defaults
    if user.preferences and user.preferences.privacy:
        return {"privacy": user.preferences.privacy}
    else:
        return {"privacy": PrivacySettings()}

@router.put("/me/privacy")
def update_privacy_settings(privacy_settings: PrivacySettings):
    """
    Update current user's privacy settings.
    """
    user_id = get_current_user_id_legacy()
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update preferences with new privacy settings
    from app.models.user_models import Preferences
    current_prefs = user.preferences or Preferences()
    current_prefs.privacy = privacy_settings
    
    user_update = UserUpdate(preferences=current_prefs)
    updated_user = update_user(user_id, user_update)
    
    return {
        "message": "Privacy settings updated successfully",
        "privacy": privacy_settings,
        "user": updated_user
    }

# Student Profile Endpoints
@router.post("/me/student-profile", response_model=StudentProfileResponse)
def create_my_student_profile(profile_data: StudentProfileCreate):
    """
    Create student profile for the current user.
    """
    user_id = get_current_user_id_legacy()
    profile = create_student_profile(user_id, profile_data)
    return {"profile": profile}

@router.get("/me/student-profile", response_model=StudentProfileResponse)
def get_my_student_profile():
    """
    Get the current user's student profile.
    """
    user_id = get_current_user_id_legacy()
    profile = get_student_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return {"profile": profile}

@router.put("/me/student-profile")
def update_my_student_profile(update_data: dict):
    """
    Pure MongoDB-style flexible student profile updates.
    
    Frontend can send ANY field:
    - { "interests": ["coding", "art"] }
    - { "learningGoals": "Master Python", "customField": "value" }
    """
    user_id = get_current_user_id_legacy()
    profile = update_student_profile_flexible(user_id, update_data)
    return {"profile": profile}

# Parent Profile Endpoints
@router.post("/me/parent-profile", response_model=ParentProfileResponse)
def create_my_parent_profile(profile_data: ParentProfileCreate):
    """
    Create parent profile for the current user.
    """
    user_id = get_current_user_id_legacy()
    profile = create_parent_profile(user_id, profile_data)
    return {"profile": profile}

@router.get("/me/parent-profile", response_model=ParentProfileResponse)
def get_my_parent_profile():
    """
    Get the current user's parent profile.
    """
    user_id = get_current_user_id_legacy()
    profile = get_parent_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Parent profile not found")
    return {"profile": profile}

@router.put("/me/parent-profile")
def update_my_parent_profile(update_data: dict):
    """
    Pure MongoDB-style flexible parent profile updates.
    
    Frontend can send ANY field:
    - { "youngLearners": [...] }
    - { "parentingStyle": "supportive", "customField": "value" }
    """
    user_id = get_current_user_id_legacy()
    profile = update_parent_profile_flexible(user_id, update_data)
    return {"profile": profile}

# Admin-only Endpoints
@router.get("/admin/all", response_model=AdminUserListResponse)
def get_all_users_admin_authenticated(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    admin_uid: str = Depends(require_admin)
):
    """
    Get all users with pagination - requires Firebase auth + admin role.
    """
    users, total = get_all_users(page, page_size)
    total_pages = (total + page_size - 1) // page_size
    
    return {
        "users": users,
        "total": total,
        "page": page,
        "pageSize": page_size,
        "totalPages": total_pages
    }

@router.get("/", response_model=AdminUserListResponse)
def get_all_users_admin(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page")
):
    """
    Get all users with pagination (Legacy - for testing).
    """
    if not is_admin_user_legacy():
        raise HTTPException(status_code=403, detail="Admin access required")
    
    users, total = get_all_users(page, page_size)
    total_pages = (total + page_size - 1) // page_size
    
    return {
        "users": users,
        "total": total,
        "page": page,
        "pageSize": page_size,
        "totalPages": total_pages
    }

@router.get("/{user_id}/profile", response_model=UserResponse)
def get_user_profile(user_id: str):
    """
    Get public user profile by ID.
    Returns limited public information about a user.
    """
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Return limited public profile (privacy-focused)
    # Create a copy of the user data and sanitize private fields
    user_dict = user.dict()
    user_dict.update({
        "email": "hidden@privacy.com",  # Hide email for privacy but keep valid format
        "phoneNumber": "",  # Hide phone for privacy
        "preferences": None,  # Hide preferences for privacy
        "gender": "",  # Hide gender for privacy
        "dob": "",  # Hide DOB for privacy
        "lastLoginAt": None,  # Hide login activity for privacy
        "lastActiveAt": None  # Hide activity for privacy
    })
    
    public_user = User(**user_dict)
    return {"user": public_user}

@router.get("/{user_id}", response_model=UserResponse)
def get_user_by_id_admin(user_id: str):
    """
    Get specific user by ID (Admin only).
    """
    if not is_admin_user():
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user": user}

@router.put("/{user_id}", response_model=UserResponse)
def update_user_admin(user_id: str, user_update: UserUpdate):
    """
    Update specific user (Admin only).
    """
    if not is_admin_user():
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user = update_user(user_id, user_update)
    return {"user": user}

@router.delete("/{user_id}")
def delete_user_admin(user_id: str):
    """
    Delete user and all associated profiles (Admin only).
    """
    if not is_admin_user():
        raise HTTPException(status_code=403, detail="Admin access required")
    
    success = delete_user(user_id)
    if success:
        return {"message": "User deleted successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to delete user")