// Analytics utility for AI improvement (anonymous data only)
class ChatAnalytics {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStart = Date.now();
    this.analyticsData = {
      sessionId: this.sessionId,
      startTime: this.sessionStart,
      pageViews: [],
      conversations: [],
      quickActions: [],
      aiPerformance: {
        totalRequests: 0,
        successfulResponses: 0,
        fallbackResponses: 0,
        averageResponseTime: 0,
        contextUsage: 0
      }
    };
    
    // Only load analytics if we're in the browser
    if (typeof window !== 'undefined') {
      this.loadAnalytics();
    }
  }

  // Generate unique session ID
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Load analytics from localStorage
  loadAnalytics() {
    if (typeof window === 'undefined') return;
    
    try {
      const saved = localStorage.getItem('chatAnalytics');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with current session data
        this.analyticsData = { ...parsed, ...this.analyticsData };
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  }

  // Save analytics to localStorage
  saveAnalytics() {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('chatAnalytics', JSON.stringify(this.analyticsData));
    } catch (error) {
      console.error('Error saving analytics:', error);
    }
  }

  // Track page view
  trackPageView(pagePath, context = {}) {
    if (typeof window === 'undefined') return;
    
    const pageView = {
      timestamp: Date.now(),
      page: pagePath,
      context: {
        hasMentorData: !!context.mentorData,
        hasWorkshopData: !!context.workshopData,
        hasUserData: !!context.userData,
        userType: context.userData?.user?.userType || 'anonymous'
      }
    };
    
    this.analyticsData.pageViews.push(pageView);
    this.saveAnalytics();
  }

  // Track conversation
  trackConversation(userMessage, aiResponse, context, responseTime, isFallback = false) {
    if (typeof window === 'undefined') return;
    
    const conversation = {
      timestamp: Date.now(),
      userMessage: this.anonymizeMessage(userMessage),
      aiResponse: this.anonymizeMessage(aiResponse),
      context: {
        page: context.currentPage,
        hasMentorData: !!context.mentorData,
        hasWorkshopData: !!context.workshopData,
        hasUserData: !!context.userData
      },
      performance: {
        responseTime,
        isFallback,
        messageLength: userMessage.length,
        aiResponseLength: aiResponse.length
      }
    };
    
    this.analyticsData.conversations.push(conversation);
    
    // Update AI performance metrics
    this.analyticsData.aiPerformance.totalRequests++;
    if (isFallback) {
      this.analyticsData.aiPerformance.fallbackResponses++;
    } else {
      this.analyticsData.aiPerformance.successfulResponses++;
    }
    
    // Update average response time
    const currentAvg = this.analyticsData.aiPerformance.averageResponseTime;
    const totalRequests = this.analyticsData.aiPerformance.totalRequests;
    this.analyticsData.aiPerformance.averageResponseTime = 
      ((currentAvg * (totalRequests - 1)) + responseTime) / totalRequests;
    
    this.saveAnalytics();
  }

  // Track quick action usage
  trackQuickAction(action, context) {
    if (typeof window === 'undefined') return;
    
    const quickAction = {
      timestamp: Date.now(),
      action: action,
      context: {
        page: context.currentPage,
        hasMentorData: !!context.mentorData,
        hasWorkshopData: !!context.workshopData
      }
    };
    
    this.analyticsData.quickActions.push(quickAction);
    this.saveAnalytics();
  }

  // Track AI error/fallback
  trackAIError(errorType, userMessage, context) {
    if (typeof window === 'undefined') return;
    
    const error = {
      timestamp: Date.now(),
      errorType,
      userMessage: this.anonymizeMessage(userMessage),
      context: {
        page: context.currentPage,
        hasMentorData: !!context.mentorData,
        hasWorkshopData: !!context.workshopData
      }
    };
    
    this.analyticsData.aiPerformance.fallbackResponses++;
    this.saveAnalytics();
  }

  // Anonymize message content (remove personal info)
  anonymizeMessage(message) {
    if (!message) return '';
    
    // Remove potential personal identifiers
    let anonymized = message
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
      .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]')
      .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP]')
      .replace(/\b[A-Z]{2}\d{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}\b/g, '[POSTCODE]');
    
    // Limit length to prevent storage bloat
    return anonymized.length > 200 ? anonymized.substring(0, 200) + '...' : anonymized;
  }

  // Get analytics summary for AI improvement
  getAnalyticsSummary() {
    if (typeof window === 'undefined') {
      return {
        sessionId: this.sessionId,
        sessionDuration: 0,
        totalConversations: 0,
        totalQuickActions: 0,
        successRate: 0,
        averageResponseTime: 0,
        mostPopularQuickActions: [],
        intentPatterns: {
          search: 0,
          booking: 0,
          pricing: 0,
          mentorInfo: 0,
          workshopInfo: 0,
          general: 0
        },
        contextEffectiveness: {
          withMentorContext: { total: 0, successful: 0, successRate: 0 },
          withWorkshopContext: { total: 0, successful: 0, successRate: 0 },
          withUserContext: { total: 0, successful: 0, successRate: 0 },
          noContext: { total: 0, successful: 0, successRate: 0 }
        },
        pageUsage: []
      };
    }
    
    const totalConversations = this.analyticsData.conversations.length;
    const totalQuickActions = this.analyticsData.quickActions.length;
    
    // Calculate success rate
    const successRate = totalConversations > 0 
      ? (this.analyticsData.aiPerformance.successfulResponses / totalConversations) * 100 
      : 0;
    
    // Most common quick actions
    const actionCounts = {};
    this.analyticsData.quickActions.forEach(action => {
      actionCounts[action.action] = (actionCounts[action.action] || 0) + 1;
    });
    
    // Most common user intents (from message patterns)
    const intentPatterns = this.analyzeIntentPatterns();
    
    return {
      sessionId: this.sessionId,
      sessionDuration: Date.now() - this.sessionStart,
      totalConversations,
      totalQuickActions,
      successRate: Math.round(successRate * 100) / 100,
      averageResponseTime: Math.round(this.analyticsData.aiPerformance.averageResponseTime),
      mostPopularQuickActions: Object.entries(actionCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5),
      intentPatterns,
      contextEffectiveness: this.analyzeContextEffectiveness(),
      pageUsage: this.analyticsData.pageViews.map(p => ({
        page: p.page,
        count: this.analyticsData.pageViews.filter(pp => pp.page === p.page).length
      }))
    };
  }

  // Analyze user intent patterns
  analyzeIntentPatterns() {
    const patterns = {
      search: 0,
      booking: 0,
      pricing: 0,
      mentorInfo: 0,
      workshopInfo: 0,
      general: 0
    };
    
    this.analyticsData.conversations.forEach(conv => {
      const message = conv.userMessage.toLowerCase();
      if (message.includes('find') || message.includes('search') || message.includes('looking for')) {
        patterns.search++;
      } else if (message.includes('book') || message.includes('schedule') || message.includes('appointment')) {
        patterns.booking++;
      } else if (message.includes('price') || message.includes('cost') || message.includes('fee')) {
        patterns.pricing++;
      } else if (message.includes('mentor') || message.includes('teacher')) {
        patterns.mentorInfo++;
      } else if (message.includes('workshop') || message.includes('class')) {
        patterns.workshopInfo++;
      } else {
        patterns.general++;
      }
    });
    
    return patterns;
  }

  // Analyze context effectiveness
  analyzeContextEffectiveness() {
    const contextStats = {
      withMentorContext: { total: 0, successful: 0 },
      withWorkshopContext: { total: 0, successful: 0 },
      withUserContext: { total: 0, successful: 0 },
      noContext: { total: 0, successful: 0 }
    };
    
    this.analyticsData.conversations.forEach(conv => {
      const hasMentor = conv.context.hasMentorData;
      const hasWorkshop = conv.context.hasWorkshopData;
      const hasUser = conv.context.hasUserData;
      const isSuccessful = !conv.performance.isFallback;
      
      if (hasMentor) {
        contextStats.withMentorContext.total++;
        if (isSuccessful) contextStats.withMentorContext.successful++;
      } else if (hasWorkshop) {
        contextStats.withWorkshopContext.total++;
        if (isSuccessful) contextStats.withWorkshopContext.successful++;
      } else if (hasUser) {
        contextStats.withUserContext.total++;
        if (isSuccessful) contextStats.withUserContext.successful++;
      } else {
        contextStats.noContext.total++;
        if (isSuccessful) contextStats.noContext.successful++;
      }
    });
    
    // Calculate success rates
    Object.keys(contextStats).forEach(key => {
      const stats = contextStats[key];
      stats.successRate = stats.total > 0 ? (stats.successful / stats.total) * 100 : 0;
    });
    
    return contextStats;
  }

  // Send analytics to backend (optional)
  async sendAnalyticsToBackend() {
    if (typeof window === 'undefined') return;
    
    try {
      const summary = this.getAnalyticsSummary();
      
      const response = await fetch('https://rootsnwings-api-944856745086.europe-west2.run.app/ai/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(summary)
      });
      
      if (response.ok) {
        console.log('Analytics sent to backend successfully');
        // Clear old data after successful send
        this.clearOldData();
      }
    } catch (error) {
      console.error('Error sending analytics to backend:', error);
    }
  }

  // Clear old data to prevent localStorage bloat
  clearOldData() {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    this.analyticsData.conversations = this.analyticsData.conversations
      .filter(conv => conv.timestamp > oneWeekAgo);
    
    this.analyticsData.quickActions = this.analyticsData.quickActions
      .filter(action => action.timestamp > oneWeekAgo);
    
    this.analyticsData.pageViews = this.analyticsData.pageViews
      .filter(view => view.timestamp > oneWeekAgo);
    
    this.saveAnalytics();
  }

  // Get insights for AI improvement
  getAIInsights() {
    const summary = this.getAnalyticsSummary();
    
    return {
      // Performance insights
      needsImprovement: summary.successRate < 80,
      slowResponses: summary.averageResponseTime > 3000,
      
      // User behavior insights
      popularIntents: summary.intentPatterns,
      contextGaps: this.identifyContextGaps(),
      
      // Quick action insights
      popularActions: summary.mostPopularQuickActions,
      
      // Recommendations
      recommendations: this.generateRecommendations(summary)
    };
  }

  // Identify context gaps
  identifyContextGaps() {
    const gaps = [];
    const contextStats = this.analyzeContextEffectiveness();
    
    if (contextStats.noContext.successRate < 70) {
      gaps.push('General queries need better responses');
    }
    
    if (contextStats.withMentorContext.successRate < 80) {
      gaps.push('Mentor-specific queries need improvement');
    }
    
    if (contextStats.withWorkshopContext.successRate < 80) {
      gaps.push('Workshop-specific queries need improvement');
    }
    
    return gaps;
  }

  // Generate improvement recommendations
  generateRecommendations(summary) {
    const recommendations = [];
    
    if (summary.successRate < 80) {
      recommendations.push('Focus on improving response accuracy');
    }
    
    if (summary.averageResponseTime > 3000) {
      recommendations.push('Optimize AI response generation speed');
    }
    
    if (summary.intentPatterns.search > summary.intentPatterns.booking * 2) {
      recommendations.push('Enhance search and discovery AI capabilities');
    }
    
    if (summary.intentPatterns.pricing > summary.intentPatterns.mentorInfo) {
      recommendations.push('Improve pricing and cost-related responses');
    }
    
    return recommendations;
  }
}

// Export singleton instance
export const chatAnalytics = new ChatAnalytics();
export default ChatAnalytics;
