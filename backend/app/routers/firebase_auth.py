"""
Firebase Authentication endpoints - Idempotent and handles race conditions
These endpoints handle Firebase ID token verification and user management
"""
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from firebase_admin import auth
from typing import Optional, List
from datetime import datetime
import logging

from app.services.firestore import db
from app.services.auth_service import AuthService
from app.models.user_models import UserRole

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/firebase-auth",
    tags=["Firebase Authentication"]
)

# Request / Response Models
class FirebaseUserRegister(BaseModel):
    firstName: str
    lastName: str  
    email: EmailStr
    userType: str = "student"  # student or mentor
    # No firebase_uid needed - we get it from the token


class FirebaseUserResponse(BaseModel):
    uid: str
    email: str
    displayName: str
    userType: str
    roles: List[str]
    profileComplete: bool
    isVerified: bool
    needsOnboarding: bool  # New field to help frontend navigation

# Helper Functions
def get_firebase_user_from_firestore(uid: str) -> Optional[dict]:
    """Get user from Firestore using Firebase UID"""
    try:
        user_doc = db.collection('users').document(uid).get()
        if user_doc.exists:
            user_data = user_doc.to_dict()
            user_data['uid'] = uid
            return user_data
        return None
    except Exception as e:
        logger.error(f"Error getting user from Firestore: {str(e)}")
        return None

def create_or_update_firestore_profile(firebase_user: auth.UserRecord, user_data: FirebaseUserRegister) -> dict:
    """
    Create or update user profile in Firestore - IDEMPOTENT
    This handles race conditions and multiple calls gracefully
    """
    try:
        # Check if profile already exists
        existing_profile = get_firebase_user_from_firestore(firebase_user.uid)
        
        if existing_profile:
            logger.info(f"Profile already exists for {firebase_user.uid}, updating last login")
            # Profile exists, just update last login and return
            db.collection('users').document(firebase_user.uid).update({
                "lastLogin": datetime.utcnow().isoformat(),
                "email": firebase_user.email,  # Update email in case it changed
                "isVerified": firebase_user.email_verified  # Update verification status
            })
            
            # Return existing profile with updated fields
            existing_profile.update({
                "lastLogin": datetime.utcnow().isoformat(),
                "email": firebase_user.email,
                "isVerified": firebase_user.email_verified
            })
            return existing_profile
        
        # Create new profile
        logger.info(f"Creating new profile for {firebase_user.uid}")
        
        # Create displayName as "FirstName LastInitial"
        last_initial = user_data.lastName[0].upper() if user_data.lastName else ""
        display_name = f"{user_data.firstName} {last_initial}" if last_initial else user_data.firstName
        
        # Set default roles based on userType
        if user_data.userType == "mentor":
            default_roles = [UserRole.MENTOR.value]
        else:
            default_roles = [UserRole.STUDENT.value]
        
        # Create user document using Firebase UID as document ID
        user_doc = {
            "uid": firebase_user.uid,
            "firstName": user_data.firstName,
            "lastName": user_data.lastName,
            "displayName": display_name,
            "email": firebase_user.email,
            "userType": user_data.userType,
            "roles": default_roles,
            "isVerified": firebase_user.email_verified,
            "profileComplete": False,  # Will be updated after onboarding
            "authProvider": "firebase",
            "createdAt": datetime.utcnow().isoformat(),
            "lastLogin": datetime.utcnow().isoformat(),
            "status": "active"
        }
        
        # Save to Firestore using Firebase UID as document ID
        db.collection('users').document(firebase_user.uid).set(user_doc)
        
        logger.info(f"Successfully created Firestore profile for Firebase user: {firebase_user.uid}")
        return user_doc
        
    except Exception as e:
        logger.error(f"Error creating/updating Firestore user profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create or update user profile"
        )

def determine_needs_onboarding(user_profile: dict) -> bool:
    """
    Determine if user needs to complete onboarding
    """
    return not user_profile.get("profileComplete", False)

# Firebase Authentication Endpoints
@router.post("/register", response_model=FirebaseUserResponse)
def register_firebase_user(
    user_data: FirebaseUserRegister,
    current_user_uid: str = Depends(AuthService.get_current_user_uid)
):
    """
    Register/sync user profile after Firebase auth.
    IDEMPOTENT - can be called multiple times safely.
    
    Flow:
    1. Frontend creates Firebase user
    2. Frontend gets ID token
    3. Frontend calls this endpoint with token + profile data
    4. Backend creates/updates Firestore profile
    5. Returns profile with navigation hints
    """
    try:
        # Get Firebase user info from the verified token
        # (current_user_uid comes from the Firebase ID token verification)
        firebase_user = auth.get_user(current_user_uid)
        
        # Verify email matches (security check)
        if firebase_user.email != user_data.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email mismatch with authenticated user"
            )
        
        # Create or update Firestore profile (idempotent)
        user_doc = create_or_update_firestore_profile(firebase_user, user_data)
        
        # Send welcome email for new users (optional - non-blocking)
        if not user_doc.get("createdAt"):  # Only for new users
            try:
                from app.services.email_service import send_welcome_email
                send_welcome_email(user_data.email, user_data.firstName, user_data.userType)
            except Exception as e:
                logger.warning(f"Failed to send welcome email: {str(e)}")
        
        # Determine navigation hints
        needs_onboarding = determine_needs_onboarding(user_doc)
        
        return FirebaseUserResponse(
            uid=user_doc["uid"],
            email=user_doc["email"],
            displayName=user_doc["displayName"],
            userType=user_doc["userType"],
            roles=user_doc["roles"],
            profileComplete=user_doc["profileComplete"],
            isVerified=user_doc["isVerified"],
            needsOnboarding=needs_onboarding
        )
        
    except HTTPException:
        raise
    except auth.UserNotFoundError:
        # This shouldn't happen since we verify the token first
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )
    except Exception as e:
        logger.error(f"Firebase registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )


@router.get("/me", response_model=FirebaseUserResponse)
def get_current_firebase_user(current_user_uid: str = Depends(AuthService.get_current_user_uid)):
    """
    Get current user profile using Firebase auth dependency.
    This endpoint helps with navigation decisions.
    """
    try:
        # Get user profile from Firestore using Firebase UID
        user_profile = get_firebase_user_from_firestore(current_user_uid)
        if not user_profile:
            # User has valid Firebase token but no Firestore profile
            # This can happen in race conditions
            firebase_user = auth.get_user(current_user_uid)
            return FirebaseUserResponse(
                uid=current_user_uid,
                email=firebase_user.email,
                displayName=firebase_user.display_name or "User",
                userType="student",
                roles=["student"],
                profileComplete=False,
                isVerified=firebase_user.email_verified,
                needsOnboarding=True
            )
        
        # Update last login (optional, non-blocking)
        try:
            db.collection('users').document(current_user_uid).update({
                "lastLogin": datetime.utcnow().isoformat()
            })
        except Exception as e:
            logger.warning(f"Failed to update last login: {str(e)}")
        
        needs_onboarding = determine_needs_onboarding(user_profile)
        
        return FirebaseUserResponse(
            uid=user_profile["uid"],
            email=user_profile["email"],
            displayName=user_profile["displayName"],
            userType=user_profile["userType"],
            roles=user_profile["roles"],
            profileComplete=user_profile["profileComplete"],
            isVerified=user_profile["isVerified"],
            needsOnboarding=needs_onboarding
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get current user error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user profile"
        )

@router.post("/complete-onboarding")
def complete_onboarding(current_user_uid: str = Depends(AuthService.get_current_user_uid)):
    """
    Mark user's onboarding as complete.
    Called after user completes onboarding flow.
    """
    try:
        # Update user profile to mark onboarding as complete
        db.collection('users').document(current_user_uid).update({
            "profileComplete": True,
            "onboardingCompletedAt": datetime.utcnow().isoformat()
        })
        
        logger.info(f"Onboarding completed for user: {current_user_uid}")
        return {"message": "Onboarding completed successfully", "profileComplete": True}
        
    except Exception as e:
        logger.error(f"Complete onboarding error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to complete onboarding"
        )


