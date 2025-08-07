"""
Email service using Resend API
Perfect integration with Next.js and React Email templates
"""
import requests
import uuid
from datetime import datetime, timedelta
import os
from typing import Optional, Dict, Any, List
from app.services.firestore import db

# Resend Configuration
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@rootsnwings.com") 
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

class ResendEmailService:
    """
    Email service using Resend API
    """
    
    def __init__(self):
        self.api_key = RESEND_API_KEY
        self.base_url = "https://api.resend.com"
        self.enabled = bool(self.api_key)
        
    def send_email(self, to: str | List[str], subject: str, html: str, 
                   from_email: str = None, reply_to: str = None) -> bool:
        """Send email using Resend API"""
        try:
            if not self.enabled:
                print(f"Resend not configured - Email would be sent: {subject} to {to}")
                return True
            
            # Prepare email data
            email_data = {
                "from": from_email or FROM_EMAIL,
                "to": to if isinstance(to, list) else [to],
                "subject": subject,
                "html": html
            }
            
            if reply_to:
                email_data["reply_to"] = reply_to
            
            # Send via Resend API
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            response = requests.post(
                f"{self.base_url}/emails",
                json=email_data,
                headers=headers
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"Email sent successfully to {to}, ID: {result.get('id', 'unknown')}")
                return True
            else:
                print(f"Failed to send email: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"Error sending email: {str(e)}")
            return False

# Email Templates (Simple HTML for now - can be replaced with React Email)
class EmailTemplates:
    """
    Email templates - these will be replaced with React Email components in frontend
    """
    
    @staticmethod
    def base_template(title: str, content: str, cta_text: str = None, cta_link: str = None) -> str:
        """Base email template with Roots & Wings branding"""
        cta_html = ""
        if cta_text and cta_link:
            cta_html = f"""
            <div style="text-align: center; margin: 30px 0;">
                <a href="{cta_link}" 
                   style="background-color: #00A2E8; color: white; padding: 15px 30px; 
                          text-decoration: none; border-radius: 8px; font-weight: bold; 
                          display: inline-block; font-size: 16px;">
                    {cta_text}
                </a>
            </div>
            """
        
        return f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>{title}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                     line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; 
                     padding: 20px; background-color: #f8fbff;">
            
            <!-- Main Container -->
            <div style="background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <div style="text-align: center; border-bottom: 3px solid #00A2E8; padding-bottom: 20px; margin-bottom: 30px;">
                    <h1 style="color: #00468C; margin: 0; font-size: 28px; font-weight: bold;">Roots & Wings</h1>
                    <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Educational Mentorship Platform</p>
                </div>
                
                <!-- Content -->
                <div style="margin-bottom: 30px;">
                    {content}
                </div>
                
                <!-- CTA Button -->
                {cta_html}
                
                <!-- Footer -->
                <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 40px; 
                            text-align: center; font-size: 12px; color: #666;">
                    <p style="margin: 5px 0;">© 2025 Roots & Wings. All rights reserved.</p>
                    <p style="margin: 5px 0;">
                        <a href="{FRONTEND_URL}/unsubscribe" style="color: #00A2E8; text-decoration: none;">Unsubscribe</a> | 
                        <a href="mailto:support@rootsnwings.com" style="color: #00A2E8; text-decoration: none;">Support</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
    
    @staticmethod
    def welcome_email(user_name: str, user_type: str = "student") -> str:
        """Welcome email after successful registration"""
        content = f"""
        <h2 style="color: #00468C; margin-bottom: 20px;">Welcome to Roots & Wings, {user_name}! 🎉</h2>
        <p style="font-size: 16px; margin-bottom: 15px;">
            Thank you for joining our educational mentorship platform. We're excited to help you on your learning journey!
        </p>
        <p style="margin-bottom: 15px;">Here's what you can do next:</p>
        <ul style="margin-bottom: 20px; padding-left: 20px;">
            <li style="margin-bottom: 8px;">Complete your profile to get personalized recommendations</li>
            <li style="margin-bottom: 8px;">Browse our amazing mentors and classes</li>
            <li style="margin-bottom: 8px;">Book your first session</li>
        </ul>
        <p>If you have any questions, our support team is here to help!</p>
        """
        
        dashboard_url = f"{FRONTEND_URL}/dashboard" if user_type == "student" else f"{FRONTEND_URL}/mentor/dashboard"
        
        return EmailTemplates.base_template(
            title="Welcome to Roots & Wings!",
            content=content,
            cta_text="Get Started",
            cta_link=dashboard_url
        )
    
    @staticmethod
    def email_verification(user_name: str, verification_link: str) -> str:
        """Email verification template"""
        content = f"""
        <h2 style="color: #00468C; margin-bottom: 20px;">Verify Your Email Address</h2>
        <p style="font-size: 16px; margin-bottom: 15px;">Hi {user_name},</p>
        <p style="margin-bottom: 15px;">
            To complete your Roots & Wings account setup, please verify your email address by clicking the button below.
        </p>
        <div style="background-color: #f8fbff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #00A2E8;">
            <p style="margin: 0; font-size: 14px; color: #666;">
                ⏰ This verification link expires in 24 hours for security.
            </p>
        </div>
        <p style="margin-bottom: 15px;">
            If you didn't create this account, please ignore this email.
        </p>
        """
        
        return EmailTemplates.base_template(
            title="Verify Your Email - Roots & Wings",
            content=content,
            cta_text="Verify Email Address",
            cta_link=verification_link
        )
    
    @staticmethod
    def password_reset(user_name: str, reset_link: str) -> str:
        """Password reset email template"""
        content = f"""
        <h2 style="color: #00468C; margin-bottom: 20px;">Reset Your Password</h2>
        <p style="font-size: 16px; margin-bottom: 15px;">Hi {user_name},</p>
        <p style="margin-bottom: 15px;">
            We received a request to reset your password for your Roots & Wings account.
        </p>
        <p style="margin-bottom: 15px;">
            Click the button below to create a new password:
        </p>
        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0; font-size: 14px; color: #856404;">
                ⚠️ This reset link expires in 1 hour for security.
            </p>
        </div>
        <p style="margin-bottom: 15px;">
            <strong>If you didn't request this reset, please ignore this email.</strong> 
            Your account remains secure and no changes have been made.
        </p>
        """
        
        return EmailTemplates.base_template(
            title="Reset Your Password - Roots & Wings",
            content=content,
            cta_text="Reset Password",
            cta_link=reset_link
        )
    
    @staticmethod
    def booking_confirmation(student_name: str, class_name: str, mentor_name: str, 
                           booking_details: Dict[str, Any]) -> str:
        """Booking confirmation email"""
        # Format sessions
        sessions_html = ""
        if booking_details.get("scheduledSlots"):
            sessions_html = """
            <div style="margin: 20px 0;">
                <h4 style="color: #00468C; margin-bottom: 10px;">📅 Scheduled Sessions:</h4>
                <ul style="list-style: none; padding: 0;">
            """
            for i, slot in enumerate(booking_details["scheduledSlots"][:3]):
                sessions_html += f"""
                <li style="background-color: #f8fbff; padding: 10px; margin: 5px 0; border-radius: 6px; border-left: 3px solid #00A2E8;">
                    <strong>Session {slot.get('sessionNumber', i+1)}:</strong> {slot['date']} at {slot['startTime']} - {slot['endTime']}
                </li>
                """
            if len(booking_details["scheduledSlots"]) > 3:
                remaining = len(booking_details["scheduledSlots"]) - 3
                sessions_html += f"""
                <li style="padding: 10px; color: #666; font-style: italic;">
                    ... and {remaining} more session{'s' if remaining > 1 else ''}
                </li>
                """
            sessions_html += "</ul></div>"
        
        content = f"""
        <h2 style="color: #00468C; margin-bottom: 20px;">🎉 Booking Confirmed!</h2>
        <p style="font-size: 16px; margin-bottom: 15px;">Hi {student_name},</p>
        <p style="margin-bottom: 20px;">
            Great news! Your booking has been confirmed. Here are your class details:
        </p>
        
        <div style="background-color: #f8fbff; padding: 25px; border-radius: 10px; margin: 25px 0; border: 2px solid #e6f7ff;">
            <h3 style="margin-top: 0; color: #00468C; margin-bottom: 15px;">📚 Class Details</h3>
            <p style="margin: 8px 0;"><strong>Class:</strong> {class_name}</p>
            <p style="margin: 8px 0;"><strong>Mentor:</strong> {mentor_name}</p>
            <p style="margin: 8px 0;"><strong>Total Price:</strong> £{booking_details.get('pricing', {}).get('finalPrice', 0)}</p>
            <p style="margin: 8px 0;"><strong>Payment Status:</strong> ✅ {booking_details.get('paymentStatus', 'Confirmed').title()}</p>
            
            {sessions_html}
        </div>
        
        <p style="margin-bottom: 15px;">
            📧 You'll receive reminder emails before each session.
        </p>
        <p style="margin-bottom: 15px;">
            Need to reschedule or have questions? Contact your mentor or our support team.
        </p>
        <p style="font-size: 16px; color: #00468C; font-weight: bold;">
            We're excited for your learning journey to begin! 🚀
        </p>
        """
        
        return EmailTemplates.base_template(
            title="Booking Confirmed - Roots & Wings",
            content=content,
            cta_text="View My Bookings",
            cta_link=f"{FRONTEND_URL}/dashboard/bookings"
        )
    
    @staticmethod
    def mentor_application_status(mentor_name: str, status: str) -> str:
        """Mentor application status update"""
        if status == "approved":
            title = "🎉 Mentor Application Approved!"
            emoji = "✅"
            message = "Congratulations! Your mentor application has been approved. You can now start accepting students and hosting classes."
            cta_text = "Start Teaching"
            cta_link = f"{FRONTEND_URL}/mentor/dashboard"
        elif status == "rejected":
            title = "Mentor Application Update"
            emoji = "❌"
            message = "Thank you for your interest in becoming a mentor. Unfortunately, we cannot approve your application at this time. Please feel free to reapply in the future."
            cta_text = "Contact Support"
            cta_link = "mailto:support@rootsnwings.com"
        else:
            title = "Mentor Application Received"
            emoji = "⏳"
            message = "Thank you for your mentor application! We're currently reviewing your submission and will get back to you within 2-3 business days."
            cta_text = "View Application"
            cta_link = f"{FRONTEND_URL}/mentor/application-status"
        
        content = f"""
        <h2 style="color: #00468C; margin-bottom: 20px;">{title}</h2>
        <p style="font-size: 16px; margin-bottom: 15px;">Hi {mentor_name},</p>
        <div style="text-align: center; font-size: 48px; margin: 20px 0;">{emoji}</div>
        <p style="margin-bottom: 20px; font-size: 16px;">{message}</p>
        """
        
        return EmailTemplates.base_template(
            title=title,
            content=content,
            cta_text=cta_text,
            cta_link=cta_link
        )

# Token Management for Email Verification
def generate_verification_token(user_id: str, token_type: str = "email_verification", expires_hours: int = 24) -> str:
    """Generate and store verification token in Firestore"""
    token = f"{token_type}_{uuid.uuid4().hex}"
    expires_at = datetime.utcnow() + timedelta(hours=expires_hours)
    
    token_doc = {
        "token": token,
        "userId": user_id,
        "tokenType": token_type,
        "used": False,
        "createdAt": datetime.utcnow().isoformat(),
        "expiresAt": expires_at.isoformat()
    }
    
    db.collection('verification_tokens').document(token).set(token_doc)
    return token

def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify and consume token"""
    try:
        token_doc = db.collection('verification_tokens').document(token).get()
        
        if not token_doc.exists:
            return None
        
        token_data = token_doc.to_dict()
        
        # Check expiration
        expires_at = datetime.fromisoformat(token_data['expiresAt'])
        if datetime.utcnow() > expires_at:
            return None
        
        # Check if already used
        if token_data.get('used', False):
            return None
        
        # Mark as used
        db.collection('verification_tokens').document(token).update({
            'used': True,
            'usedAt': datetime.utcnow().isoformat()
        })
        
        return token_data
        
    except Exception as e:
        print(f"Error verifying token: {str(e)}")
        return None

# Initialize services
email_service = ResendEmailService()
email_templates = EmailTemplates()

# Email helper functions
def send_welcome_email(user_email: str, user_name: str, user_type: str = "student") -> bool:
    """Send welcome email after registration"""
    html_content = email_templates.welcome_email(user_name, user_type)
    return email_service.send_email(
        to=user_email,
        subject="Welcome to Roots & Wings! 🎉",
        html=html_content
    )

def send_verification_email(user_email: str, user_name: str, user_id: str) -> bool:
    """Send email verification"""
    token = generate_verification_token(user_id, "email_verification", 24)
    verification_link = f"{FRONTEND_URL}/verify-email?token={token}"
    
    html_content = email_templates.email_verification(user_name, verification_link)
    return email_service.send_email(
        to=user_email,
        subject="Verify Your Email Address - Roots & Wings",
        html=html_content
    )

def send_password_reset_email(user_email: str, user_name: str, user_id: str) -> bool:
    """Send password reset email"""
    token = generate_verification_token(user_id, "password_reset", 1)  # 1 hour expiry
    reset_link = f"{FRONTEND_URL}/reset-password?token={token}"
    
    html_content = email_templates.password_reset(user_name, reset_link)
    return email_service.send_email(
        to=user_email,
        subject="Reset Your Password - Roots & Wings",
        html=html_content
    )

def send_booking_confirmation_email(booking_data: Dict[str, Any]) -> bool:
    """Send booking confirmation email"""
    # Get class and mentor data from Firestore for email template
    try:
        class_doc = db.collection('classes').document(booking_data["classId"]).get()
        mentor_doc = db.collection('mentors').document(booking_data["mentorId"]).get()
        user_doc = db.collection('users').document(booking_data["studentId"]).get()
        
        if not all([class_doc.exists, mentor_doc.exists, user_doc.exists]):
            print("Missing class, mentor, or user data for booking confirmation")
            return False
            
        class_data = class_doc.to_dict()
        mentor_data = mentor_doc.to_dict()
        user_data = user_doc.to_dict()
        
        # Build email template data
        email_booking_data = {
            **booking_data,
            "className": class_data.get("title", "Class"),
            "mentorName": mentor_data.get("displayName", "Mentor"),
            "studentName": user_data.get("displayName", "Student"),
            # Generate sessions from class schedule for email display
            "scheduledSlots": generate_session_preview(class_data, booking_data)
        }
        
        html_content = email_templates.booking_confirmation(
            student_name=email_booking_data["studentName"],
            class_name=email_booking_data["className"],
            mentor_name=email_booking_data["mentorName"],
            booking_details=email_booking_data
        )
        
        user_email = user_data.get("email")
        if user_email:
            return email_service.send_email(
                to=user_email,
                subject=f"Booking Confirmed: {email_booking_data['className']} - Roots & Wings",
                html=html_content
            )
                
    except Exception as e:
        print(f"Error sending booking confirmation: {str(e)}")
    
    return False

def generate_session_preview(class_data: Dict[str, Any], booking_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Generate a preview of sessions for email (first 3 sessions)"""
    try:
        from datetime import datetime, timedelta
        
        schedule = class_data.get("schedule", {})
        weekly_schedule = schedule.get("weeklySchedule", [])
        
        if not weekly_schedule:
            return []
        
        # Simple preview generation - first 3 sessions
        preview_sessions = []
        current_date = datetime.now()
        session_number = 1
        
        for week in range(3):  # Show first 3 weeks
            for day_schedule in weekly_schedule:
                if len(preview_sessions) >= 3:
                    break
                    
                session_date = current_date + timedelta(days=week*7 + day_schedule.get("dayOfWeek", 0))
                preview_sessions.append({
                    "sessionNumber": session_number,
                    "date": session_date.strftime("%Y-%m-%d"),
                    "startTime": day_schedule.get("startTime", "18:00"),
                    "endTime": day_schedule.get("endTime", "19:00")
                })
                session_number += 1
                
        return preview_sessions
        
    except Exception:
        return []

def send_mentor_status_email(mentor_id: str, status: str) -> bool:
    """Send mentor application status update"""
    try:
        # Get mentor and user data
        mentor_doc = db.collection('mentors').document(mentor_id).get()
        user_doc = db.collection('users').document(mentor_id).get()
        
        if mentor_doc.exists and user_doc.exists:
            mentor_name = mentor_doc.to_dict().get("displayName", "Mentor")
            user_email = user_doc.to_dict().get("email")
            
            if user_email:
                html_content = email_templates.mentor_application_status(mentor_name, status)
                subject = f"Mentor Application {status.title()} - Roots & Wings"
                
                return email_service.send_email(
                    to=user_email,
                    subject=subject,
                    html=html_content
                )
    except Exception as e:
        print(f"Error sending mentor status email: {str(e)}")
    
    return False