from app.services.firestore import db
from app.models.class_models import ClassItem, ClassSearchQuery
from datetime import date, datetime
from typing import List, Dict, Tuple, Optional
from fastapi import HTTPException
import uuid

def search_classes(query: ClassSearchQuery) -> Tuple[List[ClassItem], int]:
    """
    Search classes with advanced filtering, sorting, and pagination.
    
    IMPORTANT: This function uses multiple Firestore filters which may require
    composite indexes. We'll implement this step-by-step to identify required indexes.
    """
    try:
        # Start with base query - status filter REMOVED for testing
        # base_query = db.collection("classes").where("status", "==", "approved")  # COMMENTED OUT
        base_query = db.collection("classes")  # NO STATUS FILTER for testing
        
        # We'll apply filters very carefully to avoid composite index issues
        # Start with the most basic filters first
        filters = []
        
        # Single-field filters (usually don't need composite indexes)
        if query.type:
            filters.append(("type", "==", query.type))
        
        if query.category:
            filters.append(("category", "==", query.category))
            
        if query.subject:
            filters.append(("subject", "==", query.subject))
            
        if query.level:
            filters.append(("level", "==", query.level))
            
        if query.ageGroup:
            filters.append(("ageGroup", "==", query.ageGroup))
            
        if query.format:
            filters.append(("format", "==", query.format))
            
        if query.mentorId:
            filters.append(("mentorId", "==", query.mentorId))
            
        if query.status:
            filters.append(("status", "==", query.status))
        
        # Apply basic filters to query (one at a time to avoid composite index issues)
        current_query = base_query
        
        # Apply type filter directly to Firestore if it exists (single field index)
        type_filter = None
        other_filters = []
        
        for filter_item in filters:
            if filter_item[0] == "type":
                type_filter = filter_item
            else:
                other_filters.append(filter_item)
        
        if type_filter:
            field, op, value = type_filter
            current_query = current_query.where(field, op, value)
        
        # Get all documents and do remaining filtering in Python
        docs = list(current_query.stream())
        
        # Set remaining filters for Python processing
        filters = other_filters
        
        # Convert to class objects and apply remaining filters
        classes = []
        for doc in docs:
            data = doc.to_dict()
            data["classId"] = doc.id
            
            # Apply remaining filters in Python
            should_include = True
            
            # Apply remaining Firestore filters in Python
            for field, op, value in filters:
                field_value = data.get(field)
                if op == "==" and field_value != value:
                    should_include = False
                    break
            
            if not should_include:
                continue
            
            # Apply location filters
            if query.city and data.get("location", {}).get("city") != query.city:
                continue
                
            if query.country and data.get("location", {}).get("country") != query.country:
                continue
            
            # Apply rating filter
            if query.minRating and data.get("mentorRating", 0) < query.minRating:
                continue
            
            # Apply price filters
            pricing = data.get("pricing", {})
            per_session_rate = pricing.get("perSessionRate", 0)
            
            if query.minPrice and per_session_rate < query.minPrice:
                continue
                
            if query.maxPrice and per_session_rate > query.maxPrice:
                continue
            
            # Apply availability filter
            if query.hasAvailability:
                capacity = data.get("capacity", {})
                current_enrollment = capacity.get("currentEnrollment", 0)
                max_students = capacity.get("maxStudents", 0)
                if current_enrollment >= max_students:
                    continue
            
            # Apply date filters
            schedule = data.get("schedule", {})
            start_date_str = schedule.get("startDate")
            
            if start_date_str:
                try:
                    start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
                    
                    if query.startDateFrom:
                        from_date = datetime.strptime(query.startDateFrom, "%Y-%m-%d").date()
                        if start_date < from_date:
                            continue
                    
                    if query.startDateTo:
                        to_date = datetime.strptime(query.startDateTo, "%Y-%m-%d").date()
                        if start_date > to_date:
                            continue
                            
                except ValueError:
                    # Skip classes with invalid dates
                    continue
            
            # Apply recurring filter
            if query.isRecurring is not None and data.get("isRecurring", False) != query.isRecurring:
                continue
            
            # Apply mentor name filter
            if query.mentorName:
                mentor_name = data.get("mentorName", "").lower()
                if query.mentorName.lower() not in mentor_name:
                    continue
            
            # Apply text search
            if query.q:
                search_text = query.q.lower()
                searchable_fields = [
                    data.get("title", ""),
                    data.get("description", ""),
                    data.get("subject", ""),
                    data.get("category", "")
                ]
                searchable_content = " ".join(searchable_fields).lower()
                if search_text not in searchable_content:
                    continue
            
            # Clean and create ClassItem
            cleaned_data = clean_data(data)
            try:
                class_item = ClassItem(**cleaned_data)
                classes.append(class_item)
            except Exception as e:
                # Skip invalid class data
                continue
        
        # Sort classes
        if query.sortBy == "createdAt":
            classes.sort(key=lambda c: c.createdAt or "", reverse=(query.sortOrder == "desc"))
        elif query.sortBy == "startDate":
            def get_start_date(c):
                if c.schedule and c.schedule.startDate:
                    return c.schedule.startDate
                return date.min if query.sortOrder == "desc" else date.max
            classes.sort(key=get_start_date, reverse=(query.sortOrder == "desc"))
        elif query.sortBy == "price":
            classes.sort(key=lambda c: c.pricing.perSessionRate if c.pricing else 0, 
                        reverse=(query.sortOrder == "desc"))
        elif query.sortBy == "rating":
            classes.sort(key=lambda c: c.mentorRating or 0, reverse=(query.sortOrder == "desc"))
        elif query.sortBy == "title":
            classes.sort(key=lambda c: c.title.lower(), reverse=(query.sortOrder == "desc"))
        
        # Get total count
        total = len(classes)
        
        # Apply pagination
        start_idx = (query.page - 1) * query.pageSize
        end_idx = start_idx + query.pageSize
        paginated_classes = classes[start_idx:end_idx]
        
        return paginated_classes, total
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to search classes: {str(e)}")

def fetch_all_classes(page: int = 1, page_size: int = 20) -> Tuple[List[ClassItem], int]:
    """Get all batch classes with pagination"""
    query = ClassSearchQuery(type="batch", page=page, pageSize=page_size, sortBy="createdAt")
    return search_classes(query)

def fetch_all_workshops(page: int = 1, page_size: int = 20) -> Tuple[List[ClassItem], int]:
    """Get all workshops with pagination"""
    query = ClassSearchQuery(type="workshop", page=page, pageSize=page_size, sortBy="createdAt")
    return search_classes(query)

def fetch_featured_classes(limit: int = 6) -> List[ClassItem]:
    """Get featured classes based on performance metrics"""
    try:
        # docs = db.collection("classes").where("type", "==", "batch").where("status", "==", "approved").stream()  # COMMENTED OUT
        docs = db.collection("classes").where("type", "==", "batch").stream()  # NO STATUS FILTER for testing
        class_scores = []
        
        for doc in docs:
            data = doc.to_dict()
            data["classId"] = doc.id
            
            # Calculate performance score based on mentor rating and enrollment
            mentor_rating = data.get("mentorRating", 0)
            capacity = data.get("capacity", {})
            enrollment_rate = 0
            
            if capacity.get("maxStudents", 0) > 0:
                enrollment_rate = capacity.get("currentEnrollment", 0) / capacity.get("maxStudents", 1)
            
            score = mentor_rating * 2 + enrollment_rate * 1
            
            cleaned_data = clean_data(data)
            try:
                class_item = ClassItem(**cleaned_data)
                class_scores.append((score, class_item))
            except Exception:
                continue
        
        # Sort by score and return top classes
        class_scores.sort(reverse=True, key=lambda x: x[0])
        return [c[1] for c in class_scores[:limit]]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch featured classes: {str(e)}")

def fetch_upcoming_workshops(page: int = 1, page_size: int = 20) -> Tuple[List[ClassItem], int]:
    """Get upcoming workshops with pagination"""
    today = date.today()
    query = ClassSearchQuery(
        type="workshop", 
        startDateFrom=today.isoformat(),
        page=page, 
        pageSize=page_size, 
        sortBy="startDate"
    )
    return search_classes(query)

def fetch_class_by_id(class_id: str):
    """Get class by ID"""
    try:
        doc_ref = db.collection("classes").document(class_id)
        doc = doc_ref.get()
        if not doc.exists:
            return None
        
        data = doc.to_dict()
        data["classId"] = doc.id
        cleaned_data = clean_data(data)
        
        return ClassItem(**cleaned_data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch class: {str(e)}")

def get_classes_by_mentor_id(mentor_id: str):
    """
    Fetches all approved classes (batch + workshops) created by a given mentor.
    """
    try:
        # This uses a composite query that might need an index
        classes_ref = db.collection("classes")
        # query = classes_ref.where("mentorId", "==", mentor_id).where("status", "==", "approved")  # COMMENTED OUT
        query = classes_ref.where("mentorId", "==", mentor_id)  # NO STATUS FILTER for testing
        results = query.stream()

        classes = []
        for doc in results:
            data = doc.to_dict()
            data["classId"] = doc.id
            cleaned_data = clean_data(data)
            
            try:
                class_item = ClassItem(**cleaned_data)
                classes.append(class_item)
            except Exception:
                continue

        return classes
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch mentor classes: {str(e)}")

def get_class_categories() -> List[str]:
    """Get list of all class categories"""
    try:
        # docs = db.collection("classes").where("status", "==", "approved").stream()  # COMMENTED OUT
        docs = db.collection("classes").stream()  # NO STATUS FILTER for testing
        categories = set()
        
        for doc in docs:
            data = doc.to_dict()
            category = data.get("category")
            if category:
                categories.add(category)
        
        return sorted(list(categories))
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch categories: {str(e)}")

def get_class_subjects() -> List[str]:
    """Get list of all class subjects"""
    try:
        # docs = db.collection("classes").where("status", "==", "approved").stream()  # COMMENTED OUT
        docs = db.collection("classes").stream()  # NO STATUS FILTER for testing
        subjects = set()
        
        for doc in docs:
            data = doc.to_dict()
            subject = data.get("subject")
            if subject:
                subjects.add(subject)
        
        return sorted(list(subjects))
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch subjects: {str(e)}")

# ---------- Helpers ----------

def clean_docs(docs):
    result = []
    for doc in docs:
        data = doc.to_dict()
        data["classId"] = doc.id
        result.append(clean_data(data))
    return result

def clean_docs_from_list(doc_list):
    return [clean_data(data) for data in doc_list]

def clean_data(data: Dict) -> Dict:
    """Clean data by removing internal fields and ensuring required fields"""
    # Remove internal/admin fields
    data.pop("approvalWorkflow", None)
    data.pop("searchMetadata", None)
    
    # Ensure classId is set
    if "classId" not in data and "id" in data:
        data["classId"] = data["id"]
    
    return data

# ---------- Search Metadata Generation ----------

def generate_search_metadata(class_data: Dict) -> Dict:
    """
    Auto-generate searchMetadata for enhanced search and AI integration.
    This metadata is used for intelligent search, filtering, and recommendations.
    """
    metadata = {}
    
    try:
        # Extract schedule information
        schedule = class_data.get("schedule", {})
        weekly_schedule = schedule.get("weeklySchedule", [])
        
        # Available days and time slots
        if weekly_schedule:
            metadata["availableDays"] = [slot.get("day") for slot in weekly_schedule if slot.get("day")]
            metadata["timeSlots"] = [
                f"{slot.get('day')} {slot.get('startTime')}-{slot.get('endTime')}" 
                for slot in weekly_schedule 
                if all(slot.get(key) for key in ['day', 'startTime', 'endTime'])
            ]
        else:
            metadata["availableDays"] = []
            metadata["timeSlots"] = []
        
        # Calculate duration in weeks
        start_date_str = schedule.get("startDate")
        end_date_str = schedule.get("endDate")
        
        if start_date_str and end_date_str:
            try:
                start_date = datetime.fromisoformat(start_date_str).date()
                end_date = datetime.fromisoformat(end_date_str).date()
                weeks_duration = max(1, (end_date - start_date).days // 7)
                metadata["weeksDuration"] = weeks_duration
            except (ValueError, TypeError):
                metadata["weeksDuration"] = 1
        else:
            # For workshops or single sessions
            metadata["weeksDuration"] = 1
        
        # Extract pricing information
        pricing = class_data.get("pricing", {})
        per_session_rate = pricing.get("perSessionRate", 0)
        session_duration = schedule.get("sessionDuration", 60)  # Default 60 minutes
        
        # Calculate price per hour
        if session_duration > 0:
            metadata["pricePerHour"] = round((per_session_rate * 60) / session_duration, 2)
        else:
            metadata["pricePerHour"] = per_session_rate
        
        # Check for discounts
        package_discount = pricing.get("packageDiscount", {})
        metadata["hasDiscount"] = package_discount.get("type", "none") != "none"
        
        # Extract format information
        class_format = class_data.get("format", "online")
        metadata["isOnline"] = class_format in ["online", "hybrid"]
        metadata["isInPerson"] = class_format in ["in-person", "hybrid"]
        
        # Calculate intensity based on session frequency and duration
        intensity = calculate_intensity(class_data)
        metadata["intensity"] = intensity
        
        # Map difficulty level
        level = class_data.get("level", "beginner")
        metadata["difficultyLevel"] = map_difficulty_level(level)
        
        # Extract prerequisites
        prerequisites = class_data.get("skillPrerequisites", [])
        if isinstance(prerequisites, list):
            metadata["prerequisites"] = prerequisites
        else:
            metadata["prerequisites"] = []
        
        # Additional searchable fields
        metadata["totalSessions"] = pricing.get("totalSessions", 1)
        metadata["maxStudents"] = class_data.get("capacity", {}).get("maxStudents", 1)
        metadata["minStudents"] = class_data.get("capacity", {}).get("minStudents", 1)
        
        # Class type specific metadata
        class_type = class_data.get("type", "group")
        metadata["isWorkshop"] = class_type == "workshop"
        metadata["isGroup"] = class_type == "group"
        
        return metadata
    
    except Exception as e:
        # Return basic metadata if generation fails
        print(f"Warning: Failed to generate search metadata: {str(e)}")
        return {
            "availableDays": [],
            "timeSlots": [],
            "weeksDuration": 1,
            "intensity": "low",
            "pricePerHour": 0,
            "hasDiscount": False,
            "difficultyLevel": "beginner",
            "prerequisites": [],
            "isOnline": True,
            "isInPerson": False,
            "totalSessions": 1,
            "maxStudents": 1,
            "minStudents": 1,
            "isWorkshop": False,
            "isGroup": True
        }

def calculate_intensity(class_data: Dict) -> str:
    """
    Calculate class intensity based on frequency, duration, and total sessions.
    Returns: "low", "medium", "high"
    """
    try:
        schedule = class_data.get("schedule", {})
        pricing = class_data.get("pricing", {})
        
        weekly_schedule = schedule.get("weeklySchedule", [])
        sessions_per_week = len(weekly_schedule)
        session_duration = schedule.get("sessionDuration", 60)
        total_sessions = pricing.get("totalSessions", 1)
        
        # Calculate weekly time commitment in hours
        weekly_hours = (sessions_per_week * session_duration) / 60
        
        # Calculate intensity score
        if weekly_hours >= 4 or sessions_per_week >= 4:
            return "high"
        elif weekly_hours >= 2 or sessions_per_week >= 2:
            return "medium"
        else:
            return "low"
    
    except Exception:
        return "low"

def map_difficulty_level(level: str) -> str:
    """
    Map class level to standardized difficulty descriptions.
    """
    level_mapping = {
        "beginner": "beginner",
        "intermediate": "moderate", 
        "advanced": "challenging"
    }
    return level_mapping.get(level.lower(), "beginner")

# ---------- Class CRUD Operations ----------

def create_class(class_data: Dict) -> str:
    """
    Create a new class with auto-generated searchMetadata.
    Returns the created class ID.
    """
    try:
        # Generate unique class ID
        class_id = f"class_{str(uuid.uuid4())[:8]}"
        
        # Ensure mentorName is always set (required field for ClassItem validation)
        if not class_data.get("mentorName"):
            class_data["mentorName"] = "Unknown Mentor"
        
        # Add system fields
        now = datetime.now().isoformat()
        class_data["classId"] = class_id
        class_data["createdAt"] = now
        class_data["updatedAt"] = now
        # class_data["status"] = "pending_approval"  # COMMENTED OUT - Auto-approve for testing
        class_data["status"] = "approved"  # AUTO-APPROVE for testing
        
        # Auto-generate searchMetadata
        class_data["searchMetadata"] = generate_search_metadata(class_data)
        
        # Initialize approval workflow - COMMENTED OUT for testing
        # class_data["approvalWorkflow"] = {
        #     "reviewStatus": "pending",
        #     "adminNotes": "",
        #     "adminChecks": {
        #         "scheduleValid": False,
        #         "pricingValid": False,
        #         "contentClear": False,
        #         "mentorQualified": False,
        #         "capacityReasonable": False
        #     }
        # }
        # AUTO-APPROVE workflow for testing
        class_data["approvalWorkflow"] = {
            "reviewStatus": "approved",
            "adminNotes": "Auto-approved for testing",
            "adminChecks": {
                "scheduleValid": True,
                "pricingValid": True,
                "contentClear": True,
                "mentorQualified": True,
                "capacityReasonable": True
            }
        }
        
        # Save to Firestore
        doc_ref = db.collection("classes").document(class_id)
        doc_ref.set(class_data)
        
        return class_id
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create class: {str(e)}")

def update_class(class_id: str, class_data: Dict) -> bool:
    """
    Update an existing class and regenerate searchMetadata.
    Returns True if successful.
    """
    try:
        # Check if class exists
        doc_ref = db.collection("classes").document(class_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Class not found")
        
        # Update timestamp
        class_data["updatedAt"] = datetime.now().isoformat()
        
        # Regenerate searchMetadata
        class_data["searchMetadata"] = generate_search_metadata(class_data)
        
        # Update document
        doc_ref.update(class_data)
        
        return True
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update class: {str(e)}")

def approve_class(class_id: str, admin_notes: str = "") -> bool:
    """
    Approve a class and finalize searchMetadata.
    Returns True if successful.
    """
    try:
        doc_ref = db.collection("classes").document(class_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Class not found")
        
        class_data = doc.to_dict()
        
        # Update status and approval workflow
        updates = {
            "status": "approved",
            "updatedAt": datetime.now().isoformat(),
            "approvalWorkflow.reviewStatus": "approved",
            "approvalWorkflow.adminNotes": admin_notes,
            "approvalWorkflow.adminChecks.scheduleValid": True,
            "approvalWorkflow.adminChecks.pricingValid": True,
            "approvalWorkflow.adminChecks.contentClear": True,
            "approvalWorkflow.adminChecks.mentorQualified": True,
            "approvalWorkflow.adminChecks.capacityReasonable": True
        }
        
        # Regenerate final searchMetadata
        updates["searchMetadata"] = generate_search_metadata(class_data)
        
        doc_ref.update(updates)
        
        return True
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to approve class: {str(e)}")
