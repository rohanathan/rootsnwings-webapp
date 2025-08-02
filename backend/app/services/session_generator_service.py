from datetime import datetime, timedelta
from typing import List, Dict, Any
from app.models.booking_models import ScheduledSlot, SessionProgress
import calendar

class SessionGeneratorService:
    """Generate scheduled slots for multi-session classes"""
    
    @staticmethod
    def generate_session_slots(class_data: Dict[str, Any], start_date: str = None) -> List[ScheduledSlot]:
        """
        Generate all session slots for a multi-session class
        
        Args:
            class_data: Class information from Firestore
            start_date: Override start date (YYYY-MM-DD format)
            
        Returns:
            List of ScheduledSlot objects with session numbers
        """
        try:
            schedule = class_data.get('schedule', {})
            pricing = class_data.get('pricing', {})
            
            # Get class schedule details
            class_start_date = start_date or schedule.get('startDate')
            total_sessions = pricing.get('totalSessions', 1)
            weekly_schedule = schedule.get('weeklySchedule', [])
            
            if not class_start_date or not weekly_schedule or total_sessions == 1:
                # Single session class (workshop)
                return [ScheduledSlot(
                    sessionNumber=1,
                    date=class_start_date or datetime.now().strftime('%Y-%m-%d'),
                    dayOfWeek="Workshop",
                    startTime=schedule.get('startTime', '10:00'),
                    endTime=schedule.get('endTime', '16:00'),
                    status="confirmed",
                    attendanceStatus="pending"
                )]
            
            # Convert string date to datetime
            start_dt = datetime.strptime(class_start_date, '%Y-%m-%d')
            
            # Create day name to number mapping
            day_to_num = {
                'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3,
                'Friday': 4, 'Saturday': 5, 'Sunday': 6
            }
            
            # Sort weekly schedule by day
            weekly_schedule_sorted = sorted(weekly_schedule, 
                                          key=lambda x: day_to_num.get(x['day'], 0))
            
            # Generate all session slots
            slots = []
            session_number = 1
            current_week_start = start_dt
            
            # Calculate how many weeks we need
            sessions_per_week = len(weekly_schedule_sorted)
            weeks_needed = (total_sessions + sessions_per_week - 1) // sessions_per_week
            
            for week in range(weeks_needed):
                for day_schedule in weekly_schedule_sorted:
                    if session_number > total_sessions:
                        break
                        
                    day_name = day_schedule['day']
                    start_time = day_schedule['startTime']
                    end_time = day_schedule['endTime']
                    
                    # Find the date for this day in the current week
                    target_day_num = day_to_num[day_name]
                    current_day_num = current_week_start.weekday()
                    
                    # Calculate days to add to get to target day
                    days_ahead = target_day_num - current_day_num
                    if days_ahead < 0:  # Target day is in next week
                        days_ahead += 7
                    
                    session_date = current_week_start + timedelta(days=days_ahead)
                    
                    slot = ScheduledSlot(
                        sessionNumber=session_number,
                        date=session_date.strftime('%Y-%m-%d'),
                        dayOfWeek=day_name,
                        startTime=start_time,
                        endTime=end_time,
                        status="confirmed",
                        attendanceStatus="pending"
                    )
                    
                    slots.append(slot)
                    session_number += 1
                
                # Move to next week
                current_week_start += timedelta(weeks=1)
            
            return slots
            
        except Exception as e:
            print(f"Error generating session slots: {str(e)}")
            # Return single session fallback
            return [ScheduledSlot(
                sessionNumber=1,
                date=datetime.now().strftime('%Y-%m-%d'),
                dayOfWeek="TBD",
                startTime="10:00", 
                endTime="11:00",
                status="confirmed",
                attendanceStatus="pending"
            )]
    
    @staticmethod
    def create_session_progress(total_sessions: int) -> SessionProgress:
        """Create initial session progress tracking"""
        return SessionProgress(
            totalSessions=total_sessions,
            completedSessions=0,
            attendedSessions=0,
            missedSessions=0,
            nextSessionNumber=1,
            progressPercentage=0.0
        )
    
    @staticmethod
    def update_session_progress(progress: SessionProgress, attendance_records: List) -> SessionProgress:
        """Update session progress based on attendance"""
        try:
            attended = sum(1 for record in attendance_records if record.get('status') == 'present')
            missed = sum(1 for record in attendance_records if record.get('status') == 'absent')
            completed = len(attendance_records)
            
            # Find next session number
            attended_sessions = {record.get('sessionNumber') for record in attendance_records}
            next_session = 1
            for i in range(1, progress.totalSessions + 1):
                if i not in attended_sessions:
                    next_session = i
                    break
            else:
                next_session = None  # All sessions completed
            
            progress.completedSessions = completed
            progress.attendedSessions = attended
            progress.missedSessions = missed
            progress.nextSessionNumber = next_session
            progress.progressPercentage = (completed / progress.totalSessions * 100) if progress.totalSessions > 0 else 0
            
            return progress
            
        except Exception as e:
            print(f"Error updating session progress: {str(e)}")
            return progress

# Demo data generators
def generate_12_week_mwf_example():
    """Generate 12 weeks, Mon/Wed/Fri, 5-6pm example"""
    class_data = {
        'schedule': {
            'startDate': '2025-08-04',  # Starting Monday
            'weeklySchedule': [
                {'day': 'Monday', 'startTime': '17:00', 'endTime': '18:00'},
                {'day': 'Wednesday', 'startTime': '17:00', 'endTime': '18:00'},
                {'day': 'Friday', 'startTime': '17:00', 'endTime': '18:00'}
            ]
        },
        'pricing': {
            'totalSessions': 36  # 12 weeks × 3 sessions per week
        }
    }
    
    slots = SessionGeneratorService.generate_session_slots(class_data)
    print(f"Generated {len(slots)} sessions for 12-week MWF course")
    return slots

def generate_meditation_example():
    """Generate session slots for the meditation class (8 weeks, Tue/Thu)"""
    class_data = {
        'schedule': {
            'startDate': '2025-08-12',
            'weeklySchedule': [
                {'day': 'Tuesday', 'startTime': '18:00', 'endTime': '19:30'},
                {'day': 'Thursday', 'startTime': '18:00', 'endTime': '19:30'}
            ]
        },
        'pricing': {
            'totalSessions': 16  # 8 weeks × 2 sessions per week
        }
    }
    
    slots = SessionGeneratorService.generate_session_slots(class_data)
    print(f"Generated {len(slots)} sessions for meditation course")
    return slots