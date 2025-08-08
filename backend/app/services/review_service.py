from app.services.firestore import db
from app.models.review_models import Review, ReviewRequest, ReviewUpdate, TestimonialResponse
from app.services.booking_service import get_bookings_by_student, get_simple_booking
from datetime import datetime
from typing import List, Optional, Tuple
from fastapi import HTTPException
import uuid

def check_review_eligibility(student_id: str, class_id: str) -> str:
    """
    Check if student is eligible to review this class.
    Returns booking_id if eligible, raises HTTPException if not.
    """
    # Get student's bookings
    bookings, _ = get_bookings_by_student(student_id, page=1, page_size=100)
    
    # Find booking for this class
    class_booking = None
    for booking in bookings:
        if booking.classId == class_id and booking.bookingStatus.value in ['confirmed', 'completed']:
            class_booking = booking
            break
    
    if not class_booking:
        raise HTTPException(
            status_code=403, 
            detail="You must be enrolled in this class to leave a review"
        )
    
    return class_booking.bookingId

def get_existing_review(student_id: str, class_id: str) -> Optional[Review]:
    """Check if student already has a review for this class"""
    query = db.collection("reviews").where("studentId", "==", student_id).where("classId", "==", class_id)
    docs = list(query.stream())
    
    if docs:
        data = docs[0].to_dict()
        data["reviewId"] = docs[0].id
        return Review(**data)
    
    return None

def create_or_update_review(student_id: str, review_request: ReviewRequest) -> Review:
    """Create new review or update existing one"""
    try:
        # Check eligibility
        booking_id = check_review_eligibility(student_id, review_request.classId)
        
        # Get class info for mentor_id
        class_doc = db.collection("classes").document(review_request.classId).get()
        if not class_doc.exists:
            raise HTTPException(status_code=404, detail="Class not found")
        
        class_data = class_doc.to_dict()
        mentor_id = class_data.get("mentorId")
        
        if not mentor_id:
            raise HTTPException(status_code=400, detail="Class has no mentor assigned")
        
        # Check if review already exists
        existing_review = get_existing_review(student_id, review_request.classId)
        
        if existing_review:
            # Update existing review
            review_id = existing_review.reviewId
            updated_data = {
                "rating": review_request.rating,
                "review": review_request.review,
                "updatedAt": datetime.now().isoformat()
            }
            
            db.collection("reviews").document(review_id).update(updated_data)
            
            # Get updated review
            updated_doc = db.collection("reviews").document(review_id).get()
            data = updated_doc.to_dict()
            data["reviewId"] = review_id
            review = Review(**data)
            
        else:
            # Create new review
            review_id = f"review_{uuid.uuid4().hex[:12]}"
            
            review_data = {
                "reviewId": review_id,
                "classId": review_request.classId,
                "mentorId": mentor_id,
                "studentId": student_id,
                "bookingId": booking_id,
                "rating": review_request.rating,
                "review": review_request.review,
                "isAnonymous": True,
                "createdAt": datetime.now().isoformat(),
                "updatedAt": None
            }
            
            db.collection("reviews").document(review_id).set(review_data)
            review = Review(**review_data)
        
        # Update stats in real-time
        _update_mentor_stats(mentor_id)
        _update_class_stats(review_request.classId)
        
        return review
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create/update review: {str(e)}")

def _update_mentor_stats(mentor_id: str):
    """Recalculate and update mentor stats"""
    try:
        # Get all reviews for this mentor
        query = db.collection("reviews").where("mentorId", "==", mentor_id)
        reviews = list(query.stream())
        
        if not reviews:
            return
        
        total_reviews = len(reviews)
        total_rating = sum(doc.to_dict().get("rating", 0) for doc in reviews)
        avg_rating = round(total_rating / total_reviews, 2)
        
        # Update mentor stats
        mentor_ref = db.collection("mentors").document(mentor_id)
        mentor_ref.update({
            "stats.avgRating": avg_rating,
            "stats.totalReviews": total_reviews
        })
        
    except Exception as e:
        print(f"Failed to update mentor stats: {e}")

def _update_class_stats(class_id: str):
    """Recalculate and update class stats"""
    try:
        # Get all reviews for this class
        query = db.collection("reviews").where("classId", "==", class_id)
        reviews = list(query.stream())
        
        if not reviews:
            return
        
        total_reviews = len(reviews)
        total_rating = sum(doc.to_dict().get("rating", 0) for doc in reviews)
        avg_rating = round(total_rating / total_reviews, 2)
        
        # Update class stats
        class_ref = db.collection("classes").document(class_id)
        class_ref.update({
            "avgRating": avg_rating,
            "totalReviews": total_reviews
        })
        
    except Exception as e:
        print(f"Failed to update class stats: {e}")

def get_class_reviews(class_id: str) -> Tuple[List[Review], float]:
    """Get all reviews for a class with average rating"""
    query = db.collection("reviews").where("classId", "==", class_id)
    docs = list(query.stream())
    
    reviews = []
    total_rating = 0
    
    for doc in docs:
        data = doc.to_dict()
        data["reviewId"] = doc.id
        review = Review(**data)
        reviews.append(review)
        total_rating += review.rating
    
    avg_rating = round(total_rating / len(reviews), 2) if reviews else 0
    
    return reviews, avg_rating

def get_mentor_reviews(mentor_id: str) -> Tuple[List[Review], float]:
    """Get all reviews for a mentor with average rating"""
    query = db.collection("reviews").where("mentorId", "==", mentor_id)
    docs = list(query.stream())
    
    reviews = []
    total_rating = 0
    
    for doc in docs:
        data = doc.to_dict()
        data["reviewId"] = doc.id
        review = Review(**data)
        reviews.append(review)
        total_rating += review.rating
    
    avg_rating = round(total_rating / len(reviews), 2) if reviews else 0
    
    return reviews, avg_rating

def get_testimonials(min_rating: int = 4, limit: int = 10) -> List[TestimonialResponse]:
    """Get high-rated reviews for homepage testimonials"""
    query = db.collection("reviews").where("rating", ">=", min_rating).limit(limit)
    docs = list(query.stream())
    
    testimonials = []
    
    for doc in docs:
        review_data = doc.to_dict()
        
        # Get additional info for testimonial
        try:
            # Get class info
            class_doc = db.collection("classes").document(review_data["classId"]).get()
            class_data = class_doc.to_dict() if class_doc.exists else {}
            
            # Get mentor info
            mentor_doc = db.collection("mentors").document(review_data["mentorId"]).get()
            mentor_data = mentor_doc.to_dict() if mentor_doc.exists else {}
            
            # Check if parent booking
            booking_doc = db.collection("bookings").document(review_data["bookingId"]).get()
            booking_data = booking_doc.to_dict() if booking_doc.exists else {}
            user_type = "Parent" if booking_data.get("parentId") else "Student"
            
            testimonial = TestimonialResponse(
                studentName="Anonymous",
                studentInitial="S",  # Could enhance this later
                mentorName=mentor_data.get("displayName", "Mentor"),
                className=class_data.get("title", "Class"),
                rating=review_data["rating"],
                review=review_data["review"],
                userType=user_type,
                createdAt=review_data["createdAt"]
            )
            
            testimonials.append(testimonial)
            
        except Exception as e:
            print(f"Error building testimonial: {e}")
            continue
    
    return testimonials

def delete_review(review_id: str, student_id: str):
    """Delete a review and update stats"""
    try:
        review_doc = db.collection("reviews").document(review_id).get()
        
        if not review_doc.exists:
            raise HTTPException(status_code=404, detail="Review not found")
        
        review_data = review_doc.to_dict()
        
        # Check ownership
        if review_data["studentId"] != student_id:
            raise HTTPException(status_code=403, detail="You can only delete your own reviews")
        
        # Delete review
        db.collection("reviews").document(review_id).delete()
        
        # Update stats
        _update_mentor_stats(review_data["mentorId"])
        _update_class_stats(review_data["classId"])
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete review: {str(e)}")