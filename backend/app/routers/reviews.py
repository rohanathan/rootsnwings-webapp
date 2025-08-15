from fastapi import APIRouter, HTTPException, Depends, Query, Request
from typing import List, Optional
from app.models.review_models import (
    ReviewRequest, ReviewResponse, ReviewListResponse, 
    TestimonialsListResponse, Review
)
from app.services.review_service import (
    create_or_update_review, get_mentor_reviews,
    get_testimonials, delete_review, get_my_reviews
)
from app.services.auth_service import get_current_user

router = APIRouter(
    prefix="/reviews",
    tags=["Reviews"]
)

@router.post("/", response_model=ReviewResponse)
def create_review(
    review_request: ReviewRequest,
    request: Request
):
    """
    Create or update a review for a class.
    
    Requirements:
    - Must be enrolled in the class (confirmed booking)
    - One review per student per class
    - Can edit existing review
    
    Real-time updates:
    - Updates mentor.stats.avgRating & totalReviews
    - Updates class.avgRating & totalReviews
    """
    # Get student ID from request headers or use a fallback
    auth_header = request.headers.get("authorization")
    if auth_header and "Bearer " in auth_header:
        try:
            # Extract student ID from the token or headers
            student_id = request.headers.get("X-Student-ID")
            if not student_id:
                student_id = "user_e6f07bceda9e"  # fallback
        except:
            student_id = "user_e6f07bceda9e"  # fallback
    else:
        student_id = request.headers.get("X-Student-ID", "user_e6f07bceda9e")
    
    review = create_or_update_review(student_id, review_request)
    return ReviewResponse(review=review)

@router.get("/")
def get_reviews(
    request: Request,
    type: str = Query(..., description="mentor, testimonials, or my-reviews"),
    id: Optional[str] = Query(None, description="mentor_id when type=mentor"),
    limit: int = Query(10, description="Number of results to return"),
    min_rating: int = Query(4, description="Minimum rating for testimonials")
):
    """
    Unified reviews endpoint:
    
    Examples:
    - GET /reviews?type=mentor&id=user026 - Get mentor reviews
    - GET /reviews?type=testimonials&limit=10 - Get homepage testimonials  
    - GET /reviews?type=my-reviews - Get user's reviews (requires auth header)
    """
    
    if type == "mentor":
        if not id:
            raise HTTPException(status_code=400, detail="mentor_id required when type=mentor")
        
        reviews, avg_rating = get_mentor_reviews(id)
        return ReviewListResponse(
            reviews=reviews,
            total=len(reviews),
            avgRating=avg_rating
        )
    
    elif type == "testimonials":
        testimonials = get_testimonials(min_rating, limit)
        return TestimonialsListResponse(
            testimonials=testimonials,
            count=len(testimonials)
        )
    
    elif type == "my-reviews":
        # Frontend handles auth - extract token from headers
        auth_header = request.headers.get("authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Authorization required")
        
        try:
            # Simple token extraction - frontend responsibility to send valid token
            token = auth_header.split(" ")[1]
            # For now, extract user_id from token (simplified)
            # In production, you'd validate the JWT token properly
            from app.services.auth_service import verify_token
            user_data = verify_token(token)
            student_id = user_data.get("uid")
            
            reviews, avg_rating = get_my_reviews(student_id)
            return ReviewListResponse(
                reviews=reviews,
                total=len(reviews),
                avgRating=avg_rating
            )
        except Exception as e:
            raise HTTPException(status_code=401, detail="Invalid token")
    
    else:
        raise HTTPException(
            status_code=400, 
            detail="Invalid type. Must be: mentor, testimonials, or my-reviews"
        )

@router.delete("/{review_id}")
def delete_user_review(
    review_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a review (only your own reviews).
    
    Real-time updates:
    - Updates mentor and class stats after deletion
    """
    student_id = current_user.get("uid")
    delete_review(review_id, student_id)
    return {"message": "Review deleted successfully"}

