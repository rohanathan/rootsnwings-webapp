import stripe
import os
from pathlib import Path
from datetime import datetime
from typing import Optional, List, Tuple
from fastapi import HTTPException
import uuid

from app.models.payment_models import (
    PaymentIntent, PaymentIntentResponse, PaymentConfirmation, 
    Payment, RefundRequest, RefundResponse, PaymentStatus, Currency
)
from app.services.firestore import db
from app.services.booking_service import get_booking_by_id, update_booking

class PaymentService:
    """Stripe payment processing service"""
    
    def __init__(self):
        # Load Stripe API key from secrets file
        secrets_path = Path(__file__).parent.parent.parent.parent / "secrets" / "stripe.env"
        if secrets_path.exists():
            with open(secrets_path, 'r') as f:
                for line in f:
                    if line.startswith('STRIPE_SECRET_KEY='):
                        stripe.api_key = line.split('=', 1)[1].strip()
                        break
        else:
            # Fallback to environment variable
            stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
        
        if not stripe.api_key:
            raise ValueError("Stripe API key not found. Please set STRIPE_SECRET_KEY in secrets/stripe.env")
    
    def create_payment_intent(self, payment_request: PaymentIntent) -> PaymentIntentResponse:
        """Create a Stripe payment intent"""
        try:
            # Verify booking exists
            booking = get_booking_by_id(payment_request.bookingId)
            if not booking:
                raise HTTPException(status_code=404, detail="Booking not found")
            
            # Create Stripe payment intent
            intent = stripe.PaymentIntent.create(
                amount=payment_request.amount,
                currency=payment_request.currency.value,
                description=payment_request.description or f"Payment for booking {payment_request.bookingId}",
                receipt_email=payment_request.receiptEmail,
                metadata={
                    'booking_id': payment_request.bookingId,
                    **payment_request.metadata
                },
                automatic_payment_methods={
                    'enabled': True,
                }
            )
            
            # Save payment record to Firestore
            payment_id = f"pay_{uuid.uuid4().hex[:12]}"
            payment_data = {
                'paymentId': payment_id,
                'bookingId': payment_request.bookingId,
                'stripePaymentIntentId': intent.id,
                'amount': payment_request.amount,
                'currency': payment_request.currency.value,
                'status': PaymentStatus.PENDING.value,
                'description': payment_request.description,
                'receiptEmail': payment_request.receiptEmail,
                'metadata': payment_request.metadata,
                'createdAt': datetime.now().isoformat(),
                'updatedAt': datetime.now().isoformat(),
                'succeededAt': None,
                'refundedAmount': 0
            }
            
            db.collection('payments').document(payment_id).set(payment_data)
            
            return PaymentIntentResponse(
                paymentIntentId=payment_id,
                clientSecret=intent.client_secret,
                amount=intent.amount,
                currency=Currency(intent.currency),
                status=PaymentStatus.PENDING,
                description=intent.description
            )
            
        except stripe.error.StripeError as e:
            raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Payment intent creation failed: {str(e)}")
    
    def confirm_payment(self, payment_confirmation: PaymentConfirmation) -> Payment:
        """Confirm payment (usually called from webhook)"""
        try:
            # Get payment from Firestore
            payment_doc = db.collection('payments').document(payment_confirmation.paymentIntentId).get()
            if not payment_doc.exists:
                raise HTTPException(status_code=404, detail="Payment not found")
            
            payment_data = payment_doc.to_dict()
            
            # Update payment status
            update_data = {
                'status': payment_confirmation.status.value,
                'stripeChargeId': payment_confirmation.chargeId,
                'receiptUrl': payment_confirmation.receiptUrl,
                'updatedAt': datetime.now().isoformat()
            }
            
            if payment_confirmation.status == PaymentStatus.SUCCEEDED:
                update_data['succeededAt'] = datetime.now().isoformat()
                
                # Update booking payment status
                from app.models.booking_models import BookingUpdate, PaymentStatus as BookingPaymentStatus
                booking_update = BookingUpdate(paymentStatus=BookingPaymentStatus.PAID)
                update_booking(payment_data['bookingId'], booking_update)
            
            db.collection('payments').document(payment_confirmation.paymentIntentId).update(update_data)
            
            # Return updated payment
            updated_payment_data = {**payment_data, **update_data}
            return Payment(**updated_payment_data)
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Payment confirmation failed: {str(e)}")
    
    def process_refund(self, refund_request: RefundRequest) -> RefundResponse:
        """Process a refund through Stripe"""
        try:
            # Get payment from Firestore
            payment_doc = db.collection('payments').document(refund_request.paymentId).get()
            if not payment_doc.exists:
                raise HTTPException(status_code=404, detail="Payment not found")
            
            payment_data = payment_doc.to_dict()
            
            if not payment_data.get('stripeChargeId'):
                raise HTTPException(status_code=400, detail="Payment not charged yet")
            
            # Create refund in Stripe
            refund_amount = refund_request.amount or payment_data['amount']
            refund = stripe.Refund.create(
                charge=payment_data['stripeChargeId'],
                amount=refund_amount,
                reason=refund_request.reason or 'requested_by_customer'
            )
            
            # Update payment record
            current_refunded = payment_data.get('refundedAmount', 0)
            new_refunded_amount = current_refunded + refund_amount
            
            db.collection('payments').document(refund_request.paymentId).update({
                'refundedAmount': new_refunded_amount,
                'status': PaymentStatus.REFUNDED.value if new_refunded_amount >= payment_data['amount'] else PaymentStatus.SUCCEEDED.value,
                'updatedAt': datetime.now().isoformat()
            })
            
            # Update booking status if fully refunded
            if new_refunded_amount >= payment_data['amount']:
                from app.models.booking_models import BookingUpdate, PaymentStatus as BookingPaymentStatus
                booking_update = BookingUpdate(paymentStatus=BookingPaymentStatus.REFUNDED)
                update_booking(payment_data['bookingId'], booking_update)
            
            return RefundResponse(
                refundId=refund.id,
                paymentId=refund_request.paymentId,
                amount=refund_amount,
                currency=Currency(refund.currency),
                status=refund.status,
                reason=refund_request.reason
            )
            
        except stripe.error.StripeError as e:
            raise HTTPException(status_code=400, detail=f"Stripe refund error: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Refund processing failed: {str(e)}")
    
    def get_payment_by_id(self, payment_id: str) -> Optional[Payment]:
        """Get payment by ID"""
        try:
            payment_doc = db.collection('payments').document(payment_id).get()
            if not payment_doc.exists:
                return None
            
            payment_data = payment_doc.to_dict()
            return Payment(**payment_data)
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to get payment: {str(e)}")
    
    def get_payments_for_booking(self, booking_id: str) -> List[Payment]:
        """Get all payments for a booking"""
        try:
            payments_query = db.collection('payments').where('bookingId', '==', booking_id)
            payments_docs = payments_query.stream()
            
            payments = []
            for doc in payments_docs:
                payment_data = doc.to_dict()
                payments.append(Payment(**payment_data))
            
            return payments
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to get payments: {str(e)}")
    
    def get_all_payments(self, page: int = 1, page_size: int = 20) -> Tuple[List[Payment], int]:
        """Get all payments with pagination"""
        try:
            # Get total count
            total_docs = db.collection('payments').stream()
            total = sum(1 for _ in total_docs)
            
            # Get paginated results
            offset = (page - 1) * page_size
            query = db.collection('payments').order_by('createdAt', direction='DESCENDING')
            docs = query.offset(offset).limit(page_size).stream()
            
            payments = []
            for doc in docs:
                payment_data = doc.to_dict()
                payments.append(Payment(**payment_data))
            
            return payments, total
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to get payments: {str(e)}")

# Global payment service instance
payment_service = PaymentService()