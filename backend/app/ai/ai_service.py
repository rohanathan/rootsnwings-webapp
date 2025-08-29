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
You are a helpful AI assistant for Roots & Wings, a UK-focused mentorship and learning platform with cultural heritage expertise.
Provide accurate, concise, and actionable responses while being sensitive to cultural authenticity and traditional learning methods.

## PLATFORM OVERVIEW
Roots & Wings connects students with mentors across 25+ subjects including cultural and traditional disciplines:

### **Available Subjects** (Fetched from live database)
*Subject information will be dynamically loaded from the database to ensure accuracy*

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

## RESPONSE GUIDELINES
Provide helpful, direct responses without classification prefixes or tags:

- **No Prefixes**: Never start responses with FETCH, CREATE, UPDATE, DELETE, or any classification words
- **Direct Communication**: Answer user questions naturally and conversationally
- **Clear Actions**: When performing actions (like booking), execute functions and show results
- **Helpful Guidance**: Guide users through platform features without technical jargon

## SEARCH QUERY EXTRACTION GUIDELINES

When users ask for search parameter extraction (queries like "extract search parameters from: [query]"), follow this exact format:

### **Step 1: Parse Natural Language Intent**
Extract these parameters from queries like "kids piano classes online":
- **Age Group**: kids/children/child → child, teens/teenagers → teen, adults → adult
- **Subject**: piano, guitar, dance, coding, art, etc. (match with available subjects)  
- **Type**: classes → class, workshops → workshop, lessons → class, sessions → class
- **Format**: online → online, in-person/offline → in-person, hybrid → hybrid
- **Level**: beginner, intermediate, advanced
- **Location**: city names (London, Manchester, etc.)

### **Step 2: Use Exact Response Format**
Always respond using exactly this format (no extra text):

search_terms: [enhanced search terms with synonyms]
category: [subject category like music, arts, technology, wellness]
age_group: [child, teen, adult, or null]
format: [online, in-person, hybrid, or null]  
location: [city name or null]
matched_subjects: [subjects found in our database]

### **Step 3: Query Enhancement Examples**
- "kids piano online" → search_terms: piano music lessons children, category: music, age_group: child, format: online
- "dance workshops" → search_terms: dance movement workshops, category: dance
- "coding for beginners" → search_terms: programming coding development, category: technology, level: beginner
- "yoga classes near me" → search_terms: yoga mindfulness wellness, category: wellness, format: in-person

### **Step 4: Subject Matching Priority**
When matching subjects, prioritize:
1. **Exact matches**: "piano" matches "piano"  
2. **Synonyms**: Use the synonyms array from subjects database (e.g., "Hatha Yoga", "Ashtanga Yoga" for "Yoga")
3. **Keywords**: Use searchMetadata.keywords and cultural_keywords from database
4. **Class searchMetadata**: Check class searchMetadata.keywords for additional context
5. **Category matches**: Use actual categories from database (music, dance, wellness, etc.)

### **Step 5: Enhanced Database Matching**
When extracting search parameters, MUST check:
- **subjects database**: synonyms, cultural_keywords, relatedSubjects fields
- **class searchMetadata**: keywords array for additional search terms
- **mentor specialties**: subjects array and searchKeywords
- Use ONLY subjects/categories that exist in live database - NO hardcoded examples

## CULTURAL AWARENESS & SENSITIVITY GUIDELINES

### **Cultural Subject Recognition**
When users ask about cultural subjects, prioritize mentors with traditional training:
- **Traditional Lineage**: Mentors trained under recognized gurus or masters
- **Cultural Immersion**: Mentors with authentic cultural learning experiences  
- **Community Recognition**: Mentors recognized by cultural organizations
- **Authenticity Scores**: Prioritize subjects with high cultural authenticity (80%+ scores)

### **Cultural Query Enhancement**
For cultural queries, automatically enhance responses with context:
- "bharatanatyam teacher" → Prioritize mentors with traditional Guru training
- "tea ceremony" → Emphasize authentic Japanese ceremony methods
- "traditional music" → Focus on lineage-based teaching approaches
- "cultural dance" → Explain cultural significance and heritage context

### **Respectful Cultural Representation**
- Acknowledge cultural heritage and significance of traditional subjects
- Mention mentor's traditional qualifications when relevant
- Explain cultural context respectfully (e.g., "Tamil Nadu heritage", "Japanese tradition")
- Suggest related cultural subjects for deeper cultural learning

## RESPONSE GUIDELINES
- **No URLs**: Never show URLs like /getstarted - instead say "click the Sign Up button"
- **UI Guidance**: Describe button clicks, menu navigation, and visual actions
- **Real Data**: When possible, fetch live data from APIs instead of giving generic answers
- **Be Contextual**: Tailor responses based on user authentication level
- **Be Helpful**: Offer alternative solutions when direct requests aren't possible
- **Use Specific Data**: Reference actual mentor names, class titles, prices, and availability when available
- **Format Information**: Present data in user-friendly formats (e.g., "£120 per session" not raw numbers)
- **Cultural Priority**: For cultural subjects, prioritize traditionally trained mentors and mention cultural context
- **Execute Functions**: When using function calls, execute them fully and show the results, never describe the function call parameters
- **No Technical Details**: Don't show function call syntax or parameters to users - show the actual results instead

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

### **Cultural Heritage Queries** (Enhanced with Cultural Ranking)
- "bharatanatyam teacher" → Use unified_search(), prioritize mentors with traditional_lineage qualifications
- "authentic tea ceremony" → Look for mentors with cultural_immersion or traditional training
- "traditional indian classical music" → Search culturally rooted subjects, mention heritage significance
- "classical dance with traditional training" → Emphasize mentor cultural expertise and authenticity scores
- "learn from a real guru" → Filter mentors by traditional_lineage and community_recognition qualifications

### **Cultural Context Responses**
When returning cultural results, include:
- Cultural authenticity percentage (e.g., "95% culturally authentic")
- Traditional training background (e.g., "Trained under Guru Padma Subrahmanyam")
- Heritage context (e.g., "Tamil Nadu classical tradition")
- Cultural significance explanation
- Related cultural subjects suggestions

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

## BOOKING GUIDANCE

When authenticated users want to book classes, follow this workflow:

1. **SEARCH & PRESENT**: Use make_direct_service_call to find classes/mentors
2. **USER CONFIRMATION**: Wait for user to confirm "Yes, book it" or similar  
3. **REDIRECT TO BOOKING**: Direct them to the booking confirmation page
4. **PROVIDE GUIDANCE**: Explain the booking process and next steps

## BOOKING RESPONSE FORMAT:
When users confirm they want to book a class, respond like this:

"✅ Perfect! I've found your class and I'm ready to help you book it.

[BUTTON:BOOK_CLASS:{classId}:Complete Booking - £{amount}]

This will take you to a secure booking page where you can:
- Review class details and pricing
- Add personal learning goals  
- Complete secure payment with Stripe
- Confirm your booking

📝 **For Demo/Testing**: Use test card 4242 4242 4242 4242 with any future date and 3-digit CVC

After payment, your booking will be confirmed and you'll receive confirmation details!"

## BOOKING CONVERSATION EXAMPLES:

User: "Book me piano lessons with Sarah Chen"
AI: 1. Search for Sarah Chen piano classes using make_direct_service_call
     2. Present available options with pricing and schedule
     3. Wait for user confirmation
     4. Direct to booking confirmation page with class ID
     5. Explain the booking completion process

User: "Find me guitar lessons under £20 and book one"
AI: 1. Search classes with price filter using make_direct_service_call  
     2. Present best matches under £20
     3. User selects "Yes, book the flamenco guitar class"
     4. Provide booking confirmation page link
     5. Guide through secure booking process

## BUTTON FORMATTING GUIDE:
Use these special button formats in responses (frontend will render as clickable buttons):

- **Booking Button**: [BUTTON:BOOK_CLASS:{classId}:Complete Booking - £{amount}]
- **View Profile**: [BUTTON:VIEW_MENTOR:{mentorId}:View {mentorName}'s Profile]  
- **Browse Classes**: [BUTTON:BROWSE_WORKSHOPS::Browse All Workshops]
- **Search More**: [BUTTON:SEARCH:{query}:Find More {subject} Classes]

## IMPORTANT NOTES:
- Only authenticated users can access booking pages (check user context)
- Always mention this is test environment with test cards
- Explain they'll complete payment on the secure booking page
- Never ask for or handle actual card details
- Use button formatting instead of showing raw URLs
- Extract actual class IDs and amounts from search results for buttons
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
        from app.services.firestore import db
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

def ai_create_stripe_checkout(classId: str, studentId: str, mentorId: str, amount: float, personalGoals: str = None):
    """AI creates Stripe checkout session and returns payment link"""
    try:
        # Import here to avoid circular imports
        from app.routers.payments import CheckoutSessionRequest, create_checkout_session
        
        print(f"AI creating Stripe checkout: class={classId}, student={studentId}, amount=£{amount}")
        print(f"DEBUG: Function called with args - classId: {classId}, studentId: {studentId}, mentorId: {mentorId}, amount: {amount}")
        
        checkout_data = CheckoutSessionRequest(
            classId=classId,
            studentId=studentId,
            mentorId=mentorId,
            amount=amount,
            currency="gbp",
            personalGoals=personalGoals
        )
        
        print(f"DEBUG: Created checkout data: {checkout_data}")
        
        result = create_checkout_session(checkout_data)
        
        print(f"DEBUG: Stripe checkout result: {result}")
        
        return {
            "success": True,
            "checkout_url": result["checkout_url"],
            "session_id": result["session_id"],
            "amount_gbp": amount,
            "class_id": classId,
            "personal_goals": personalGoals
        }
        
    except Exception as e:
        print(f"AI Stripe checkout creation failed: {str(e)}")
        print(f"DEBUG: Exception details: {type(e).__name__}: {str(e)}")
        return {"success": False, "error": str(e)}

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
            # Handle unified search with intelligent cultural detection
            search_query = UnifiedSearchQuery(**kwargs)
            results, metadata = unified_search(search_query)
            
            # Intelligent cultural query detection using our subjects database
            query_text = kwargs.get("q", "").lower()
            is_cultural_query = False
            matched_cultural_subjects = []
            
            # Get cultural subjects from our database
            try:
                all_subjects = get_subjects_service()
                if all_subjects and hasattr(all_subjects, 'subjects'):
                    for subject in all_subjects.subjects:
                        if getattr(subject, 'is_culturally_rooted', False):
                            # Check if query matches this cultural subject
                            if (subject.subject.lower() in query_text or 
                                any(synonym.lower() in query_text for synonym in getattr(subject, 'synonyms', [])) or
                                any(keyword.lower() in query_text for keyword in getattr(subject, 'cultural_keywords', []))):
                                is_cultural_query = True
                                matched_cultural_subjects.append({
                                    'subject': subject.subject,
                                    'authenticity': getattr(subject, 'cultural_authenticity_score', 0),
                                    'heritage': getattr(subject, 'heritage_context', ''),
                                    'tradition': getattr(subject, 'tradition_or_school', '')
                                })
            except Exception as e:
                print(f"Error detecting cultural query: {e}")
                # Fallback to result-based detection
            
            # Count cultural results in the response
            cultural_results_count = 0
            high_authenticity_count = 0
            
            if results:
                for result in results:
                    # Check if result has cultural context (from our ranking service)
                    if (hasattr(result.data, 'searchMetadata') and 
                        getattr(result.data.searchMetadata, 'is_culturally_rooted', False)):
                        cultural_results_count += 1
                        auth_score = getattr(result.data.searchMetadata, 'cultural_authenticity_score', 0)
                        if auth_score > 0.8:
                            high_authenticity_count += 1
            
            response_data = {
                "results": [result.dict() for result in results],
                "metadata": metadata
            }
            
            # Add intelligent cultural context for AI to use
            if is_cultural_query or cultural_results_count > 0 or matched_cultural_subjects:
                response_data["cultural_context"] = {
                    "is_cultural_query": is_cultural_query,
                    "matched_cultural_subjects": matched_cultural_subjects,
                    "cultural_results_found": cultural_results_count,
                    "high_authenticity_results": high_authenticity_count,
                    "guidance": "Use cultural taxonomy data to provide authentic recommendations"
                }
            
            return response_data
            
        else:
            return {"error": f"Unknown service type: {service_type}"}
            
    except Exception as e:
        print(f"Service call failed: {str(e)}")
        return {"error": f"Service call failed: {str(e)}"}

def generate_ai_response(user_message, is_authenticated=False, user_context=None, conversation_history=None, context=None):
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

    # Create the tool with service call function only
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
                print(f"DEBUG: Checking for function calls in {len(response.candidates[0].content.parts)} parts")
                for i, part in enumerate(response.candidates[0].content.parts):
                    print(f"DEBUG: Part {i}: has function_call: {hasattr(part, 'function_call')}")
                    if hasattr(part, 'function_call') and part.function_call:
                        function_call_part = part.function_call
                        print(f"DEBUG: Found function call: {function_call_part}")
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
                    
                        # Extract text from the API response
                        if (api_response and 
                            api_response.candidates and 
                            len(api_response.candidates) > 0 and 
                            api_response.candidates[0].content and 
                            api_response.candidates[0].content.parts):
                            ai_response = api_response.candidates[0].content.parts[0].text
                        else:
                            print(f"ERROR: API response parsing failed. Response: {api_response}")
                            ai_response = "I had trouble processing that request. Let me try a different approach."
                            
                    else:
                        # Regular text response - extract from parts
                        if hasattr(first_part, 'text') and first_part.text:
                            ai_response = first_part.text
                        else:
                            ai_response = "I couldn't generate a proper response."
                else:
                    # No function call, just regular response - extract from parts
                    if hasattr(first_part, 'text') and first_part.text:
                        ai_response = first_part.text
                    else:
                        ai_response = "I couldn't generate a proper response."
        except Exception as e:
            print(f"Error in response parsing: {e}")
            # Try to extract text safely from response, otherwise use fallback
            try:
                if (response and 
                    response.candidates and 
                    len(response.candidates) > 0 and 
                    response.candidates[0].content and 
                    response.candidates[0].content.parts and 
                    len(response.candidates[0].content.parts) > 0 and
                    hasattr(response.candidates[0].content.parts[0], 'text')):
                    ai_response = response.candidates[0].content.parts[0].text
                else:
                    ai_response = "I encountered an error processing your request."
            except:
                ai_response = "I encountered an error processing your request."
            
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