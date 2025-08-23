from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

class PageViewAnalytics(BaseModel):
    page: str
    count: int

class QuickActionAnalytics(BaseModel):
    action: str
    count: int

class ContextEffectiveness(BaseModel):
    total: int
    successful: int
    successRate: float

class ContextEffectivenessStats(BaseModel):
    withMentorContext: ContextEffectiveness
    withWorkshopContext: ContextEffectiveness
    withUserContext: ContextEffectiveness
    noContext: ContextEffectiveness

class IntentPatterns(BaseModel):
    search: int
    booking: int
    pricing: int
    mentorInfo: int
    workshopInfo: int
    general: int

class AIAnalyticsSummary(BaseModel):
    sessionId: str
    sessionDuration: int
    totalConversations: int
    totalQuickActions: int
    successRate: float
    averageResponseTime: int
    mostPopularQuickActions: List[List]
    intentPatterns: IntentPatterns
    contextEffectiveness: ContextEffectivenessStats
    pageUsage: List[PageViewAnalytics]
    timestamp: Optional[datetime] = None

class AnalyticsResponse(BaseModel):
    success: bool
    message: str
    insights: Optional[Dict] = None
