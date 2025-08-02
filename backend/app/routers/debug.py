from fastapi import APIRouter
from app.services.student_booking_service import StudentBookingService

router = APIRouter(
    prefix="/debug",
    tags=["Debug"]
)

@router.post("/refresh-student/{student_id}")
def refresh_student_booking_summary(student_id: str):
    """Manually refresh student booking summary for testing"""
    try:
        StudentBookingService.update_student_booking_summary(student_id, None)
        return {"message": f"Refreshed booking summary for {student_id}"}
    except Exception as e:
        return {"error": str(e)}

@router.get("/student-bookings/{student_id}")
def debug_student_bookings(student_id: str):
    """Debug student bookings to see what's going wrong"""
    try:
        bookings = StudentBookingService._get_active_bookings(student_id)
        return {
            "student_id": student_id,
            "active_bookings": len(bookings),
            "bookings": [
                {
                    "bookingId": booking.bookingId,
                    "status": booking.bookingStatus,
                    "className": booking.className,
                    "scheduledSlots": len(booking.scheduledSlots),
                    "hasSessionProgress": hasattr(booking, 'sessionProgress') and booking.sessionProgress is not None
                }
                for booking in bookings
            ]
        }
    except Exception as e:
        return {"error": str(e), "details": str(type(e))}