from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum

class PaymentStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing" 
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"

class Currency(str, Enum):
    GBP = "gbp"  # Stripe uses lowercase
    USD = "usd"
    EUR = "eur"

class PaymentIntent(BaseModel):
    """Create payment intent for Stripe"""
    bookingId: str
    amount: int  # Amount in smallest currency unit (pence for GBP)
    currency: Currency = Currency.GBP
    description: Optional[str] = None
    receiptEmail: Optional[str] = None
    metadata: Optional[Dict[str, str]] = Field(default_factory=dict)

class PaymentIntentResponse(BaseModel):
    """Response from Stripe payment intent creation"""
    paymentIntentId: str
    clientSecret: str  # Frontend needs this for Stripe.js
    amount: int
    currency: Currency
    status: PaymentStatus
    description: Optional[str] = None

class PaymentConfirmation(BaseModel):
    """Confirm a payment (usually from webhook)"""
    paymentIntentId: str
    stripePaymentIntentId: str
    status: PaymentStatus
    amount: int
    currency: Currency
    receiptUrl: Optional[str] = None
    chargeId: Optional[str] = None

class RefundRequest(BaseModel):
    """Request a refund"""
    paymentId: str
    amount: Optional[int] = None  # If None, full refund
    reason: Optional[str] = None

class RefundResponse(BaseModel):
    """Refund response"""
    refundId: str
    paymentId: str
    amount: int
    currency: Currency
    status: str
    reason: Optional[str] = None

class Payment(BaseModel):
    """Complete payment record"""
    paymentId: str
    bookingId: str
    stripePaymentIntentId: str
    stripeChargeId: Optional[str] = None
    amount: int  # In smallest currency unit
    currency: Currency
    status: PaymentStatus
    description: Optional[str] = None
    receiptUrl: Optional[str] = None
    receiptEmail: Optional[str] = None
    metadata: Optional[Dict[str, str]] = Field(default_factory=dict)
    createdAt: datetime
    updatedAt: datetime
    succeededAt: Optional[datetime] = None
    refundedAmount: Optional[int] = 0

class PaymentResponse(BaseModel):
    payment: Payment

class PaymentListResponse(BaseModel):
    payments: List[Payment]
    total: int
    page: int
    pageSize: int
    totalPages: int

# Stripe webhook event model
class StripeWebhookEvent(BaseModel):
    id: str
    type: str
    data: Dict[str, Any]
    created: int

# Test card model for dissertation demo
class TestCard(BaseModel):
    number: str
    exp_month: int
    exp_year: int
    cvc: str
    description: str

# Common test cards for demonstration
TEST_CARDS = [
    TestCard(
        number="4242424242424242",
        exp_month=12,
        exp_year=2025,
        cvc="123",
        description="Visa - Always succeeds"
    ),
    TestCard(
        number="4000000000000002",
        exp_month=12,
        exp_year=2025,
        cvc="123",
        description="Visa - Always declined"
    ),
    TestCard(
        number="4000000000009995",
        exp_month=12,
        exp_year=2025,
        cvc="123",
        description="Visa - Always declined with insufficient funds"
    )
]