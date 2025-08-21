from fastapi import APIRouter, HTTPException, Query
from typing import List
from app.models.class_models import ClassItem, ClassListResponse, FeaturedClassResponse, WorkshopListResponse, ClassSearchQuery
from app.services.class_service import (
    search_classes, fetch_all_classes, fetch_all_workshops, fetch_featured_classes,
    fetch_upcoming_workshops, fetch_class_by_id, get_class_categories, get_class_subjects,
    create_class, update_class_flexible
)
from app.services.mentor_service import fetch_mentor_by_id
from app.services.firestore import db
import uuid
from datetime import datetime

router = APIRouter(
    prefix="/classes",
    tags=["Classes"]
)

@router.get("", response_model=ClassListResponse)
@router.get("/", response_model=ClassListResponse)
def get_classes(
    # Search & Filter Parameters
    q: str = Query(None, description="Search in title, description, subject"),
    featured: bool = Query(None, description="Get featured classes only - USED BY: Homepage featured workshops (?featured=true&pageSize=3)"),
    type: str = Query(None, description="Class type filter - USED BY: Workshop listing (?type=workshop), Group batches (?type=group), One-on-one (?type=one-on-one)"),
    category: str = Query(None, description="Class category filter - USED BY: Discovery page category filtering"),
    subject: str = Query(None, description="Subject filter - USED BY: Discovery page subject-specific filtering"),
    level: str = Query(None, description="Class level filter - USED BY: Workshop discovery advanced filtering"),
    ageGroup: str = Query(None, description="Age group filter - USED BY: Workshop discovery age-based filtering"),
    format: str = Query(None, description="Class format filter - USED BY: Workshop discovery format filtering (online/in-person/hybrid)"),
    city: str = Query(None, description="City location filter - USED BY: Location-based class discovery"),
    country: str = Query(None, description="Country filter - USED BY: Geographic filtering in discovery"),
    mentorId: str = Query(None, description="Mentor-specific classes - USED BY: Mentor dashboard (?mentorId={uid}), Mentor detail page, Admin mentor review"),
    mentorName: str = Query(None, description="Filter by mentor name - USED BY: Search functionality"),
    minRating: float = Query(None, ge=0, le=5, description="Minimum mentor rating filter - USED BY: Quality filtering in discovery"),
    maxPrice: float = Query(None, ge=0, description="Maximum price filter - USED BY: Price range filtering in discovery"),
    minPrice: float = Query(None, ge=0, description="Minimum price filter - USED BY: Price range filtering in discovery"),
    upcoming: bool = Query(None, description="Upcoming workshops only - USED BY: Homepage featured workshops (?upcoming=true)"),
    isRecurring: bool = Query(None, description="Recurring classes filter - USED BY: Class type filtering"),
    hasAvailability: bool = Query(None, description="Available spots filter - USED BY: Booking-ready class filtering"),
    startDateFrom: str = Query(None, description="Date range start - USED BY: Calendar-based class discovery"),
    startDateTo: str = Query(None, description="Date range end - USED BY: Calendar-based class discovery"),
    status: str = Query(None, description="Class status filter - USED BY: Admin dashboard (?status=pending_approval), status management"),
    # Pagination & Sorting
    sortBy: str = Query("createdAt", description="Sort field - USED BY: Admin dashboard chronological sorting, discovery page sorting"),
    sortOrder: str = Query("desc", description="Sort order - USED BY: Most recent first in admin, various discovery sorts"),
    page: int = Query(1, ge=1, description="Page number - USED BY: Admin dashboard pagination, discovery pagination"),
    pageSize: int = Query(20, ge=1, le=100, description="Items per page - USED BY: Admin lists (50/100), Discovery (20), Homepage (3)")
):
    """
    Primary classes endpoint used across multiple frontend pages with different parameter combinations.
    
    FRONTEND USAGE PATTERNS:
    - Workshop Discovery: GET /classes?type=workshop&pageSize=20&hasAvailability=true
      Returns workshop list for /explore/workshops (uses: title, description, mentorName, pricing, schedule, 
      capacity, format, level, ageGroup, classImage)
    
    - Homepage Featured: GET /classes?type=workshop&upcoming=true&pageSize=3  
      Returns 3 featured workshops for homepage cards (uses: title, schedule, mentorName, format)
    
    - Mentor Dashboard: GET /classes?mentorId={uid}&pageSize=50
      Returns mentor's own classes (uses: title, subject, type, schedule.weeklySchedule, status)
    
    - Admin Dashboard: GET /classes?status=pending_approval&pageSize=50
      Returns classes needing approval (uses: status, title, subject, category, mentorName, 
      capacity.maxStudents, pricing.perSessionRate, type, createdAt)
    
    - Group Batches: GET /classes?type=group&mentorId={id}
      Returns group classes for specific mentor (uses: similar fields as workshops)
    
    - Mentor Class Management: GET /classes?mentorId={uid} 
      Returns all mentor's classes for management interface
    
    FILTERING NOTES:
    - Workshop discovery applies type=workshop filter
    - Admin uses status parameter for approval workflow
    - Mentor dashboard filters by mentorId for ownership
    - Homepage uses upcoming=true for current workshops
    
    RESPONSE FIELD USAGE:
    - Discovery pages: Rich content fields + visual elements + pricing + schedule
    - Admin interface: Status fields + basic info + business metrics
    - Mentor dashboard: Management-focused fields + scheduling info
    - Homepage: Minimal fields for featured showcase cards
    """
    
    # Handle featured classes
    if featured is True:
        classes = fetch_featured_classes(pageSize if pageSize <= 20 else 6)
        return {
            "classes": classes,
            "total": len(classes),
            "page": 1,
            "pageSize": len(classes),
            "totalPages": 1
        }
    
    # Handle workshops with upcoming filter
    if type == "workshop":
        if upcoming is True:
            workshops, total = fetch_upcoming_workshops(page, pageSize)
        else:
            # Check if there are any additional filters beyond just type=workshop
            has_additional_filters = any([
                q, featured, category, subject, level, ageGroup, format, 
                city, country, mentorId, mentorName, minRating, maxPrice, 
                minPrice, isRecurring, hasAvailability, startDateFrom, 
                startDateTo, status
            ])
            
            if has_additional_filters:
                # Use search_classes for filtered workshops
                search_query = ClassSearchQuery(
                    q=q,
                    type=type,
                    category=category,
                    subject=subject,
                    level=level,
                    ageGroup=ageGroup,
                    format=format,
                    city=city,
                    country=country,
                    mentorId=mentorId,
                    mentorName=mentorName,
                    minRating=minRating,
                    maxPrice=maxPrice,
                    minPrice=minPrice,
                    isRecurring=isRecurring,
                    hasAvailability=hasAvailability,
                    startDateFrom=startDateFrom,
                    startDateTo=startDateTo,
                    status=status,
                    sortBy=sortBy,
                    sortOrder=sortOrder,
                    page=page,
                    pageSize=pageSize
                )
                workshops, total = search_classes(search_query)
            else:
                # Use fetch_all_workshops for unfiltered workshops
                workshops, total = fetch_all_workshops(page, pageSize)
        
        total_pages = (total + pageSize - 1) // pageSize
        return {
            "classes": workshops,
            "total": total,
            "page": page,
            "pageSize": pageSize,
            "totalPages": total_pages
        }
    
    # Handle search/filter or get all classes
    search_query = ClassSearchQuery(
        q=q,
        type=type,
        category=category,
        subject=subject,
        level=level,
        ageGroup=ageGroup,
        format=format,
        city=city,
        country=country,
        mentorId=mentorId,
        mentorName=mentorName,
        minRating=minRating,
        maxPrice=maxPrice,
        minPrice=minPrice,
        isRecurring=isRecurring,
        hasAvailability=hasAvailability,
        startDateFrom=startDateFrom,
        startDateTo=startDateTo,
        status=status,
        sortBy=sortBy,
        sortOrder=sortOrder,
        page=page,
        pageSize=pageSize
    )
    
    classes, total = search_classes(search_query)
    total_pages = (total + pageSize - 1) // pageSize
    
    return {
        "classes": classes,
        "total": total,
        "page": page,
        "pageSize": pageSize,
        "totalPages": total_pages
    }

@router.get("/{class_id}")
def get_class_by_id(class_id: str):
    """
    Get individual class details by ID - used by booking flows and detail views.
    
    FRONTEND USAGE PATTERNS:
    - Booking Confirmation: GET /classes/{classId}
      Used to display class details on booking confirmation page (uses: title, mentorName, pricing, schedule)
    
    - User Dashboard: GET /classes/{classId} 
      Used to show details of user's enrolled classes (uses: title, basic class info)
    
    - Admin Class Review: GET /classes/{classId}
      Used for detailed admin review of pending classes (uses: ALL fields for comprehensive evaluation)
    
    - Mentor Class Management: GET /classes/{classId}
      Used by mentors to view/edit their own class details (uses: ALL fields for management)
    
    RESPONSE FIELD USAGE:
    - Booking context: Core class info + pricing + schedule for booking decisions
    - Admin review: Complete class details including status, capacity, mentor info
    - User dashboard: Basic class info for enrolled class display
    - Mentor management: Full class details for editing and management
    
    SECURITY NOTE: Returns all class fields - ensure proper access control at application level
    """
    class_item = fetch_class_by_id(class_id)
    if not class_item:
        raise HTTPException(status_code=404, detail="Class not found")
    return {"class": class_item}

@router.post("/create")
def create_new_class(class_data: dict):
    """
    Create a new class with auto-generated searchMetadata.
    
    The class will be created with status 'pending_approval' and include:
    - Auto-generated searchMetadata for AI-powered search
    - Approval workflow initialization
    - System timestamps
    
    Example payload:
    {
        "type": "group",
        "title": "Beginner Guitar Lessons", 
        "subject": "guitar",
        "category": "Music",
        "description": "Learn basic guitar chords and techniques",
        "mentorId": "user123",
        "level": "beginner",
        "ageGroup": "adult",
        "format": "online",
        "pricing": {
            "perSessionRate": 35.0,
            "totalSessions": 8,
            "currency": "GBP"
        },
        "schedule": {
            "startDate": "2025-09-01",
            "endDate": "2025-10-20", 
            "weeklySchedule": [
                {"day": "Tuesday", "startTime": "18:00", "endTime": "19:00"}
            ],
            "sessionDuration": 60
        },
        "capacity": {
            "maxStudents": 6,
            "minStudents": 2
        }
    }
    """
    class_id = create_class(class_data)
    return {
        "message": "Class created successfully",
        "classId": class_id,
        "status": "pending_approval"
    }

@router.put("/{class_id}")
def update_existing_class(class_id: str, update_data: dict):
    """
    Pure MongoDB-style flexible class updates.
    
    Frontend can send ANY field it wants:
    - { "title": "New title" }
    - { "pricing.perSessionRate": 40.0, "capacity.maxStudents": 10 }
    - { "status": "approved", "customField": "value" }
    - { "schedule": {...}, "anyField": "anyValue" }
    """
    updated_class = update_class_flexible(class_id, update_data)
    return {"class": updated_class}

@router.post("/one-on-one/create")
def create_one_on_one_class(request: dict):
    """
    Create a one-on-one class dynamically for booking flow with flexible multi-session support.
    
    Pure MongoDB-style flexible endpoint. Frontend can send ANY fields it wants:
    - Required: mentorId
    - For single session: sessionDate, startTime, endTime  
    - For multiple sessions: weeklySchedule (array with sessionDate, startTime, endTime per session)
    - Optional: subject, format, specialRequests, isFirstSession, totalSessions, etc.
    
    This creates a temporary class that:
    - Will not appear in any class listings (type: "one-on-one" is filtered out)
    - Is auto-approved for immediate booking
    - Has dynamic title based on mentor's subjects
    - Supports both single and multiple session scheduling
    - Includes first session discount if applicable
    
    Returns classId for immediate redirect to booking confirmation page.
    """
    try:
        # Basic validation
        if 'mentorId' not in request:
            raise HTTPException(status_code=400, detail="Missing required field: mentorId")
        
        # Get mentor details for title generation and pricing
        mentor = fetch_mentor_by_id(request['mentorId'])
        if not mentor:
            raise HTTPException(status_code=404, detail=f"Mentor {request['mentorId']} not found")
        
        # Determine if this is single session or multi-session
        weekly_schedule = request.get('weeklySchedule', [])
        is_multi_session = len(weekly_schedule) > 0
        total_sessions = request.get('totalSessions', len(weekly_schedule) if is_multi_session else 1)
        
        # Handle scheduling data
        if is_multi_session:
            # Multi-session: Use weeklySchedule array
            if not weekly_schedule:
                raise HTTPException(status_code=400, detail="weeklySchedule is required for multi-session classes")
            
            # Extract date range from sessions
            session_dates = [session.get('sessionDate') for session in weekly_schedule if session.get('sessionDate')]
            if not session_dates:
                raise HTTPException(status_code=400, detail="Each session in weeklySchedule must have sessionDate")
            
            start_date = min(session_dates)
            end_date = max(session_dates) 
            
            # Convert sessionDate to day name for each session
            schedule_data = {
                "startDate": [start_date] if start_date == end_date else [start_date, end_date],
                "endDate": [end_date] if start_date == end_date else [start_date, end_date],
                "weeklySchedule": [
                    {
                        "day": datetime.strptime(session.get('sessionDate', '2025-01-01'), '%Y-%m-%d').strftime('%A'),
                        "startTime": session.get('startTime', '10:00'),
                        "endTime": session.get('endTime', '11:00'),
                        "sessionDate": session.get('sessionDate')  # Keep specific date
                    } for session in weekly_schedule
                ],
                "sessionDuration": 60
            }
        else:
            # Single session: Use traditional fields
            required_single_fields = ['sessionDate', 'startTime', 'endTime']
            for field in required_single_fields:
                if field not in request:
                    raise HTTPException(status_code=400, detail=f"Missing required field for single session: {field}")
            
            schedule_data = {
                "startDate": request['sessionDate'],
                "endDate": request['sessionDate'],
                "weeklySchedule": [{
                    "day": datetime.strptime(request['sessionDate'], '%Y-%m-%d').strftime('%A'),
                    "startTime": request['startTime'],
                    "endTime": request['endTime']
                }],
                "sessionDuration": 60
            }
        
        # Generate dynamic title
        subject = None
        if hasattr(mentor, 'subjects') and mentor.subjects:
            subject = mentor.subjects[0]
        elif hasattr(mentor, 'category') and mentor.category:
            subject = mentor.category
        else:
            subject = "Session"
        
        title = f"One-on-One {subject} with {mentor.displayName}"
        if total_sessions > 1:
            title = f"{total_sessions}-Session One-on-One {subject} with {mentor.displayName}"
        
        # Calculate pricing
        base_rate = getattr(mentor.pricing, 'oneOnOneRate', 50.0) if hasattr(mentor, 'pricing') and mentor.pricing else 50.0
        is_first_session = request.get('isFirstSession', False)
        
        # For multi-session: calculate total with potential first session free
        if total_sessions > 1:
            sessions_to_pay = total_sessions - (1 if is_first_session else 0)
            subtotal = sessions_to_pay * base_rate
            discount_percentage = 0  # Applied per session basis
        else:
            discount_percentage = 100 if is_first_session else 0
            subtotal = 0.0 if is_first_session else base_rate
        
        # Generate unique class ID
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        class_id = f"onetoone_{request['mentorId']}_{timestamp}_{str(uuid.uuid4())[:8]}"
        
        # Create base class data structure
        class_data = {
            "classId": class_id,
            "type": "one-on-one",  # This will be filtered out from all listings
            "title": title,
            "subject": subject,
            "category": getattr(mentor, 'category', 'General') if hasattr(mentor, 'category') else 'General',
            "description": f"Personalised one-on-one session{'s' if total_sessions > 1 else ''}. {request.get('specialRequests', '')}".strip(),
            "mentorId": request['mentorId'],
            "mentorName": mentor.displayName,
            "level": "all-levels",
            "ageGroup": "all-ages", 
            "format": request.get('format', 'online'),
            "schedule": schedule_data,
            "capacity": {
                "maxStudents": 1,
                "minStudents": 1,
                "currentEnrollment": 0
            },
            "pricing": {
                "perSessionRate": base_rate,
                "totalSessions": total_sessions,
                "discountPercentage": discount_percentage,
                "subtotal": subtotal,
                "currency": "GBP"
            },
            "status": "approved",  # Auto-approve one-on-one classes
            "isRecurring": total_sessions > 1,
            "createdAt": datetime.now().isoformat(),
            "updatedAt": datetime.now().isoformat()
        }
        
        # MongoDB-style flexibility: Frontend can override ANY field or add custom fields
        for key, value in request.items():
            # Skip fields we've already handled properly
            if key not in ['mentorId', 'sessionDate', 'startTime', 'endTime', 'weeklySchedule', 'totalSessions']:
                # Allow frontend to override any generated field or add custom fields
                if key not in ['classId']:  # Protect classId from being overridden
                    class_data[key] = value
        
        # Save to Firestore
        doc_ref = db.collection('classes').document(class_id)
        doc_ref.set(class_data)
        
        return {
            "message": f"One-on-one class created successfully with {total_sessions} session{'s' if total_sessions > 1 else ''}",
            "classId": class_id,
            "title": class_data.get('title', title),
            "totalSessions": total_sessions,
            "finalPrice": class_data.get('pricing', {}).get('subtotal', subtotal),
            "isFirstSession": is_first_session
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create one-on-one class: {str(e)}")

@router.get("/debug")
def debug_classes():
    """Debug endpoint to see raw class data"""
    try:
        # Get all classes without any filtering
        docs = db.collection("classes").stream()
        all_classes = []
        
        for doc in docs:
            data = doc.to_dict()
            data["classId"] = doc.id
            all_classes.append(data)
        
        # Get workshops only
        workshop_docs = db.collection("classes").where("type", "==", "workshop").stream()
        workshops = []
        
        for doc in workshop_docs:
            data = doc.to_dict()
            data["classId"] = doc.id
            workshops.append(data)
        
        return {
            "total_classes": len(all_classes),
            "total_workshops": len(workshops),
            "all_classes": all_classes[:5],  # First 5 for debugging
            "workshops": workshops[:5],  # First 5 for debugging
            "categories": list(set([c.get("category") for c in all_classes if c.get("category")])),
            "subjects": list(set([c.get("subject") for c in all_classes if c.get("subject")])),
            "formats": list(set([c.get("format") for c in all_classes if c.get("format")])),
            "age_groups": list(set([c.get("ageGroup") for c in all_classes if c.get("ageGroup")]))
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Debug failed: {str(e)}")



