from app.services.firestore import db
from app.models.user_models import (
    User, UserCreate, UserUpdate, StudentProfile, StudentProfileCreate, 
    StudentProfileUpdate, ParentProfile, ParentProfileCreate, ParentProfileUpdate
)
from datetime import datetime
from typing import Optional, List
from fastapi import HTTPException
import uuid

def create_user(user_data: UserCreate) -> User:
    """Create a new user"""
    try:
        # Generate UID if not provided
        uid = user_data.uid or f"user_{uuid.uuid4().hex[:12]}"
        
        # Check if user already exists
        existing_user = db.collection("users").document(uid).get()
        if existing_user.exists:
            raise HTTPException(status_code=400, detail="User already exists")
        
        # Prepare user data
        now = datetime.now()
        user_dict = user_data.dict(exclude={'uid'})
        user_dict.update({
            "uid": uid,
            "createdAt": now.isoformat(),
            "updatedAt": now.isoformat(),
            "lastLoginAt": None,
            "lastActiveAt": None
        })
        
        # Save to Firestore
        db.collection("users").document(uid).set(user_dict)
        
        # Return user object
        return User(**user_dict)
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Failed to create user: {str(e)}")

def get_user_by_id(uid: str) -> Optional[User]:
    """Get user by UID - strict User model"""
    try:
        doc = db.collection("users").document(uid).get()
        if not doc.exists:
            return None
        
        data = doc.to_dict()
        return User(**data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user: {str(e)}")

def get_user_flexible(uid: str) -> Optional[dict]:
    """Get user by UID - flexible dict format with clean structure"""
    try:
        doc = db.collection("users").document(uid).get()
        if not doc.exists:
            return None
        
        # Get raw data and clean it up
        raw_data = doc.to_dict()
        
        # Apply migration to clean up the response
        from app.services.user_migration import clean_user_response
        cleaned_data = clean_user_response(raw_data)
        
        return cleaned_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user: {str(e)}")

def update_user_flexible(uid: str, update_data: dict) -> dict:
    """Pure MongoDB-style flexible user update"""
    try:
        doc_ref = db.collection("users").document(uid)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Pure flexibility - use whatever frontend sends
        flexible_update = update_data.copy()
        flexible_update["updatedAt"] = datetime.now().isoformat()
        
        # Update with ANY fields
        doc_ref.update(flexible_update)
        
        # Return updated user as clean dict
        updated_doc = doc_ref.get()
        raw_data = updated_doc.to_dict()
        
        # Apply migration to clean up the response
        from app.services.user_migration import clean_user_response
        cleaned_data = clean_user_response(raw_data)
        
        return cleaned_data
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Failed to update user: {str(e)}")

def update_last_login(uid: str) -> None:
    """Update user's last login timestamp"""
    try:
        doc_ref = db.collection("users").document(uid)
        if doc_ref.get().exists:
            doc_ref.update({
                "lastLoginAt": datetime.now().isoformat(),
                "lastActiveAt": datetime.now().isoformat()
            })
    except Exception:
        # Silently fail for login updates
        pass

def update_last_active(uid: str) -> None:
    """Update user's last active timestamp"""
    try:
        doc_ref = db.collection("users").document(uid)
        if doc_ref.get().exists:
            doc_ref.update({
                "lastActiveAt": datetime.now().isoformat()
            })
    except Exception:
        # Silently fail for activity updates
        pass

# Student Profile Services
def create_student_profile(uid: str, profile_data: StudentProfileCreate) -> StudentProfile:
    """Create student profile"""
    try:
        # Check if user exists
        user_doc = db.collection("users").document(uid).get()
        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if profile already exists
        existing_profile = db.collection("student_profiles").document(uid).get()
        if existing_profile.exists:
            raise HTTPException(status_code=400, detail="Student profile already exists")
        
        # Create profile
        now = datetime.now()
        profile_dict = profile_data.dict()
        profile_dict.update({
            "uid": uid,
            "createdAt": now.isoformat(),
            "updatedAt": now.isoformat()
        })
        
        # Save to Firestore
        db.collection("student_profiles").document(uid).set(profile_dict)
        
        # Update user's hasStudentProfile flag
        db.collection("users").document(uid).update({
            "hasStudentProfile": True,
            "updatedAt": now.isoformat()
        })
        
        return StudentProfile(**profile_dict)
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Failed to create student profile: {str(e)}")

def get_student_profile(uid: str) -> Optional[StudentProfile]:
    """Get student profile"""
    try:
        doc = db.collection("student_profiles").document(uid).get()
        if not doc.exists:
            return None
        
        data = doc.to_dict()
        return StudentProfile(**data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get student profile: {str(e)}")

def update_student_profile_flexible(uid: str, update_data: dict) -> dict:
    """Update student profile"""
    try:
        doc_ref = db.collection("student_profiles").document(uid)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Student profile not found")
        
        # Pure flexibility - use whatever frontend sends
        flexible_update = update_data.copy()
        flexible_update["updatedAt"] = datetime.now().isoformat()
        
        # Update with ANY fields
        doc_ref.update(flexible_update)
        
        # Return updated profile as plain dict
        updated_doc = doc_ref.get()
        return updated_doc.to_dict()
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Failed to update student profile: {str(e)}")

# Parent Profile Services
def create_parent_profile(uid: str, profile_data: ParentProfileCreate) -> ParentProfile:
    """Create parent profile"""
    try:
        # Check if user exists
        user_doc = db.collection("users").document(uid).get()
        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if profile already exists
        existing_profile = db.collection("parent_profiles").document(uid).get()
        if existing_profile.exists:
            raise HTTPException(status_code=400, detail="Parent profile already exists")
        
        # Create profile
        now = datetime.now()
        profile_dict = profile_data.dict()
        profile_dict.update({
            "uid": uid,
            "createdAt": now.isoformat(),
            "updatedAt": now.isoformat()
        })
        
        # Save to Firestore
        db.collection("parent_profiles").document(uid).set(profile_dict)
        
        # Update user's hasParentProfile flag
        db.collection("users").document(uid).update({
            "hasParentProfile": True,
            "updatedAt": now.isoformat()
        })
        
        return ParentProfile(**profile_dict)
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Failed to create parent profile: {str(e)}")

def get_parent_profile(uid: str) -> Optional[ParentProfile]:
    """Get parent profile"""
    try:
        doc = db.collection("parent_profiles").document(uid).get()
        if not doc.exists:
            return None
        
        data = doc.to_dict()
        return ParentProfile(**data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get parent profile: {str(e)}")

def update_parent_profile_flexible(uid: str, update_data: dict) -> dict:
    """Update parent profile"""
    try:
        doc_ref = db.collection("parent_profiles").document(uid)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Parent profile not found")
        
        # Pure flexibility - use whatever frontend sends
        flexible_update = update_data.copy()
        flexible_update["updatedAt"] = datetime.now().isoformat()
        
        # Update with ANY fields
        doc_ref.update(flexible_update)
        
        # Return updated profile as plain dict
        updated_doc = doc_ref.get()
        return updated_doc.to_dict()
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Failed to update parent profile: {str(e)}")

# Admin-only functions
def get_all_users(page: int = 1, page_size: int = 20) -> tuple[List[User], int]:
    """Get all users with pagination (admin only)"""
    try:
        # Get total count
        total_docs = db.collection("users").stream()
        total = sum(1 for _ in total_docs)
        
        # Calculate pagination
        offset = (page - 1) * page_size
        
        # Get paginated results
        query = db.collection("users").order_by("createdAt", direction="DESCENDING")
        docs = query.offset(offset).limit(page_size).stream()
        
        users = []
        for doc in docs:
            data = doc.to_dict()
            users.append(User(**data))
        
        return users, total
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get users: {str(e)}")

def delete_user(uid: str) -> bool:
    """Delete user and all associated profiles (admin only)"""
    try:
        # Delete user document
        user_ref = db.collection("users").document(uid)
        if not user_ref.get().exists:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Delete associated profiles from correct collections
        db.collection("student_profiles").document(uid).delete()
        db.collection("parent_profiles").document(uid).delete() 
        db.collection("mentors").document(uid).delete()
        
        # Delete user
        user_ref.delete()
        
        return True
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Failed to delete user: {str(e)}")