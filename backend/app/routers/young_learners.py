from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from app.models.user_models import (
    YoungLearnerProfile, 
    YoungLearnerProfileCreate, 
    YoungLearnerProfileUpdate,
    YoungLearnerProfileResponse,
    YoungLearnerListResponse
)
from app.services.firestore import db

router = APIRouter(prefix="/young-learners", tags=["Young Learners"])

@router.post("/", response_model=YoungLearnerProfileResponse)
async def create_young_learner(profile: YoungLearnerProfileCreate):
    """Create a new young learner profile"""
    try:
        # Generate unique ID for the young learner
        young_learner_id = f"yl_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{profile.parentUid[-4:]}"
        
        # Create the profile
        young_learner_data = {
            **profile.dict(),
            "createdAt": datetime.now().isoformat(),
            "updatedAt": datetime.now().isoformat()
        }
        
        # Store in young_learner_profiles collection
        db.collection('young_learner_profiles').document(young_learner_id).set(young_learner_data)
        
        # Get the created profile
        created_profile = db.collection('young_learner_profiles').document(young_learner_id).get().to_dict()
        created_profile['id'] = young_learner_id
        
        return YoungLearnerProfileResponse(
            success=True,
            profile=YoungLearnerProfile(**created_profile)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create young learner profile: {str(e)}")

@router.get("/{young_learner_id}", response_model=YoungLearnerProfileResponse)
async def get_young_learner(young_learner_id: str):
    """Get a specific young learner profile"""
    try:
        doc = db.collection('young_learner_profiles').document(young_learner_id).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Young learner profile not found")
        
        profile_data = doc.to_dict()
        profile_data['id'] = young_learner_id
        
        return YoungLearnerProfileResponse(
            success=True,
            profile=YoungLearnerProfile(**profile_data)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get young learner profile: {str(e)}")

@router.get("/parent/{parent_uid}", response_model=YoungLearnerListResponse)
async def get_young_learners_by_parent(parent_uid: str):
    """Get all young learners for a specific parent"""
    try:
        # Query young learners by parentUid
        docs = db.collection('young_learner_profiles').where('parentUid', '==', parent_uid).stream()
        
        profiles = []
        for doc in docs:
            profile_data = doc.to_dict()
            profile_data['id'] = doc.id
            profiles.append(YoungLearnerProfile(**profile_data))
        
        return YoungLearnerListResponse(
            success=True,
            profiles=profiles
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get young learners: {str(e)}")

@router.put("/{young_learner_id}", response_model=YoungLearnerProfileResponse)
async def update_young_learner(young_learner_id: str, profile: YoungLearnerProfileUpdate):
    """Update a young learner profile"""
    try:
        doc_ref = db.collection('young_learner_profiles').document(young_learner_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Young learner profile not found")
        
        # Get existing profile data
        existing_profile = doc.to_dict()
        
        # Update only provided fields
        update_data = profile.dict(exclude_unset=True)
        update_data['updatedAt'] = datetime.now().isoformat()
        
        # Merge with existing data
        merged_data = {**existing_profile, **update_data}
        
        # Update the document
        doc_ref.set(merged_data)
        
        # Get updated profile
        updated_profile = doc_ref.get().to_dict()
        updated_profile['id'] = young_learner_id
        
        return YoungLearnerProfileResponse(
            success=True,
            profile=YoungLearnerProfile(**updated_profile)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update young learner profile: {str(e)}")

@router.delete("/{young_learner_id}")
async def delete_young_learner(young_learner_id: str):
    """Delete a young learner profile"""
    try:
        doc_ref = db.collection('young_learner_profiles').document(young_learner_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Young learner profile not found")
        
        # Delete the document
        doc_ref.delete()
        
        return {"success": True, "message": "Young learner profile deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete young learner profile: {str(e)}")

@router.get("/", response_model=YoungLearnerListResponse)
async def list_young_learners(
    parent_uid: Optional[str] = Query(None, description="Filter by parent UID"),
    limit: int = Query(50, description="Maximum number of profiles to return")
):
    """List young learner profiles with optional filtering"""
    try:
        query = db.collection('young_learner_profiles')
        
        # Apply parent filter if provided
        if parent_uid:
            query = query.where('parentUid', '==', parent_uid)
        
        # Limit results
        query = query.limit(limit)
        
        # Execute query
        docs = query.stream()
        
        profiles = []
        for doc in docs:
            profile_data = doc.to_dict()
            profile_data['id'] = doc.id
            profiles.append(YoungLearnerProfile(**profile_data))
        
        return YoungLearnerListResponse(
            success=True,
            profiles=profiles
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list young learners: {str(e)}")
