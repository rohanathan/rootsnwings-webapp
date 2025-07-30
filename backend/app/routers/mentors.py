from fastapi import APIRouter
from app.services.firestore import db
from pydantic import BaseModel, Field
from typing import List, Optional

# This router will be included in your main.py
router = APIRouter(
    prefix="/mentors",  # All routes in this file will start with /mentors
    tags=["Mentors"]      # Group these endpoints in the auto-generated docs
)

# --- CORRECTED Pydantic Models ---
# This now matches the data structure shown in your error log.

class MentorStats(BaseModel):
    """Defines the structure of the 'stats' object within a mentor document."""
    avgRating: float = 0
    repeatStudentRate: float = 0
    totalStudents: int = 0
    totalSessions: int = 0
    responseTimeMinutes: int = 999
    # Add any other fields from your stats object, making them optional if they might be missing
    totalReviews: Optional[int] = None

class Mentor(BaseModel):
    """
    CORRECTED: This model now accurately reflects the fields in your Firestore
    'mentors' collection, preventing validation errors.
    """
    id: str
    displayName: str  # Changed from firstName/lastName
    isVerified: bool
    
    # Making most fields Optional is safer, as it prevents errors if a
    # document in Firestore is missing a field.
    headline: Optional[str] = None
    bio: Optional[str] = None
    photoURL: Optional[str] = None
    specialties: Optional[List[str]] = Field(default_factory=list) # Use specialties if it exists
    subjects: Optional[List[str]] = Field(default_factory=list) # Or subjects
    stats: Optional[MentorStats] = Field(default_factory=MentorStats)


class AllMentorsResponse(BaseModel):
    """Defines the response structure for the /mentors endpoint."""
    mentors: List[Mentor]

class FeaturedMentorsResponse(BaseModel):
    """Defines the response structure for the /mentors/featured endpoint."""
    featured: List[Mentor]


# --- API Endpoints (No changes needed here) ---

@router.get("/", response_model=AllMentorsResponse)
def get_mentors():
    """
    Retrieves a list of all mentors from the Firestore collection.
    """
    docs = db.collection("mentors").stream()
    mentors_list = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        mentors_list.append(data)

    return {"mentors": mentors_list}


@router.get("/featured", response_model=FeaturedMentorsResponse)
def get_featured_mentors():
    """
    Calculates a score for each mentor and returns the top 6.
    """
    docs = db.collection("mentors").stream()
    mentor_scores = []

    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        
        stats = MentorStats(**data.get("stats", {}))

        score = (
            stats.avgRating * 3 +
            stats.repeatStudentRate * 2 +
            stats.totalStudents * 1 +
            stats.totalSessions * 1 -
            stats.responseTimeMinutes * 0.01
        )

        mentor_scores.append((score, data))

    mentor_scores.sort(reverse=True, key=lambda x: x[0])
    top_mentors = [m[1] for m in mentor_scores[:6]]

    return {"featured": top_mentors}

