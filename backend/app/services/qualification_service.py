from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid
from app.services.firestore import db
from app.models.qualification_models import (
    MentorQualification, CreateQualificationRequest, UpdateQualificationRequest,
    VerifyQualificationRequest, QualificationSearchQuery, VerificationStatus,
    MentorQualificationsSummary, QualificationStats
)

class QualificationService:
    def __init__(self):
        self.collection = db.collection('qualifications')
    
    async def create_qualification(self, mentor_id: str, request: CreateQualificationRequest) -> MentorQualification:
        """Create a new qualification for a mentor"""
        qualification_id = str(uuid.uuid4())
        
        qualification_data = {
            'qualificationId': qualification_id,
            'mentorId': mentor_id,
            'title': request.title,
            'description': request.description,
            'issuedBy': request.issuedBy,
            'yearAwarded': request.yearAwarded,
            'proofURL': str(request.proofURL) if request.proofURL else None,
            'isCertified': request.isCertified,
            'verificationStatus': VerificationStatus.PENDING,
            'tags': request.tags or [],
            'verificationNotes': None,
            'verifiedBy': None,
            'verifiedAt': None,
            'createdAt': datetime.utcnow(),
            'updatedAt': datetime.utcnow()
        }
        
        # Use qualification_id as document ID
        doc_ref = self.collection.document(qualification_id)
        doc_ref.set(qualification_data)
        
        return MentorQualification(**qualification_data)
    
    async def get_qualification(self, qualification_id: str) -> Optional[MentorQualification]:
        """Get qualification by ID"""
        doc = self.collection.document(qualification_id).get()
        if doc.exists:
            data = doc.to_dict()
            return MentorQualification(**data)
        return None
    
    async def get_mentor_qualifications(self, mentor_id: str) -> List[MentorQualification]:
        """Get all qualifications for a mentor"""
        query = self.collection.where('mentorId', '==', mentor_id)
        docs = query.stream()
        
        qualifications = []
        for doc in docs:
            data = doc.to_dict()
            qualifications.append(MentorQualification(**data))
        
        # Sort by creation date (newest first)
        qualifications.sort(key=lambda x: x.createdAt or datetime.min, reverse=True)
        return qualifications
    
    async def update_qualification(self, qualification_id: str, request: UpdateQualificationRequest) -> Optional[MentorQualification]:
        """Update qualification details"""
        doc_ref = self.collection.document(qualification_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return None
        
        update_data = {'updatedAt': datetime.utcnow()}
        
        # Only update provided fields
        if request.title is not None:
            update_data['title'] = request.title
        if request.description is not None:
            update_data['description'] = request.description
        if request.issuedBy is not None:
            update_data['issuedBy'] = request.issuedBy
        if request.yearAwarded is not None:
            update_data['yearAwarded'] = request.yearAwarded
        if request.proofURL is not None:
            update_data['proofURL'] = str(request.proofURL)
        if request.isCertified is not None:
            update_data['isCertified'] = request.isCertified
        if request.tags is not None:
            update_data['tags'] = request.tags
        
        doc_ref.update(update_data)
        
        # Get updated document
        updated_doc = doc_ref.get()
        return MentorQualification(**updated_doc.to_dict())
    
    async def verify_qualification(self, qualification_id: str, request: VerifyQualificationRequest, 
                                 verified_by: str) -> Optional[MentorQualification]:
        """Verify or reject a qualification"""
        doc_ref = self.collection.document(qualification_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return None
        
        update_data = {
            'verificationStatus': request.verificationStatus,
            'verificationNotes': request.verificationNotes,
            'verifiedBy': verified_by,
            'verifiedAt': datetime.utcnow(),
            'updatedAt': datetime.utcnow()
        }
        
        doc_ref.update(update_data)
        
        # Get updated document
        updated_doc = doc_ref.get()
        return MentorQualification(**updated_doc.to_dict())
    
    async def delete_qualification(self, qualification_id: str) -> bool:
        """Delete a qualification"""
        doc_ref = self.collection.document(qualification_id)
        if doc_ref.get().exists:
            doc_ref.delete()
            return True
        return False
    
    async def search_qualifications(self, query: QualificationSearchQuery) -> tuple[List[MentorQualification], int]:
        """Search qualifications with filters and pagination"""
        firestore_query = self.collection
        
        # Apply filters
        if query.mentorId:
            firestore_query = firestore_query.where('mentorId', '==', query.mentorId)
        
        if query.verificationStatus:
            firestore_query = firestore_query.where('verificationStatus', '==', query.verificationStatus)
        
        if query.isCertified is not None:
            firestore_query = firestore_query.where('isCertified', '==', query.isCertified)
        
        if query.yearAwarded:
            firestore_query = firestore_query.where('yearAwarded', '==', query.yearAwarded)
        
        # Get all matching documents
        docs = list(firestore_query.stream())
        
        # Apply text search and additional filters in memory
        qualifications = []
        for doc in docs:
            data = doc.to_dict()
            qualification = MentorQualification(**data)
            
            # Text search
            if query.q:
                search_text = f"{qualification.title} {qualification.description or ''} {qualification.issuedBy}".lower()
                if query.q.lower() not in search_text:
                    continue
            
            # Tag filter
            if query.tag and query.tag not in qualification.tags:
                continue
            
            # Institution filter
            if query.issuedBy and query.issuedBy.lower() not in qualification.issuedBy.lower():
                continue
            
            qualifications.append(qualification)
        
        # Sort
        reverse = query.sortOrder == "desc"
        if query.sortBy == "yearAwarded":
            qualifications.sort(key=lambda x: int(x.yearAwarded), reverse=reverse)
        elif query.sortBy == "title":
            qualifications.sort(key=lambda x: x.title.lower(), reverse=reverse)
        else:  # createdAt
            qualifications.sort(key=lambda x: x.createdAt or datetime.min, reverse=reverse)
        
        # Apply pagination
        total = len(qualifications)
        start = (query.page - 1) * query.pageSize
        end = start + query.pageSize
        paginated_qualifications = qualifications[start:end]
        
        return paginated_qualifications, total
    
    async def get_mentor_qualifications_summary(self, mentor_id: str) -> MentorQualificationsSummary:
        """Get summary statistics for mentor's qualifications"""
        qualifications = await self.get_mentor_qualifications(mentor_id)
        
        total_qualifications = len(qualifications)
        verified_count = sum(1 for q in qualifications if q.verificationStatus == VerificationStatus.VERIFIED)
        pending_count = sum(1 for q in qualifications if q.verificationStatus == VerificationStatus.PENDING)
        rejected_count = sum(1 for q in qualifications if q.verificationStatus == VerificationStatus.REJECTED)
        certified_count = sum(1 for q in qualifications if q.isCertified)
        self_declared_count = sum(1 for q in qualifications if not q.isCertified)
        
        latest_qualification = qualifications[0] if qualifications else None
        
        return MentorQualificationsSummary(
            mentorId=mentor_id,
            totalQualifications=total_qualifications,
            verifiedCount=verified_count,
            pendingCount=pending_count,
            rejectedCount=rejected_count,
            certifiedCount=certified_count,
            selfDeclaredCount=self_declared_count,
            latestQualification=latest_qualification
        )
    
    async def bulk_verify_qualifications(self, qualification_ids: List[str], 
                                       verification_status: VerificationStatus,
                                       verification_notes: Optional[str],
                                       verified_by: str) -> List[str]:
        """Bulk verify multiple qualifications"""
        updated_ids = []
        
        for qualification_id in qualification_ids:
            doc_ref = self.collection.document(qualification_id)
            doc = doc_ref.get()
            
            if doc.exists:
                update_data = {
                    'verificationStatus': verification_status,
                    'verificationNotes': verification_notes,
                    'verifiedBy': verified_by,
                    'verifiedAt': datetime.utcnow(),
                    'updatedAt': datetime.utcnow()
                }
                
                doc_ref.update(update_data)
                updated_ids.append(qualification_id)
        
        return updated_ids
    
    async def get_pending_verifications(self, limit: int = 50) -> List[MentorQualification]:
        """Get qualifications pending verification"""
        query = self.collection.where('verificationStatus', '==', VerificationStatus.PENDING).limit(limit)
        docs = query.stream()
        
        qualifications = []
        for doc in docs:
            data = doc.to_dict()
            qualifications.append(MentorQualification(**data))
        
        # Sort by creation date (oldest first for processing)
        qualifications.sort(key=lambda x: x.createdAt or datetime.min)
        return qualifications
    
    async def get_qualification_stats(self) -> QualificationStats:
        """Get overall qualification statistics"""
        docs = list(self.collection.stream())
        
        total_qualifications = len(docs)
        pending_verification = 0
        verified = 0
        rejected = 0
        certified = 0
        self_declared = 0
        institution_counts = {}
        recent_submissions = 0
        
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        for doc in docs:
            data = doc.to_dict()
            
            # Count by verification status
            status = data.get('verificationStatus', VerificationStatus.PENDING)
            if status == VerificationStatus.PENDING:
                pending_verification += 1
            elif status == VerificationStatus.VERIFIED:
                verified += 1
            elif status == VerificationStatus.REJECTED:
                rejected += 1
            
            # Count by certification type
            if data.get('isCertified', False):
                certified += 1
            else:
                self_declared += 1
            
            # Count institutions
            institution = data.get('issuedBy', 'Unknown')
            institution_counts[institution] = institution_counts.get(institution, 0) + 1
            
            # Count recent submissions
            created_at = data.get('createdAt')
            if created_at and isinstance(created_at, datetime) and created_at > thirty_days_ago:
                recent_submissions += 1
        
        # Top institutions
        top_institutions = [
            {"name": name, "count": count}
            for name, count in sorted(institution_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        ]
        
        return QualificationStats(
            totalQualifications=total_qualifications,
            pendingVerification=pending_verification,
            verified=verified,
            rejected=rejected,
            certified=certified,
            selfDeclared=self_declared,
            topInstitutions=top_institutions,
            recentSubmissions=recent_submissions
        )