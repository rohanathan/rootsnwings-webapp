from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Message(BaseModel):
    messageId: str
    senderId: str
    studentId: str  # Required - the student in the conversation
    mentorId: str   # Required - the mentor in the conversation  
    parentId: Optional[str] = None  # Optional - only if parent is involved
    message: str
    sentAt: str

class MessageCreate(BaseModel):
    senderId: str
    studentId: str
    mentorId: str
    parentId: Optional[str] = None
    message: str

class MessageListResponse(BaseModel):
    messages: list[Message]
    total: int