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
        "status": "approved"
    }

@pytest.fixture
def mentor_data():
    return {
        "uid": "test_mentor_001", 
        "displayName": "John Smith",
        "category": "music",
        "city": "London"
    }

