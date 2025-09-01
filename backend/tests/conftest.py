# Test configuration
import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from app.main import app

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def mock_firestore():
    """Basic Firestore mock"""
    with patch('app.services.firestore.db') as mock_db:
        mock_collection = Mock()
        mock_document = Mock()
        mock_db.collection.return_value = mock_collection
        mock_collection.document.return_value = mock_document
        mock_collection.stream.return_value = []
        yield mock_db

# Test data fixtures
@pytest.fixture  
def class_data():
    return {
        "classId": "test_class_001",
        "title": "Piano Class",
        "subject": "piano",
        "mentorName": "John Smith",
        "status": "approved",
        "type": "workshop",
        "format": "online",
        "ageGroup": "adult",
        "pricing": {"rate": 50, "currency": "GBP"}
    }

@pytest.fixture
def workshop_class_data():
    return {
        "classId": "test_workshop_001",
        "title": "Guitar Workshop",
        "subject": "guitar",
        "type": "workshop",
        "mentorName": "Sarah Johnson",
        "status": "approved",
        "format": "in-person",
        "city": "Manchester"
    }

@pytest.fixture
def group_class_data():
    return {
        "classId": "test_group_001",
        "title": "Painting Group Class",
        "subject": "painting",
        "type": "group",
        "mentorName": "Emma Wilson",
        "status": "approved",
        "format": "hybrid"
    }

@pytest.fixture
def onetoone_class_data():
    return {
        "classId": "test_onetoone_001",
        "title": "Personal Piano Lesson",
        "subject": "piano",
        "type": "onetoone",
        "mentorName": "David Brown",
        "status": "approved",
        "format": "online"
    }

@pytest.fixture
def mentor_data():
    return {
        "uid": "test_mentor_001", 
        "displayName": "John Smith",
        "category": "music",
        "city": "London",
        "specialties": ["piano", "theory"],
        "verified": True,
        "rating": 4.8
    }

@pytest.fixture
def music_mentor_data():
    return {
        "uid": "test_music_mentor_001",
        "displayName": "Sarah Chen",
        "category": "music",
        "city": "London",
        "specialties": ["piano", "guitar"],
        "verified": True,
        "rating": 4.9
    }

@pytest.fixture
def london_mentor_data():
    return {
        "uid": "test_london_mentor_001",
        "displayName": "Emma London",
        "category": "art",
        "city": "London",
        "region": "Greater London",
        "verified": True
    }

@pytest.fixture
def booking_data():
    return {
        "bookingId": "test_booking_001",
        "studentId": "test_student_001",
        "mentorId": "test_mentor_001",
        "classId": "test_class_001",
        "status": "pending",
        "bookingDate": "2025-08-31T10:00:00Z",
        "totalAmount": 50.00
    }



