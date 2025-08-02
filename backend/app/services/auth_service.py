from firebase_admin import auth
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import logging

logger = logging.getLogger(__name__)
security = HTTPBearer()

class AuthService:
    """Firebase Authentication service"""
    
    @staticmethod
    def verify_token(token: str) -> dict:
        """
        Verify Firebase ID token and return decoded token
        """
        try:
            decoded_token = auth.verify_id_token(token)
            return decoded_token
        except auth.InvalidIdTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token"
            )
        except auth.ExpiredIdTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication token has expired"
            )
        except Exception as e:
            logger.error(f"Token verification failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication failed"
            )
    
    @staticmethod
    def get_current_user_uid(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
        """
        Dependency to get current user UID from JWT token
        """
        token = credentials.credentials
        decoded_token = AuthService.verify_token(token)
        return decoded_token.get("uid")
    
    @staticmethod
    def get_current_user_optional(credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))) -> Optional[str]:
        """
        Optional dependency to get current user UID (doesn't raise error if no token)
        """
        if not credentials:
            return None
        
        try:
            token = credentials.credentials
            decoded_token = AuthService.verify_token(token)
            return decoded_token.get("uid")
        except HTTPException:
            return None
    
    @staticmethod
    def require_admin_role(current_user_uid: str = Depends(get_current_user_uid)) -> str:
        """
        Dependency that requires admin role
        """
        # Check if user has admin role in Firestore
        from app.services.user_service import get_user_by_id
        from app.models.user_models import UserRole
        
        user = get_user_by_id(current_user_uid)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if UserRole.ADMIN not in user.roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        return current_user_uid
    
    @staticmethod
    def require_mentor_role(current_user_uid: str = Depends(get_current_user_uid)) -> str:
        """
        Dependency that requires mentor role
        """
        from app.services.user_service import get_user_by_id
        from app.models.user_models import UserRole
        
        user = get_user_by_id(current_user_uid)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if UserRole.MENTOR not in user.roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Mentor access required"
            )
        
        return current_user_uid

# Convenience functions for easier imports
get_current_user = AuthService.get_current_user_uid
get_current_user_optional = AuthService.get_current_user_optional
require_admin = AuthService.require_admin_role
require_mentor = AuthService.require_mentor_role