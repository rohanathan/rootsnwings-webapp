# app/services/classes.py

from app.services.firestore import db
from datetime import date, datetime
from typing import List, Dict


def fetch_all_classes() -> List[Dict]:
    docs = db.collection("classes").where("type", "==", "batch").where("status", "==", "approved").stream()
    return clean_docs(docs)


def fetch_all_workshops() -> List[Dict]:
    docs = db.collection("classes").where("type", "==", "workshop").where("status", "==", "approved").stream()
    return clean_docs(docs)


def fetch_featured_classes() -> List[Dict]:
    docs = db.collection("classes").where("type", "==", "batch").where("status", "==", "approved").stream()
    class_scores = []
    for doc in docs:
        data = doc.to_dict()
        data["classId"] = doc.id
        stats = data.get("stats", {})
        score = (
            stats.get("avgRating", 0) * 3 +
            stats.get("repeatStudentRate", 0) * 2 +
            stats.get("totalStudents", 0) * 1 +
            stats.get("totalSessions", 0) * 1 -
            stats.get("responseTimeMinutes", 999) * 0.01
        )
        class_scores.append((score, data))
    class_scores.sort(reverse=True, key=lambda x: x[0])
    return [c[1] for c in class_scores[:6]]


def fetch_upcoming_workshops() -> List[Dict]:
    docs = db.collection("classes").where("type", "==", "workshop").where("status", "==", "approved").stream()
    today = date.today()
    upcoming = []

    for doc in docs:
        data = doc.to_dict()
        data["classId"] = doc.id
        start_date_str = data.get("schedule", {}).get("startDate")

        try:
            start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
            if start_date >= today:
                upcoming.append(data)
        except:
            continue

    return clean_docs_from_list(upcoming)


def fetch_class_by_id(class_id: str) -> Dict:
    doc_ref = db.collection("classes").document(class_id)
    doc = doc_ref.get()
    if not doc.exists:
        return None
    data = doc.to_dict()
    data["classId"] = doc.id
    return clean_data(data)


def get_classes_by_mentor_id(mentor_id: str):
    """
    Fetches all approved classes (batch + workshops) created by a given mentor.
    """
    classes_ref = db.collection("classes")
    query = classes_ref.where("mentorId", "==", mentor_id).where("approvalWorkflow.reviewStatus", "==", "approved")
    results = query.stream()

    classes = []
    for doc in results:
        data = doc.to_dict()
        data["id"] = doc.id
        classes.append(data)

    return classes

# ---------- Helpers ----------

def clean_docs(docs):
    result = []
    for doc in docs:
        data = doc.to_dict()
        data["classId"] = doc.id
        result.append(clean_data(data))
    return result


def clean_docs_from_list(doc_list):
    return [clean_data(data) for data in doc_list]


def clean_data(data: Dict) -> Dict:
    data.pop("approvalWorkflow", None)
    data.pop("searchMetadata", None)
    return data
