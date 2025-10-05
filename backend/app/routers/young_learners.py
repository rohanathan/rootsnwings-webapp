from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional, Dict, Any
from datetime import datetime
from app.models.user_models import (
    YoungLearnerProfile, 
    YoungLearnerProfileCreate, 
    YoungLearnerProfileUpdate,
    YoungLearnerProfileResponse,
    YoungLearnerListResponse
)
from app.services.firestore import db
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/young-learners", tags=["Young Learners"])

@router.post("/", response_model=YoungLearnerProfileResponse)
async def create_young_learner(
    young_learner_data: dict,
    current_user_uid: str = Depends(get_current_user)
):
    """Create a new young learner profile with complete flexibility"""
    try:
        # Generate unique IDs for the young learner
        young_learner_id = f"yl_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{current_user_uid[-4:]}"
        
        # Add system fields
        profile_data = {
            **young_learner_data,
            "parentUid": current_user_uid,  # Ensure parent is current user
            "createdAt": datetime.now().isoformat(),
            "updatedAt": datetime.now().isoformat()
        }
        
        # Store in young_learner_profiles collection
        db.collection('young_learner_profiles').document(young_learner_id).set(profile_data)
        
        # Get the created profile
        created_profile = db.collection('young_learner_profiles').document(young_learner_id).get().to_dict()
        created_profile['id'] = young_learner_id
        
        return YoungLearnerProfileResponse(
            success=True,
            profile=created_profile
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create young learner profile: {str(e)}")

@router.get("", response_model=YoungLearnerListResponse)
@router.get("/", response_model=YoungLearnerListResponse)
async def get_young_learners(
    young_learner_id: Optional[str] = Query(None, description="Get specific young learner by ID"),
    parent_uid: Optional[str] = Query(None, description="Filter by parent UID"),
    limit: int = Query(50, description="Maximum number of profiles to return"),
    current_user_uid: str = Depends(get_current_user)
):
    """Universal getter - handles both individual young learner and filtered lists"""
    try:
        # If specific young learner ID requested
        if young_learner_id:
            doc = db.collection('young_learner_profiles').document(young_learner_id).get()
            if not doc.exists:
                raise HTTPException(status_code=404, detail="Young learner profile not found")
            
            profile_data = doc.to_dict()
            profile_data['id'] = young_learner_id
            
            # Security: Only allow parent to access their own children
            if profile_data.get('parentUid') != current_user_uid:
                raise HTTPException(status_code=403, detail="Access denied - not your child")
            
            return YoungLearnerListResponse(
                success=True,
                profiles=[profile_data]
            )
        
        # Otherwise, return filtered list
        query = db.collection('young_learner_profiles')
        
        # Security: Always filter by current user as parent unless admin access
        if not parent_uid:
            parent_uid = current_user_uid
        elif parent_uid != current_user_uid:
            # Only allow parents to see their own children
            raise HTTPException(status_code=403, detail="Access denied - can only view your own children")
            
        query = query.where('parentUid', '==', parent_uid)
        query = query.limit(limit)
        
        docs = query.stream()
        profiles = []
        for doc in docs:
            profile_data = doc.to_dict()
            profile_data['id'] = doc.id
            profiles.append(profile_data)
        
        return YoungLearnerListResponse(
            success=True,
            profiles=profiles
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get young learners: {str(e)}")

@router.put("/{young_learner_id}", response_model=YoungLearnerProfileResponse)
async def update_young_learner(
    young_learner_id: str,
    update_data: dict,
    delete_profile: Optional[bool] = Query(False, description="Delete the young learner profile"),
    current_user_uid: str = Depends(get_current_user)
):
    """Universal updater - handles updates and deletions with complete flexibility"""
    try:
        doc_ref = db.collection('young_learner_profiles').document(young_learner_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Young learner profile not found")
        
        existing_profile = doc.to_dict()
        
        # Security: Only allow parent to modify their own children
        if existing_profile.get('parentUid') != current_user_uid:
            raise HTTPException(status_code=403, detail="Access denied - not your child")
        
        # Handle deletion
        if delete_profile:
            doc_ref.delete()
            return {
                "success": True, 
                "message": "Young learner profile deleted successfully",
                "profile": None
            }
        
        # Handle updates
        update_data['updatedAt'] = datetime.now().isoformat()
        
        # Merge with existing data (MongoDB-style flexibility)
        merged_data = {**existing_profile, **update_data}
        doc_ref.set(merged_data)
        
        # Get updated profile
        updated_profile = doc_ref.get().to_dict()
        updated_profile['id'] = young_learner_id
        
        return YoungLearnerProfileResponse(
            success=True,
            profile=updated_profile
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update young learner profile: {str(e)}")
