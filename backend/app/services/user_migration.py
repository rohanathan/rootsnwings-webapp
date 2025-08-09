"""
User data migration utilities to clean up redundant fields and inconsistencies
"""
from app.services.firestore import db
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

def migrate_user_data(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Clean up user data by removing redundant fields and normalizing structure.
    
    This function transforms old user documents to the new clean structure:
    - Removes redundant role tracking fields
    - Normalizes field names  
    - Derives profile flags from roles
    """
    cleaned_data = user_data.copy()
    
    # FIELD REMAPPING
    # Map old field names to new ones
    field_mapping = {
        'accountStatus': 'status',
        'lastLoginAt': 'lastLogin',
        'lastActiveAt': 'lastLogin',  # Merge both into single lastLogin
    }
    
    for old_field, new_field in field_mapping.items():
        if old_field in cleaned_data:
            cleaned_data[new_field] = cleaned_data[old_field]
            del cleaned_data[old_field]
    
    # REDUNDANT FIELD REMOVAL
    # Remove fields that can be derived from roles
    redundant_fields = [
        'userType',           # Use roles instead
        'hasStudentProfile',  # Derive from roles
        'hasParentProfile',   # Derive from roles
        'hasMentorProfile',   # Derive from roles
        'isVerified',         # Use profileComplete instead
        'verificationLevel',  # Simplified to profileComplete
        'lastActiveAt',       # Already merged to lastLogin above
        'title',             # Not needed for MVP
        'mentorStatus',       # Move to mentor profile if needed
        # NOTE: Keep passwordHash - needed for authentication!
    ]
    
    for field in redundant_fields:
        cleaned_data.pop(field, None)
    
    # ENSURE REQUIRED FIELDS EXIST
    # Add profileComplete if missing (derive from existing data)
    if 'profileComplete' not in cleaned_data:
        # Consider profile complete if user has roles and basic info
        has_roles = bool(cleaned_data.get('roles', []))
        has_name = bool(cleaned_data.get('displayName', '').strip())
        has_location = bool(cleaned_data.get('location'))
        cleaned_data['profileComplete'] = has_roles and has_name
    
    # Ensure roles is always a list
    if 'roles' not in cleaned_data:
        cleaned_data['roles'] = []
    
    # Ensure status exists (default to active)
    if 'status' not in cleaned_data:
        cleaned_data['status'] = 'active'
    
    return cleaned_data

def clean_user_response(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Clean user data for API responses using the new clean structure
    """
    return migrate_user_data(user_data)

def migrate_user_document(uid: str) -> bool:
    """
    Migrate a single user document in Firestore to the new clean structure
    """
    try:
        doc_ref = db.collection("users").document(uid)
        doc = doc_ref.get()
        
        if not doc.exists:
            logger.warning(f"User {uid} not found for migration")
            return False
        
        old_data = doc.to_dict()
        cleaned_data = migrate_user_data(old_data)
        
        # Only update if data actually changed
        if cleaned_data != old_data:
            doc_ref.set(cleaned_data)
            logger.info(f"Migrated user {uid}")
            return True
        else:
            logger.info(f"User {uid} already clean, no migration needed")
            return True
            
    except Exception as e:
        logger.error(f"Failed to migrate user {uid}: {str(e)}")
        return False

def migrate_all_users() -> Dict[str, int]:
    """
    Migrate all users in the database to the new clean structure
    """
    results = {"migrated": 0, "skipped": 0, "failed": 0}
    
    try:
        users_ref = db.collection("users")
        docs = users_ref.stream()
        
        for doc in docs:
            uid = doc.id
            try:
                if migrate_user_document(uid):
                    results["migrated"] += 1
                else:
                    results["failed"] += 1
            except Exception as e:
                logger.error(f"Failed to process user {uid}: {str(e)}")
                results["failed"] += 1
        
        logger.info(f"Migration complete: {results}")
        return results
        
    except Exception as e:
        logger.error(f"Failed to migrate users: {str(e)}")
        return results

# Helper functions for checking roles (replacing the removed fields)
def has_student_role(user_data: Dict[str, Any]) -> bool:
    """Check if user has student role"""
    return "student" in user_data.get('roles', [])

def has_parent_role(user_data: Dict[str, Any]) -> bool:
    """Check if user has parent role"""
    return "parent" in user_data.get('roles', [])

def has_mentor_role(user_data: Dict[str, Any]) -> bool:
    """Check if user has mentor role"""
    return "mentor" in user_data.get('roles', [])

def get_primary_role(user_data: Dict[str, Any]) -> Optional[str]:
    """Get user's primary role for UI purposes"""
    roles = user_data.get('roles', [])
    if not roles:
        return None
    
    # Priority order for determining primary role
    role_priority = ["mentor", "parent", "student", "admin"]
    for role in role_priority:
        if role in roles:
            return role
    
    # Return first role if none match priority
    return roles[0] if roles else None