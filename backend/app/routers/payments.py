from fastapi import APIRouter, HTTPException
import stripe
from datetime import datetime

from app.models.payment_models import (
    PaymentIntent, PaymentIntentResponse, TEST_CARDS
)
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
            "status": "confirmed",
            "paymentStatus": "completed", 
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

