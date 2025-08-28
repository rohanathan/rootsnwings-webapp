from app.services.firestore import db
from app.models.message_models import Message, MessageCreate
from datetime import datetime
from typing import List
import uuid

def send_message(message_data: MessageCreate) -> str:
    """Send a message - create new document in messages collection"""
    message_id = f"msg_{str(uuid.uuid4())[:8]}"
    
    message_doc = {
        "messageId": message_id,
        "senderId": message_data.senderId,
        "studentId": message_data.studentId,
        "mentorId": message_data.mentorId,
        "parentId": message_data.parentId,
        "classId": message_data.classId,
        "message": message_data.message,
        "sentAt": datetime.now().isoformat()
    }
    
    # Remove None values
    message_doc = {k: v for k, v in message_doc.items() if v is not None}
    
    # Save to Firestore
    db.collection('messages').document(message_id).set(message_doc)
    
    return message_id

def get_messages_for_conversation(student_id: str, mentor_id: str, parent_id: str = None, class_id: str = None) -> List[Message]:
    """Get all messages between student and mentor (optionally including parent or for specific class)"""
    
    if class_id:
        # Group messages: get all messages for this class
        query = db.collection('messages').where('classId', '==', class_id).where('mentorId', '==', mentor_id)
    else:
        # Private messages: messages between this student and mentor (no classId)
        query = db.collection('messages').where('studentId', '==', student_id).where('mentorId', '==', mentor_id)
    
    docs = query.order_by('sentAt').stream()
    
    messages = []
    for doc in docs:
        data = doc.to_dict()
        try:
            message = Message(**data)
            # If parent_id specified, only show messages involving that parent
            if parent_id and data.get('parentId') != parent_id:
                continue
            # If requesting private messages, filter out group messages
            if not class_id and data.get('classId'):
                continue
            messages.append(message)
        except Exception:
            continue
    
    return messages

def get_messages_for_user(user_id: str) -> List[Message]:
    """Get all messages for a user (as sender, student, mentor, or parent)"""
    
    messages = []
    
    # Get messages where user is sender
    query1 = db.collection('messages').where('senderId', '==', user_id)
    for doc in query1.stream():
        data = doc.to_dict()
        try:
            messages.append(Message(**data))
        except Exception:
            continue
    
    # Get messages where user is student
    query2 = db.collection('messages').where('studentId', '==', user_id)
    for doc in query2.stream():
        data = doc.to_dict()
        try:
            messages.append(Message(**data))
        except Exception:
            continue
            
    # Get messages where user is mentor
    query3 = db.collection('messages').where('mentorId', '==', user_id)
    for doc in query3.stream():
        data = doc.to_dict()
        try:
            messages.append(Message(**data))
        except Exception:
            continue
            
    # Get messages where user is parent
    query4 = db.collection('messages').where('parentId', '==', user_id)
    for doc in query4.stream():
        data = doc.to_dict()
        try:
            messages.append(Message(**data))
        except Exception:
            continue
    
    # Remove duplicates and sort by time
    unique_messages = {msg.messageId: msg for msg in messages}
    sorted_messages = sorted(unique_messages.values(), key=lambda x: x.sentAt)
    
    return sorted_messages