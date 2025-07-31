from fastapi import APIRouter
from app.models.mentor_models import AllMentorsResponse, FeaturedMentorsResponse, MentorResponse
from app.services.mentor_service import fetch_all_mentors, fetch_featured_mentors, fetch_mentor_by_id
from app.services.class_service import get_classes_by_mentor_id
from app.models.class_models import MentorClassesResponse


router = APIRouter(
    prefix="/mentors",
    tags=["Mentors"]
)

@router.get("/", response_model=AllMentorsResponse)
def get_mentors():
    return {"mentors": fetch_all_mentors()}

@router.get("/featured", response_model=FeaturedMentorsResponse)
def get_featured_mentors():
    return {"featured": fetch_featured_mentors()}

@router.get("/{mentor_id}", response_model=MentorResponse)
def get_mentor_by_id(mentor_id: str):
    return {"mentor": fetch_mentor_by_id(mentor_id)}

@router.get("/{mentor_id}/classes", response_model=MentorClassesResponse)
def get_mentor_classes(mentor_id: str):
    """
    Get all approved classes and workshops by this mentor.
    """
    classes = get_classes_by_mentor_id(mentor_id)
    return {"classes": classes}