import google.generativeai as genai
import requests
import json
from datetime import datetime, date
from app.config import settings

# Import service functions for direct calls
from app.services.class_service import search_classes, fetch_all_workshops, fetch_all_classes
from app.services.mentor_service import search_mentors, fetch_all_mentors, fetch_mentor_by_id
from app.services.user_service import get_user_by_id
# Import correct booking and message functions
from app.services.booking_service import get_bookings_by_student
from app.services.message_service import get_messages_for_user
# Import metadata service functions (proper service layer)
from app.services.metadata_service import get_subjects_service, search_subjects_service
from app.models.class_models import ClassSearchQuery
from app.models.mentor_models import MentorSearchQuery
from app.models.search_models import UnifiedSearchQuery
from app.services.search_service import unified_search

MODEL_ID = "gemini-2.5-flash" # @param ["gemini-2.5-flash-lite-preview-06-17", "gemini-2.5-flash", "gemini-2.5-pro"] {"allow-input":true, isTemplate: true}

# Get API key from backend settings
GOOGLE_AI_API_KEY = settings.google_ai_api_key
if not GOOGLE_AI_API_KEY:
    raise ValueError("GOOGLE_AI_API_KEY environment variable is required")

# Configure the Google Generative AI API
genai.configure(api_key=GOOGLE_AI_API_KEY)
 
safety_settings = [
    {
        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
        "threshold": "BLOCK_ONLY_HIGH",
    },
]

system_instruction = """
You are a helpful AI assistant for Roots & Wings, a UK-focused mentorship and learning platform. 
Provide accurate, concise, and actionable responses to help users navigate and use the platform effectively.

## PLATFORM OVERVIEW
Roots & Wings connects students with mentors across 25+ subjects including:
- **Music**: Piano, guitar, violin, vocals, drums, theory
- **Arts**: Drawing, painting, photography, digital art, craft
- **Languages**: English, Spanish, French, Mandarin, Hindi, Arabic
- **Technology**: Coding, web development, game development, AI
- **Mindfulness**: Meditation, yoga, breathing techniques
- **Academic**: Maths, science, writing, literature
- **Creative**: Content creation, YouTube, social media, design

## CORE FEATURES
**User Types**: Students and Mentors (simplified from parents/young learners)
**Authentication**: Firebase Auth with email/password and social login
**Session Types**: One-on-One, Group Workshops, Group Batches
**Payments**: Stripe integration with secure checkout
**Session Tracking**: Progress monitoring with completed/total sessions
**Messaging**: Direct communication between students and mentors

## DATA STRUCTURE & API ENDPOINTS

### Classes/Workshops Data Structure
**GET /classes** - Returns all classes with fields:
- `classId`: Unique identifier
- `type`: "workshop", "group", "one-on-one"
- `title`: Class name
- `subject`: Subject ID (e.g., "piano", "coding")
- `category`: Main category (e.g., "music", "technology")
- `description`: Class description
- `mentorName`: Mentor's display name
- `mentorId`: Mentor's UID
- `pricing.perSessionRate`: Price per session (£)
- `pricing.totalSessions`: Number of sessions
- `pricing.currency`: Currency code (GBP)
- `schedule.startDate`: Start date
- `schedule.endDate`: End date
- `schedule.weeklySchedule`: Weekly time slots
- `schedule.sessionDuration`: Session length in minutes
- `capacity.maxStudents`: Maximum enrollment
- `capacity.currentEnrollment`: Current enrolled count
- `capacity.minStudents`: Minimum to run class
- `format`: "online", "in-person", "hybrid"
- `level`: "beginner", "intermediate", "advanced"
- `ageGroup`: "child", "teen", "adult"
- `classImage`: Workshop image URL
- `status`: "draft", "pending", "approved", "rejected"
- `createdAt`: Creation timestamp

**GET /classes?type=workshop** - Returns only workshops
**GET /classes?subject=piano** - Filter by subject
**GET /classes?category=music** - Filter by category

### Mentors Data Structure
**GET /mentors** - Returns all mentors with fields:
- `uid`: Unique mentor identifier
- `displayName`: Mentor's public name
- `photoURL`: Profile picture URL
- `category`: Main teaching category
- `subjects`: List of subject IDs they teach
- `headline`: Brief tagline
- `bio`: Full biography
- `city`: City name
- `region`: Region/state
- `country`: Country
- `languages`: Languages spoken
- `teachingLevels`: Experience levels taught
- `ageGroups`: Age groups served
- `teachingModes`: Teaching modes (online, in-person, hybrid)
- `pricing.oneOnOneRate`: Hourly rate for 1-on-1 (£)
- `pricing.groupRate`: Hourly rate for group sessions (£)
- `pricing.currency`: Currency code
- `pricing.firstSessionFree`: Free trial offer (boolean)
- `stats.avgRating`: Average rating 0-5
- `stats.totalReviews`: Number of reviews
- `stats.totalStudents`: Total students taught
- `stats.totalSessions`: Total sessions completed
- `stats.responseTimeMinutes`: Average response time
- `status`: "active", "inactive", "pending"
- `isVerified`: Verification status

**GET /mentors/{mentor_id}`** - Get specific mentor details

### Subjects & Categories
**GET /metadata/subjects** - Returns all subjects with:
- `subjectId`: Unique subject identifier
- `subject`: Subject name
- `category`: Main category
- `region`: Region availability
- `synonyms`: Alternative names
- `relatedSubjects`: Related subject IDs
- `searchBoost`: Popularity/importance score

**GET /metadata/subjects?category=music** - Filter by category
**GET /metadata/subjects/search?q=piano`** - Search subjects

### User Data (Requires Authentication)
**GET /users/{user_id}`** - User profile with:
- `uid`: User ID
- `displayName`: User's name
- `email`: Email address
- `photoURL`: Profile picture
- `userType`: "student" or "mentor"
- `onboardingCompleted`: Onboarding status
- `savedMentors`: List of saved mentor IDs
- `preferences`: User preferences

### Bookings Data (Requires Authentication)
**GET /bookings?studentId={user_id}`** - User's bookings with:
- `bookingId`: Unique booking identifier
- `classId`: Associated class ID
- `studentId`: Student's UID
- `mentorId`: Mentor's UID
- `status`: "pending", "confirmed", "completed", "cancelled"
- `bookingDate`: When booking was made
- `sessionDate`: Session date/time
- `totalAmount`: Total cost
- `paymentStatus`: Payment status

### Messages Data (Requires Authentication)
**GET /messages/user/{user_id}`** - User's messages with:
- `messageId`: Unique message identifier
- `senderId`: Sender's UID
- `receiverId`: Receiver's UID
- `content`: Message content
- `timestamp`: Message timestamp
- `read`: Read status

## FRONTEND COMPONENTS & UI PATTERNS

### Discovery Pages
- **Mentor Directory** (`/mentor/directory`): Grid of MentorCard components showing displayName, photoURL, city, avgRating, totalReviews, oneOnOneRate, firstSessionFree badge
- **Workshop Listing** (`/explore/workshops`): Grid of WorkshopCard components showing title, mentorName, perSessionRate, startDate, capacity info, format badges
- **Group Batches** (`/explore/group-batches`): Similar to workshops but for multi-session courses
- **One-on-One** (`/explore/onetoone`): Mentor-focused discovery for private sessions

### Dashboard Pages
- **Student Dashboard** (`/user/dashboard`): Shows enrolled classes, upcoming sessions, saved mentors, progress tracking
- **Mentor Dashboard** (`/mentor/dashboard`): Shows created classes, upcoming sessions, student list, earnings overview
- **Admin Dashboard** (`/admin/dashboard`): Platform analytics, pending approvals, content moderation

### Booking Flow
- **Class Detail** → **Booking Confirmation** (`/booking/confirmbooking/[classid]`) → **Payment** → **Success** (`/booking/success`)
- Shows class details, pricing breakdown, session schedule, mentor info

### Navigation Components
- **NavBar**: Main navigation with logo, search, user menu, notifications
- **UserSidebar**: Student dashboard navigation (bookings, messages, saved mentors, etc.)
- **MentorSideBase**: Mentor dashboard navigation (classes, students, earnings, etc.)
- **AdminSidebar**: Admin panel navigation (dashboard, classes, mentors, moderation)

## USER JOURNEYS

### Getting Started
- **Sign Up**: `/getstarted` - Student or mentor registration with Firebase Auth
- **Onboarding**: `/user/onboarding` or `/mentor/onboarding` - Profile setup and interests

### Discovery & Exploration  
- **Find Mentors**: `/mentor/directory` - Search and filter mentors by subject, price, rating
- **Browse Workshops**: `/explore/workshops` - Upcoming group learning sessions
- **Group Batches**: `/explore/group-batches` - Multi-session group courses
- **One-on-One**: `/explore/onetoone` - Private mentoring sessions

### Booking & Management
- **Book Sessions**: `/booking/confirmbooking/[classid]` - Secure session booking
- **Booking Success**: `/booking/success` - Confirmation and next steps
- **Student Dashboard**: `/user/dashboard` - Manage bookings, progress, saved mentors
- **Mentor Dashboard**: `/mentor/dashboard` - Manage classes, students, earnings

### Platform Management
- **Admin Dashboard**: `/admin/dashboard` - Platform oversight and analytics
- **Class Approval**: `/admin/classes` - Review and approve mentor-created classes
- **Content Moderation**: `/admin/content-moderation` - Handle reports and issues

## AUTHENTICATION LEVELS
**Public Users**: Can browse mentors, workshops, and platform information
**Authenticated Students**: Can book sessions, manage profile, view bookings, message mentors
**Authenticated Mentors**: Can create classes, manage availability, view earnings, communicate with students
**Administrators**: Can approve classes, moderate content, access platform analytics

## QUESTION TYPES & RESPONSES
Classify user questions into these categories and respond accordingly:

1. **FETCH**: Retrieve information (mentors, workshops, bookings, profile data)
2. **CREATE**: Book sessions, create classes, register accounts, set availability  
3. **UPDATE**: Modify bookings, update profiles, change class details
4. **DELETE**: Cancel bookings, remove classes, delete accounts
5. **NAVIGATE**: Help finding specific pages or features
6. **GUIDANCE**: How-to assistance for platform features

## RESPONSE GUIDELINES
- **No URLs**: Never show URLs like /getstarted - instead say "click the Sign Up button"
- **UI Guidance**: Describe button clicks, menu navigation, and visual actions
- **Real Data**: When possible, fetch live data from APIs instead of giving generic answers
- **Be Contextual**: Tailor responses based on user authentication level
- **Be Helpful**: Offer alternative solutions when direct requests aren't possible
- **Use Specific Data**: Reference actual mentor names, class titles, prices, and availability when available
- **Format Information**: Present data in user-friendly formats (e.g., "£120 per session" not raw numbers)

## COMMON USER QUERIES & RESPONSES

### Discovery Queries (Single Filter)
- "Show me piano teachers in London" → Use GET /mentors with location filter
- "What workshops are available this month?" → Use GET /classes?type=workshop
- "Find coding classes for beginners" → Use GET /classes?subject=coding&level=beginner

### Multi-Subject Queries
- "Show me piano and guitar classes" → Use GET /classes?subject=piano,guitar
- "I want sitar or veena workshops" → Use GET /classes?type=workshop&subject=sitar,veena

### Complex Combination Queries
- "Online beginner piano workshops" → Use GET /classes?type=workshop&subject=piano&level=beginner&format=online
- "Show me music classes for adults in London" → Use GET /classes?category=music&ageGroup=adult&city=London
- "I want online or in-person yoga for beginners" → Use GET /classes?subject=yoga&level=beginner&format=online,in-person

### Booking Queries
- "How do I book a session with [mentor name]?" → Guide through booking flow
- "What's the cost of [class name]?" → Fetch pricing from class data
- "When is the next [subject] workshop?" → Check schedule data

### Account Queries
- "Show my upcoming bookings" → Use GET /bookings?studentId={user_id}
- "Update my profile" → Guide to profile settings
- "Cancel my booking" → Explain cancellation process

IMPORTANT: When users ask for data (subjects, mentors, workshops, bookings), use the make_direct_service_call function to fetch real, current information from the platform instead of providing static responses.

Always identify the question type in your response and provide relevant, platform-specific guidance with actual data when available.
"""

# Removed get_user_question() - not needed for web API

def safe_json_serialize(obj):
    """
    Safely serialize objects to JSON, handling datetime and date objects
    """
    def default_serializer(o):
        if isinstance(o, (datetime, date)):
            return o.isoformat()
        return str(o)  # fallback for other non-serializable objects
    
    return json.dumps(obj, default=default_serializer, indent=2)

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

def safe_json_serialize(obj):
    """
    Safely serialize objects to JSON, handling non-serializable types.
    """
    try:
        return json.dumps(obj, indent=2, default=str)
    except Exception as e:
        return f"Error serializing object: {str(e)}"

def get_subjects_with_metadata():
    """
    Fetch all subjects with their metadata including synonyms, keywords, and related subjects.
    Used for AI-powered query expansion and semantic search enhancement.
    """
    try:
        from app.config import db
        subjects_ref = db.collection('subjects')
        subjects_data = []
        
        print("Fetching subjects metadata for AI enhancement...")
        
        for doc in subjects_ref.stream():
            subject_data = doc.to_dict()
            
            # Extract relevant metadata for AI
            metadata = {
                'subject': subject_data.get('subject', ''),
                'subjectId': subject_data.get('subjectId', ''),
                'category': subject_data.get('category', ''),
                'synonyms': subject_data.get('synonyms', []),
                'keywords': subject_data.get('searchMetadata', {}).get('keywords', []),
                'relatedSubjects': subject_data.get('relatedSubjects', [])
            }
            
            # Only include subjects with useful metadata
            if metadata['subject'] and (metadata['synonyms'] or metadata['keywords']):
                subjects_data.append(metadata)
        
        print(f"Loaded {len(subjects_data)} subjects with metadata for AI enhancement")
        return subjects_data
        
    except Exception as e:
        print(f"Error fetching subjects metadata: {str(e)}")
        return []

def enhance_query_with_metadata(user_query, subjects_metadata):
    """
    Enhance user search query using subject metadata to find semantic matches.
    Returns expanded search terms and matched subjects.
    """
    try:
        user_query_lower = user_query.lower()
        matched_subjects = []
        expanded_terms = set([user_query])  # Start with original query
        
        print(f"Enhancing query '{user_query}' with metadata...")
        
        for subject in subjects_metadata:
            subject_matched = False
            
            # Check if query matches subject name
            if user_query_lower in subject['subject'].lower():
                matched_subjects.append(subject)
                subject_matched = True
            
            # Check synonyms
            for synonym in subject.get('synonyms', []):
                if user_query_lower in synonym.lower() or synonym.lower() in user_query_lower:
                    matched_subjects.append(subject)
                    expanded_terms.add(synonym)
                    expanded_terms.add(subject['subject'])
                    subject_matched = True
                    break
            
            # Check keywords
            if not subject_matched:
                for keyword in subject.get('keywords', []):
                    if user_query_lower in keyword.lower() or keyword.lower() in user_query_lower:
                        matched_subjects.append(subject)
                        expanded_terms.add(keyword)
                        expanded_terms.add(subject['subject'])
                        break
        
        # Remove duplicates and convert to list
        expanded_terms = list(expanded_terms)
        
        print(f"Query enhancement result: {len(matched_subjects)} subjects matched, {len(expanded_terms)} expanded terms")
        
        return {
            'original_query': user_query,
            'expanded_terms': expanded_terms,
            'matched_subjects': matched_subjects,
            'enhancement_count': len(matched_subjects)
        }
        
    except Exception as e:
        print(f"Error enhancing query with metadata: {str(e)}")
        return {
            'original_query': user_query,
            'expanded_terms': [user_query],
            'matched_subjects': [],
            'enhancement_count': 0
        }

def make_direct_service_call(service_type, **kwargs):
    """
    Make direct service calls instead of HTTP requests to avoid deadlock.
    This replaces the make_api_request function with direct function calls.
    """
    print(f"Making direct service call: {service_type} with params: {kwargs}")
    
    try:
        if service_type == "classes":
            # Handle class searches
            if "type" in kwargs and kwargs["type"] == "workshop":
                # Get workshops only
                page = kwargs.get("page", 1)
                page_size = kwargs.get("pageSize", 20)
                classes, total = fetch_all_workshops(page, page_size)
                return {
                    "classes": [class_item.dict() for class_item in classes],
                    "total": total,
                    "page": page,
                    "pageSize": page_size
                }
            else:
                # Use search_classes for filtered results
                search_query = ClassSearchQuery(**kwargs)
                classes, total = search_classes(search_query)
                return {
                    "classes": [class_item.dict() for class_item in classes],
                    "total": total,
                    "page": kwargs.get("page", 1),
                    "pageSize": kwargs.get("pageSize", 20)
                }
                
        elif service_type == "mentors":
            # Handle mentor searches
            if "mentor_id" in kwargs:
                # Get specific mentor
                mentor = fetch_mentor_by_id(kwargs["mentor_id"])
                return {"mentor": mentor.dict()}
            else:
                # Use search_mentors for filtered results
                search_query = MentorSearchQuery(**kwargs)
                mentors, total = search_mentors(search_query)
                return {
                    "mentors": [mentor.dict() for mentor in mentors],
                    "total": total,
                    "page": kwargs.get("page", 1),
                    "pageSize": kwargs.get("pageSize", 20)
                }
                
        elif service_type == "subjects":
            # Handle subject searches
            if "search" in kwargs:
                # Search subjects
                subjects_response = search_subjects_service(kwargs["search"], kwargs.get("limit", 10))
                return {"subjects": [subject.dict() for subject in subjects_response.subjects]}
            else:
                # Get all subjects
                subjects_response = get_subjects_service(
                    category=kwargs.get("category"),
                    region=kwargs.get("region"),
                    limit=kwargs.get("limit")
                )
                return {"subjects": [subject.dict() for subject in subjects_response.subjects]}
                
        elif service_type == "user":
            # Handle user data (requires authentication)
            if "user_id" in kwargs:
                user = get_user_by_id(kwargs["user_id"])
                return {"user": user.dict()}
            else:
                return {"error": "User ID required"}
                
        elif service_type == "bookings":
            # Handle booking data (requires authentication)
            if "user_id" in kwargs:
                bookings, total = get_bookings_by_student(kwargs["user_id"])
                return {
                    "bookings": [booking.dict() for booking in bookings],
                    "total": total
                }
            else:
                return {"error": "User ID required"}
                
        elif service_type == "messages":
            # Handle message data (requires authentication)
            if "user_id" in kwargs:
                messages = get_messages_for_user(kwargs["user_id"])
                return {"messages": [message.dict() for message in messages]}
            else:
                return {"error": "User ID required"}
                
        elif service_type == "search":
            # Handle unified search
            search_query = UnifiedSearchQuery(**kwargs)
            results, metadata = unified_search(search_query)
            return {
                "results": [result.dict() for result in results],
                "metadata": metadata
            }
            
        else:
            return {"error": f"Unknown service type: {service_type}"}
            
    except Exception as e:
        print(f"Service call failed: {str(e)}")
        return {"error": f"Service call failed: {str(e)}"}

def generate_ai_response(user_message, is_authenticated=False, conversation_history=None, context=None):
    """
    Generate AI response for web API (converted from main function)
    """
    if conversation_history is None:
        conversation_history = []
    
    user_question = user_message
    
    # Check if this is a search query that can benefit from metadata enhancement
    search_indicators = [
        'find', 'search', 'look for', 'looking for', 'want to learn', 
        'teacher', 'mentor', 'class', 'lesson', 'course', 'workshop',
        'extract search parameters', 'search terms'
    ]
    
    is_search_query = any(indicator in user_message.lower() for indicator in search_indicators)
    
    # Enhance search queries with metadata
    enhanced_message = user_message
    metadata_context = ""
    
    if is_search_query:
        try:
            print(f"Detected search query, enhancing with metadata: {user_message}")
            subjects_metadata = get_subjects_with_metadata()
            
            if subjects_metadata:
                # Create metadata context for AI
                subjects_summary = []
                for subject in subjects_metadata[:10]:  # Limit to avoid token overflow
                    summary = f"- {subject['subject']}"
                    if subject['synonyms']:
                        summary += f" (synonyms: {', '.join(subject['synonyms'][:3])})"
                    if subject['keywords']:
                        summary += f" (keywords: {', '.join(subject['keywords'][:3])})"
                    subjects_summary.append(summary)
                
                metadata_context = f"\n\nAVAILABLE SUBJECTS WITH METADATA:\n" + "\n".join(subjects_summary)
                metadata_context += f"\n\nTotal subjects available: {len(subjects_metadata)}"
                
                # For specific search parameter extraction requests, enhance the query
                if 'extract search parameters' in user_message.lower():
                    enhancement = enhance_query_with_metadata(user_message, subjects_metadata)
                    if enhancement['enhancement_count'] > 0:
                        enhanced_message += f"\n\nMETADATA ENHANCEMENT FOUND:"
                        enhanced_message += f"\n- Matched subjects: {[s['subject'] for s in enhancement['matched_subjects']]}"
                        enhanced_message += f"\n- Suggested terms: {enhancement['expanded_terms']}"
                
                print(f"Enhanced query with {len(subjects_metadata)} subjects metadata")
        
        except Exception as e:
            print(f"Error in metadata enhancement: {str(e)}")
            # Continue without enhancement if there's an error
    
    # Build conversation context
    conversation_context = build_conversation_context(conversation_history)
    
    # Add page context awareness
    page_context = ""
    if context:
        page_context = "\n\nCURRENT PAGE CONTEXT:\n"
        if context.get('currentPage'):
            page_context += f"- User is on: {context['currentPage']}\n"
        if context.get('mentorData'):
            mentor = context['mentorData']
            page_context += f"- Viewing mentor: {mentor.get('displayName', 'Unknown')}\n"
            page_context += f"- Subject: {', '.join(mentor.get('subjects', []))}\n"
            page_context += f"- Location: {mentor.get('city', 'Unknown')}\n"
            page_context += f"- Rating: {mentor.get('stats', {}).get('avgRating', 'N/A')}\n"
        if context.get('workshopData'):
            workshop = context['workshopData']
            page_context += f"- Viewing workshop: {workshop.get('title', 'Unknown')}\n"
            page_context += f"- Subject: {workshop.get('subject', 'Unknown')}\n"
            page_context += f"- Mentor: {workshop.get('mentorName', 'Unknown')}\n"
            page_context += f"- Price: £{workshop.get('pricing', {}).get('total', 'N/A')}\n"
        if context.get('userData'):
            user = context['userData']
            page_context += f"- User logged in: {user.get('user', {}).get('displayName', 'Unknown')}\n"
            page_context += f"- User type: {user.get('user', {}).get('userType', 'Unknown')}\n"
        
        page_context += "\nUse this context to provide more relevant and personalized responses."

    def get_destination_function(destination):
        """
        Get the destination that the user wants to go to
        """
        print(f"Destination: {destination}")
        return destination
    
    get_destination = {
        "name": "get_destination_function",
        "description": "Get the destination that the user wants to go to",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "destination": {
                    "type": "STRING",
                    "description": "Destination that the user wants to go to",
                },
            },
        },
    }

    destination_tool = {
        "function_declarations": [get_destination],
    }
    

    # Define the direct service call function declaration
    make_service_call_declaration = {
        "name": "make_direct_service_call",
        "description": """Fetch real data from the Roots & Wings platform using direct service calls. Use this when users ask for current information about:
        
        CLASSES & WORKSHOPS:
        - service_type: "classes" - All classes with full details (title, mentor, pricing, schedule, capacity)
        - type: "workshop" - Only workshops
        - type: "group" - Only group batches  
        - type: "one-on-one" - Only one-on-one sessions
        - subject: "piano" - Filter by specific subject
        - subject: "piano,guitar,violin" - Multiple subjects (comma-separated)
        - category: "music" - Filter by category
        - level: "beginner" - Filter by experience level
        - format: "online" - Filter by format (online, in-person, hybrid)
        
        COMBINATION FILTERING (mix multiple parameters):
        - type: "workshop", subject: "piano", level: "beginner" - Workshop + Subject + Level
        - subject: "yoga,meditation", format: "online", ageGroup: "adult" - Multiple subjects + Format + Age
        - category: "music", level: "beginner,intermediate", format: "in-person" - Category + Multiple levels + Format
        
        MENTORS:
        - service_type: "mentors" - All mentors with profiles, ratings, pricing
        - category: "music" - Filter by teaching category
        - city: "London" - Filter by location
        - teachingMode: "online" - Filter by teaching mode
        - mentor_id: "uid123" - Specific mentor details
        
        SUBJECTS & CATEGORIES:
        - service_type: "subjects" - All available subjects
        - category: "music" - Subjects by category
        - region: "UK" - Subjects by region
        - search: "piano" - Search subjects
        
        USER DATA (requires authentication):
        - service_type: "user", user_id: "uid123" - User profile and preferences
        - service_type: "bookings", user_id: "uid123" - User's booking history
        - service_type: "messages", user_id: "uid123" - User's messages
        
        UNIFIED SEARCH:
        - service_type: "search", q: "piano" - Search across mentors and classes
        
        Always fetch real data instead of giving generic responses. Use appropriate filters to get relevant results.""",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "service_type": {
                    "type": "STRING",
                    "description": "Type of service to call: classes, mentors, subjects, user, bookings, messages, search",
                    "enum": ["classes", "mentors", "subjects", "user", "bookings", "messages", "search"]
                },
                "type": {
                    "type": "STRING",
                    "description": "For classes: workshop, group, one-on-one. For search: mentor, class",
                },
                "subject": {
                    "type": "STRING",
                    "description": "Subject filter (e.g., piano, coding, yoga). Supports comma-separated values",
                },
                "category": {
                    "type": "STRING", 
                    "description": "Category filter (e.g., music, technology, arts)",
                },
                "level": {
                    "type": "STRING",
                    "description": "Experience level (beginner, intermediate, advanced)",
                },
                "format": {
                    "type": "STRING",
                    "description": "Format filter (online, in-person, hybrid)",
                },
                "city": {
                    "type": "STRING",
                    "description": "City filter for location-based search",
                },
                "mentor_id": {
                    "type": "STRING",
                    "description": "Specific mentor ID for detailed mentor info",
                },
                "user_id": {
                    "type": "STRING",
                    "description": "User ID for authenticated data (bookings, messages, profile)",
                },
                "search": {
                    "type": "STRING",
                    "description": "Search query for subjects or unified search",
                },
                "q": {
                    "type": "STRING",
                    "description": "Search query for unified search across mentors and classes",
                },
                "page": {
                    "type": "INTEGER",
                    "description": "Page number for pagination (default: 1)",
                },
                "pageSize": {
                    "type": "INTEGER",
                    "description": "Items per page (default: 20)",
                }
            },
            "required": ["service_type"]
        },
    }

    # Create the tool with the function declaration
    service_tool = {
        "function_declarations": [make_service_call_declaration],
    }

    # Simple auth level check
    auth_context = "authenticated user" if is_authenticated else "public user"
    enhanced_system_instruction = system_instruction + f"\n\nNote: Current user is a {auth_context}."
    
    # Add metadata context for search enhancement
    if metadata_context:
        enhanced_system_instruction += metadata_context
        enhanced_system_instruction += "\n\nWhen extracting search parameters or helping with search queries, use this metadata to suggest better terms and find semantic matches."

    # Prepare the full prompt with context
    full_prompt = user_question
    if conversation_context:
        full_prompt = conversation_context + "\n\nCurrent question: " + user_question
    if page_context:
        full_prompt = full_prompt + "\n\n" + page_context
    
    try:
        # Create the model instance with system instruction
        model = genai.GenerativeModel(
            MODEL_ID,
            system_instruction=enhanced_system_instruction
        )
        
        response = model.generate_content(
            contents=full_prompt,
            generation_config={
                "temperature": 0.4,
                "top_p": 0.95,
                "top_k": 20,
                "candidate_count": 1,
                "stop_sequences": ["STOP!"],
            },
                safety_settings=safety_settings,
            tools=[service_tool, destination_tool]
        )
        
        # Check if there's a function call (with proper error handling)
        ai_response = "I'm sorry, I couldn't generate a response right now."
        
        try:
            if (response and 
                response.candidates and 
                len(response.candidates) > 0 and 
                response.candidates[0].content and 
                response.candidates[0].content.parts and 
                len(response.candidates[0].content.parts) > 0):
                
                first_part = response.candidates[0].content.parts[0]
                
                # Check if there's a function call in any part
                function_call_part = None
                for part in response.candidates[0].content.parts:
                    if hasattr(part, 'function_call') and part.function_call:
                        function_call_part = part.function_call
                        break
                
                if function_call_part:
                    function_call = function_call_part
                    
                    if hasattr(function_call, 'name') and function_call.name == "make_direct_service_call":
                        # Extract function arguments safely
                        args = function_call.args if hasattr(function_call, 'args') else {}
                        service_type = args.get("service_type", "")
                        
                        # Remove service_type from args for the service call
                        service_args = {k: v for k, v in args.items() if k != "service_type"}
                        
                        # Make the actual service call
                        service_result = make_direct_service_call(service_type, **service_args)
                        
                        # Generate response with the service data
                        api_response = model.generate_content(
                            contents=f"Service Response: {safe_json_serialize(service_result)}\n\nUser Question: {user_question}\n\nPlease provide a helpful response based on the service data. Don't show raw JSON - format it nicely for the user.",
                            generation_config={
                                "temperature": 0.4,
                                "top_p": 0.95,
                                "top_k": 20,
                                "candidate_count": 1,
                            },
                            safety_settings=safety_settings
                        )
                        ai_response = api_response.text if api_response and api_response.text else "I received data but couldn't format it properly."
                    else:
                        # Regular text response
                        ai_response = response.text if response.text else "I couldn't generate a proper response."
                else:
                    # No function call, just regular response
                    ai_response = response.text if response.text else "I couldn't generate a proper response."
        except Exception as e:
            print(f"Error in response parsing: {e}")
            ai_response = response.text if response and response.text else "I encountered an error processing your request."
            
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