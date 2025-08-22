"""
Metadata service functions for direct AI calls
"""
from typing import List, Dict, Any, Optional
from app.services.firestore import db
from app.routers.metadata import Subject, SubjectsResponse

def get_subjects_service(category: Optional[str] = None, region: Optional[str] = None, limit: Optional[int] = None) -> SubjectsResponse:
    """
    Get subjects from the subjects collection - service layer function for AI calls.
    """
    try:
        subjects_ref = db.collection('subjects')
        
        # Apply filters
        if category:
            subjects_ref = subjects_ref.where('category', '==', category)
        
        if region:
            subjects_ref = subjects_ref.where('region', '==', region)
        
        # Get documents
        subjects_docs = subjects_ref.stream()
        
        subjects_list = []
        for doc in subjects_docs:
            subject_data = doc.to_dict()
            subjects_list.append(Subject(**subject_data))
        
        # Sort by searchBoost (higher boost = more popular/important)
        subjects_list.sort(key=lambda x: x.searchBoost, reverse=True)
        
        # Apply limit if specified
        if limit:
            subjects_list = subjects_list[:limit]
        
        return SubjectsResponse(
            subjects=subjects_list,
            count=len(subjects_list)
        )
        
    except Exception as e:
        print(f"Error fetching subjects: {str(e)}")
        return SubjectsResponse(subjects=[], count=0)

def search_subjects_service(search_query: str, limit: int = 10) -> SubjectsResponse:
    """
    Search subjects by name, synonyms, or related subjects - service layer function for AI calls.
    """
    try:
        subjects_ref = db.collection('subjects')
        all_subjects = subjects_ref.stream()
        
        matching_subjects = []
        search_term = search_query.lower()
        
        for doc in all_subjects:
            subject_data = doc.to_dict()
            
            # Check if search term matches subject name
            if search_term in subject_data.get('subject', '').lower():
                subject_data['relevance_score'] = 3.0  # Exact name match gets highest score
                matching_subjects.append(subject_data)
                continue
            
            # Check synonyms
            synonyms = subject_data.get('synonyms', [])
            for synonym in synonyms:
                if search_term in synonym.lower():
                    subject_data['relevance_score'] = 2.0  # Synonym match
                    matching_subjects.append(subject_data)
                    break
            else:
                # Check related subjects
                related = subject_data.get('relatedSubjects', [])
                for related_subject in related:
                    if search_term in related_subject.lower():
                        subject_data['relevance_score'] = 1.0  # Related match
                        matching_subjects.append(subject_data)
                        break
        
        # Sort by relevance score, then by searchBoost
        matching_subjects.sort(key=lambda x: (x.get('relevance_score', 0), x.get('searchBoost', 0)), reverse=True)
        
        # Convert to Subject models (remove relevance_score)
        subjects_list = []
        for subject_data in matching_subjects[:limit]:
            subject_data.pop('relevance_score', None)
            subjects_list.append(Subject(**subject_data))
        
        return SubjectsResponse(
            subjects=subjects_list,
            count=len(subjects_list)
        )
        
    except Exception as e:
        print(f"Error searching subjects: {str(e)}")
        return SubjectsResponse(subjects=[], count=0)