"use client";

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// Dynamically import analytics to avoid SSR issues - graceful fallback if it fails
const AnalyticsModule = dynamic(() => 
    import('@/utils/analytics').catch(() => ({ 
        default: null, 
        chatAnalytics: null 
    })), 
    { ssr: false }
);

const ChatbotOverlay = () => {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hi there! 👋 I'm your Roots & Wings assistant. How can I help you today?",
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [conversationHistory, setConversationHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Set mounted state
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Helper function to safely call analytics
    const safeAnalyticsCall = (callback) => {
        if (!isMounted || typeof window === 'undefined') return;
        
        try {
            if (AnalyticsModule && AnalyticsModule.chatAnalytics) {
                callback(AnalyticsModule.chatAnalytics);
            }
        } catch (error) {
            console.warn('Analytics call failed:', error);
        }
    };

    // Track page view when chat opens
    useEffect(() => {
        if (isOpen && isMounted && typeof window !== 'undefined') {
            const pageContext = getPageContext();
            safeAnalyticsCall(analytics => {
                analytics.trackPageView(window.location.pathname, pageContext);
            });
        }
    }, [isOpen, isMounted]);

    // Toggle chat visibility
    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    // Handle message sending
    const handleSendMessage = (e) => {
        if (e) {
            e.preventDefault();
        }
        
        if (!inputMessage.trim()) return;

        const userMessage = {
            id: Date.now(),
            text: inputMessage.trim(),
            sender: 'user',
            timestamp: new Date()
        };

        // Add user message
        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsTyping(true);

        // Call AI backend
        callAIBackend(userMessage.text);
    };

    // Handle Enter key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Get current page context for AI
    const getPageContext = () => {
        const context = {
            currentPage: typeof window !== 'undefined' ? window.location.pathname : '/',
            mentorData: null,
            workshopData: null,
            userData: null
        };
        
        if (typeof window === 'undefined') return context;
        
        try {
            // Get mentor data if on mentor detail page
            const mentor = localStorage.getItem('mentor');
            if (mentor) {
                context.mentorData = JSON.parse(mentor);
            }
            
            // Get workshop data if on workshop page
            const workshop = localStorage.getItem('selectedWorkshop');
            if (workshop) {
                context.workshopData = JSON.parse(workshop);
            }
            
            // Get user data if logged in
            const user = localStorage.getItem('user');
            if (user) {
                context.userData = JSON.parse(user);
            }
        } catch (error) {
            console.error('Error parsing context data:', error);
        }
        
        return context;
    };

    // AI Backend Integration
    const callAIBackend = async (userMessage) => {
        const startTime = Date.now();
        try {
            setIsLoading(true);
            setError(null);
            
            // Get user token if available (Firebase auth format)
            let token = null;
            if (typeof window !== 'undefined') {
                try {
                    // Try to get Firebase auth token
                    const { auth } = await import('@/lib/firebase');
                    if (auth.currentUser) {
                        token = await auth.currentUser.getIdToken();
                    }
                } catch (error) {
                    console.warn('Could not get Firebase token:', error);
                }
            }
            
            // Prepare conversation history for context (backend expects list of [question, answer] tuples)
            const history = [];
            for (let i = 0; i < conversationHistory.length; i += 2) {
                if (conversationHistory[i] && conversationHistory[i + 1]) {
                    history.push([
                        conversationHistory[i].content,
                        conversationHistory[i + 1].content
                    ]);
                }
            }
            
            // Get current page context
            const pageContext = getPageContext();
            
            const response = await axios.post(
                'https://rootsnwings-api-944856745086.europe-west2.run.app/ai/chat',
                {
                    message: userMessage,
                    conversation_history: history,
                    context: pageContext
                },
                {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : undefined,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            if (response.data.error) {
                throw new Error(response.data.error);
            }
            
            // Add AI response to messages
            const botMessage = {
                id: Date.now() + 1,
                text: response.data.response,
                sender: 'bot',
                timestamp: new Date()
            };
            
            setMessages(prev => [...prev, botMessage]);
            
            // Update conversation history
            setConversationHistory(prev => [
                ...prev,
                { role: 'user', content: userMessage },
                { role: 'assistant', content: response.data.response }
            ]);

            // Track successful conversation for analytics
            const responseTime = Date.now() - startTime;
            safeAnalyticsCall(analytics => {
                analytics.trackConversation(
                    userMessage, 
                    response.data.response, 
                    pageContext, 
                    responseTime, 
                    false
                );
            });
            
        } catch (error) {
            console.error('AI API Error:', error);
            console.error('Error details:', error.response?.data);
            console.error('Error status:', error.response?.status);
            
            // More specific error message
            let errorMessage = 'AI service temporarily unavailable';
            if (error.response?.status === 500) {
                errorMessage = 'AI service internal error';
            } else if (error.response?.status === 404) {
                errorMessage = 'AI service not found';
            } else if (error.code === 'NETWORK_ERROR') {
                errorMessage = 'Network connection error';
            }
            
            // Fallback response on error
            const fallbackMessage = {
                id: Date.now() + 1,
                text: `I'm having trouble connecting right now (${errorMessage}). Let me try to help you with what I know: You can search for mentors, explore workshops, or ask me about our services. What would you like to know? 🤔`,
                sender: 'bot',
                timestamp: new Date()
            };
            
            setMessages(prev => [...prev, fallbackMessage]);
            setError(errorMessage);

            // Track fallback response for analytics
            const responseTime = Date.now() - startTime;
            safeAnalyticsCall(analytics => {
                analytics.trackConversation(
                    userMessage, 
                    fallbackMessage.text, 
                    pageContext, 
                    responseTime, 
                    true
                );
            });
        } finally {
            setIsLoading(false);
            setIsTyping(false);
        }
    };

    // Fallback bot response logic (kept for error cases)
    const getBotResponse = (userText) => {
        const text = userText.toLowerCase();
        
        if (text.includes('hello') || text.includes('hi') || text.includes('hey')) {
            return "Hello! Welcome to Roots & Wings! 😊 Are you looking for a mentor or would you like to become one?";
        }
        
        if (text.includes('mentor') || text.includes('find') || text.includes('teacher')) {
            return "Great! We have amazing mentors in various subjects like Music, Dance, Languages, Art, and more. What subject are you interested in learning? 🎨🎵";
        }
        
        if (text.includes('music') || text.includes('guitar') || text.includes('piano')) {
            return "Wonderful choice! 🎵 We have experienced music mentors who can teach instruments, theory, and cultural music forms. Would you like me to show you available music mentors?";
        }
        
        if (text.includes('dance') || text.includes('kathak') || text.includes('ballet')) {
            return "Dance is such a beautiful art form! 💃 We have mentors specializing in traditional dances like Kathak, contemporary styles, and more. Shall I help you find dance mentors in your area?";
        }
        
        if (text.includes('price') || text.includes('cost') || text.includes('fee')) {
            return "Our mentors set their own rates, typically ranging from £25-50 per hour for one-on-one sessions. Many offer group classes at reduced rates and first sessions are often free! 💰";
        }
        
        if (text.includes('online') || text.includes('virtual') || text.includes('remote')) {
            return "Yes! Many of our mentors offer online sessions via video call. This gives you access to amazing teachers from anywhere in the UK! 💻 Would you like to see online-available mentors?";
        }
        
        if (text.includes('become') || text.includes('teach') || text.includes('join')) {
            return "That's fantastic! 🌟 We're always looking for passionate mentors. You can share your expertise in subjects like music, arts, languages, or any skill you're great at. Would you like me to guide you through the mentor application process?";
        }
        
        if (text.includes('help') || text.includes('support') || text.includes('contact')) {
            return "I'm here to help! You can ask me about finding mentors, becoming a mentor, pricing, booking sessions, or any other questions about Roots & Wings. What would you like to know? 🤗";
        }
        
        if (text.includes('booking') || text.includes('session') || text.includes('appointment')) {
            return "Booking is easy! Once you find a mentor you like, you can book directly through their profile. Many mentors offer free initial consultations to discuss your goals. 📅";
        }
        
        if (text.includes('thank') || text.includes('thanks')) {
            return "You're very welcome! 😊 Is there anything else I can help you with today? I'm here whenever you need assistance with Roots & Wings!";
        }
        
        // Default responses
        const defaultResponses = [
            "That's interesting! Could you tell me more about what you're looking for? I'm here to help you find the perfect mentor or answer any questions about Roots & Wings! 😊",
            "I'd love to help you with that! Can you give me a bit more detail about what you need? Whether it's finding a mentor, learning about our services, or something else entirely! 🤔",
            "Thanks for reaching out! I'm here to assist you with anything related to mentoring, learning, or our platform. What specific area would you like to explore? 🚀",
            "Great question! I can help you with finding mentors, understanding our services, booking sessions, or becoming a mentor yourself. What interests you most? ✨"
        ];
        
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    };

    // Format timestamp
    // Parse markdown and button patterns in AI messages
    const parseMessageWithButtons = (messageText) => {
        // First, handle buttons
        const buttonPattern = /\[BUTTON:([^:]+):([^:]*):([^\]]+)\]/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = buttonPattern.exec(messageText)) !== null) {
            // Add text before button (with markdown parsing)
            if (match.index > lastIndex) {
                const textContent = messageText.slice(lastIndex, match.index);
                parts.push({
                    type: 'text',
                    content: textContent
                });
            }

            // Add button
            const [fullMatch, buttonType, buttonId, buttonLabel] = match;
            parts.push({
                type: 'button',
                buttonType,
                buttonId,
                buttonLabel,
                fullMatch
            });

            lastIndex = match.index + fullMatch.length;
        }

        // Add remaining text
        if (lastIndex < messageText.length) {
            parts.push({
                type: 'text',
                content: messageText.slice(lastIndex)
            });
        }

        // If no buttons found, return original text
        if (parts.length === 0) {
            parts.push({
                type: 'text',
                content: messageText
            });
        }

        return parts;
    };

    // Simple markdown parser for chat messages
    const parseMarkdown = (text) => {
        if (!text) return [];
        
        // Split by **bold** patterns
        const parts = text.split(/(\*\*[^*]+\*\*)/g);
        
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                // Bold text
                return {
                    type: 'bold',
                    content: part.slice(2, -2)
                };
            } else {
                // Regular text
                return {
                    type: 'text',
                    content: part
                };
            }
        }).filter(part => part.content); // Remove empty parts
    };

    // Get button styling based on type
    const getButtonStyle = (buttonType) => {
        const baseStyle = "inline-block px-3 py-1 rounded-lg text-xs font-medium mx-1 my-1 transition-colors duration-200 shadow-sm hover:shadow-md";
        
        switch (buttonType) {
            case 'BOOK_CLASS':
                return `${baseStyle} bg-green-500 hover:bg-green-600 text-white`;
            case 'VIEW_MENTOR':
                return `${baseStyle} bg-purple-500 hover:bg-purple-600 text-white`;
            case 'BROWSE_WORKSHOPS':
                return `${baseStyle} bg-blue-500 hover:bg-blue-600 text-white`;
            case 'SEARCH':
                return `${baseStyle} bg-gray-500 hover:bg-gray-600 text-white`;
            default:
                return `${baseStyle} bg-blue-500 hover:bg-blue-600 text-white`;
        }
    };

    // Handle button clicks
    const handleButtonClick = (buttonType, buttonId, buttonLabel) => {
        console.log('Button clicked:', { buttonType, buttonId, buttonLabel });

        switch (buttonType) {
            case 'BOOK_CLASS':
                if (buttonId) {
                    router.push(`/booking/confirmbooking/${buttonId}`);
                }
                break;
            case 'VIEW_MENTOR':
                if (buttonId) {
                    router.push(`/mentor/detailpage?mentorId=${buttonId}`);
                }
                break;
            case 'BROWSE_WORKSHOPS':
                router.push('/explore/workshops');
                break;
            case 'SEARCH':
                // You can trigger a new search or navigate to search page
                if (buttonId) {
                    // Option 1: Navigate to search with query
                    router.push(`/search?q=${encodeURIComponent(buttonId)}`);
                }
                break;
            default:
                console.log('Unknown button type:', buttonType);
        }
    };

    const formatTime = (timestamp) => {
        return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Generate context-aware quick actions
    const getContextualQuickActions = () => {
        const actions = [
            "Find a mentor",
            "Explore workshops",
            "How to book?",
            "Pricing information"
        ];
        
        const pageContext = getPageContext();
        
        // Add mentor-specific actions
        if (pageContext.mentorData) {
            actions.unshift(
                `Tell me about ${pageContext.mentorData.displayName}`,
                `Book session with ${pageContext.mentorData.displayName}`,
                `Similar mentors to ${pageContext.mentorData.displayName}`
            );
        }
        
        // Add workshop-specific actions
        if (pageContext.workshopData) {
            actions.unshift(
                `Tell me about ${pageContext.workshopData.title}`,
                `Book this workshop`,
                `Similar workshops`
            );
        }
        
        // Add user-specific actions if logged in
        if (pageContext.userData?.user) {
            actions.unshift(
                "My upcoming sessions",
                "My saved mentors",
                "My learning progress"
            );
        }
        
        return actions.slice(0, 6); // Limit to 6 actions
    };

    // Analytics Dashboard Component
    const AnalyticsDashboard = () => {
        const [analytics, setAnalytics] = useState(null);

        useEffect(() => {
            safeAnalyticsCall(analyticsModule => {
                setAnalytics(analyticsModule.getAnalyticsSummary());
            });
        }, []);

        const sendAnalytics = () => {
            safeAnalyticsCall(analyticsModule => {
                analyticsModule.sendAnalyticsToBackend();
            });
        };

        if (!analytics) {
            return (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-800">Analytics unavailable</h4>
                </div>
            );
        }

        return (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">AI Performance Insights</h4>
                <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                        <span className="text-blue-700">Success Rate:</span>
                        <span className="font-semibold">{analytics.successRate}%</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-blue-700">Avg Response:</span>
                        <span className="font-semibold">{analytics.averageResponseTime}ms</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-blue-700">Conversations:</span>
                        <span className="font-semibold">{analytics.totalConversations}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-blue-700">Quick Actions:</span>
                        <span className="font-semibold">{analytics.totalQuickActions}</span>
                    </div>
                </div>
                <button
                    onClick={sendAnalytics}
                    className="w-full mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                >
                    Send Analytics to Backend
                </button>
            </div>
        );
    };

    // Handle quick action buttons
    const handleQuickAction = (message) => {
        setInputMessage(message);
        
        // Track quick action usage for analytics
        const pageContext = getPageContext();
        safeAnalyticsCall(analytics => {
            analytics.trackQuickAction(message, pageContext);
        });
        
        // Auto-send quick action messages
        setTimeout(() => {
            const userMessage = {
                id: Date.now(),
                text: message,
                sender: 'user',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, userMessage]);
            callAIBackend(message);
        }, 100);
    };

    // Don't render until mounted to avoid SSR issues
    if (!isMounted) {
        return null;
    }

    return (
        <>
            {/* External Dependencies */}
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
            
            {/* Chat Toggle Button*/}
            <div className="fixed bottom-6 right-6 z-40">
                <button
                    onClick={toggleChat}
                    className={`relative w-16 h-16 rounded-full shadow-lg transform transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-200 ${
                        isOpen 
                            ? 'bg-gray-600 hover:bg-gray-700' 
                            : 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                    }`}
                >
                    {/* Button Icon */}
                    <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isOpen ? 'rotate-180 opacity-100' : 'rotate-0 opacity-100'}`}>
                        {isOpen ? (
                            <i className="fas fa-times text-white text-xl"></i>
                        ) : (
                            <i className="fas fa-comments text-white text-xl"></i>
                        )}
                    </div>
                    
                    {/* Notification Badge (when closed) */}
                    {!isOpen && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                            <span className="text-white text-xs font-bold">!</span>
                        </div>
                    )}
                    
                    {/* Pulsing Ring Animation */}
                    {!isOpen && (
                        <div className="absolute inset-0 rounded-full animate-ping bg-blue-400 opacity-30"></div>
                    )}
                </button>
            </div>

            {/* Chat Window */}
            <div className={`fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] bg-white rounded-2xl shadow-2xl transform transition-all duration-300 ${
                isOpen ? 'opacity-100 translate-y-0 scale-100 z-50' : 'opacity-0 translate-y-8 scale-95 pointer-events-none z-40'
            } border border-gray-100`}>
                
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-2xl p-4 text-white">
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <i className="fas fa-robot text-white text-lg"></i>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg">Roots & Wings Assistant</h3>
                            <p className="text-blue-100 text-sm">
                                {isTyping ? (
                                    <span className="flex items-center">
                                        <div className="flex space-x-1 mr-2">
                                            <div className="w-1 h-1 bg-blue-200 rounded-full animate-bounce"></div>
                                            <div className="w-1 h-1 bg-blue-200 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                            <div className="w-1 h-1 bg-blue-200 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                        </div>
                                        Typing...
                                    </span>
                                ) : (
                                    "Always here to help! ✨"
                                )}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowAnalytics(!showAnalytics)}
                            className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors backdrop-blur-sm mr-2"
                            title="View Analytics"
                        >
                            <i className="fas fa-chart-bar text-white text-sm"></i>
                        </button>
                        <button
                            onClick={toggleChat}
                            className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors backdrop-blur-sm"
                        >
                            <i className="fas fa-minus text-white text-sm"></i>
                        </button>
                    </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 h-[340px] overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                        >
                            <div className={`flex max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
                                {/* Avatar */}
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                    message.sender === 'user' 
                                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 ml-2 shadow-md' 
                                        : 'bg-gradient-to-br from-gray-100 to-gray-200 mr-2 border border-gray-200'
                                }`}>
                                    {message.sender === 'user' ? (
                                        <i className="fas fa-user text-white text-xs"></i>
                                    ) : (
                                        <i className="fas fa-robot text-gray-600 text-xs"></i>
                                    )}
                                </div>
                                
                                {/* Message Bubble */}
                                <div className={`relative px-4 py-3 rounded-2xl shadow-md ${
                                    message.sender === 'user'
                                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md border border-blue-400'
                                        : 'bg-white text-gray-800 rounded-bl-md border border-gray-200 shadow-sm'
                                }`}>
                                    <div className="text-sm leading-relaxed">
                                        {parseMessageWithButtons(message.text).map((part, partIndex) => (
                                            part.type === 'button' ? (
                                                <button
                                                    key={partIndex}
                                                    onClick={() => handleButtonClick(part.buttonType, part.buttonId, part.buttonLabel)}
                                                    className={getButtonStyle(part.buttonType)}
                                                >
                                                    {part.buttonLabel}
                                                </button>
                                            ) : (
                                                <span key={partIndex}>
                                                    {parseMarkdown(part.content).map((mdPart, mdIndex) => (
                                                        mdPart.type === 'bold' ? (
                                                            <strong key={mdIndex} className="font-semibold">
                                                                {mdPart.content}
                                                            </strong>
                                                        ) : (
                                                            <span key={mdIndex} className="whitespace-pre-line">{mdPart.content}</span>
                                                        )
                                                    ))}
                                                </span>
                                            )
                                        ))}
                                    </div>
                                    <div className={`text-xs mt-1 opacity-70 ${
                                        message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                                    }`}>
                                        {formatTime(message.timestamp)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Loading and Error States */}
                    {isLoading && (
                        <div className="flex justify-start animate-fade-in">
                            <div className="flex items-end space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center border border-blue-200">
                                    <i className="fas fa-robot text-blue-600 text-xs"></i>
                                </div>
                                <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 border border-blue-200 shadow-sm">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 mx-4">
                            <div className="flex items-center space-x-2 text-red-700 text-sm">
                                <i className="fas fa-exclamation-triangle"></i>
                                <span>{error}</span>
                            </div>
                        </div>
                    )}
                    
                    {/* Typing Indicator */}
                    {isTyping && !isLoading && (
                        <div className="flex justify-start animate-fade-in">
                            <div className="flex items-end space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center border border-gray-200">
                                    <i className="fas fa-robot text-gray-600 text-xs"></i>
                                </div>
                                <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 border border-gray-200 shadow-sm">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Invisible div for auto-scroll */}
                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-100 rounded-b-2xl bg-white">
                    <div className="flex space-x-3">
                        <div className="flex-1 relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white placeholder-gray-500 text-sm transition-all duration-200"
                                maxLength={500}
                                disabled={isTyping}
                            />
                            {/* Character counter */}
                            {inputMessage.length > 400 && (
                                <div className="absolute -top-6 right-2 text-xs text-gray-400 bg-white px-2 py-1 rounded shadow">
                                    {inputMessage.length}/500
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim() || isTyping}
                            className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group shadow-md"
                        >
                            <i className={`fas fa-paper-plane text-sm transform transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                                isTyping ? 'animate-pulse' : ''
                            }`}></i>
                        </button>
                    </div>
                    
                    {/* Context-Aware Quick Action Buttons */}
                    {!inputMessage && (
                        <div className="mt-3 flex flex-wrap gap-2 animate-fade-in">
                            {getContextualQuickActions().map((action, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleQuickAction(action)}
                                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-full text-xs hover:bg-blue-200 transition-all duration-200 transform hover:scale-105"
                                >
                                    {action}
                                </button>
                            ))}
                        </div>
                    )}
                    
                    {/* Analytics Dashboard */}
                    {showAnalytics && isMounted && typeof window !== 'undefined' && (
                        <AnalyticsDashboard />
                    )}
                    
                    {/* Powered by indicator */}
                    <div className="mt-3 text-center">
                        <p className="text-xs text-gray-400 flex items-center justify-center space-x-1">
                            <i className="fas fa-shield-alt text-xs"></i>
                            <span>Powered by Roots & Wings AI Assistant</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Custom Styles */}
            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }

                /* Custom scrollbar for webkit browsers */
                .overflow-y-auto::-webkit-scrollbar {
                    width: 4px;
                }

                .overflow-y-auto::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 10px;
                }

                .overflow-y-auto::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }

                .overflow-y-auto::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }

                /* Smooth animations */
                * {
                    transition: all 0.2s ease-in-out;
                }
            `}</style>
        </>
    );
};

export default ChatbotOverlay;