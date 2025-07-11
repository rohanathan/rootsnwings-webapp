import functions_framework
from flask import jsonify, Request
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase app
cred = credentials.ApplicationDefault()
firebase_admin.initialize_app(cred)
db = firestore.client()

@functions_framework.http
def approve_mentor(request: Request):
    try:
        request_json = request.get_json(silent=True)
        if not request_json or "mentor_id" not in request_json:
            return jsonify({"error": "Missing mentor_id"}), 400

        mentor_id = request_json["mentor_id"]
        doc_ref = db.collection("mentors").document(mentor_id)

        doc = doc_ref.get()
        if not doc.exists:
            return jsonify({"error": f"Mentor ID '{mentor_id}' not found."}), 404

        doc_ref.update({"approved": True})
        return jsonify({"message": f"Mentor {mentor_id} approved."}), 200

    except Exception as e:
        print(f"[ERROR] {e}")  # This shows in terminal logs
        return jsonify({"error": str(e)}), 500
git remote add public https://github.com/rohanathan/rootsnwings.git
