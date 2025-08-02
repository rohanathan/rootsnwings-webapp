from fastapi import APIRouter, HTTPException, Query, Request
from typing import List
import stripe
import json

from app.models.payment_models import (
    PaymentIntent, PaymentIntentResponse, PaymentConfirmation,
    Payment, PaymentResponse, PaymentListResponse,
    RefundRequest, RefundResponse, TEST_CARDS
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

@router.post("/webhook")
async def stripe_webhook(request: Request):
    """
    Stripe webhook endpoint to handle payment events.
    
    This endpoint receives real-time notifications from Stripe about payment status changes.
    In production, this would be secured with webhook signatures.
    """
    try:
        payload = await request.body()
        sig_header = request.headers.get('stripe-signature')
        
        # In production, verify webhook signature here
        # For demo purposes, we'll skip signature verification
        
        event = stripe.Event.construct_from(
            json.loads(payload), stripe.api_key
        )
        
        # Handle payment intent succeeded
        if event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            
            # Find our payment record
            booking_id = payment_intent.get('metadata', {}).get('booking_id')
            if booking_id:
                # Update payment status
                confirmation = PaymentConfirmation(
                    paymentIntentId=f"pay_{payment_intent['id']}",  # This might need adjustment
                    stripePaymentIntentId=payment_intent['id'],
                    status="succeeded",
                    amount=payment_intent['amount'],
                    currency=payment_intent['currency'],
                    chargeId=payment_intent.get('latest_charge')
                )
                
                payment_service.confirm_payment(confirmation)
        
        # Handle payment intent failed
        elif event['type'] == 'payment_intent.payment_failed':
            payment_intent = event['data']['object']
            # Handle failed payment logic here
            pass
        
        return {"received": True}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Webhook error: {str(e)}")

@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(payment_id: str):
    """
    Get payment details by ID.
    """
    payment = payment_service.get_payment_by_id(payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return {"payment": payment}

@router.get("/booking/{booking_id}")
def get_payments_for_booking(booking_id: str):
    """
    Get all payments associated with a booking.
    """
    payments = payment_service.get_payments_for_booking(booking_id)
    return {"payments": payments, "total": len(payments)}

@router.post("/refund", response_model=RefundResponse)
def process_refund(refund_request: RefundRequest):
    """
    Process a payment refund through Stripe.
    
    **Test Mode**: Refunds are processed in Stripe's test environment.
    """
    return payment_service.process_refund(refund_request)

@router.get("/", response_model=PaymentListResponse)
def get_all_payments(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page")
):
    """
    Get all payments with pagination (Admin only in production).
    """
    payments, total = payment_service.get_all_payments(page, page_size)
    total_pages = (total + page_size - 1) // page_size
    
    return PaymentListResponse(
        payments=payments,
        total=total,
        page=page,
        pageSize=page_size,
        totalPages=total_pages
    )

@router.get("/demo/info")
def get_demo_info():
    """
    Information about the payment demo for dissertation purposes.
    """
    return {
        "title": "Stripe Payment Integration Demo",
        "description": "This demonstrates a complete payment processing system using Stripe's test environment",
        "features": [
            "Payment intent creation",
            "Secure payment processing with Stripe.js",
            "Webhook handling for real-time updates",
            "Refund processing",
            "Payment status tracking"
        ],
        "test_environment": {
            "note": "All payments use Stripe's test mode",
            "test_cards_endpoint": "/payments/test-cards",
            "webhook_url": "/payments/webhook"
        },
        "security_features": [
            "PCI DSS compliance through Stripe",
            "No card data stored on our servers",
            "Webhook signature verification (in production)",
            "Secure client secrets for frontend"
        ]
    }