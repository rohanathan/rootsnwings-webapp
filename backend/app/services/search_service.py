from app.services.firestore import db
from app.models.search_models import UnifiedSearchQuery, SearchResult, UnifiedSearchResponse
from app.models.mentor_models import Mentor, MentorSearchQuery
from app.models.class_models import ClassItem, ClassSearchQuery
from app.services.mentor_service import search_mentors
from app.services.class_service import search_classes
from app.services.cultural_ranking_service import culturally_aware_ranking
from typing import List, Tuple
from fastapi import HTTPException
import re

def unified_search(query: UnifiedSearchQuery) -> Tuple[List[SearchResult], dict]:
    """
    Unified search across mentors and classes with intelligent ranking
    """
    try:
        search_results = []
        mentor_count = 0
        class_count = 0
        
        # Search mentors if not filtered to classes only
        if not query.type or query.type == "mentor":
            mentor_query = MentorSearchQuery(
                q=query.q,
                category=query.category,
                city=query.city,
                country=query.country,
                minRating=query.minRating,
                maxRate=query.maxPrice,
                isVerified=query.isVerified,
                sortBy="avgRating",
                sortOrder="desc",
                page=1,
                pageSize=100  # Get more results for unified ranking
            )
            
            mentors, total_mentors = search_mentors(mentor_query)
            mentor_count = total_mentors
            
            # Convert mentors to unified search results
            for mentor in mentors:
                # Calculate price (use one-on-one rate as primary price)
                price = None
                if mentor.pricing:
                    price = mentor.pricing.oneOnOneRate
                
                # Format location string
                location = f"{mentor.city}, {mentor.country}"
                
                search_result = {
                    "type": "mentor",
                    "id": mentor.uid,
                    "title": mentor.displayName,
                    "description": mentor.headline or mentor.bio,
                    "category": mentor.category,
                    "rating": mentor.stats.avgRating if mentor.stats else None,
                    "price": price,
                    "location": location,
                    "imageUrl": mentor.photoURL,
                    "tags": mentor.searchKeywords,
                    "data": mentor
                }
                
                search_results.append(search_result)
        
        # Search classes if not filtered to mentors only
        if not query.type or query.type == "class":
            class_query = ClassSearchQuery(
                q=query.q,
                category=query.category,
                city=query.city,
                country=query.country,
                minRating=query.minRating,
                maxPrice=query.maxPrice,
                format="online" if query.isOnline else None,
                sortBy="createdAt",
                sortOrder="desc",
                page=1,
                pageSize=100  # Get more results for unified ranking
            )
            
            classes, total_classes = search_classes(class_query)
            class_count = total_classes
            
            # Convert classes to unified search results
            for class_item in classes:
                # Calculate price
                price = None
                if class_item.pricing:
                    price = class_item.pricing.perSessionRate
                
                # Format location string
                location = "Online" if class_item.format == "online" else class_item.format
                
                search_result = {
                    "type": "class",
                    "id": class_item.classId,
                    "title": class_item.title,
                    "description": class_item.description,
                    "category": class_item.category,
                    "rating": class_item.mentorRating,
                    "price": price,
                    "location": location,
                    "imageUrl": class_item.mentorPhotoURL,
                    "tags": [class_item.subject] if class_item.subject else [],
                    "data": class_item
                }
                
                search_results.append(search_result)
        
        # Apply intelligent cultural ranking
        search_results = culturally_aware_ranking(query.q, search_results)
        
        # Apply unified filtering
        filtered_results = apply_unified_filters(search_results, query)
        
        # Sort results
        sorted_results = sort_unified_results(filtered_results, query.sortBy, query.sortOrder)
        
        # Apply pagination
        total = len(sorted_results)
        start_idx = (query.page - 1) * query.pageSize
        end_idx = start_idx + query.pageSize
        paginated_results = sorted_results[start_idx:end_idx]
        
        # Convert back to SearchResult objects and clean internal scoring
        final_results = []
        for result_dict in paginated_results:
            # Remove internal scoring fields
            result_dict.pop('ranking_score', None)
            result_dict.pop('score_breakdown', None)
            final_results.append(SearchResult(**result_dict))
        
        stats = {
            "total": total,
            "mentorCount": mentor_count,
            "classCount": class_count
        }
        
        return final_results, stats
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unified search failed: {str(e)}")

def calculate_mentor_relevance(mentor: Mentor, search_query: str) -> float:
    """Calculate relevance score for mentor based on search query"""
    if not search_query:
        return 5.0  # Default relevance when no search query
    
    score = 0.0
    query_lower = search_query.lower()
    
    # Check name (highest weight)
    if query_lower in mentor.displayName.lower():
        score += 10.0
    
    # Check headline
    if mentor.headline and query_lower in mentor.headline.lower():
        score += 8.0
    
    # Check bio
    if mentor.bio and query_lower in mentor.bio.lower():
        score += 5.0
    
    # Check category
    if query_lower in mentor.category.lower():
        score += 6.0
    
    # Check searchKeywords (tags)
    for keyword in mentor.searchKeywords:
        if query_lower in keyword.lower():
            score += 4.0
    
    # Boost by rating
    if mentor.stats and mentor.stats.avgRating:
        score += mentor.stats.avgRating
    
    return score

def calculate_class_relevance(class_item: ClassItem, search_query: str) -> float:
    """Calculate relevance score for class based on search query"""
    if not search_query:
        return 5.0  # Default relevance when no search query
    
    score = 0.0
    query_lower = search_query.lower()
    
    # Check title (highest weight)
    if query_lower in class_item.title.lower():
        score += 10.0
    
    # Check description
    if class_item.description and query_lower in class_item.description.lower():
        score += 8.0
    
    # Check subject
    if query_lower in class_item.subject.lower():
        score += 6.0
    
    # Check category
    if query_lower in class_item.category.lower():
        score += 5.0
    
    # Boost by mentor rating
    if class_item.mentorRating:
        score += class_item.mentorRating
    
    return score

def apply_unified_filters(results: List[dict], query: UnifiedSearchQuery) -> List[dict]:
    """Apply additional filters to unified results"""
    filtered_results = []
    
    for result in results:
        # Apply online filter
        if query.isOnline is not None:
            if result["type"] == "mentor":
                mentor = result["data"]
                if query.isOnline and "online" not in mentor.teachingModes:
                    continue
                if not query.isOnline and "in-person" not in mentor.teachingModes:
                    continue
            elif result["type"] == "class":
                class_item = result["data"]
                if query.isOnline and class_item.format != "online":
                    continue
                if not query.isOnline and class_item.format == "online":
                    continue
        
        # Apply price filter
        if query.maxPrice and result["price"] and result["price"] > query.maxPrice:
            continue
        
        # Apply rating filter
        if query.minRating and result["rating"] and result["rating"] < query.minRating:
            continue
        
        # Apply verification filter (mentors only)
        if query.isVerified is not None and result["type"] == "mentor":
            mentor = result["data"]
            if mentor.isVerified != query.isVerified:
                continue
        
        filtered_results.append(result)
    
    return filtered_results

def sort_unified_results(results: List[dict], sort_by: str, sort_order: str) -> List[dict]:
    """Sort unified results by specified criteria"""
    reverse = sort_order == "desc"
    
    if sort_by == "relevance":
        # Sort by cultural ranking score (if available)
        results.sort(key=lambda r: r.get('ranking_score', 0), reverse=reverse)
    elif sort_by == "rating":
        results.sort(key=lambda r: r["rating"] or 0, reverse=reverse)
    elif sort_by == "price":
        results.sort(key=lambda r: r["price"] or 0, reverse=reverse)
    elif sort_by == "date":
        # Sort by creation date (classes) or mentor stats (mentors)
        def get_date_score(r):
            if r["type"] == "class":
                return r["data"].createdAt or ""
            else:
                return r["data"].createdAt or ""
        results.sort(key=get_date_score, reverse=reverse)
    else:
        # Default to cultural ranking
        results.sort(key=lambda r: r.get('ranking_score', 0), reverse=True)
    
    return results

# Legacy function for backward compatibility
def search_classes_with_filters(
    category: str = None,
    city: str = None,
    subject: str = None,
    level: str = None,
    age_group: str = None,
    class_format: str = None,
    is_online: bool = None,
    min_rating: float = None
) -> list:
    """Legacy function - now uses the new class search service"""
    try:
        query = ClassSearchQuery(
            category=category,
            city=city,
            subject=subject,
            level=level,
            ageGroup=age_group,
            format=class_format,
            minRating=min_rating,
            page=1,
            pageSize=100
        )
        
        classes, _ = search_classes(query)
        return [class_item.dict() for class_item in classes]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Class search failed: {str(e)}")
