# app/services/search_service.py
from app.services.firestore import db
from google.cloud.firestore_v1.base_query import BaseQuery

def search_classes_with_filters(
    category: str = None,
    city: str = None,
    min_rating: float = None,
    q: str = None
) -> list:
    """
    Builds and executes a Firestore query for classes with multiple filters.
    This is now designed to fail correctly if an index is missing.
    """
    # Start with the base collection
    query_ref: BaseQuery = db.collection("classes")

    # IMPORTANT: Chain .where() clauses. Each 'if' adds another filter to the same query object.
    
    # Filter by category (assuming it's in a 'searchMetadata' map)
    if category:
        # NOTE: The field path 'searchMetadata.category' must exactly match your Firestore document structure.
        query_ref = query_ref.where("searchMetadata.category", "==", category)

    # Filter by city (assuming it's in a 'location' map)
    if city:
        query_ref = query_ref.where("location.city", "==", city)
        
    # Filter by minimum rating (a range operator)
    if min_rating:
        # NOTE: You can only use one range (<, <=, >, >=) operator per query.
        query_ref = query_ref.where("searchMetadata.mentorRating", ">=", min_rating)

    # Filter by keyword using 'array-contains'
    if q:
        # NOTE: The field 'searchKeywords' must be an array of strings in your documents.
        # The operator is "array-contains", not "array_contains".
        query_ref = query_ref.where("searchKeywords", "array-contains", q.lower())

    # Now, execute the fully constructed query
    try:
        docs = query_ref.stream()
        results = []
        for doc in docs:
            data = doc.to_dict()
            data["classId"] = doc.id
            results.append(data)
        return results
    except Exception as e:
        # This will catch the Firestore error and print it clearly.
        print(f"Firestore Query Failed: {e}")
        # Re-raise the exception so FastAPI shows the error.
        raise e

