# main.py

from firebase_functions import https_fn
from firebase_admin import initialize_app, firestore
import firebase_admin
import logging

# Do NOT initialize the app or client in the global scope.

@https_fn.on_request()
def approve_mentor(req: https_fn.Request) -> https_fn.Response:
    """
    Approves a mentor by setting the 'approved' field to True in Firestore.
    Initializes services within the function to prevent deployment timeouts.
    """
    try:
        # 1. Initialize the app and client here, inside the function.
        # This check prevents re-initializing the app on "hot" invocations.
        if not firebase_admin._apps:
            initialize_app()
        
        db = firestore.client()

        # 2. Your function logic remains the same
        request_json = req.get_json(silent=True)
        if not request_json or "mentor_id" not in request_json:
            logging.error("Request is missing 'mentor_id'.")
            return https_fn.Response(
                {"error": "Missing 'mentor_id' in request body"},
                status=400,
                mimetype="application/json"
            )

        mentor_id = request_json["mentor_id"]

        doc_ref = db.collection("mentors").document(mentor_id)
        doc_ref.update({"approved": True})

        logging.info(f"Successfully approved mentor {mentor_id}.")
        return https_fn.Response(
            {"message": f"Mentor {mentor_id} approved."},
            status=200,
            mimetype="application/json"
        )

    except Exception as e:
        logging.exception(f"An unexpected error occurred: {e}")
        return https_fn.Response(
            {"error": "An internal server error occurred."},
            status=500,
            mimetype="application/json"
        )