from pydantic import BaseModel, Field, HttpUrl, validator
from typing import List, Optional
from datetime import datetime
from enum import Enum

class VerificationStatus(str, Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"

class MentorQualification(BaseModel):
    qualificationId: Optional[str] = Field(None, description="Auto-generated qualification ID")
    mentorId: str = Field(..., description="Mentor's UID")
    title: str = Field(..., description="Name of the qualification (e.g. BA in Dance, RYT-200)")
    description: Optional[str] = Field(None, description="Brief summary of the qualification")
    issuedBy: str = Field(..., description="Institution or Organization")
    yearAwarded: str = Field(..., description="Year of award (e.g. 2020)")
    proofURL: Optional[HttpUrl] = Field(None, description="Link to certificate image or PDF")
    isCertified: bool = Field(..., description="True if officially certified, false if self-declared")
    verificationStatus: VerificationStatus = Field(VerificationStatus.PENDING, description="Verification status")
    tags: Optional[List[str]] = Field(default_factory=list, description="Search tags (e.g. classical, certified, yoga, university)")
    verificationNotes: Optional[str] = Field(None, description="Admin notes on verification")
    verifiedBy: Optional[str] = Field(None, description="Admin who verified")
    verifiedAt: Optional[datetime] = Field(None, description="Verification timestamp")
    createdAt: Optional[datetime] = Field(None, description="Creation timestamp")
    updatedAt: Optional[datetime] = Field(None, description="Last update timestamp")
    
    @validator('yearAwarded')
    def validate_year(cls, v):
        try:
            year = int(v)
            if year < 1900 or year > datetime.now().year + 1:
                raise ValueError('Year must be between 1900 and next year')
            return v
        except ValueError:
            raise ValueError('Year must be a valid number')

class CreateQualificationRequest(BaseModel):
    title: str = Field(..., description="Name of the qualification")
    description: Optional[str] = Field(None, description="Brief summary of the qualification")
    issuedBy: str = Field(..., description="Institution or Organization")
    yearAwarded: str = Field(..., description="Year of award")
    proofURL: Optional[HttpUrl] = Field(None, description="Link to certificate image or PDF")
    isCertified: bool = Field(..., description="True if officially certified, false if self-declared")
    tags: Optional[List[str]] = Field(default_factory=list, description="Search tags")

class UpdateQualificationRequest(BaseModel):
    title: Optional[str] = Field(None, description="Name of the qualification")
    description: Optional[str] = Field(None, description="Brief summary of the qualification")
    issuedBy: Optional[str] = Field(None, description="Institution or Organization")
    yearAwarded: Optional[str] = Field(None, description="Year of award")
    proofURL: Optional[HttpUrl] = Field(None, description="Link to certificate image or PDF")
    isCertified: Optional[bool] = Field(None, description="True if officially certified, false if self-declared")
    tags: Optional[List[str]] = Field(None, description="Search tags")

class VerifyQualificationRequest(BaseModel):
    verificationStatus: VerificationStatus = Field(..., description="New verification status")
    verificationNotes: Optional[str] = Field(None, description="Admin notes on verification")

class QualificationResponse(BaseModel):
    qualification: MentorQualification

class QualificationListResponse(BaseModel):
    qualifications: List[MentorQualification]
    total: int
    page: int = 1
    pageSize: int = 20
    totalPages: int

class QualificationSearchQuery(BaseModel):
    mentorId: Optional[str] = Field(None, description="Filter by mentor")
    verificationStatus: Optional[VerificationStatus] = Field(None, description="Filter by verification status")
    isCertified: Optional[bool] = Field(None, description="Filter by certification type")
    issuedBy: Optional[str] = Field(None, description="Filter by issuing organization")
    yearAwarded: Optional[str] = Field(None, description="Filter by year")
    tag: Optional[str] = Field(None, description="Filter by tag")
    q: Optional[str] = Field(None, description="Search in title, description, issuedBy")
    sortBy: Optional[str] = Field("createdAt", description="Sort field: createdAt, yearAwarded, title")
    sortOrder: Optional[str] = Field("desc", description="Sort order: asc or desc")
    page: int = Field(1, ge=1, description="Page number")
    pageSize: int = Field(20, ge=1, le=100, description="Items per page")

class MentorQualificationsSummary(BaseModel):
    mentorId: str
    totalQualifications: int
    verifiedCount: int
    pendingCount: int
    rejectedCount: int
    certifiedCount: int
    selfDeclaredCount: int
    latestQualification: Optional[MentorQualification] = None

class BulkVerificationRequest(BaseModel):
    qualificationIds: List[str] = Field(..., description="List of qualification IDs to verify")
    verificationStatus: VerificationStatus = Field(..., description="New verification status for all")
    verificationNotes: Optional[str] = Field(None, description="Notes for all qualifications")

class QualificationStats(BaseModel):
    totalQualifications: int
    pendingVerification: int
    verified: int
    rejected: int
    certified: int
    selfDeclared: int
    topInstitutions: List[dict]  # [{"name": "University of Arts", "count": 15}]
    recentSubmissions: int  # last 30 days