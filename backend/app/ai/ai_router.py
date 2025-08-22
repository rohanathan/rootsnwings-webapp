from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
from pydantic import BaseModel
from app.ai.ai_service import generate_ai_response

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[list] = []

class ChatResponse(BaseModel):
    response: str
    conversation_history: list
    error: Optional[str] = None

@router.post("/chat", response_model=ChatResponse)
async def ai_chat(
    chat_request: ChatRequest,
    authorization: Optional[str] = Header(None)
):
    """
    Single AI chat endpoint - handles both public and authenticated users.
    Simple if/else for auth levels.
    """
    try:
        # Simple auth check - if Authorization header exists, user is authenticated
        is_authenticated = authorization is not None and authorization.startswith("Bearer ")
        
        result = generate_ai_response(
            user_message=chat_request.message,
            is_authenticated=is_authenticated,
            conversation_history=chat_request.conversation_history
        )
        
        if "error" in result:
            return ChatResponse(
                response=result.get("response", "Sorry, I encountered an error."),
                conversation_history=chat_request.conversation_history,
                error=result["error"]
            )
        
        return ChatResponse(
            response=result["response"],
            conversation_history=result["conversation_history"]
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")