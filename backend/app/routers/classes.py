from fastapi import APIRouter
from app.services.firestore import db
from pydantic import BaseModel, Field
from typing import List, Optional

router = APIRouter(
    prefix="/classes",
    tags=["Classes"]
)

# --- Response Model ---
class ClassItem(BaseModel):
    classId: str
    title: str
    ageGroup: str
    level: str
    startDate: str
    endDate: str
    weeklySchedule: List[str]
    format: str
    platform: Optional[str] = None
    mentorName: str
    mentorPhotoURL: Optional[str] = None
    mentorRating: Optional[float] = None
    price: float
    currency: str
    totalSessions: int
    seatsLeft: int

class AllClassesResponse(BaseModel):
    classes: List[ClassItem]

# --- Route Handler ---
@router.get("/", response_model=AllClassesResponse)
def get_all_classes():
    docs = db.collection("classes").stream()
    class_list = []

    for doc in docs:
        data = doc.to_dict()
        if data.get("type") != "batch" or data.get("status") != "approved":
            continue

        schedule = data.get("schedule", {})
        pricing = data.get("pricing", {})
        capacity = data.get("capacity", {})
        location = data.get("location", {})

        # Build the response item
        class_obj = {
            "classId": data.get("classId"),
            "title": data.get("title"),
            "ageGroup": data.get("ageGroup"),
            "level": data.get("level"),
            "startDate": schedule.get("startDate"),
            "endDate": schedule.get("endDate"),
            "weeklySchedule": [
                f"{item['day']} {item['startTime']}–{item['endTime']}"
                for item in schedule.get("weeklySchedule", [])
            ],
            "format": data.get("format"),
            "platform": location.get("details", {}).get("platform"),
            "mentorName": data.get("mentorName"),
            "mentorPhotoURL": data.get("mentorPhotoURL"),
            "mentorRating": data.get("mentorRating"),
            "price": pricing.get("subtotal", 0.0),
            "currency": pricing.get("currency", "GBP"),
            "totalSessions": pricing.get("totalSessions", 0),
            "seatsLeft": max(capacity.get("maxStudents", 0) - capacity.get("currentEnrollment", 0), 0)
        }

        class_list.append(class_obj)

    return {"classes": class_list}
