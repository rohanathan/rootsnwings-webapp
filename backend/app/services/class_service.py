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
        # Start with base query - exclude one-on-one classes from all listings
        base_query = db.collection("classes").where("type", "!=", "one-on-one")
        
        # We'll apply filters very carefully to avoid composite index issues
        # Start with the most basic filters first
        filters = []
        
        # Single-field filters (usually don't need composite indexes)
        if query.type:
            filters.append(("type", "==", query.type))
        
        if query.category:
            filters.append(("category", "==", query.category))
            
        if query.subject:
            # Handle comma-separated subjects
            subjects = [s.strip() for s in query.subject.split(',')]
            if len(subjects) == 1:
                filters.append(("subject", "==", subjects[0]))
            else:
                # Multiple subjects - use 'in' operator  
                filters.append(("subject", "in", subjects))
            
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
        
        # Apply safe filters to Firestore, complex ones to Python
        firestore_filters = []
        other_filters = []
        
        # These filters are safe for Firestore (single field, no composite index needed)
        safe_firestore_fields = ["type", "category", "subject", "level", "ageGroup", "format", "mentorId", "status"]
        
        for filter_item in filters:
            if filter_item[0] in safe_firestore_fields:
                firestore_filters.append(filter_item)
            else:
                other_filters.append(filter_item)
        
        # Apply Firestore filters 
        print(f"DEBUG: Applying Firestore filters: {firestore_filters}")
        print(f"DEBUG: Python filters: {other_filters}")
        for field, op, value in firestore_filters:
            print(f"DEBUG: Adding Firestore filter - {field} {op} {value}")
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
            
            # Apply remaining filters in Python (filters that couldn't be applied in Firestore)
            for field, op, value in filters:
                field_value = data.get(field)
                # Handle None values properly
                if field_value is None:
                    should_include = False
                    break
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
        # Exclude one-on-one classes and get batches only
        docs = db.collection("classes").where("type", "==", "batch").stream()
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
        
        # Ensure mentorName is set (required field for ClassItem validation)
        if not data.get("mentorName") and data.get("mentorId"):
            try:
                # First try to get from mentors collection
                from app.services.mentor_service import fetch_mentor_by_id
                mentor = fetch_mentor_by_id(data["mentorId"])
                if mentor and hasattr(mentor, 'displayName') and mentor.displayName:
                    data["mentorName"] = mentor.displayName
                else:
                    # Fallback: get displayName from users collection
                    user_doc = db.collection("users").document(data["mentorId"]).get()
                    if user_doc.exists:
                        user_data = user_doc.to_dict()
                        first_name = user_data.get("firstName", "")
                        last_name = user_data.get("lastName", "")
                        display_name = user_data.get("displayName", "")
                        
                        if display_name:
                            data["mentorName"] = display_name
                        elif first_name:
                            last_initial = last_name[0].upper() if last_name else ""
                            data["mentorName"] = f"{first_name} {last_initial}".strip()
                        else:
                            data["mentorName"] = "Unknown Mentor"
                    else:
                        data["mentorName"] = "Unknown Mentor"
            except Exception as e:
                print(f"Error fetching mentor name in fetch_class_by_id: {e}")
                data["mentorName"] = "Unknown Mentor"
        elif not data.get("mentorName"):
            data["mentorName"] = "Unknown Mentor"
        
        cleaned_data = clean_data(data)
        
        return ClassItem(**cleaned_data)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch class: {str(e)}")

def get_classes_by_mentor_id(mentor_id: str):
    """
    Fetches all approved classes (batch + workshops) created by a given mentor.
    Excludes one-on-one classes as they are private.
    """
    try:
        # This uses a composite query that might need an index
        classes_ref = db.collection("classes")
        # Exclude one-on-one classes from mentor class listings
        query = classes_ref.where("mentorId", "==", mentor_id).where("type", "!=", "one-on-one")
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
    # Remove internal/admin fields but preserve status for admin functionality
    data.pop("approvalWorkflow", None)
    # Keep searchMetadata for cultural map and frontend features
    # data.pop("searchMetadata", None)
    
    # Preserve status field for admin interface - this is essential
    # The status field will be: "pending", "approved", "rejected"
    
    # Ensure classId is set
    if "classId" not in data and "id" in data:
        data["classId"] = data["id"]
    
    # Ensure mentorName is set (required field for ClassItem validation)
    if not data.get("mentorName"):
        if data.get("mentorId"):
            try:
                # First try to get from mentors collection
                from app.services.mentor_service import fetch_mentor_by_id
                mentor = fetch_mentor_by_id(data["mentorId"])
                if mentor and hasattr(mentor, 'displayName') and mentor.displayName:
                    data["mentorName"] = mentor.displayName
                else:
                    # Fallback: get displayName from users collection
                    user_doc = db.collection("users").document(data["mentorId"]).get()
                    if user_doc.exists:
                        user_data = user_doc.to_dict()
                        first_name = user_data.get("firstName", "")
                        last_name = user_data.get("lastName", "")
                        display_name = user_data.get("displayName", "")
                        
                        if display_name:
                            data["mentorName"] = display_name
                        elif first_name:
                            last_initial = last_name[0].upper() if last_name else ""
                            data["mentorName"] = f"{first_name} {last_initial}".strip()
                        else:
                            data["mentorName"] = "Unknown Mentor"
                    else:
                        data["mentorName"] = "Unknown Mentor"
            except Exception as e:
                print(f"Error fetching mentor name in clean_data: {e}")
                data["mentorName"] = "Unknown Mentor"
        else:
            data["mentorName"] = "Unknown Mentor"
    
    # Add subject-based class images if not present
    if not data.get("classImage"):
        subject = data.get("subject", "").lower()
        category = data.get("category", "").lower()
        
        # Subject-based images
        subject_images = {
            "carnatic_vocal": "https://rafaacademy.in/wp-content/uploads/2025/03/carnatic-vocals.png",
            "guitar": "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&h=600&fit=crop", 
            "piano": "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&h=600&fit=crop",
            "violin": "https://images.unsplash.com/photo-1465821185615-20b3c2fbf41b?w=800&h=600&fit=crop",
            "dance": "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800&h=600&fit=crop",
            "yoga": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop",
            "art": "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop",
            "programming": "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop",
            "cooking": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
            "anime_character_drawing":"https://i.pinimg.com/736x/f5/cf/e3/f5cfe3103f2184921d567db80068bdd0.jpg",
            "bagpipes_playing" : "https://c.files.bbci.co.uk/6288/production/_127342252_paul_burns_reuters.jpg",
            "yoga":"https://images.indianexpress.com/2015/06/shilpa-shetty-yoga-759.jpg?w=600",
            "kung_fu":"https://www.shutterstock.com/image-photo/man-practises-martial-arts-dramatic-260nw-73460365.jpg",
            "malt_whisky_tasting":"https://www.worldwhiskyday.com/wp-content/uploads/2016/03/Whisky-flight.jpg",
            "3d_printing_design":"https://specials-images.forbesimg.com/imageserve/5f1a62d942a6387efb759310/960x0.jpg",
            "bharatanatyam_classical":"https://www.hinduamerican.org/wp-content/uploads/2022/02/nataraja.jpg",
            "hindustani_vocal":"https://themystickeys.com/wp-content/uploads/2024/12/images-30.jpg",
            "judo":"https://media.cnn.com/api/v1/images/stellar/prod/170818132444-judo-throw-baku-2017.jpg?q=w_3918,h_2578,x_0,y_0,c_fill",
            "ceilidh_music_instrumental":"https://i.scdn.co/image/ab67616d0000b273959d96d40da624c47b829dee",
            "mridangam":"https://c8.alamy.com/comp/CE8RCX/indian-percussion-instrument-mridangam-miniature-painting-on-paper-CE8RCX.jpg",
            "origami_art":"https://romania.cgsinc.com/wp-content/uploads/2016/06/IMG_2233.jpg",
            "scottish_cookery_haggis":"https://theblackfarmer.com/wp-content/uploads/2025/01/haggis-220g-chubb-1200x900.webp",
            "magic_illusions":"https://m.media-amazon.com/images/I/7150oGAgF2L._UF350,350_QL80_.jpg",
            "polka_dancing":"https://images.squarespace-cdn.com/content/v1/5a18683b64b05f9f4adeb4c7/1573751591119-QJJZ9E9K7UIV68JEGWVL/polka.jpg",
            "sitar":"https://static.vecteezy.com/system/resources/previews/010/419/426/non_2x/sitar-india-music-instrument-free-vector.jpg",
            "terrarium_making":"https://i.pinimg.com/736x/c1/70/43/c1704387041c8d985b13e0e741435009.jpg",
            "veena":"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSoDUCry3i--1iPj79Plqyyr21SHk37d6jCoUR1GMpRo5OKB6_ddB1fkl4XFpYtiY1YOUg&usqp=CAU",
            "hip_hop_dance":"https://i.etsystatic.com/16454555/r/il/1e6910/2413310801/il_1080xN.2413310801_oi8o.jpg",
            "kitemaking_indian":"https://www.shutterstock.com/editorial/image-editorial/ObTfM245McT9A8x2OTAxMg==/indian-kite-maker-jagmohan-kanojia-prepares-kites-440nw-9313323a.jpg",
            "lantern_making_hoi_an":"https://live.staticflickr.com/65535/48662393921_5ffd018797_h.jpg",
            "sake_appreciation":"https://www.localwineschool.com/images/event/SakeOverflow.jpg",
            "boxing" : "https://media.gq.com/photos/59ee10b166e2d56abcd79fd3/16:9/w_2560%2Cc_limit/gq-fitness-boxing.jpg",
            "french patisserie":"https://images.immediate.co.uk/production/volatile/sites/30/2018/10/apple-tart-patisserie-c005d5c.jpg",
            "swimming":"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/40._Schwimmzonen-_und_Mastersmeeting_Enns_2017_100m_Brust_Herren_USC_Traun-9897.jpg/960px-40._Schwimmzonen-_und_Mastersmeeting_Enns_2017_100m_Brust_Herren_USC_Traun-9897.jpg",
            "tai_chi":"https://mstrust.org.uk/sites/default/files/styles/meta_open_graph/public/tiles/Tai%20Chi.jpg?h=0738d7e3&itok=y9AnmsnW",
            "lego_building_and_robotics": "https://www.lego.com/cdn/cs/set/assets/bltcd461a16ee553ef0/Mindstroms-Build_Bot-TRACK3R-Sidekick-Standardfa39268afb269891b21f72b189e198c6b015ff89bad95355aa044bb683546555.jpg?fit=crop&format=jpg&quality=80&width=800&height=600&dpr=1",
            "ballet_classical" : "https://upload.wikimedia.org/wikipedia/commons/5/52/Edgar_Degas_-_The_Dance_Foyer_at_the_Opera_on_the_rue_Le_Peletier.jpg"
        }
        
        # Category fallback images
        category_images = {
            "music": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop",
            "arts": "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop",
            "fitness": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop",
            "technology": "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=600&fit=crop"
        }
        
        # Try subject first, then category, then default
        if subject in subject_images:
            data["classImage"] = subject_images[subject]
        elif category in category_images:
            data["classImage"] = category_images[category]
        else:
            data["classImage"] = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop"  # Default education image
    
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
        
        # === KEYWORDS AND CULTURAL CONTEXT ===
        
        # Generate keywords for search optimization
        keywords = generate_class_keywords(class_data)
        metadata["keywords"] = keywords
        
        # Add cultural context if available
        cultural_context = generate_cultural_context(class_data)
        if cultural_context:
            metadata.update(cultural_context)
        
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

def generate_class_keywords(class_data: Dict) -> List[str]:
    """
    Generate search keywords from class data for enhanced discoverability.
    """
    keywords = []
    
    # Core class information
    title = class_data.get("title", "")
    subject = class_data.get("subject", "")
    category = class_data.get("category", "")
    description = class_data.get("description", "")
    
    # Add obvious keywords
    if title:
        keywords.extend(title.lower().split())
    if subject:
        keywords.extend(subject.lower().split())
    if category:
        keywords.append(category.lower())
    
    # Add level and age group keywords
    level = class_data.get("level", "")
    age_group = class_data.get("ageGroup", "")
    class_format = class_data.get("format", "")
    
    if level:
        keywords.append(level.lower())
    if age_group:
        keywords.append(age_group.lower())
        # Add synonyms
        if age_group.lower() == "child":
            keywords.extend(["kids", "children"])
        elif age_group.lower() == "teen":
            keywords.extend(["teenager", "youth"])
    if class_format:
        keywords.append(class_format.lower())
    
    # Extract meaningful words from description
    if description:
        desc_words = [word.strip().lower() for word in description.split() 
                     if len(word) > 3 and word.isalpha()]
        keywords.extend(desc_words[:10])  # Limit to first 10 meaningful words
    
    # Remove duplicates and empty strings
    keywords = list(set([k for k in keywords if k.strip()]))
    
    return keywords[:20]  # Limit to 20 keywords max

def generate_cultural_context(class_data: Dict) -> Dict:
    """
    Generate cultural context by trying to match subject to cultural database.
    Returns cultural metadata or basic context for non-cultural subjects.
    """
    cultural_context = {}
    
    subject = class_data.get("subject", "").lower()
    category = class_data.get("category", "").lower()
    
    # Try to match to cultural subjects using simple keyword matching
    cultural_match = match_subject_to_cultural_data(subject, category)
    
    if cultural_match:
        # Found cultural match - use rich cultural context
        cultural_context = {
            "cultural_origin_region": cultural_match.get("region"),
            "heritage_context": cultural_match.get("heritage_context", "folk"),
            "cultural_authenticity_score": cultural_match.get("cultural_authenticity_score", 0.5),
            "cultural_significance_level": cultural_match.get("cultural_significance_level", 0.5),
            "is_culturally_rooted": cultural_match.get("is_culturally_rooted", False),
            "cultural_keywords": cultural_match.get("cultural_keywords", []),
            "tradition_or_school": cultural_match.get("tradition_or_school"),
        }
    else:
        # No cultural match - provide basic context for non-rooted classes
        cultural_context = {
            "cultural_origin_region": "Worldwide",
            "heritage_context": "modern",
            "cultural_authenticity_score": 0.3,
            "cultural_significance_level": 0.2,
            "is_culturally_rooted": False,
            "cultural_keywords": ["contemporary", "modern"],
            "tradition_or_school": None
        }
    
    # Add mentor cultural score (placeholder - will be enhanced)
    cultural_context["mentor_cultural_score"] = 0.5
    cultural_context["combined_cultural_score"] = (
        cultural_context["cultural_authenticity_score"] * 0.7 + 
        cultural_context["mentor_cultural_score"] * 0.3
    )
    
    return cultural_context

def match_subject_to_cultural_data(subject_text: str, category: str) -> Optional[Dict]:
    """
    Simple matching logic to connect free-text subjects to cultural database.
    """
    # Simple keyword-based mapping for common cultural subjects
    cultural_mappings = {
        "bharatanatyam": {
            "region": "India", 
            "heritage_context": "classical",
            "cultural_authenticity_score": 0.95,
            "cultural_significance_level": 0.9,
            "is_culturally_rooted": True,
            "cultural_keywords": ["classical", "traditional", "temple", "devotional", "indian"],
            "tradition_or_school": "Tamil Nadu Classical Dance"
        },
        "bagpipe": {
            "region": "Scotland",
            "heritage_context": "folk", 
            "cultural_authenticity_score": 0.8,
            "cultural_significance_level": 0.7,
            "is_culturally_rooted": True,
            "cultural_keywords": ["scottish", "traditional", "highland", "folk music", "celtic"],
            "tradition_or_school": "Scottish Highland Tradition"
        },
        "origami": {
            "region": "Japan",
            "heritage_context": "folk",
            "cultural_authenticity_score": 0.8,
            "cultural_significance_level": 0.7, 
            "is_culturally_rooted": True,
            "cultural_keywords": ["japanese", "traditional", "paper folding", "meditative", "zen"],
            "tradition_or_school": "Traditional Japanese Paper Art"
        }
    }
    
    # Check for direct matches
    for key, cultural_data in cultural_mappings.items():
        if key in subject_text.lower():
            return cultural_data
    
    # Check for broader cultural patterns
    if any(word in subject_text.lower() for word in ["indian", "classical", "traditional"]):
        if "dance" in subject_text.lower():
            return cultural_mappings.get("bharatanatyam")
    
    return None

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
        if not class_data.get("mentorName") and class_data.get("mentorId"):
            try:
                # First try to get from mentors collection
                from app.services.mentor_service import fetch_mentor_by_id
                mentor = fetch_mentor_by_id(class_data["mentorId"])
                if mentor and hasattr(mentor, 'displayName') and mentor.displayName:
                    class_data["mentorName"] = mentor.displayName
                else:
                    # Fallback: get displayName from users collection
                    user_doc = db.collection("users").document(class_data["mentorId"]).get()
                    if user_doc.exists:
                        user_data = user_doc.to_dict()
                        first_name = user_data.get("firstName", "")
                        last_name = user_data.get("lastName", "")
                        display_name = user_data.get("displayName", "")
                        
                        if display_name:
                            class_data["mentorName"] = display_name
                        elif first_name:
                            last_initial = last_name[0].upper() if last_name else ""
                            class_data["mentorName"] = f"{first_name} {last_initial}".strip()
                        else:
                            class_data["mentorName"] = "Unknown Mentor"
                    else:
                        class_data["mentorName"] = "Unknown Mentor"
            except Exception as e:
                print(f"Error fetching mentor name: {e}")
                class_data["mentorName"] = "Unknown Mentor"
        elif not class_data.get("mentorName"):
            class_data["mentorName"] = "Unknown Mentor"
        
        # Add system fields
        now = datetime.now().isoformat()
        class_data["classId"] = class_id
        class_data["createdAt"] = now
        class_data["updatedAt"] = now
        class_data["status"] = "pending"  # Classes need admin approval
        
        # Auto-generate searchMetadata
        class_data["searchMetadata"] = generate_search_metadata(class_data)
        
        # Initialize approval workflow for admin review
        class_data["approvalWorkflow"] = {
            "reviewStatus": "pending",
            "adminNotes": "",
            "adminChecks": {
                "scheduleValid": False,
                "pricingValid": False,
                "contentClear": False,
                "mentorQualified": False,
                "capacityReasonable": False
            }
        }
        
        # Save to Firestore
        doc_ref = db.collection("classes").document(class_id)
        doc_ref.set(class_data)
        
        return class_id
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create class: {str(e)}")

def update_class_flexible(class_id: str, update_data: dict) -> dict:
    """Pure MongoDB-style flexible class update - accept ANY fields"""
    try:
        doc_ref = db.collection("classes").document(class_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Class not found")
        
        # Pure flexibility - use whatever frontend sends
        flexible_update = update_data.copy()
        flexible_update["updatedAt"] = datetime.now().isoformat()
        
        # If mentorId is being updated or mentorName is being cleared, fetch mentor name
        current_data = doc.to_dict()
        if ("mentorId" in flexible_update and flexible_update["mentorId"]) or (flexible_update.get("mentorName") is None):
            mentor_id = flexible_update.get("mentorId", current_data.get("mentorId"))
            if mentor_id:
                try:
                    from app.services.mentor_service import fetch_mentor_by_id
                    mentor = fetch_mentor_by_id(mentor_id)
                    if mentor and hasattr(mentor, 'displayName'):
                        flexible_update["mentorName"] = mentor.displayName
                    else:
                        flexible_update["mentorName"] = "Unknown Mentor"
                except:
                    flexible_update["mentorName"] = "Unknown Mentor"
        
        # Update with ANY fields
        doc_ref.update(flexible_update)
        
        # Return updated class as clean data
        updated_doc = doc_ref.get()
        updated_data = updated_doc.to_dict()
        updated_data["classId"] = class_id
        return clean_data(updated_data)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update class: {str(e)}")