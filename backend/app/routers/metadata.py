"""
Metadata endpoints for subjects, categories, and regions
"""
from fastapi import APIRouter, Query
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.services.firestore import db

router = APIRouter(
    prefix="/metadata",
    tags=["Metadata"]
)

class Subject(BaseModel):
    # === CORE FIELDS ===
    subjectId: str
    subject: str
    category: str
    region: str
    synonyms: List[str]
    relatedSubjects: List[str]
    searchBoost: float
    
    # === CULTURAL TAXONOMY FIELDS ===
    tradition_or_school: Optional[str] = None  # e.g. "Bharatanatyam"
    heritage_context: Optional[str] = "folk"  # "intangible_heritage", "folk", "classical", "community_practice", "modern_fusion"
    materials_used: Optional[List[str]] = []  # ["tabla", "harmonium"]
    language_of_instruction: Optional[List[str]] = ["English"]  # Languages available
    cultural_context_provided: Optional[bool] = True  # Whether cultural significance is explained
    age_appropriateness_min: Optional[int] = 5  # Minimum recommended age
    age_appropriateness_max: Optional[int] = 99  # Maximum recommended age (99 = no limit)
    prerequisite_skills: Optional[List[str]] = []  # ["basic drawing", "rhythm awareness"]
    cultural_authenticity_score: Optional[float] = 0.5  # 0.0-1.0 (0=modern interpretation, 1=traditional)
    cultural_significance_level: Optional[float] = 0.5  # 0.0-1.0 importance level
    is_culturally_rooted: Optional[bool] = False  # Whether rooted in specific traditions
    cultural_keywords: Optional[List[str]] = []  # ["traditional", "heritage", "ceremonial"]

class SubjectsResponse(BaseModel):
    subjects: List[Subject]
    count: int

class CategoriesResponse(BaseModel):
    categories: List[Dict[str, Any]]
    count: int

class RegionsResponse(BaseModel):
    regions: List[str]
    count: int

@router.get("/subjects", response_model=SubjectsResponse)
def get_subjects(
    category: Optional[str] = Query(None, description="Filter by category (e.g., visual_arts)"),
    region: Optional[str] = Query(None, description="Filter by region (e.g., UK, Worldwide)"),
    limit: Optional[int] = Query(None, description="Limit number of results")
):
    """
    Get subjects from the subjects collection.
    
    Query parameters:
    - category: Filter by category (visual_arts, culinary_arts, etc.)
    - region: Filter by region (UK, US, Worldwide, etc.)
    - limit: Limit number of results returned
    
    Returns subjects with synonyms, related subjects, and search boost for ranking.
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

@router.get("/subjects/search", response_model=SubjectsResponse)
def search_subjects(
    q: str = Query(..., description="Search query"),
    limit: Optional[int] = Query(10, description="Limit number of results")
):
    """
    Search subjects by name, synonyms, or related subjects.
    
    Searches in:
    - subject name
    - synonyms array
    - related subjects
    
    Returns results sorted by searchBoost and relevance.
    """
    try:
        subjects_ref = db.collection('subjects')
        all_subjects = subjects_ref.stream()
        
        matching_subjects = []
        search_term = q.lower()
        
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

@router.get("/categories", response_model=CategoriesResponse)
def get_categories():
    """
    Get all unique categories from subjects collection.
    
    Returns categories with count of subjects in each category.
    """
    try:
        subjects_ref = db.collection('subjects')
        subjects_docs = subjects_ref.stream()
        
        category_count = {}
        
        for doc in subjects_docs:
            subject_data = doc.to_dict()
            category = subject_data.get('category', 'other')
            
            if category not in category_count:
                category_count[category] = {
                    'categoryId': category,
                    'categoryName': category.replace('_', ' ').title(),
                    'subjectCount': 0
                }
            category_count[category]['subjectCount'] += 1
        
        # Convert to list and sort by subject count
        categories_list = list(category_count.values())
        categories_list.sort(key=lambda x: x['subjectCount'], reverse=True)
        
        return CategoriesResponse(
            categories=categories_list,
            count=len(categories_list)
        )
        
    except Exception as e:
        print(f"Error fetching categories: {str(e)}")
        return CategoriesResponse(categories=[], count=0)

@router.get("/regions", response_model=RegionsResponse)
def get_regions():
    """
    Get all unique regions from subjects collection.
    
    Useful for filtering subjects by geographical availability.
    """
    try:
        subjects_ref = db.collection('subjects')
        subjects_docs = subjects_ref.stream()
        
        regions = set()
        
        for doc in subjects_docs:
            subject_data = doc.to_dict()
            region = subject_data.get('region')
            if region:
                regions.add(region)
        
        regions_list = sorted(list(regions))
        
        return RegionsResponse(
            regions=regions_list,
            count=len(regions_list)
        )
        
    except Exception as e:
        print(f"Error fetching regions: {str(e)}")
        return RegionsResponse(regions=[], count=0)

@router.get("/subjects/{subject_id}")
def get_subject_details(subject_id: str):
    """
    Get detailed information about a specific subject.
    
    Returns subject with all metadata including synonyms and related subjects.
    """
    try:
        subject_doc = db.collection('subjects').document(subject_id).get()
        
        if not subject_doc.exists:
            return {"error": "Subject not found"}
        
        subject_data = subject_doc.to_dict()
        return {"subject": Subject(**subject_data)}
        
    except Exception as e:
        print(f"Error fetching subject details: {str(e)}")
        return {"error": "Failed to fetch subject details"}