from fastapi import APIRouter, HTTPException
import stripe
from datetime import datetime

from app.models.payment_models import (
    PaymentIntent, PaymentIntentResponse, TEST_CARDS
)
from pydantic import BaseModel
from typing import Optional
from app.services.payment_service import payment_service

router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)

@router.post("/create-intent", response_model=PaymentIntentResponse)
def create_payment_intent(payment_request: PaymentIntent):
    """
    Create a Stripe payment intent for a booking.
    
    This generates a client secret that the frontend can use with Stripe.js
    to collect payment information securely.
    
    **Test Mode**: This uses Stripe's test environment with test API keys.
    """
    return payment_service.create_payment_intent(payment_request)

@router.get("/test-cards")
def get_test_cards():
    """
    Get list of Stripe test card numbers for demonstration.
    
    **For Dissertation Demo Only**: These cards simulate different payment scenarios:
    - Successful payments
    - Declined payments
    - Insufficient funds
    - Authentication required
    """
    return {
        "message": "Stripe test card numbers for demonstration",
        "test_cards": TEST_CARDS,
        "note": "These are official Stripe test cards - no real money is processed"
    }


# Stripe Checkout Session Models
class CheckoutSessionRequest(BaseModel):
    classId: str
    studentId: str
    mentorId: str
    amount: float  # in pounds, will convert to pence
    currency: str = "gbp"
    personalGoals: Optional[str] = None
    parentId: Optional[str] = None
    youngLearnerName: Optional[str] = None

@router.post("/create-checkout-session")
def create_checkout_session(request: CheckoutSessionRequest):
    """
    Create a Stripe Checkout Session for booking payment.
    Redirects user to Stripe's hosted checkout page.
    No booking is created until payment succeeds.
    """
    try:
        from app.config import settings
        
        # Set Stripe API key
        stripe.api_key = settings.stripe_secret_key
        
        # Convert amount to pence for Stripe
        amount_pence = int(request.amount * 100)
        
        # Get class and mentor details for the line item
        from app.services.class_service import fetch_class_by_id
        from app.services.mentor_service import fetch_mentor_by_id
        
        class_data = fetch_class_by_id(request.classId)
        mentor_data = fetch_mentor_by_id(request.mentorId)
        
        if not class_data:
            raise HTTPException(status_code=404, detail="Class not found")
        if not mentor_data:
            raise HTTPException(status_code=404, detail="Mentor not found")
        
        # Create Stripe checkout session
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": request.currency,
                    "product_data": {
                        "name": f"{getattr(class_data, 'title', 'Class')} with {getattr(mentor_data, 'displayName', 'Mentor')}",
                        "description": f"Learning session - {getattr(class_data, 'subject', '')}",
                    },
                    "unit_amount": amount_pence,
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url=f"{settings.frontend_url}/booking/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.frontend_url}/booking/confirmbooking/{request.classId}",
            metadata={
                "classId": request.classId,
                "studentId": request.studentId,
                "mentorId": request.mentorId,
                "amount": str(request.amount),
                "currency": request.currency,
                "personalGoals": request.personalGoals or "",
                "parentId": request.parentId or "",
                "youngLearnerName": request.youngLearnerName or "",
            }
        )
        
        return {
            "checkout_url": checkout_session.url,
            "session_id": checkout_session.id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create checkout session: {str(e)}")

@router.post("/confirm-payment")
def confirm_payment(booking_id: str, payment_intent_id: str):
    """
    Confirm payment and update booking status.
    Called after successful Stripe payment.
    """
    try:
        # Update booking to confirmed status
        from app.services.booking_service import update_booking_flexible
        
        update_data = {
            "bookingStatus": "confirmed",
            "paymentStatus": "paid", 
            "paymentIntentId": payment_intent_id,
            "confirmedAt": datetime.now().isoformat()
        }
        
        updated_booking = update_booking_flexible(booking_id, update_data)
        
        return {
            "success": True,
            "message": "Payment confirmed and booking updated",
            "booking": updated_booking
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to confirm payment: {str(e)}")

@router.get("/success")
def payment_success(session_id: str):
    """
    Handle successful payment from Stripe Checkout.
    Creates the final booking after payment confirmation.
    """
    try:
        from app.config import settings
        from app.services.booking_service import create_booking_flexible
        
        # Set Stripe API key
        stripe.api_key = settings.stripe_secret_key
        
        # Retrieve the Stripe session
        session = stripe.checkout.Session.retrieve(session_id)
        
        if session.payment_status != "paid":
            raise HTTPException(status_code=400, detail="Payment not completed")
        
        # Extract metadata
        metadata = session.metadata
        
        # Create the booking now that payment is confirmed
        booking_data = {
            "studentId": metadata["studentId"],
            "classId": metadata["classId"], 
            "mentorId": metadata["mentorId"],
            "bookingStatus": "confirmed",
            "paymentStatus": "paid",
            "stripeSessionId": session_id,
            "amount": float(metadata["amount"]),
            "currency": metadata["currency"],
            "personalGoals": metadata.get("personalGoals") or None,
            "parentId": metadata.get("parentId") or None,
            "youngLearnerName": metadata.get("youngLearnerName") or None,
            "confirmedAt": datetime.now().isoformat(),
        }
        
        booking = create_booking_flexible(booking_data)
        
        return {
            "success": True,
            "message": "Payment successful and booking created",
            "booking": booking,
            "session": {
                "id": session.id,
                "amount_total": session.amount_total,
                "currency": session.currency,
                "payment_status": session.payment_status
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process payment success: {str(e)}")

