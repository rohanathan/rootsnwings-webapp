from app.services.firestore import db
from app.models.class_models import ClassItem, ClassSearchQuery
from datetime import date, datetime
from typing import List, Dict, Tuple
from fastapi import HTTPException

def search_classes(query: ClassSearchQuery) -> Tuple[List[ClassItem], int]:
    """
    Search classes with advanced filtering, sorting, and pagination.
    
    IMPORTANT: This function uses multiple Firestore filters which may require
    composite indexes. We'll implement this step-by-step to identify required indexes.
    """
    try:
        # Start with base query - only approved classes
        base_query = db.collection("classes").where("status", "==", "approved")
        
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
        
        # Apply basic filters to query (one at a time to avoid composite index issues)
        current_query = base_query
        
        # For now, let's apply only ONE additional filter to avoid composite index issues
        # We'll do the rest of the filtering in Python
        if filters:
            # Apply only the first filter to Firestore
            field, op, value = filters[0]
            current_query = current_query.where(field, op, value)
        
        # Get all documents and do complex filtering in Python
        docs = list(current_query.stream())
        
        # Convert to class objects and apply remaining filters
        classes = []
        for doc in docs:
            data = doc.to_dict()
            data["classId"] = doc.id
            
            # Apply remaining filters in Python
            should_include = True
            
            # Apply remaining Firestore filters in Python
            for i, (field, op, value) in enumerate(filters[1:], 1):
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
        docs = db.collection("classes").where("type", "==", "batch").where("status", "==", "approved").stream()
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
        query = classes_ref.where("mentorId", "==", mentor_id).where("status", "==", "approved")
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
        docs = db.collection("classes").where("status", "==", "approved").stream()
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
        docs = db.collection("classes").where("status", "==", "approved").stream()
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
