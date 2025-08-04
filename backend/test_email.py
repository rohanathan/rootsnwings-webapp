"""
Quick test script to debug email configuration
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("=== Email Configuration Debug ===")
print(f"RESEND_API_KEY: {'SET' if os.getenv('RESEND_API_KEY') else 'NOT SET'}")
print(f"FROM_EMAIL: {os.getenv('FROM_EMAIL', 'NOT SET')}")
print(f"FRONTEND_URL: {os.getenv('FRONTEND_URL', 'NOT SET')}")
print(f"BACKEND_URL: {os.getenv('BACKEND_URL', 'NOT SET')}")

# Test email service
try:
    from app.services.email_service import email_service, send_welcome_email
    
    print(f"\nEmail service enabled: {email_service.enabled}")
    print(f"API Key configured: {bool(email_service.api_key)}")
    
    # Test sending welcome email to your Resend account email
    result = send_welcome_email("rohanathan.s1412@gmail.com", "Rohan", "student")
    print(f"Email send result: {result}")
    
except Exception as e:
    print(f"Error testing email service: {str(e)}")
    import traceback
    traceback.print_exc()