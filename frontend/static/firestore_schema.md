# Roots & Wings - Revised Firestore Schema (Production Ready)

## 🏗️ Architecture Overview

**Design Philosophy:** Hybrid approach balancing query performance, data consistency, and maintainability for a real-world educational mentoring platform.

```
📁 /users/{uid} - Single source of truth with role-based embedded profiles
📁 /users/{uid}/qualifications/{id} - Heavy mentor documentation
📁 /users/{uid}/availability/{slotId} - Dynamic scheduling data
📁 /users/{uid}/young-learners/{learnerId} - Child profiles (parent accounts)

📁 /classes/{classId} - Unified booking system (workshops, 1-on-1, batches)
📁 /classes/{classId}/bookings/{bookingId} - Class-specific enrollment data
📁 /classes/{classId}/messages/{messageId} - Class discussion threads
📁 /classes/{classId}/reviews/{reviewId} - Session feedback

📁 /conversations/{conversationId} - Private messaging between users
📁 /conversations/{conversationId}/messages/{messageId} - Chat messages

📁 /payments/{paymentId} - Single source of truth for all transactions
📁 /subjects/{subjectId} - Course categories and metadata
📁 /achievements/{achievementId} - Gamification badges and milestones
📁 /reports/{reportId} - Content moderation and abuse reporting
📁 /admin-logs/{logId} - System administration and audit trail
```

---

## 📋 Core Collections - Detailed Schemas

### 1. **Users Collection** `/users/{uid}` 
*Single document with role-based embedded profiles*

```javascript
{
  // 🔐 Authentication & Identity
  
  
  // 🎭 Multi-Role System (Core Innovation)
  
  // 👩‍🎓 Student Profile (Embedded - Lightweight)
 
  
  // 🧑‍🏫 Mentor Profile (Embedded - Essential Data Only)
  
    
    // Pricing & Availability
    
    
    // Quick Stats (Updated by application)
    
    
    // Availability Summary (Detailed schedule in subcollection)
    
  },
  
  // 👨‍👩‍👧‍👦 Parent Profile (Embedded)

  // 📍 Location & Contact
  
  },
  
  // ⚙️ Account Settings

  
  // 📊 Account Metadata

```

---

### 2. **User Subcollections**

#### **Qualifications** `/users/{uid}/qualifications/{qualId}`
*Heavy mentor documentation - separate for performance*


```

#### **Availability Slots** `/users/{uid}/availability/{slotId}`

```

#### **Young Learners** `/users/{uid}/young-learners/{learnerId}`

```

---

### 3. **Classes Collection** `/classes/{classId}`
*Unified booking system for all session types*

```javascript
{
  classId: "class_2025_piano_001",
  
  // 🎯 Class Type (Union Approach - Option 2A)
  type: "workshop", // "one-on-one" | "batch" | "workshop"
  
  // 📚 Basic Information
  title: "Introduction to Jazz Piano",
  description: "Learn fundamental jazz chord progressions and improvisation techniques...",
  subject: "piano",
  category: "music",
  
  // 👨‍🏫 Mentor Information (Denormalized)
  mentorId: "mentor_abc123",
  mentorName: "Sarah Johnson", // For quick display
  mentorPhotoURL: "https://...",
  mentorRating: 4.8,
  
  // 🎓 Learning Details
  level: "intermediate", // beginner | intermediate | advanced
  ageGroup: "adult", // child | teen | adult | mixed
  skillPrerequisites: ["basic piano knowledge", "can read sheet music"],
  
  // 💰 Dynamic Pricing System
  pricing: {
    // Base pricing structure
    perSessionRate: 25.00, // Mentor's hourly rate
    totalSessions: 1, // For workshops = 1, for batches = calculated
    subtotal: 25.00, // perSessionRate × totalSessions
    currency: "GBP",
    
    // Flexible discount system
    discounts: {
      // Mentor-selected discount (from dropdown or custom)
      mentorDiscount: {
        type: "percentage", // percentage | fixed_amount
        value: 15, // 15% or £15 depending on type
        amount: 3.75, // calculated discount amount
        reason: "Multi-session package discount"
      },
      
      // Platform discounts
      earlyBird: {
        type: "fixed_amount",
        value: 5.00,
        amount: 5.00,
        validUntil: "2025-08-15T00:00:00Z",
        condition: "booking_before_deadline"
      },
      
      firstTime: {
        type: "fixed_amount", 
        value: 10.00,
        amount: 10.00,
        condition: "student_first_booking"
      }
    },
    
    // Final calculation
    totalDiscounts: 18.75, // sum of all applicable discounts
    finalPrice: 6.25, // subtotal - totalDiscounts
    
    // Discount options for mentor interface
    suggestedDiscounts: [
      { label: "5% Multi-session", value: 5, type: "percentage" },
      { label: "10% Package Deal", value: 10, type: "percentage" },
      { label: "15% Bulk Discount", value: 15, type: "percentage" },
      { label: "20% Premium Package", value: 20, type: "percentage" },
      { label: "Custom Amount", value: "custom", type: "custom" }
    ]
  },
  
  // 📅 Schedule (Flexible structure based on type)
  
  // For type: "workshop" (Single event)
  schedule: {
    date: "2025-08-20",
    startTime: "14:00",
    endTime: "16:00",
    timezone: "Europe/London",
    duration: 120 // minutes
  },
  
  // For type: "batch" (Fully flexible multi-session course)
  // schedule: {
  //   duration: 8, // weeks (4|6|8|10|12)
  //   startDate: "2025-08-10",
  //   endDate: "2025-10-05", // auto-calculated
  //   weeklySchedule: [
  //     { day: "monday", startTime: "18:00", endTime: "19:00" },
  //     { day: "wednesday", startTime: "18:00", endTime: "19:00" },
  //     { day: "friday", startTime: "18:00", endTime: "19:00" }
  //   ],
  //   sessionsPerWeek: 3, // calculated from weeklySchedule.length
  //   totalSessions: 24, // duration × sessionsPerWeek
  //   sessionDuration: 60, // minutes per session
  //   timezone: "Europe/London",
  //   // Searchable metadata
  //   schedulePattern: "mon-wed-fri", // for easy filtering
  //   timeOfDay: "evening", // morning | afternoon | evening | mixed
  //   intensity: "regular" // intensive (4+ sessions/week) | regular (2-3) | relaxed (1)
  // },
  
  // For type: "one-on-one" (Flexible scheduling)
  // schedule: {
  //   isFlexible: true,
  //   sessionDuration: 60, // minutes
  //   advanceBookingRequired: 24, // hours
  //   cancellationPolicy: "24_hours",
  //   availableDays: ["monday", "tuesday", "wednesday", "friday"],
  //   availableTimeSlots: ["18:00-20:00", "20:00-22:00"]
  // },
  
  // 👥 Capacity & Enrollment
  capacity: {
    maxStudents: 12,
    minStudents: 3, // minimum to run the class
    currentEnrollment: 7,
    waitlistCount: 2
  },
  
  // 🌐 Format & Location
  format: "online", // online | in-person | hybrid
  location: {
    type: "online", // online | venue | mentor_home | student_home
    details: {
      platform: "Google Meet",
      meetingLink: null, // Generated before class
      requiresApp: false
    }
    // For in-person:
    // details: {
    //   venueName: "Birmingham Community Center",
    //   address: "123 Arts Street, Birmingham B15 2TT",
    //   accessibilityFeatures: ["wheelchair_accessible", "parking_available"]
    // }
  },
  
  // 📖 Learning Materials
  materials: {
    required: ["Piano or keyboard", "Notebook", "Stable internet connection"],
    provided: ["Digital sheet music", "Chord progression charts"],
    recommended: ["Metronome app", "Recording device"]
  },
  
  // 🎯 Learning Outcomes
  objectives: [
    "Understand jazz chord progressions (ii-V-I)",
    "Learn basic improvisation techniques",
    "Play 3 simple jazz standards"
  ],
  
  // 📊 Class Status & Admin Approval
  status: "pending_approval", // pending_approval | approved | rejected | needs_modification | accepting_bookings | full | in_progress | completed | cancelled
  
  // Admin approval workflow
  approvalWorkflow: {
    submittedAt: timestamp,
    submittedBy: "mentor_abc123",
    
    // Admin review
    reviewedBy: null, // admin user ID when reviewed
    reviewedAt: null,
    reviewStatus: "pending", // pending | approved | rejected | needs_modification
    
    // Admin feedback
    adminNotes: null,
    // Example: "Please adjust pricing - £25/hour seems too low for advanced level"
    
    // Review checklist (what admin verifies)
    adminChecks: {
      scheduleReasonable: null, // true | false | null (not checked)
      pricingAppropriate: null,
      contentQuality: null,
      mentorQualified: null,
      capacityRealistic: null
    },
    
    // Revision history
    revisionHistory: [
      // {
      //   version: 1,
      //   submittedAt: timestamp,
      //   changes: ["Updated schedule", "Adjusted pricing"],
      //   adminFeedback: "Schedule looks good now, approved!"
      // }
    ]
  },
  
  // 🔄 Recurring Information (for batch classes)
  isRecurring: false,
  parentClassId: null, // if this is part of a series
  
  // 🏷️ Enhanced Search Metadata
  searchMetadata: {
    // For flexible scheduling search
    availableDays: ["monday", "wednesday", "friday"], // extracted from schedule
    timeSlots: ["18:00-19:00"], // all time slots offered
    timeOfDay: ["evening"], // morning | afternoon | evening
    intensity: "regular", // intensive (4+ sessions/week) | regular (2-3) | relaxed (1)
    
    // Duration & commitment
    weeksDuration: 8, // for batch classes
    totalTimeCommitment: 24, // total hours (sessions × duration)
    
    // Pricing for filtering
    pricePerSession: 25.00,
    pricePerHour: 25.00,
    totalPackagePrice: 6.25,
    hasDiscount: true,
    
    // Content & skill level
    difficultyLevel: "intermediate",
    prerequisites: ["basic piano knowledge"],
    
    // Format & accessibility  
    isOnline: true,
    isInPerson: false,
    supportsRecording: true,
    
    // Auto-generated search tags
    searchTags: [
      "jazz-piano", "intermediate", "evening-classes", 
      "3x-per-week", "8-weeks", "online", "discounted"
    ]
  },
  
  // 🏷️ Original Tags & Categorization
  tags: ["jazz", "improvisation", "chords", "intermediate"],
  keywords: ["jazz piano", "chord progressions", "improvisation", "adult learning"],
  
  // 📞 Communication
  hasGroupChat: true,
  groupChatId: "chat_class_001",
  announcementsEnabled: true,
  
  // 📈 Analytics
  analytics: {
    viewCount: 45,
    bookingConversionRate: 0.23,
    averageRating: 4.7,
    completionRate: 0.89
  },
  
  // 🕒 Metadata
  createdAt: timestamp,
  updatedAt: timestamp,
  publishedAt: timestamp,
  lastBookingAt: timestamp
}
```

---

### 4. **Class Subcollections**

#### **Bookings** `/classes/{classId}/bookings/{bookingId}`
*Individual student enrollment data*

```javascript
{
  bookingId: "booking_user123_class001",
  
  // 👤 Student Information (Denormalized)
  studentId: "user_123",
  studentName: "Mike Thompson",
  studentEmail: "mike@example.com",
  studentPhotoURL: "https://...",
  
  // 👶 Young Learner (if applicable)
  youngLearnerId: "learner_456", // if booked for a child
  youngLearnerName: "Emma Thompson",
  
  // 💳 Booking Details
  bookingStatus: "confirmed", // pending | confirmed | cancelled | completed | no_show
  paymentStatus: "paid", // pending | paid | partial | refunded
  paymentId: "payment_789", // Reference to payment record
  
  // 💰 Pricing Breakdown
  pricing: {
    basePrice: 25.00,
    discountsApplied: [
      {
        type: "earlyBird",
        amount: 5.00,
        description: "Early bird discount"
      }
    ],
    finalPrice: 20.00,
    currency: "GBP"
  },
  
  // 📅 Schedule (for flexible classes)
  scheduledSlots: [
    {
      date: "2025-08-20",
      startTime: "14:00",
      endTime: "16:00",
      status: "confirmed"
    }
  ],
  
  // 🎯 Learning Customization
  personalGoals: "Focus on left-hand technique and rhythm",
  specialRequests: "Please speak slowly, English is second language",
  accessibilityNeeds: [],
  
  // 📞 Communication Preferences
  allowGroupChat: true,
  preferredContactMethod: "email", // email | sms | app_notification
  
  // ✅ Attendance & Progress
  attendanceRecord: [
    {
      sessionDate: "2025-08-20",
      status: "present", // present | absent | partial | excused
      notes: "Great progress on chord transitions"
    }
  ],
  
  // ⭐ Feedback
  studentRating: null, // Set after completion
  studentReview: null,
  mentorNotes: "Enthusiastic learner, needs work on timing",
  
  // 🕒 Metadata
  bookedAt: timestamp,
  confirmedAt: timestamp,
  updatedAt: timestamp,
  completedAt: null
}
```

#### **Messages** `/classes/{classId}/messages/{messageId}`
*Class discussion threads and announcements*

```javascript
{
  messageId: "msg_class001_001",
  
  // 💬 Message Content
  content: "Don't forget to practice the chord progressions we learned today!",
  type: "text", // text | image | file | announcement | system
  
  // 👤 Sender Information
  senderId: "mentor_abc123",
  senderName: "Sarah Johnson",
  senderRole: "mentor", // mentor | student | system
  senderPhotoURL: "https://...",
  
  // 📎 Attachments (optional)
  attachments: [
    {
      fileName: "jazz-chord-chart.pdf",
      fileURL: "https://storage.googleapis.com/...",
      fileType: "application/pdf",
      fileSize: 245760
    }
  ],
  
  // 🎯 Message Properties
  isAnnouncement: false, // Highlighted messages from mentor
  isPinned: false,
  replyToMessageId: null, // For threaded conversations
  
  // 👀 Read Status
  readBy: {
    "user_123": timestamp,
    "user_456": timestamp
  },
  readCount: 2,
  
  // 🏷️ System Messages
  systemData: null,
  // For system messages:
  // systemData: {
  //   type: "class_cancelled",
  //   data: { reason: "Mentor illness", rescheduledDate: "2025-08-27" }
  // }
  
  // 🕒 Metadata
  timestamp: timestamp,
  editedAt: null,
  deletedAt: null
}
```

#### **Reviews** `/classes/{classId}/reviews/{reviewId}`
*Student feedback and ratings*

```javascript
{
  reviewId: "review_user123_class001",
  
  // ⭐ Rating & Feedback
  rating: 5, // 1-5 stars
  title: "Excellent introduction to jazz piano!",
  review: "Sarah's teaching style is clear and engaging. I learned so much in just 2 hours...",
  
  // 👤 Reviewer Information
  reviewerId: "user_123",
  reviewerName: "Mike T.", // Partially anonymized
  reviewerPhotoURL: "https://...",
  isVerifiedBooking: true, // Confirmed they actually attended
  
  // 📊 Detailed Ratings
  detailedRatings: {
    teaching: 5,
    communication: 5,
    materials: 4,
    value: 5,
    organization: 5
  },
  
  // 🎯 Review Context
  attendedSessions: 1, // for multi-session classes
  completionStatus: "completed", // completed | partial | dropped_out
  
  // 💭 Mentor Response
  mentorResponse: {
    content: "Thank you Mike! So glad you enjoyed the session. Keep practicing!",
    respondedAt: timestamp
  },
  
  // 👍 Community Interaction
  helpfulVotes: 3, // Other users found this review helpful
  reportedAsInappropriate: false,
  
  // 🕒 Metadata
  createdAt: timestamp,
  updatedAt: timestamp,
  moderationStatus: "approved" // pending | approved | hidden
}
```

---

### 5. **Payments Collection** `/payments/{paymentId}`
*Single source of truth for all financial transactions*

```javascript
{
  paymentId: "pay_2025_RW_12345",
  
  // 💳 Transaction Details
  amount: 20.00,
  currency: "GBP",
  
  // 👥 Participants
  payerId: "user_123",
  payerName: "Mike Thompson", // Denormalized for reports
  payerEmail: "mike@example.com",
  
  recipientId: "mentor_abc123", // Mentor receiving payment
  recipientName: "Sarah Johnson",
  
  // 📚 Booking Context
  bookingType: "workshop", // workshop | one-on-one | batch
  classId: "class_2025_piano_001",
  bookingId: "booking_user123_class001",
  classTitle: "Introduction to Jazz Piano",
  
  // 💰 Financial Breakdown
  breakdown: {
    subtotal: 25.00,
    discounts: 5.00, // Early bird discount
    platformFee: 2.00, // 10% commission
    mentorEarnings: 18.00,
    taxes: 0.00
  },
  
  // 🏦 Payment Processing
  paymentMethod: "card", // card | bank_transfer | digital_wallet | credits
  paymentProvider: "stripe", // stripe | paypal | bank
  providerTransactionId: "pi_1234567890",
  
  // 📊 Transaction Status
  status: "completed", // pending | processing | completed | failed | cancelled | refunded
  failureReason: null, // If status is failed
  
  // 🔄 Refund Information
  refundAmount: 0.00,
  refundReason: null,
  refundedAt: null,
  refundTransactionId: null,
  
  // 📄 Invoice & Receipt
  invoiceURL: "https://storage.googleapis.com/receipts/pay_2025_RW_12345.pdf",
  receiptEmailSent: true,
  
  // 🕒 Timeline
  createdAt: timestamp,
  processingStartedAt: timestamp,
  completedAt: timestamp,
  
  // 📊 Metadata
  userAgent: "Mozilla/5.0...", // For fraud detection
  ipAddress: "192.168.1.1", // For fraud detection (anonymized)
  source: "web_app" // web_app | mobile_app | admin
}
```

---

### 6. **Conversations Collection** `/conversations/{conversationId}`
*Private messaging between users*

```javascript
{
  conversationId: "conv_user123_mentor456",
  
  // 💬 Conversation Type
  type: "mentor_student", // mentor_student | admin_user | group_chat
  
  // 👥 Participants
  participants: [
    {
      userId: "user_123",
      displayName: "Mike Thompson",
      photoURL: "https://...",
      role: "student",
      joinedAt: timestamp
    },
    {
      userId: "mentor_456",
      displayName: "Sarah Johnson", 
      photoURL: "https://...",
      role: "mentor",
      joinedAt: timestamp
    }
  ],
  
  // 📚 Context (Optional)
  relatedClassId: "class_2025_piano_001", // If conversation is about specific class
  relatedBookingId: "booking_user123_class001",
  
  // 💬 Last Message (Denormalized for chat list)
  lastMessage: {
    content: "Thanks for the great session today!",
    senderId: "user_123",
    senderName: "Mike Thompson",
    timestamp: timestamp,
    type: "text"
  },
  
  // 📊 Message Stats
  totalMessages: 12,
  unreadCount: {
    "user_123": 0,
    "mentor_456": 1
  },
  
  // ⚙️ Conversation Settings
  settings: {
    allowFileSharing: true,
    allowVoiceMessages: false,
    autoDeleteAfterDays: null, // null = never delete
    isArchived: false
  },
  
  // 🔒 Privacy & Moderation
  isBlocked: false,
  blockedBy: null,
  reportCount: 0,
  moderationFlags: [],
  
  // 🕒 Metadata
  createdAt: timestamp,
  updatedAt: timestamp,
  lastActivityAt: timestamp
}
```

---

### 7. **Subjects Collection** `/subjects/{subjectId}`
*Course categories and educational metadata*

```javascript
{
  subjectId: "piano",
  
  // 📚 Basic Information
  name: "Piano",
  displayName: "Piano & Keyboard",
  slug: "piano",
  description: "Learn classical, jazz, and contemporary piano techniques...",
  
  // 🎨 Visual Identity
  iconURL: "https://cdn.rootsandwings.co.uk/icons/piano.svg",
  bannerURL: "https://cdn.rootsandwings.co.uk/banners/piano-hero.jpg",
  colorScheme: "#4A90E2", // Primary color for this subject
  
  // 📖 Educational Structure
  category: "music", // music | arts | languages | academics | heritage | wellness
  subcategories: ["classical", "jazz", "contemporary", "theory"],
  
  // 🎓 Learning Framework
  skillLevels: [
    {
      level: "beginner",
      description: "No prior experience required",
      typicalDuration: "3-6 months",
      keySkills: ["Basic posture", "Simple melodies", "Reading notation"]
    },
    {
      level: "intermediate", 
      description: "Can play simple pieces",
      typicalDuration: "6-12 months",
      keySkills: ["Chord progressions", "Both hands coordination", "Dynamics"]
    },
    {
      level: "advanced",
      description: "Proficient in multiple styles",
      typicalDuration: "1+ years",
      keySkills: ["Complex pieces", "Improvisation", "Teaching others"]
    }
  ],
  
  // 👥 Age Group Suitability
  ageGroups: [
    {
      group: "child",
      minAge: 5,
      maxAge: 12,
      specialConsiderations: ["Shorter sessions", "Simplified theory", "Fun songs"]
    },
    {
      group: "teen",
      minAge: 13,
      maxAge: 17,
      specialConsiderations: ["Popular music", "Performance opportunities"]
    },
    {
      group: "adult",
      minAge: 18,
      maxAge: null,
      specialConsiderations: ["Flexible scheduling", "Personal goals"]
    }
  ],
  
  // 💰 Market Information
  pricing: {
    averageHourlyRate: 32.50,
    priceRange: {
      min: 20.00,
      max: 55.00
    },
    currency: "GBP"
  },
  
  // 📊 Subject Statistics
  stats: {
    totalMentors: 23,
    activeMentors: 18,
    totalStudents: 156,
    totalSessions: 1247,
    averageRating: 4.7,
    popularityScore: 85 // 0-100 relative to other subjects
  },
  
  // 🏷️ SEO & Discovery
  keywords: ["piano lessons", "keyboard classes", "music theory", "classical piano"],
  relatedSubjects: ["music-theory", "composition", "singing"],
  
  // 📋 Requirements & Equipment
  requirements: {
    equipment: ["Piano or 88-key keyboard", "Adjustable bench", "Music stand"],
    software: ["Optional: Piano learning apps", "Metronome"],
    space: ["Quiet practice area", "Good lighting for sheet music"]
  },
  
  // 🎯 Learning Outcomes
  commonGoals: [
    "Play favorite songs",
    "Understand music theory",
    "Perform for others",
    "Compose original music",
    "Prepare for exams"
  ],
  
  // 🔄 Subject Status
  isActive: true,
  featured: true, // Show on homepage
  trending: false,
  
  // 🕒 Metadata
  createdAt: timestamp,
  updatedAt: timestamp,
  lastAnalyticsUpdate: timestamp
}
```

---

### 8. **Achievements Collection** `/achievements/{achievementId}`
*Gamification system for student engagement*

```javascript
{
  achievementId: "first_session_complete",
  
  // 🏆 Achievement Details
  name: "First Steps",
  description: "Complete your very first learning session",
  category: "milestone", // milestone | progress | skill | social | special
  
  // 🎨 Visual Design
  iconURL: "https://cdn.rootsandwings.co.uk/badges/first-steps.svg",
  badgeColor: "#4CAF50",
  rarity: "common", // common | rare | epic | legendary
  
  // 🎯 Unlock Criteria
  requirements: {
    type: "session_completion",
    condition: {
      sessionsCompleted: 1,
      sessionType: "any" // any | one-on-one | group | workshop
    }
  },
  
  // 🎁 Rewards (Optional)
  rewards: {
    points: 10,
    discount: null, // { amount: 5.00, validDays: 30 }
    unlocks: [] // Other achievements or features unlocked
  },
  
  // 📊 Achievement Stats
  stats: {
    totalUnlocked: 1247, // How many users have this
    difficultyScore: 1, // 1-10 scale
    averageTimeToUnlock: "0 days" // From account creation
  },
  
  // 👥 Target Audience
  targetAudience: {
    roles: ["student"], // student | mentor | parent
    ageGroups: ["all"], // child | teen | adult | all
    subjects: [] // Empty = all subjects
  },
  
  // 📢 Display Settings
  isPublic: true, // Show on profile
  isShareable: true, // Allow social sharing
  showInFeed: true, // Show in activity feed
  
  // 🔄 Achievement Status
  isActive: true,
  isRetired: false, // No longer available
  
  // 🕒 Metadata
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

### 9. **Reports Collection** `/reports/{reportId}`
*Content moderation and user safety*

```javascript
{
  reportId: "report_2025_001",
  
  // 🚨 Report Details
  type: "inappropriate_content", // inappropriate_content | harassment | spam | fake_profile | safety_concern
  category: "message", // message | profile | class | review | other
  severity: "medium", // low | medium | high | critical
  
  // 👤 Reporter Information
  reporterId: "user_123",
  reporterName: "Mike Thompson", // For admin context
  reporterEmail: "mike@example.com",
  
  // 🎯 Reported Content/User
  targetType: "message", // user | message | class | review
  targetId: "msg_class001_025",
  targetUserId: "user_456", // If reporting a user
  targetUserName: "Jane Smith",
  
  // 📝 Report Content
  reason: "Using inappropriate language in class chat",
  description: "This user has been consistently using profanity in the group chat despite warnings from other students.",
  evidence: [
    {
      type: "screenshot",
      url: "https://storage.googleapis.com/reports/evidence_001.jpg",
      description: "Screenshot of inappropriate messages"
    }
  ],
  
  // 📚 Context Information
  relatedClassId: "class_2025_piano_001",
  relatedConversationId: "conv_class001_group",
  
  // 👮 Moderation Status
  status: "under_review", // submitted | under_review | resolved | dismissed | escalated
  priority: "normal", // low | normal | high | urgent
  
  // 👨‍💼 Admin Assignment
  assignedAdminId: "admin_789",
  assignedAdminName: "Support Team Lead",
  assignedAt: timestamp,
  
  // 🔍 Investigation Notes
  adminNotes: [
    {
      adminId: "admin_789",
      note: "Reviewed chat logs. Evidence confirms inappropriate language.",
      timestamp: timestamp
    }
  ],
  
  // ⚖️ Resolution Details
  resolution: null,
  // When resolved:
  // resolution: {
  //   action: "warning_issued", // warning_issued | content_removed | account_suspended | dismissed
  //   reason: "First offense, user warned about community guidelines",
  //   actionDetails: {
  //     warningLevel: 1,
  //     suspensionDays: null,
  //     contentRemoved: ["msg_class001_025", "msg_class001_026"]
  //   },
  //   resolvedBy: "admin_789",
  //   resolvedAt: timestamp
  // },
  
  // 📊 Follow-up
  requiresFollowUp: false,
  followUpDate: null,
  appealSubmitted: false,
  
  // 🕒 Metadata
  createdAt: timestamp,
  updatedAt: timestamp,
  escalatedAt: null,
  resolvedAt: null
}
```

---

### 10. **Admin Logs Collection** `/admin-logs/{logId}`
*System administration and audit trail*

```javascript
{
  logId: "log_2025_admin_001",
  
  // 👨‍💼 Admin Information
  adminId: "admin_789",
  adminName: "Sarah Admin",
  adminEmail: "admin@rootsandwings.co.uk",
  adminRole: "moderator", // super_admin | admin | moderator | support
  
  // 🎯 Action Details
  action: "user_suspension", // user_creation | user_suspension | content_moderation | payment_refund | etc.
  category: "user_management", // user_management | content_moderation | financial | system_config
  
  // 📝 Action Description
  description: "Suspended user account for violating community guidelines",
  
  // 🎯 Target Information
  targetType: "user", // user | class | payment | report | system_setting
  targetId: "user_456",
  targetIdentifier: "jane.smith@example.com", // Human-readable identifier
  
  // 📊 Action Details
  actionData: {
    previousStatus: "active",
    newStatus: "suspended",
    suspensionDays: 7,
    reason: "Inappropriate behavior in class chats",
    relatedReportId: "report_2025_001",
    autoNotificationSent: true
  },
  
  // 🔍 Context
  ipAddress: "192.168.1.100", // Admin's IP (for security)
  userAgent: "Mozilla/5.0...",
  
  // 📈 Impact Assessment
  impact: {
    usersAffected: 1,
    classesAffected: 2,
    financialImpact: 0.00,
    systemWideEffect: false
  },
  
  // 🔄 Reversibility
  isReversible: true,
  reverseAction: "user_unsuspension",
  
  // 📋 Approval Process (for high-impact actions)
  requiresApproval: false,
  approvedBy: null,
  approvalStatus: "auto_approved", // pending | approved | rejected | auto_approved
  
  // 🕒 Metadata
  timestamp: timestamp,
  sessionId: "admin_session_123", // For tracking admin sessions
  
  // 📊 Audit Information
  auditTrail: {
    dataBeforeChange: { status: "active" },
    dataAfterChange: { status: "suspended", suspendedUntil: "2025-08-27" },
    checksumBefore: "abc123...",
    checksumAfter: "def456..."
  }
}
```

---

## 🔐 Security Rules Overview

### **Role-Based Access Control**
```javascript
// Users can read/write their own data
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}

// Class access based on enrollment and mentor ownership
match /classes/{classId} {
  allow read: if request.auth != null; // Public discovery
  allow write: if request.auth != null && 
    (request.auth.uid == resource.data.mentorId || isAdmin());
}

// Booking access for participants only
match /classes/{classId}/bookings/{bookingId} {
  allow read, write: if request.auth != null && 
    (request.auth.uid == resource.data.studentId || 
     request.auth.uid == getClassMentor(classId));
}

// Message access for conversation participants
match /conversations/{conversationId}/messages/{messageId} {
  allow read, write: if request.auth != null && 
    isParticipant(conversationId, request.auth.uid);
}
```

---

## 📊 Indexing Strategy (Start Simple)

### **Essential Composite Indexes**
```javascript
// Find active mentors by subject and location
users: [roles, mentorProfile.subjects, location.city, mentorProfile.acceptingNewStudents]

// Browse available classes
classes: [type, status, subject, location.city]

// User's booking history
classes/{classId}/bookings: [studentId, bookingStatus, createdAt]

// Recent messages in conversation
conversations/{conversationId}/messages: [timestamp DESC]
```

---

## 🚀 Implementation Phases

### **Phase 1: Core MVP (Start Simple)**
- ✅ Users with basic role profiles
- ✅ Simple class creation (workshops only)
- ✅ Basic booking system
- ✅ Simple messaging
- ✅ Payment tracking

### **Phase 2: Enhanced Features**
- 🔄 Complex class types (batches, recurring)
- 🔄 Advanced availability system
- 🔄 Achievement system
- 🔄 Enhanced search with filters

### **Phase 3: Production Scale**
- 🔄 Optimized search collections
- 🔄 Advanced security rules
- 🔄 Analytics and reporting
- 🔄 Admin moderation tools

---

## 💡 Key Design Benefits

**🎯 Single Source of Truth:** No duplicate mentor profiles, unified class system
**⚡ Query Efficiency:** Embedded profiles for fast filtering, subcollections for heavy data
**🔒 Security First:** Role-based access with proper data isolation
**📈 Scalable:** Clear separation between MVP and advanced features
**🎓 Academic Depth:** Complex architectural decisions perfect for dissertation analysis

This schema provides a solid foundation for your Roots & Wings platform while maintaining the flexibility to scale and add complexity as needed for your MSc project.