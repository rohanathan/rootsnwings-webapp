"use client";

import React, { useState, useRef, useEffect } from 'react';

const ChatbotOverlay = () => {
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

        // Simulate bot response with realistic delay
        setTimeout(() => {
            const botResponse = getBotResponse(userMessage.text);
            const botMessage = {
                id: Date.now() + 1,
                text: botResponse,
                sender: 'bot',
                timestamp: new Date()
            };
            
            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);
        }, 1000 + Math.random() * 1500); // 1-2.5 second delay
    };

    // Handle Enter key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Simple bot response logic
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
    const formatTime = (timestamp) => {
        return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Handle quick action buttons
    const handleQuickAction = (message) => {
        setInputMessage(message);
    };

    return (
        <div className="fixed inset-0 pointer-events-none z-50">
            {/* External Dependencies */}
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet" />
            
            {/* Chat Toggle Button - Always visible */}
            <div className="absolute bottom-6 right-6 pointer-events-auto">
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

            {/* Chat Window Overlay */}
            <div className={`absolute bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] bg-white rounded-2xl shadow-2xl transform transition-all duration-300 pointer-events-auto ${
                isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
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
                                    <p className="text-sm leading-relaxed">{message.text}</p>
                                    <div className={`text-xs mt-1 opacity-70 ${
                                        message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                                    }`}>
                                        {formatTime(message.timestamp)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Typing Indicator */}
                    {isTyping && (
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
                    
                    {/* Quick Action Buttons (when no message is typed and it's early in conversation) */}
                    {!inputMessage && messages.length <= 1 && (
                        <div className="mt-3 flex flex-wrap gap-2 animate-fade-in">
                            <button
                                onClick={() => handleQuickAction("I'm looking for a music mentor")}
                                className="px-3 py-2 bg-blue-100 text-blue-700 rounded-full text-xs hover:bg-blue-200 transition-all duration-200 transform hover:scale-105"
                            >
                                🎵 Find Music Mentor
                            </button>
                            <button
                                onClick={() => handleQuickAction("How do I become a mentor?")}
                                className="px-3 py-2 bg-green-100 text-green-700 rounded-full text-xs hover:bg-green-200 transition-all duration-200 transform hover:scale-105"
                            >
                                🌟 Become a Mentor
                            </button>
                            <button
                                onClick={() => handleQuickAction("What are your prices?")}
                                className="px-3 py-2 bg-purple-100 text-purple-700 rounded-full text-xs hover:bg-purple-200 transition-all duration-200 transform hover:scale-105"
                            >
                                💰 Pricing Info
                            </button>
                        </div>
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
        </div>
    );
};

export default ChatbotOverlay;