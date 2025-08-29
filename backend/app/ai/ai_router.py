from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
from pydantic import BaseModel
from datetime import datetime
from app.ai.ai_service import generate_ai_response
from app.services.auth_service import AuthService
# from app.models.analytics_models import AIAnalyticsSummary, AnalyticsResponse

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[list] = []
    context: Optional[dict] = {}

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
    Single AI chat endpoint - handles both public and authenticated users with booking capabilities.
    """
    try:
        # Simple auth check - if Authorization header exists, user is authenticated
        is_authenticated = authorization is not None and authorization.startswith("Bearer ")
        
        # Extract user ID for booking functionality
        user_id = None
        if is_authenticated:
            try:
                # Simple token parsing for user ID extraction
                from app.services.auth_service import AuthService
                user_id = AuthService.get_current_user_uid(authorization)
            except:
                user_id = None  # Fallback gracefully if token parsing fails
        
        result = generate_ai_response(
            user_message=chat_request.message,
            is_authenticated=is_authenticated,
            user_context={"userId": user_id} if user_id else None,
            conversation_history=chat_request.conversation_history,
            context=chat_request.context
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

# Temporarily commented out analytics endpoint to isolate chat issues
# @router.post("/analytics", response_model=AnalyticsResponse)
# async def receive_ai_analytics(analytics_data: AIAnalyticsSummary):
#     """
#     Receive AI analytics data for improvement and insights
#     """
#     try:
#         # Add timestamp if not provided
#         if not analytics_data.timestamp:
#             analytics_data.timestamp = datetime.now()
#         
#         # Process analytics data for insights
#         insights = process_analytics_for_insights(analytics_data)
#         
#         # Here you could store analytics in a database for long-term analysis
#         # For now, we'll just log and return insights
#         
#         print(f"📊 Received AI Analytics - Session: {analytics_data.sessionId}")
#         print(f"   Success Rate: {analytics_data.successRate}%")
#         print(f"   Total Conversations: {analytics_data.totalConversations}")
#         print(f"   Average Response Time: {analytics_data.averageResponseTime}ms")
#         
#         return AnalyticsResponse(
#             success=True,
#             message="Analytics received successfully",
#             insights=insights
#         )
#         
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Analytics processing error: {str(e)}")

# def process_analytics_for_insights(analytics: AIAnalyticsSummary) -> dict:
#     """
#     Process analytics data to generate insights for AI improvement
#     """
#     insights = {
#         "performance": {},
#         "user_behavior": {},
#         "context_effectiveness": {},
#         "recommendations": []
#     }
#     
#     # Performance insights
#     insights["performance"] = {
#         "needs_improvement": analytics.successRate < 80,
#         "response_time_ok": analytics.averageResponseTime < 3000,
#         "success_rate": analytics.successRate
#     }
#     
#     # User behavior insights
#     insights["user_behavior"] = {
#         "most_popular_intent": max(analytics.intentPatterns.dict(), key=analytics.intentPatterns.dict().get),
#         "quick_action_usage": analytics.totalQuickActions > 0,
#         "session_engagement": analytics.totalConversations > 2
#     }
#     
#     # Context effectiveness insights
#     insights["context_effectiveness"] = {
#         "mentor_context_working": analytics.contextEffectiveness.withMentorContext.successRate > 70,
#         "workshop_context_working": analytics.contextEffectiveness.withWorkshopContext.successRate > 70,
#         "general_queries_need_help": analytics.contextEffectiveness.noContext.successRate < 70
#     }
#     
#     # Generate recommendations
#     recommendations = []
#     
#     if analytics.successRate < 80:
#         recommendations.append("Focus on improving AI response accuracy")
#     
#     if analytics.averageResponseTime > 3000:
#         recommendations.append("Optimize AI response generation speed")
#     
#     if analytics.intentPatterns.search > analytics.intentPatterns.booking * 2:
#         recommendations.append("Enhance search and discovery AI capabilities")
#     
#     if analytics.intentPatterns.pricing > analytics.intentPatterns.mentorInfo:
#         recommendations.append("Improve pricing and cost-related responses")
#     
#     ights["recommendations"] = recommendations
#     
#     return insights