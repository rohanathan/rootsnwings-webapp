"""
Authentication endpoints for user registration, login & password management
"""
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional
import bcrypt
import jwt
import uuid
from datetime import datetime, timedelta
from app.services.firestore import db
from app.config import settings

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

# Security
security = HTTPBearer()
SECRET_KEY = "your-secret-key-change-in-production"  # TODO: Move to environment variables
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Request/Response Models
class UserRegister(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    password: str
    userType: str = "student"  # student, mentor, parent

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    rememberMe: bool = False

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    user: dict

class PasswordReset(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

# Helper Functions
def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_user_by_email(email: str):
    """Get user from database by email"""
    try:
        users_ref = db.collection('users')
        query = users_ref.where('email', '==', email).limit(1)
        docs = list(query.stream())
        
        if docs:
            user_data = docs[0].to_dict()
            user_data['uid'] = docs[0].id
            return user_data
        return None
    except Exception as e:
        print(f"Error getting user by email: {str(e)}")
        return None

# Authentication Endpoints
@router.post("/register", response_model=TokenResponse)
def register_user(user_data: UserRegister):
    """
    Register a new user account.
    
    - Validates email uniqueness
    - Hashes password with bcrypt
    - Creates user document in Firestore
    - Returns access token for immediate login
    """
    try:
        # Check if user already exists
        existing_user = get_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash password
        hashed_password = hash_password(user_data.password)
        
        # Generate user ID
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        
        # Create displayName as "FirstName LastInitial"
        last_initial = user_data.lastName[0].upper() if user_data.lastName else ""
        display_name = f"{user_data.firstName} {last_initial}" if last_initial else user_data.firstName
        
        # Create user document
        user_doc = {
            "uid": user_id,
            "firstName": user_data.firstName,
            "lastName": user_data.lastName,
            "displayName": display_name,
            "email": user_data.email,
            "passwordHash": hashed_password,
            "userType": user_data.userType,
            "isVerified": False,
            "profileComplete": False,
            "createdAt": datetime.utcnow().isoformat(),
            "lastLogin": None,
            "status": "active"
        }
        
        # Save to Firestore
        db.collection('users').document(user_id).set(user_doc)
        
        # Send welcome and verification emails
        try:
            from app.services.email_service import send_welcome_email, send_verification_email
            send_welcome_email(user_data.email, user_data.firstName, user_data.userType)
            send_verification_email(user_data.email, user_data.firstName, user_id)
        except Exception as e:
            print(f"Error sending emails: {str(e)}")
        
        # Create access token
        token_data = {"sub": user_id, "email": user_data.email, "type": user_data.userType}
        expires_delta = timedelta(days=7) if False else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(data=token_data, expires_delta=expires_delta)
        
        # Remove password hash from response
        user_doc.pop("passwordHash", None)
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=int(expires_delta.total_seconds()),
            user=user_doc
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.post("/login", response_model=TokenResponse)
def login_user(login_data: UserLogin):
    """
    Authenticate user and return access token.
    
    - Verifies email and password
    - Updates last login timestamp
    - Returns JWT token for API access
    """
    try:
        # Get user by email
        user = get_user_by_email(login_data.email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Verify password
        if not verify_password(login_data.password, user.get("passwordHash", "")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Update last login
        db.collection('users').document(user['uid']).update({
            "lastLogin": datetime.utcnow().isoformat()
        })
        
        # Create access token
        token_data = {"sub": user['uid'], "email": user['email'], "type": user.get('userType', 'student')}
        expires_delta = timedelta(days=7) if login_data.rememberMe else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(data=token_data, expires_delta=expires_delta)
        
        # Remove password hash from response
        user.pop("passwordHash", None)
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=int(expires_delta.total_seconds()),
            user=user
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

@router.post("/logout")
def logout_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Logout user (client should discard token).
    """
    return {"message": "Logged out successfully"}

@router.post("/forgot-password")
def forgot_password(reset_data: PasswordReset):
    """
    Send password reset email if user exists.
    """
    try:
        # Check if user exists
        user = get_user_by_email(reset_data.email)
        if user:
            # Send password reset email
            try:
                from app.services.email_service import send_password_reset_email
                send_password_reset_email(
                    user_email=user["email"], 
                    user_name=user["firstName"], 
                    user_id=user["uid"]
                )
            except Exception as e:
                print(f"Error sending password reset email: {str(e)}")
        
        # Always return same message for security (don't reveal if email exists)
        return {"message": "If this email is registered, you will receive password reset instructions"}
        
    except Exception as e:
        print(f"Password reset error: {str(e)}")
        return {"message": "If this email is registered, you will receive password reset instructions"}

@router.get("/verify-token")
def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Verify if the provided JWT token is valid.
    Returns user info if token is valid.
    """
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        # Get current user data
        user_doc = db.collection('users').document(user_id).get()
        if not user_doc.exists:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        user_data = user_doc.to_dict()
        user_data.pop("passwordHash", None)  # Never return password hash
        
        return {"user": user_data, "valid": True}
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    except Exception as e:
        print(f"Token verification error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token verification failed"
        )

@router.post("/verify-email")
def verify_email_endpoint(token: str):
    """
    Verify email address using token from email.
    """
    try:
        from app.services.email_service import verify_token
        
        token_data = verify_token(token)
        if not token_data or token_data.get("tokenType") != "email_verification":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired verification token"
            )
        
        user_id = token_data["userId"]
        
        # Update user as verified
        db.collection('users').document(user_id).update({
            "isVerified": True,
            "verifiedAt": datetime.utcnow().isoformat()
        })
        
        return {"message": "Email verified successfully", "verified": True}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Email verification error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Email verification failed"
        )

@router.post("/reset-password")
def reset_password_endpoint(reset_data: PasswordResetConfirm):
    """
    Reset password using token from email.
    """
    try:
        from app.services.email_service import verify_token
        
        token_data = verify_token(reset_data.token)
        if not token_data or token_data.get("tokenType") != "password_reset":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )
        
        user_id = token_data["userId"]
        
        # Hash new password
        new_password_hash = hash_password(reset_data.new_password)
        
        # Update user password
        db.collection('users').document(user_id).update({
            "passwordHash": new_password_hash,
            "passwordResetAt": datetime.utcnow().isoformat()
        })
        
        return {"message": "Password reset successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Password reset error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password reset failed"
        )