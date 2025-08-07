from fastapi import APIRouter
from app.services.booking_service import get_bookings_by_student

router = APIRouter(
    prefix="/debug",
    tags=["Debug"]
)

@router.get("/student-bookings/{student_id}")
def debug_student_bookings(student_id: str):
    """Debug student bookings using new simple booking system"""
    try:
        bookings, total = get_bookings_by_student(student_id, page=1, page_size=50)
        return {
            "student_id": student_id,
            "total_bookings": total,
            "bookings": [
                {
                    "bookingId": booking.bookingId,
                    "classId": booking.classId,
                    "bookingStatus": booking.bookingStatus,
                    "paymentStatus": booking.paymentStatus,
                    "finalPrice": booking.pricing.finalPrice if booking.pricing else 0
                }
                for booking in bookings
            ]
        }
    except Exception as e:
        return {"error": str(e), "details": str(type(e))}