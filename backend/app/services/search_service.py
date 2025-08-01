from app.services.firestore import db
from google.cloud.firestore_v1.base_query import BaseQuery
from google.api_core import exceptions as google_exceptions

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
    """
    Builds and executes a robust Firestore query for classes with multiple filters.
    This version uses the correct field paths based on your JSON schema to ensure
    it will trigger an index creation error when necessary.
    """
    try:
        query_ref: BaseQuery = db.collection("classes")

        # --- Chain .where() clauses using CORRECT field paths from your schema ---

        if category:
            # 'category' is a top-level field in your schema.
            query_ref = query_ref.where("category", "==", category)

        if city:
            # Assuming 'city' is inside the 'location' object.
            # The path must be "location.city" if that's the structure in the DB.
            # Your schema's location object is generic, so we'll assume a 'city' field.
            # **VERIFY THIS PATH IS CORRECT IN YOUR ACTUAL FIRESTORE DATA.**
            query_ref = query_ref.where("location.city", "==", city)
        
        if subject:
            # 'subject' is a top-level field.
            query_ref = query_ref.where("subject", "==", subject)

        if level:
            # 'level' is a top-level field.
            query_ref = query_ref.where("level", "==", level)

        if age_group:
            # 'ageGroup' is a top-level field.
            query_ref = query_ref.where("ageGroup", "==", age_group)

        if class_format:
            # 'format' is a top-level field.
            query_ref = query_ref.where("format", "==", class_format)
        
        if is_online is not None:
            # 'isOnline' is inside 'searchMetadata' in your schema.
            # THIS IS A CRITICAL CORRECTION.
            query_ref = query_ref.where("searchMetadata.isOnline", "==", is_online)
        
        if min_rating:
            # 'mentorRating' is a top-level field.
            # This is a range filter. You can only have one per query.
            query_ref = query_ref.where("mentorRating", ">=", min_rating)

        # Execute the fully constructed query
        docs = query_ref.stream()
        results = [doc.to_dict() for doc in docs]
        return results

    except google_exceptions.InvalidArgument as e:
        # This is the specific error for a missing index. We make sure it's visible.
        print(f"!!! FIRESTORE INDEX REQUIRED !!!\n{e}\n")
        raise e
    except Exception as e:
        print(f"An unexpected error occurred during search: {e}")
        raise e
