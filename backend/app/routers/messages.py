from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from app.models.message_models import Message, MessageCreate, MessageListResponse
from app.services.message_service import send_message, get_messages_for_conversation, get_messages_for_user

router = APIRouter(
    prefix="/messages",
    tags=["Messages"]
)

@router.post("/")
def create_message(message_data: MessageCreate):
    """
    Send a message between student and mentor (optionally including parent).
    
    Simple messaging - just specify who's sending to whom.
    """
    try:
        message_id = send_message(message_data)
        return {
            "message": "Message sent successfully",
            "messageId": message_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send message: {str(e)}")

@router.get("/conversation")
def get_conversation(
    studentId: str = Query(..., description="Student ID"),
    mentorId: str = Query(..., description="Mentor ID"), 
    parentId: Optional[str] = Query(None, description="Parent ID (optional)")
):
    """
    Get all messages in a conversation between student and mentor.
    If parentId provided, filters to only messages involving that parent.
    """
    try:
        messages = get_messages_for_conversation(studentId, mentorId, parentId)
        return MessageListResponse(
            messages=messages,
            total=len(messages)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get conversation: {str(e)}")

@router.get("/user/{user_id}")
def get_user_messages(user_id: str):
    """
    Get all messages for a specific user.
    Returns messages where user is sender, student, mentor, or parent.
    """
    try:
        messages = get_messages_for_user(user_id)
        return MessageListResponse(
            messages=messages,
            total=len(messages)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user messages: {str(e)}")