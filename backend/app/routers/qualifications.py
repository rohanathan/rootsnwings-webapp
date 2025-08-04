from fastapi import APIRouter, HTTPException, Depends, status, Query
from typing import List, Optional
from app.models.qualification_models import (
    MentorQualification, QualificationResponse, QualificationListResponse,
    CreateQualificationRequest, UpdateQualificationRequest, VerifyQualificationRequest,
    QualificationSearchQuery, MentorQualificationsSummary, QualificationStats,
    BulkVerificationRequest, VerificationStatus
)
from app.services.qualification_service import QualificationService
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/qualifications", tags=["qualifications"])
qualification_service = QualificationService()

@router.post("/mentors/{mentor_id}", response_model=QualificationResponse, status_code=status.HTTP_201_CREATED)
async def create_qualification(
    mentor_id: str,
    request: CreateQualificationRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create a new qualification for a mentor"""
    # Verify user is the mentor or admin
    if current_user.get('uid') != mentor_id and not current_user.get('isAdmin', False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to manage this mentor's qualifications"
        )
    
    try:
        qualification = await qualification_service.create_qualification(mentor_id, request)
        return QualificationResponse(qualification=qualification)
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create qualification: {str(e)}"
        )

@router.post("/mentors/{mentor_id}/test", response_model=QualificationResponse, status_code=status.HTTP_201_CREATED)
async def create_qualification_test(
    mentor_id: str,
    request: CreateQualificationRequest
):
    """Create a new qualification for a mentor (test endpoint)"""
    try:
        qualification = await qualification_service.create_qualification(mentor_id, request)
        return QualificationResponse(qualification=qualification)
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create qualification: {str(e)}"
        )

@router.get("/{qualification_id}", response_model=QualificationResponse)
async def get_qualification(qualification_id: str):
    """Get qualification by ID"""
    qualification = await qualification_service.get_qualification(qualification_id)
    
    if not qualification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Qualification not found"
        )
    
    return QualificationResponse(qualification=qualification)

@router.get("/mentors/{mentor_id}/list", response_model=List[MentorQualification])
async def get_mentor_qualifications(mentor_id: str):
    """Get all qualifications for a mentor"""
    qualifications = await qualification_service.get_mentor_qualifications(mentor_id)
    return qualifications

@router.get("/mentors/{mentor_id}/summary", response_model=MentorQualificationsSummary)
async def get_mentor_qualifications_summary(mentor_id: str):
    """Get qualification summary statistics for a mentor"""
    summary = await qualification_service.get_mentor_qualifications_summary(mentor_id)
    return summary

@router.put("/{qualification_id}", response_model=QualificationResponse)
async def update_qualification(
    qualification_id: str,
    request: UpdateQualificationRequest,
    current_user: dict = Depends(get_current_user)
):
    """Update qualification details"""
    # Get qualification to check mentor ownership
    qualification = await qualification_service.get_qualification(qualification_id)
    if not qualification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Qualification not found"
        )
    
    # Verify user is the mentor or admin
    if current_user.get('uid') != qualification.mentorId and not current_user.get('isAdmin', False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this qualification"
        )
    
    updated_qualification = await qualification_service.update_qualification(qualification_id, request)
    
    if not updated_qualification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Qualification not found"
        )
    
    return QualificationResponse(qualification=updated_qualification)

@router.post("/{qualification_id}/verify/test", response_model=QualificationResponse)
async def verify_qualification_test(
    qualification_id: str,
    request: VerifyQualificationRequest
):
    """Verify or reject a qualification (test endpoint)"""
    verified_qualification = await qualification_service.verify_qualification(
        qualification_id, request, "test_admin"
    )
    
    if not verified_qualification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Qualification not found"
        )
    
    return QualificationResponse(qualification=verified_qualification)

@router.post("/{qualification_id}/verify", response_model=QualificationResponse)
async def verify_qualification(
    qualification_id: str,
    request: VerifyQualificationRequest,
    current_user: dict = Depends(get_current_user)
):
    """Verify or reject a qualification (admin only)"""
    # Verify user is admin
    if not current_user.get('isAdmin', False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can verify qualifications"
        )
    
    verified_qualification = await qualification_service.verify_qualification(
        qualification_id, request, current_user.get('uid')
    )
    
    if not verified_qualification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Qualification not found"
        )
    
    return QualificationResponse(qualification=verified_qualification)

@router.delete("/{qualification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_qualification(
    qualification_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a qualification"""
    # Get qualification to check mentor ownership
    qualification = await qualification_service.get_qualification(qualification_id)
    if not qualification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Qualification not found"
        )
    
    # Verify user is the mentor or admin
    if current_user.get('uid') != qualification.mentorId and not current_user.get('isAdmin', False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this qualification"
        )
    
    success = await qualification_service.delete_qualification(qualification_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Qualification not found"
        )

@router.get("/", response_model=QualificationListResponse)
async def search_qualifications(
    mentor_id: Optional[str] = Query(None, description="Filter by mentor"),
    verification_status: Optional[VerificationStatus] = Query(None, description="Filter by verification status"),
    is_certified: Optional[bool] = Query(None, description="Filter by certification type"),
    issued_by: Optional[str] = Query(None, description="Filter by issuing organization"),
    year_awarded: Optional[str] = Query(None, description="Filter by year"),
    tag: Optional[str] = Query(None, description="Filter by tag"),
    q: Optional[str] = Query(None, description="Search in title, description, issuedBy"),
    sort_by: Optional[str] = Query("createdAt", description="Sort field"),
    sort_order: Optional[str] = Query("desc", description="Sort order"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page")
):
    """Search qualifications with filters and pagination"""
    query = QualificationSearchQuery(
        mentorId=mentor_id,
        verificationStatus=verification_status,
        isCertified=is_certified,
        issuedBy=issued_by,
        yearAwarded=year_awarded,
        tag=tag,
        q=q,
        sortBy=sort_by,
        sortOrder=sort_order,
        page=page,
        pageSize=page_size
    )
    
    qualifications, total = await qualification_service.search_qualifications(query)
    total_pages = (total + page_size - 1) // page_size
    
    return QualificationListResponse(
        qualifications=qualifications,
        total=total,
        page=page,
        pageSize=page_size,
        totalPages=total_pages
    )

@router.get("/admin/pending", response_model=List[MentorQualification])
async def get_pending_verifications(
    limit: int = Query(50, ge=1, le=100, description="Number of items to return"),
    current_user: dict = Depends(get_current_user)
):
    """Get qualifications pending verification (admin only)"""
    if not current_user.get('isAdmin', False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can access pending verifications"
        )
    
    qualifications = await qualification_service.get_pending_verifications(limit)
    return qualifications

@router.post("/admin/bulk-verify", response_model=dict)
async def bulk_verify_qualifications(
    request: BulkVerificationRequest,
    current_user: dict = Depends(get_current_user)
):
    """Bulk verify multiple qualifications (admin only)"""
    if not current_user.get('isAdmin', False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can bulk verify qualifications"
        )
    
    updated_ids = await qualification_service.bulk_verify_qualifications(
        request.qualificationIds,
        request.verificationStatus,
        request.verificationNotes,
        current_user.get('uid')
    )
    
    return {
        "message": f"Successfully updated {len(updated_ids)} qualifications",
        "updatedIds": updated_ids,
        "requestedIds": request.qualificationIds,
        "notFound": list(set(request.qualificationIds) - set(updated_ids))
    }

@router.get("/admin/stats", response_model=QualificationStats)
async def get_qualification_stats(
    current_user: dict = Depends(get_current_user)
):
    """Get overall qualification statistics (admin only)"""
    if not current_user.get('isAdmin', False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can access qualification statistics"
        )
    
    stats = await qualification_service.get_qualification_stats()
    return stats