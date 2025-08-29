# Search API tests
from unittest.mock import Mock

def test_search_basic(client, mock_firestore):
    """Test basic search works"""
    # Mock some search results
    mock_firestore.collection.return_value.stream.return_value = []
    
    response = client.get("/search/?q=piano")
    assert response.status_code == 200
    data = response.json()
    assert "results" in data or "mentors" in data or "classes" in data

def test_search_with_filters(client, mock_firestore):
    """Test search with category filter"""
    mock_firestore.collection.return_value.stream.return_value = []
    
    response = client.get("/search/?category=music")
    assert response.status_code == 200
