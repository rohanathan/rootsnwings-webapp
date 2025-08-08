"""
DEPRECATED: Service for updating mentor statistics when reviews are submitted.

This service is now replaced by real-time stats updates in review_service.py
Reviews are no longer stored in bookings, but in a separate reviews collection.
"""
from typing import Optional
from app.services.firestore import db

def update_mentor_stats(mentor_id: str):
    """
    Recalculate and update mentor statistics based on all their reviews.
    
    Updates:
    - avgRating: Average of all student ratings
    - totalReviews: Count of bookings with reviews
    - totalStudents: Count of unique students who booked with this mentor
    """
    # Use existing Firestore client
    
    try:
        # Get all bookings for this mentor
        bookings_ref = db.collection('bookings')
        mentor_bookings = bookings_ref.where('mentorId', '==', mentor_id).stream()
        
        total_rating = 0
        review_count = 0
        unique_students = set()
        
        for booking_doc in mentor_bookings:
            booking_data = booking_doc.to_dict()
            
            # Count all students (for totalStudents)
            if booking_data.get('studentId'):
                unique_students.add(booking_data['studentId'])
            
            # Count only bookings with reviews (for avgRating and totalReviews)
            if booking_data.get('studentRating') and booking_data.get('studentReview'):
                total_rating += booking_data['studentRating']
                review_count += 1
        
        # Calculate new stats
        avg_rating = (total_rating / review_count) if review_count > 0 else 0
        total_students = len(unique_students)
        
        # Update mentor document
        mentor_ref = db.collection('mentors').document(mentor_id)
        
        # Get current mentor data to preserve other stats
        mentor_doc = mentor_ref.get()
        if not mentor_doc.exists:
            print(f"Warning: Mentor {mentor_id} not found")
            return False
        
        mentor_data = mentor_doc.to_dict()
        current_stats = mentor_data.get('stats', {})
        
        # Update only the review-related stats
        updated_stats = {
            **current_stats,  # Preserve existing stats like totalSessions, responseTimeMinutes, etc.
            'avgRating': round(avg_rating, 2),
            'totalReviews': review_count,
            'totalStudents': total_students
        }
        
        # Update the mentor document
        mentor_ref.update({
            'stats': updated_stats
        })
        
        print(f"Updated mentor {mentor_id} stats: avgRating={avg_rating:.2f}, totalReviews={review_count}, totalStudents={total_students}")
        return True
        
    except Exception as e:
        print(f"Error updating mentor stats for {mentor_id}: {str(e)}")
        return False

def get_mentor_stats(mentor_id: str) -> Optional[dict]:
    """
    Get current mentor statistics.
    """
    # Use existing Firestore client
    
    try:
        mentor_ref = db.collection('mentors').document(mentor_id)
        mentor_doc = mentor_ref.get()
        
        if mentor_doc.exists:
            mentor_data = mentor_doc.to_dict()
            return mentor_data.get('stats', {})
        else:
            return None
            
    except Exception as e:
        print(f"Error getting mentor stats for {mentor_id}: {str(e)}")
        return None