from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.models.review_models import (
    ReviewRequest, ReviewResponse, ReviewListResponse, 
    TestimonialsListResponse, Review
)
from app.services.review_service import (
    create_or_update_review, get_class_reviews, get_mentor_reviews,
    get_testimonials, delete_review
)
from app.services.auth_service import get_current_user

router = APIRouter(
    prefix="/reviews",
    tags=["Reviews"]
)

@router.post("/", response_model=ReviewResponse)
def create_review(
    review_request: ReviewRequest,
    current_user: dict = Depends(get_current_user)
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
    student_id = current_user.get("uid")
    review = create_or_update_review(student_id, review_request)
    return ReviewResponse(review=review)

@router.get("/class/{class_id}", response_model=ReviewListResponse)
def get_reviews_for_class(class_id: str):
    """
    Get all reviews for a specific class.
    Used for class detail pages.
    """
    reviews, avg_rating = get_class_reviews(class_id)
    return ReviewListResponse(
        reviews=reviews,
        total=len(reviews),
        avgRating=avg_rating
    )

@router.get("/mentor/{mentor_id}", response_model=ReviewListResponse)
def get_reviews_for_mentor(mentor_id: str):
    """
    Get all reviews for a specific mentor.
    Used for mentor profile pages.
    """
    reviews, avg_rating = get_mentor_reviews(mentor_id)
    return ReviewListResponse(
        reviews=reviews,
        total=len(reviews),
        avgRating=avg_rating
    )

@router.get("/testimonials", response_model=TestimonialsListResponse)
def get_testimonials_for_homepage(
    min_rating: int = 4,
    limit: int = 10
):
    """
    Get high-rated reviews for homepage testimonials.
    
    Filters:
    - Rating >= min_rating (default 4)
    - Anonymized student info
    - Includes mentor and class names
    """
    testimonials = get_testimonials(min_rating, limit)
    return TestimonialsListResponse(
        testimonials=testimonials,
        count=len(testimonials)
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

@router.get("/my-reviews", response_model=ReviewListResponse)
def get_my_reviews(current_user: dict = Depends(get_current_user)):
    """
    Get all reviews written by the current user.
    """
    from app.services.firestore import db
    
    student_id = current_user.get("uid")
    query = db.collection("reviews").where("studentId", "==", student_id)
    docs = list(query.stream())
    
    reviews = []
    for doc in docs:
        data = doc.to_dict()
        data["reviewId"] = doc.id
        reviews.append(Review(**data))
    
    avg_rating = sum(r.rating for r in reviews) / len(reviews) if reviews else 0
    
    return ReviewListResponse(
        reviews=reviews,
        total=len(reviews),
        avgRating=round(avg_rating, 2)
    )