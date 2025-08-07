# DEPRECATED - Use Simple Booking API instead
# This file is too complex with 100+ lines of session calculation
# Frontend now handles all session logic from class.schedule.weeklySchedule
# 
# Old approach:
# - Generated 12+ ScheduledSlot objects in booking creation
# - Complex date calculations, session progress tracking  
# - Redundant attendance status management
#
# New approach:
# - Booking just references classId
# - Frontend calculates sessions from class.schedule on demand
# - Optional simple attendance collection if needed
#
# Delete this file when migration is complete