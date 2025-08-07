from app.services.firestore import db
from datetime import datetime
from app.models.mentor_models import Mentor, MentorStats, MentorSearchQuery
from fastapi import HTTPException
from typing import List, Tuple
import re

def search_mentors(query: MentorSearchQuery) -> Tuple[List[Mentor], int]:
    """
    Search mentors with advanced filtering, sorting, and pagination
    """
    try:
        # Start with base query - only active mentors
        # base_query = db.collection("mentors").where("status", "==", "active")  # COMMENTED OUT
        base_query = db.collection("mentors")  # NO STATUS FILTER for testing
        
        # Apply filters
        filters = []
        
        if query.category:
            filters.append(("category", "==", query.category))
        
        if query.city:
            filters.append(("city", "==", query.city))
            
        if query.country:
            filters.append(("country", "==", query.country))
            
        if query.isVerified is not None:
            filters.append(("isVerified", "==", query.isVerified))
            
        if query.acceptingStudents is not None:
            filters.append(("acceptingNewStudents", "==", query.acceptingStudents))
            
        if query.minRating:
            filters.append(("stats.avgRating", ">=", query.minRating))
        
        # Apply basic filters to query
        current_query = base_query
        for field, op, value in filters:
            current_query = current_query.where(field, op, value)
        
        # Get all documents (we'll do complex filtering in Python)
        docs = list(current_query.stream())
        
        # Convert to mentor objects and apply complex filters
        mentors = []
        for doc in docs:
            data = doc.to_dict()
            data["uid"] = doc.id
            
            # Apply array-based filters
            if query.teachingMode and query.teachingMode not in data.get("teachingModes", []):
                continue
                
            if query.teachingLevel and query.teachingLevel not in data.get("teachingLevels", []):
                continue
                
            if query.ageGroup and query.ageGroup not in data.get("ageGroups", []):
                continue
                
            if query.language and query.language not in data.get("languages", []):
                continue
                
            # Apply rate filter
            if query.maxRate:
                pricing = data.get("pricing", {})
                if pricing.get("oneOnOneRate", 0) > query.maxRate:
                    continue
            
            # Apply text search
            if query.q:
                search_text = query.q.lower()
                searchable_fields = [
                    data.get("displayName", ""),
                    data.get("headline", ""),
                    data.get("bio", ""),
                    " ".join(data.get("searchKeywords", []))
                ]
                searchable_content = " ".join(searchable_fields).lower()
                if search_text not in searchable_content:
                    continue
            
            try:
                mentor = Mentor(**data)
                mentors.append(mentor)
            except Exception as e:
                # Skip invalid mentor data
                continue
        
        # Sort mentors
        if query.sortBy == "avgRating":
            mentors.sort(key=lambda m: m.stats.avgRating if m.stats else 0, 
                        reverse=(query.sortOrder == "desc"))
        elif query.sortBy == "totalReviews":
            mentors.sort(key=lambda m: m.stats.totalReviews if m.stats else 0, 
                        reverse=(query.sortOrder == "desc"))
        elif query.sortBy == "oneOnOneRate":
            mentors.sort(key=lambda m: m.pricing.oneOnOneRate if m.pricing else 0, 
                        reverse=(query.sortOrder == "desc"))
        elif query.sortBy == "createdAt":
            mentors.sort(key=lambda m: m.createdAt or "", 
                        reverse=(query.sortOrder == "desc"))
        
        # Get total count
        total = len(mentors)
        
        # Apply pagination
        start_idx = (query.page - 1) * query.pageSize
        end_idx = start_idx + query.pageSize
        paginated_mentors = mentors[start_idx:end_idx]
        
        return paginated_mentors, total
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to search mentors: {str(e)}")

def fetch_all_mentors(page: int = 1, page_size: int = 20) -> Tuple[List[Mentor], int]:
    """Get all approved mentors with pagination"""
    query = MentorSearchQuery(page=page, pageSize=page_size, sortBy="createdAt")
    return search_mentors(query)

def fetch_featured_mentors(limit: int = 6) -> List[Mentor]:
    """Get featured mentors based on performance score"""
    try:
        # docs = db.collection("mentors").where("status", "==", "active").stream()  # COMMENTED OUT
        docs = db.collection("mentors").stream()  # NO STATUS FILTER for testing
        mentor_scores = []
        
        for doc in docs:
            data = doc.to_dict()
            data["uid"] = doc.id
            
            try:
                mentor = Mentor(**data)
                stats = mentor.stats or MentorStats()
                
                # Calculate performance score
                score = (
                    stats.avgRating * 3 +
                    stats.repeatStudentRate * 2 +
                    stats.totalStudents * 0.1 +
                    stats.totalSessions * 0.05 -
                    stats.responseTimeMinutes * 0.001
                )
                
                mentor_scores.append((score, mentor))
            except Exception:
                # Skip invalid mentor data
                continue
        
        # Sort by score and return top mentors
        mentor_scores.sort(reverse=True, key=lambda x: x[0])
        return [m[1] for m in mentor_scores[:limit]]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch featured mentors: {str(e)}")

def fetch_mentor_by_id(mentor_id: str) -> Mentor:
    """Get mentor by ID"""
    try:
        doc = db.collection("mentors").document(mentor_id).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Mentor not found")
        
        data = doc.to_dict()
        data["uid"] = doc.id
        
        return Mentor(**data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch mentor: {str(e)}")

def get_mentor_categories() -> List[str]:
    """Get list of all mentor categories"""
    try:
        # docs = db.collection("mentors").where("status", "==", "active").stream()  # COMMENTED OUT
        docs = db.collection("mentors").stream()  # NO STATUS FILTER for testing
        categories = set()
        
        for doc in docs:
            data = doc.to_dict()
            category = data.get("category")
            if category:
                categories.add(category)
        
        return sorted(list(categories))
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch categories: {str(e)}")

def get_mentor_cities() -> List[str]:
    """Get list of all mentor cities"""
    try:
        # docs = db.collection("mentors").where("status", "==", "active").stream()  # COMMENTED OUT
        docs = db.collection("mentors").stream()  # NO STATUS FILTER for testing
        cities = set()
        
        for doc in docs:
            data = doc.to_dict()
            city = data.get("city")
            if city:
                cities.add(city)
        
        return sorted(list(cities))
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch cities: {str(e)}")

def update_mentor(mentor_id: str, mentor_data: dict) -> dict:
    """Update mentor profile with any fields provided"""
    try:
        # Get existing mentor
        mentor_doc = db.collection("mentors").document(mentor_id).get()
        if not mentor_doc.exists:
            raise HTTPException(status_code=404, detail="Mentor not found")
        
        existing_data = mentor_doc.to_dict()
        
        # Update with new data (merge strategy)
        updated_data = {**existing_data, **mentor_data}
        updated_data["updatedAt"] = datetime.now().isoformat()
        
        # Save to Firestore
        db.collection("mentors").document(mentor_id).set(updated_data)
        
        return updated_data
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update mentor: {str(e)}")
