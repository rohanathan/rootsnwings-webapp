"""
Quick test script to add sample reviews and test the testimonials endpoint
"""
import firebase_admin
from firebase_admin import firestore
import sys
import os

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.config import get_firebase_app

def add_sample_reviews():
    """Add sample reviews to existing booking for testing testimonials"""
    
    # Initialize Firebase
    firebase_app = get_firebase_app()
    db = firestore.client(firebase_app)
    
    # Update the existing booking with sample review
    booking_ref = db.collection('bookings').document('booking_5f0db64c878d')
    
    booking_ref.update({
        'studentRating': 5,
        'studentReview': 'Amazing anime drawing class! Sarah taught me so much about character design and proportions. Highly recommend!',
        'bookingStatus': 'completed'  # Need completed status for reviews
    })
    
    print("✅ Added sample review to booking_5f0db64c878d")
    
    # Verify the update
    booking_doc = booking_ref.get()
    if booking_doc.exists:
        booking_data = booking_doc.to_dict()
        print(f"✅ Verified: Rating = {booking_data.get('studentRating')}")
        print(f"✅ Verified: Review = {booking_data.get('studentReview')}")
        print(f"✅ Verified: Status = {booking_data.get('bookingStatus')}")
    
    return True

if __name__ == "__main__":
    add_sample_reviews()