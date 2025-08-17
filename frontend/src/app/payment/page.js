'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import axios from 'axios';

// Load Stripe with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_...');

function PaymentForm({ clientSecret, bookingId }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    // Confirm payment with Stripe
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/booking/success?booking_id=${bookingId}`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Complete Your Payment</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <PaymentElement 
          options={{
            layout: 'tabs',
          }}
        />
        
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {errorMessage}
          </div>
        )}
        
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
            isProcessing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isProcessing ? 'Processing...' : 'Pay Now'}
        </button>
      </form>
    </div>
  );
}

export default function PaymentPage() {
  const [clientSecret, setClientSecret] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get payment data from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const clientSecretParam = urlParams.get('client_secret');
    const bookingIdParam = urlParams.get('booking_id');
    
    if (clientSecretParam && bookingIdParam) {
      setClientSecret(clientSecretParam);
      setBookingId(bookingIdParam);
      setLoading(false);
    } else {
      // Fallback to localStorage
      const storedPaymentData = localStorage.getItem('payment_data');
      if (storedPaymentData) {
        const data = JSON.parse(storedPaymentData);
        setPaymentData(data);
        setClientSecret(data.client_secret);
        setBookingId(data.booking_id);
        setLoading(false);
      } else {
        // Redirect back if no payment data
        window.location.href = '/';
      }
    }
  }, []); 

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment...</p>
        </div>
      </div>
    );
  }

  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#2563eb',
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Payment summary */}
        {paymentData && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Payment Summary</h1>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold">£{paymentData.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Currency:</span>
                <span className="font-semibold">{paymentData.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Booking ID:</span>
                <span className="font-semibold text-sm">{paymentData.booking_id}</span>
              </div>
            </div>
          </div>
        )}

        {/* Stripe payment form */}
        {clientSecret && clientSecret !== 'undefined' && (
          <Elements options={options} stripe={stripePromise}>
            <PaymentForm clientSecret={clientSecret} bookingId={bookingId} />
          </Elements>
        )}

        {/* Error state for invalid client secret */}
        {(!clientSecret || clientSecret === 'undefined') && !loading && (
          <div className="max-w-md mx-auto bg-red-50 border border-red-200 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-red-800 mb-4">Payment Error</h2>
            <p className="text-red-700 mb-4">
              There was an issue creating the payment session. This could be due to:
            </p>
            <ul className="list-disc list-inside text-red-700 mb-4 space-y-1">
              <li>Server configuration issues</li>
              <li>Invalid booking details</li>
              <li>Payment processing temporarily unavailable</li>
            </ul>
            <button
              onClick={() => window.location.href = '/workshop/listing'}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold"
            >
              Go Back to Workshops
            </button>
          </div>
        )}

        {/* Test card info */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Test Mode - Use Test Cards</h3>
          <p className="text-sm text-yellow-700">
            Use card number: <code className="bg-yellow-100 px-2 py-1 rounded">4242 4242 4242 4242</code>
            <br />
            Expiry: Any future date, CVC: Any 3 digits
          </p>
        </div>
      </div>
    </div>
  );
}