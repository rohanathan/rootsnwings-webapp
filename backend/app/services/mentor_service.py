from app.services.firestore import db
from app.models.mentor_models import Mentor, MentorStats
from fastapi import HTTPException

def fetch_all_mentors():
    docs = db.collection("mentors").stream()
    mentors = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        mentors.append(data)
    return mentors

def fetch_featured_mentors():
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
    return [m[1] for m in mentor_scores[:6]]

def fetch_mentor_by_id(mentor_id: str):
    doc = db.collection("mentors").document(mentor_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Mentor not found")
    data = doc.to_dict()
    data["id"] = doc.id
    return data
