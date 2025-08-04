"""
Add sample bookings with reviews for homepage testimonials
"""
from app.services.firestore import db
import uuid
from datetime import datetime

def add_sample_testimonials():
    """Add 4-5 sample bookings with high-rated reviews"""
    
    sample_bookings = [
        {
            "studentId": "user028",
            "studentName": "Emma T",
            "classId": "class_youtube_001", 
            "className": "YouTube Content Creation Mastery",
            "mentorId": "user027",
            "mentorName": "Alex Thompson",
            "rating": 5,
            "review": "Alex helped me grow my YouTube channel from 100 to 5000 subscribers! The editing techniques and content strategy were game-changing.",
            "userType": "Student"
        },
        {
            "studentId": "user029", 
            "studentName": "Michael R",
            "classId": "class_yoga_001",
            "className": "Mindful Yoga for Beginners", 
            "mentorId": "user030",
            "mentorName": "Priya Sharma",
            "rating": 5,
            "review": "Priya's yoga classes completely transformed my stress levels. Her gentle approach made yoga accessible for a complete beginner like me.",
            "userType": "Student"
        },
        {
            "studentId": "user031",
            "studentName": "Sophie K",
            "classId": "class_gamedev_001", 
            "className": "Game Development with Unity",
            "mentorId": "user032",
            "mentorName": "David Kim",
            "rating": 4,
            "review": "David's game development course was challenging but incredibly rewarding. Built my first 2D platformer game!",
            "userType": "Student",
            "parentId": "user030"  # Parent booking for young learner
        },
        {
            "studentId": "user033",
            "studentName": "Rachel M",
            "classId": "class_contentcreation_001",
            "className": "Social Media Content Creation",
            "mentorId": "user034", 
            "mentorName": "Jessica Taylor",
            "rating": 5,
            "review": "Jessica taught me how to create engaging Instagram and TikTok content. My follower count doubled in just 6 weeks!",
            "userType": "Student"
        },
        {
            "studentId": "user035",
            "studentName": "Oliver W", 
            "classId": "class_martialarts_001",
            "className": "Karate Fundamentals",
            "mentorId": "user036",
            "mentorName": "Sensei Williams",
            "rating": 4,
            "review": "Great introduction to karate. Sensei Williams emphasizes discipline and respect alongside the physical techniques.",
            "userType": "Student"
        }
    ]
    
    for booking_data in sample_bookings:
        booking_id = f"booking_{uuid.uuid4().hex[:12]}"
        
        # Create booking document
        booking = {
            "bookingId": booking_id,
            "studentId": booking_data["studentId"],
            "studentName": booking_data["studentName"],
            "classId": booking_data["classId"],
            "className": booking_data["className"], 
            "mentorId": booking_data["mentorId"],
            "mentorName": booking_data["mentorName"],
            "parentId": booking_data.get("parentId"),
            "youngLearnerName": None,
            "bookingStatus": "confirmed",
            "paymentStatus": "paid",
            "pricing": {
                "basePrice": 320.0,
                "discountsApplied": [],
                "finalPrice": 320.0,
                "currency": "GBP"
            },
            "scheduledSlots": [
                {
                    "sessionNumber": 1,
                    "date": "2025-08-05",
                    "dayOfWeek": "Tuesday", 
                    "startTime": "19:00",
                    "endTime": "20:30",
                    "status": "confirmed",
                    "attendanceStatus": "pending"
                }
            ],
            "attendanceRecord": [],
            "sessionProgress": {
                "totalSessions": 8,
                "completedSessions": 3,
                "attendedSessions": 3,
                "missedSessions": 0,
                "nextSessionNumber": 4,
                "progressPercentage": 37.5
            },
            "personalGoals": "Learn new skills and build confidence",
            "mentorNotes": None,
            "studentRating": booking_data["rating"],
            "studentReview": booking_data["review"],
            "bookedAt": "2025-07-15T10:00:00.000000",
            "confirmedAt": "2025-07-15T10:05:00.000000",
            "completedAt": None,
            "cancelledAt": None
        }
        
        # Add to Firestore
        db.collection('bookings').document(booking_id).set(booking)
        print(f"Added booking {booking_id}: {booking_data['studentName']} - {booking_data['className']} ({booking_data['rating']} stars)")

if __name__ == "__main__":
    add_sample_testimonials()