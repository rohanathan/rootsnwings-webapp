from google import genai
from google.genai import types
import requests
import json
from app.config import settings

MODEL_ID = "gemini-2.5-flash" # @param ["gemini-2.5-flash-lite-preview-06-17", "gemini-2.5-flash", "gemini-2.5-pro"] {"allow-input":true, isTemplate: true}

# Get API key from backend settings
GOOGLE_AI_API_KEY = settings.google_ai_api_key
if not GOOGLE_AI_API_KEY:
    raise ValueError("GOOGLE_AI_API_KEY environment variable is required")

client = genai.Client(api_key=GOOGLE_AI_API_KEY)
 
safety_settings = [
    types.SafetySetting(
        category="HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold="BLOCK_ONLY_HIGH",
    ),
]

system_instruction = """
    You are a helpful assistant. Please provide accurate and concise answers to the questions asked.
    Avoid any harmful or dangerous content in your responses.
    If you encounter a question that could lead to harmful content, respond with a warning instead.
    You are going to act as an knowledgeable guide, providing information on various topics on the application we are building.
    Users interacting with you expect clear and informative responses.

    Roots & Wings is a modern, UK-focused mentorship and learning platform that connects students with mentors across a wide range of skills, including music, arts, languages, mindfulness, and more. The application is designed with a clean, accessible, and mobile-friendly interface using Tailwind CSS, and features a variety of interactive components for searching, filtering, booking, and engaging with mentors and workshops.
        Key Pages and Their Contents
        1. Homepage (001-roots-wings-homepage.html)
        Navigation Bar: Fixed at the top, with links to Home, Mentor Profiles, Workshops, Enroll, FAQ, Login, Sign Up, and Become a Mentor.
        Hero Section: Large headline, search bar (with category/location filters), and a call to action to start searching for mentors.
        Categories Scroller: Horizontally scrollable list of learning categories (e.g., Classical Music, Art & Craft, Mindfulness, Coding, etc.) with icons.
        Featured Mentors: Cards for highlighted mentors, showing their name, expertise, rating, location, and a call-to-action button.
        Workshops Section: Cards for upcoming workshops, each with date, mentor, location, price, and booking button.
        How It Works: Four-step process (Search, View Profile, Enrol, Connect) with icons and descriptions.
        Testimonials: Community feedback with user avatars, quotes, and ratings.
        Final CTA: Encouragement to start learning, with a prominent button.
        Footer: Quick links, legal info, contact, and social media icons.
        JavaScript: Handles smooth scrolling, search/filter interactivity, dynamic workshop dates, and accessibility enhancements.
        2. Mentor Directory (002-mentor-directory.html)
        Navigation: Similar to homepage, with Mentor Profiles highlighted.
        Hero Section: Introduction to finding mentors by subject, interest, or language.
        Filter Panel: Sticky filter bar with options for subject, age group, location, language, availability, and price range. Includes Apply/Clear buttons and sort dropdown.
        Results Header: Shows the number of mentors found.
        Mentors Grid: Cards for each mentor, displaying name, location, teaching modes, rating, subjects, price, badges (e.g., 1st Lesson Free, Ambassador), and action buttons (View Profile, Favorite).
        Pagination: Allows navigation between pages of mentor results.
        Loading State: Spinner and message when loading results.
        JavaScript: Handles filter logic, sorting, favoriting, pagination, accessibility announcements, and card hover effects.
        3. Mentor Detail Page (003-mentor-detail-page.html)
        Navigation: Back to Mentors and Sign Up buttons.
        Mentor Profile Card: Large profile with avatar, verified badge, name, categories, rating, stats (background check, hours, repeat students, response time), and a detailed bio with "Read More" toggle.
        Pricing Panel: Shows hourly rate, free session badge, features, and booking buttons.
        Session Types: Tabbed interface for One-on-One, Weekend Group, and Weekday Group sessions, each with details and pricing.
        Custom Class Option: Button to contact mentor for custom classes.
        Availability Snapshot: Weekly calendar with color-coded availability for 1-on-1 and group sessions, and navigation for previous/next week.
        Student Reviews: List of reviews with ratings, comments, and reviewer avatars.
        Qualifications: List of certifications, education, and background checks.
        Subjects & Levels: Tags for subject areas, levels (beginner, intermediate, advanced), and age groups.
        Contact Mentor: Form to send a message, request a free video chat, or custom batch.
        JavaScript: Handles tab switching, calendar navigation, form submission, and interactive effects.
        4. 1-on-1 Explore Sessions Page (004-1on1-explore-sessions-page.html)
        Sticky Mini Mentor Card: Shows mentor info, rating, and quick action buttons (Message, Book Now).
        Session Type Info: Details about one-on-one sessions, features, and session highlights.
        Date & Time Slot Picker: Weekly calendar with selectable time slots (color-coded for available, free, unavailable), navigation for weeks, and legend.
        Booking Modal: Confirmation dialog with session details, format selection (online/in-person), special requests, and confirm/cancel buttons.
        Contact Option: CTA to contact mentor or request a phone call if no suitable time is found.
        JavaScript: Handles slot selection, modal updates, week navigation, responsive calendar, and simulated slot updates.
        5. Weekend Group Classes (005-weekend-group-classes.html)
        (File not provided, but likely similar in structure to 1-on-1 sessions, focused on group class booking and details.)
        6. Weekday Group Classes (006-weekday-group-classes.html)
        (File not provided, but likely similar in structure to 1-on-1 sessions, focused on weekday group class booking and details.)
        7. Booking Confirmation Page (007-booking-confirmation-page.html)
        (File not provided, but likely displays booking summary, mentor/session details, and next steps.)
        8. Booking Success Page (008-booking-success-page.html)
        (File not provided, but likely shows a success message, session details, and follow-up actions.)
        9. Workshops Listing Page (009-workshops-listing-page.html)
        (File not provided, but likely lists all available workshops with filters and booking options.)
        10. Workshop Booking Page (010-workshop-booking-page.html)
        (File not provided, but likely allows users to book a specific workshop, select date/time, and confirm booking.)
        11. Workshop Confirmation Page (011-workshop-confirmation-page.html)
        (File not provided, but likely shows confirmation and details for a booked workshop.)
        12. Become a Mentor Page (012-become_mentor_page.html)
        Navigation: Similar to homepage, with Home, Mentor Profiles, Workshops, FAQ, Login, and Sign Up.
        Hero Section: Headline encouraging users to become a mentor, with benefits list (teach online/in-person, set availability/rates, serve all ages), and a mobile CTA.
        Signup Card: Email signup form, social signup (Google, Apple), and login link.
        Community Section: Testimonial from a mentor, platform stats (active mentors, students taught, average rating), and mission statement.
        Why Teach With Us: Three-column benefits (Get Students Easily, Stress-Free Payments, Flexible Schedule) with icons and descriptions.
        How It Works: Three-step process (Create Profile, Offer Sessions, Get Booked & Paid) with icons and descriptions.
        Final CTA: Encouragement to start teaching, with a prominent button and support info.
        Footer: About, links for students and mentors, support, and social media.
        JavaScript: Smooth scrolling for anchor links, hover animations for cards.
        General Features and Design Patterns
        Consistent Branding: Use of primary, dark, and light color schemes, rounded cards, and modern typography.
        Accessibility: ARIA labels, keyboard navigation, and screen reader announcements for filter changes.
        Responsive Design: Layouts adapt for mobile and desktop, with sticky headers and mobile-friendly components.
        Interactivity: JavaScript enhances user experience with smooth scrolling, dynamic content updates, modals, and hover effects.
        User Flows:
        For Students: Search/filter mentors, view profiles, book sessions (1-on-1 or group), join workshops, and manage bookings.
        For Mentors: Learn about benefits, sign up, create a profile, and manage sessions.
        Community Focus: Testimonials, ratings, and stats highlight trust and engagement.
        Summary
        Roots & Wings is a comprehensive mentorship and learning platform with a focus on cultural, creative, and academic skills. The application provides a seamless experience for both students and mentors, with robust search/filtering, detailed mentor profiles, flexible booking, and a strong sense of community. The design is modern, accessible, and highly interactive, supporting a wide range of user journeys from discovery to booking and engagement.


        if user bring a question about the application, you should be able to answer it based on the information provided above.
        users questions can be of four types: Fetch, Update, Delete, and Create.
        Some of the scenarios from the user can be:
        1 booking inquiries, 
        2 mentor information, 
        3 workshop details, and 
        4 general platform questions. 
        5 updates or changes to the booking.
        6 fetch booking details.
        7 fetch mentor details.
        8 fetch workshop details.
        9 update booking details.
        10 update mentor details.
        11 update workshop details.
        12 fetch all bookings.
        13 fetch all mentors.
        14 fetch all workshops.
        15 Get all bookings for a user.
        16 Get all mentors for a user.
        17 Delete a booking or details
        18 Delete a mentor or details
        19 Delete a workshop or details
        20 Update a booking or details

        IMPORTANT: If the user asks for data that requires fetching from external APIs (like user data, mentor data, booking data, etc.), you MUST use the make_api_request function to fetch the data before providing a response. Do not make up data - always fetch real data when requested.

        # Please identify the type of question and respond accordingly.also mention the type in which the questions falls under.
"""

# Removed get_user_question() - not needed for web API

def build_conversation_context(conversation_history):
    """
    Builds the conversation context from previous exchanges.
    """
    if not conversation_history:
        return ""
    
    context = "\n\nPrevious conversation:\n"
    for i, (question, answer) in enumerate(conversation_history, 1):
        context += f"Q{i}: {question}\n"
        context += f"A{i}: {answer}\n"
    
    return context

def make_api_request(url, method="GET", headers=None, data=None):
    """
    Make an API request to fetch data from backend APIs.
    """
    print(f"Making API request to {url} with method {method}")
    try:
        # Use backend URL for internal API calls
        base_url = "http://localhost:8000"
        full_url = f"{base_url}{url}" if not url.startswith("http") else url
        
        if method.upper() == "GET":
            response = requests.get(full_url, headers=headers)
        elif method.upper() == "POST":
            response = requests.post(full_url, headers=headers, json=data)
        elif method.upper() == "PUT":
            response = requests.put(full_url, headers=headers, json=data)
        elif method.upper() == "DELETE":
            response = requests.delete(full_url, headers=headers)
        else:
            return {"error": f"Unsupported method: {method}"}
        
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": f"API request failed: {str(e)}"}
    except json.JSONDecodeError:
        return {"error": "Invalid JSON response from API"}

def generate_ai_response(user_message, is_authenticated=False, conversation_history=None):
    """
    Generate AI response for web API (converted from main function)
    """
    if conversation_history is None:
        conversation_history = []
    
    user_question = user_message
    
    # Build conversation context
    conversation_context = build_conversation_context(conversation_history)

    def get_destination_function(destination):
        """
        Get the destination that the user wants to go to
        """
        print(f"Destination: {destination}")
        return destination
    
    get_destination = types.FunctionDeclaration(
        name="get_destination_function",
        description="Get the destination that the user wants to go to",
        parameters={
            "type": "OBJECT",
            "properties": {
                "destination": {
                    "type": "STRING",
                    "description": "Destination that the user wants to go to",
                },
            },
        },
    )

    destination_tool = types.Tool(
        function_declarations=[get_destination],
    )
    

    # Define the API request function declaration
    make_api_request_declaration = types.FunctionDeclaration(
        name="make_api_request",
        description="when user want to create a new mentor or user or booking or workshop or any other data, you should use this function to create the data",
        parameters={
            "type": "OBJECT",
            "properties": {
                "url": {
                    "type": "STRING",
                    "description": "The URL to make the API request to",
                },
                "method": {
                    "type": "STRING",
                    "description": "HTTP method (GET, POST, PUT, DELETE). Default is GET",
                    "enum": ["GET", "POST", "PUT", "DELETE"]
                },
                "headers": {
                    "type": "OBJECT",
                    "description": "Optional headers for the request",
                },
                "data": {
                    "type": "OBJECT", 
                    "description": "Optional data to send with POST/PUT requests",
                }
            },
            "required": ["url"]
        },
    )

    # Create the tool with the function declaration
    api_tool = types.Tool(
        function_declarations=[make_api_request_declaration],
    )

    # Simple auth level check
    auth_context = "authenticated user" if is_authenticated else "public user"
    enhanced_system_instruction = system_instruction + f"\n\nNote: Current user is a {auth_context}."

    # Prepare the full prompt with context
    full_prompt = user_question
    if conversation_context:
        full_prompt = conversation_context + "\n\nCurrent question: " + user_question
    
    try:
        response = client.models.generate_content(
            model=MODEL_ID,
            contents=full_prompt,
            config=types.GenerateContentConfig(
                tools=[api_tool, destination_tool],
                temperature=0.4,
                top_p=0.95,
                top_k=20,
                candidate_count=1,
                seed=5,
                stop_sequences=["STOP!"],
                presence_penalty=0.0,
                frequency_penalty=0.0,
                safety_settings=safety_settings,
                system_instruction=enhanced_system_instruction,
            )
        )
        
        # Get AI response text (simplified)
        ai_response = response.text if response and response.text else "I'm sorry, I couldn't generate a response right now."
            
        # Store the conversation
        conversation_history.append((user_question, ai_response))
        
        # Keep only last 10 exchanges to manage context length
        if len(conversation_history) > 10:
            conversation_history = conversation_history[-10:]
        
        return {
            "response": ai_response,
            "conversation_history": conversation_history
        }
            
    except Exception as e:
        return {
            "error": f"AI generation failed: {str(e)}",
            "response": "I apologize, but I'm having trouble processing your request right now. Please try again."
        }