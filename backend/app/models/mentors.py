from fastapi import APIRouter
from app.services.firestore import db

router = APIRouter()

@router.get("/mentors")
def get_mentors():
    mentors = []
    docs = db.collection("mentors").stream()
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        mentors.append(data)
    return {"mentors": mentors}
