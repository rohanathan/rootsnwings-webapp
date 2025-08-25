"""
Cultural Ranking Service for Roots & Wings

Using the enhanced searchMetadata we already created
"""

from typing import List, Dict
from app.services.mentor_service import fetch_mentor_by_id

def calculate_cultural_relevance(query: str, item: Dict) -> float:
    """
    How culturally relevant is this item to the search?
    Using the cultural context we already put in searchMetadata.
    """
    if not query:
        return 0.5
    
    # Get the cultural data we already calculated
    search_metadata = item.get('searchMetadata', {})
    if not search_metadata:
        return 0.3
    
    query_lower = query.lower()
    score = 0.0
    
    # Check if query mentions the cultural origin
    cultural_region = search_metadata.get('cultural_origin_region', '').lower()
    if cultural_region and cultural_region != 'worldwide':
        if cultural_region in query_lower:
            score += 0.4
    
    # Check if query matches cultural keywords
    cultural_keywords = search_metadata.get('cultural_keywords', [])
    matching_keywords = 0
    for keyword in cultural_keywords:
        if keyword.lower() in query_lower:
            matching_keywords += 1
    
    if matching_keywords > 0:
        score += min(0.3, matching_keywords * 0.1)  # Up to 0.3 for keyword matches
    
    # Boost based on how culturally authentic the item is
    cultural_score = search_metadata.get('cultural_authenticity_score', 0.3)
    score += cultural_score * 0.3
    
    return min(score, 1.0)

def calculate_mentor_cultural_expertise(mentor_id: str) -> float:
    """
    How much cultural training does this mentor have?
    Using the enhanced qualifications we already built.
    """
    try:
        mentor = fetch_mentor_by_id(mentor_id)
        if not mentor or not mentor.qualifications:
            return 0.4  # Basic score for mentors without special qualifications
        
        expertise_score = 0.0
        cultural_qualifications = 0
        
        # Score based on qualification types
        for qual in mentor.qualifications:
            qual_type = str(qual.type).lower()
            
            if 'traditional_lineage' in qual_type:
                expertise_score += 1.0  # Highest score for traditional training
                cultural_qualifications += 1
            elif 'cultural_apprenticeship' in qual_type:
                expertise_score += 0.8
                cultural_qualifications += 1
            elif 'cultural_immersion' in qual_type:
                expertise_score += 0.7
                cultural_qualifications += 1
            elif 'self_taught_cultural' in qual_type:
                expertise_score += 0.5
                cultural_qualifications += 1
        
        if cultural_qualifications == 0:
            return 0.4  # Basic score
        
        # Average the scores but capping at 1.0
        final_score = min(expertise_score / cultural_qualifications, 1.0)
        return final_score
        
    except Exception:
        return 0.4  # Default score

def calculate_trust_score(item: Dict) -> float:
    """
    Simple trust scoring using existing fields.
    """
    mentor_data = None
    
    if item.get('type') == 'mentor':
        mentor_data = item.get('data', {})
    elif item.get('type') == 'class':
        # Trying to get mentor info for the class
        mentor_id = item.get('data', {}).get('mentorId')
        if mentor_id:
            try:
                mentor = fetch_mentor_by_id(mentor_id)
                mentor_data = mentor.__dict__ if mentor else {}
            except:
                mentor_data = {}
    
    if not mentor_data:
        return 0.5  # Default trust score
    
    score = 0.5  # Everyone starts with basic trust
    
    # Simple boosts for verification
    if mentor_data.get('backgroundChecked'):
        score += 0.2  # DBS check completed
    
    if mentor_data.get('isVerified'):
        score += 0.2  # Admin verified
    
    # Small boost for experience
    total_students = mentor_data.get('stats', {}).get('totalStudents', 0)
    if total_students > 5:
        score += 0.1  # Has taught multiple students
    
    return min(score, 1.0)

def calculate_text_relevance(query: str, item: Dict) -> float:
    """
    Basic keyword matching using the enhanced keywords we generated.
    """
    if not query:
        return 0.5
    
    query_lower = query.lower()
    score = 0.0
    
    # Use the keywords we already generated in searchMetadata
    keywords = item.get('searchMetadata', {}).get('keywords', [])
    if keywords:
        matches = sum(1 for keyword in keywords if keyword in query_lower)
        if matches > 0:
            score += min(matches * 0.2, 0.8)  # Up to 0.8 for keyword matches
    
    # Check title and subject directly
    title = item.get('title', '') or item.get('data', {}).get('title', '')
    subject = item.get('subject', '') or item.get('data', {}).get('subject', '')
    
    if title and query_lower in title.lower():
        score += 0.5
    
    if subject and query_lower in subject.lower():
        score += 0.4
    
    return min(score, 1.0)

def culturally_aware_ranking(query: str, results: List[Dict]) -> List[Dict]:
    """
    Main ranking function. Keep it simple and focused.
    """
    for item in results:
        # Calculate the four main scores
        cultural_score = calculate_cultural_relevance(query, item)
        text_score = calculate_text_relevance(query, item)
        trust_score = calculate_trust_score(item)
        
        # Get mentor cultural expertise if it's a cultural subject
        mentor_expertise = 0.5  # Default
        is_cultural = item.get('searchMetadata', {}).get('is_culturally_rooted', False)
        
        if is_cultural and item.get('type') == 'class':
            mentor_id = item.get('data', {}).get('mentorId')
            if mentor_id:
                mentor_expertise = calculate_mentor_cultural_expertise(mentor_id)
        
        # Simple weighted combination
        # For cultural subjects: cultural relevance matters most
        # For non-cultural: text matching matters most
        if is_cultural:
            final_score = (
                0.4 * cultural_score +      # Cultural relevance is key
                0.3 * mentor_expertise +    # Mentor cultural training important
                0.2 * trust_score +         # Trust matters
                0.1 * text_score           # Basic text matching
            )
        else:
            final_score = (
                0.5 * text_score +         # Text matching is key for non-cultural
                0.3 * trust_score +        # Trust still matters
                0.2 * cultural_score       # Adding cultural context
            )
        
        # Store the final score
        item['ranking_score'] = final_score
        
        # Store breakdown for debugging
        item['score_breakdown'] = {
            'cultural_relevance': cultural_score,
            'mentor_cultural_expertise': mentor_expertise,
            'trust_score': trust_score,
            'text_relevance': text_score,
            'is_cultural_subject': is_cultural,
            'final_score': final_score
        }
    
    # Sort by final score
    results.sort(key=lambda x: x.get('ranking_score', 0), reverse=True)
    return results