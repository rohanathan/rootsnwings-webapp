# Search API tests
from unittest.mock import Mock

def test_search_basic_music(client, mock_firestore):
    """Test basic music search"""
    mock_firestore.collection.return_value.stream.return_value = []
    
    response = client.get("/search/?q=piano")
    assert response.status_code == 200
    data = response.json()
    assert "results" in data or "mentors" in data or "classes" in data

def test_search_basic_art(client, mock_firestore):
    """Test basic art search"""
    mock_firestore.collection.return_value.stream.return_value = []
    
    response = client.get("/search/?q=painting")
    assert response.status_code == 200
    data = response.json()
    assert "results" in data or "mentors" in data or "classes" in data

def test_search_cultural_subjects(client, mock_firestore):
    """Test searching for cultural subjects"""
    mock_firestore.collection.return_value.stream.return_value = []
    
    cultural_terms = ["bharatanatyam", "bagpipes", "flamenco", "aikido", "origami"]
    for term in cultural_terms:
        response = client.get(f"/search/?q={term}")
        assert response.status_code == 200

def test_search_with_category_filter(client, mock_firestore):
    """Test search with category filter"""
    mock_firestore.collection.return_value.stream.return_value = []
    
    categories = ["music", "art", "technology", "language", "wellness"]
    for category in categories:
        response = client.get(f"/search/?category={category}")
        assert response.status_code == 200

def test_search_with_region_filter(client, mock_firestore):
    """Test search with region filter"""
    mock_firestore.collection.return_value.stream.return_value = []
    
    regions = ["London", "Manchester", "Edinburgh", "Cardiff", "Belfast"]
    for region in regions:
        response = client.get(f"/search/?region={region}")
        assert response.status_code == 200

def test_search_with_format_filter(client, mock_firestore):
    """Test search with format filter"""
    mock_firestore.collection.return_value.stream.return_value = []
    
    formats = ["online", "in-person", "hybrid"]
    for format_type in formats:
        response = client.get(f"/search/?format={format_type}")
        assert response.status_code == 200

def test_search_with_age_group_filter(client, mock_firestore):
    """Test search with age group filter"""
    mock_firestore.collection.return_value.stream.return_value = []
    
    age_groups = ["adult", "teen", "child", "all_ages"]
    for age_group in age_groups:
        response = client.get(f"/search/?ageGroup={age_group}")
        assert response.status_code == 200

def test_search_with_multiple_filters(client, mock_firestore):
    """Test search with multiple filters combined"""
    mock_firestore.collection.return_value.stream.return_value = []
    
    response = client.get("/search/?q=guitar&category=music&format=online&ageGroup=adult")
    assert response.status_code == 200
    data = response.json()
    assert "results" in data or "mentors" in data or "classes" in data

def test_search_with_price_range(client, mock_firestore):
    """Test search with price range filters"""
    mock_firestore.collection.return_value.stream.return_value = []
    
    response = client.get("/search/?minPrice=20&maxPrice=100")
    assert response.status_code == 200
    data = response.json()
    assert "results" in data or "mentors" in data or "classes" in data

def test_search_empty_query(client, mock_firestore):
    """Test search with empty query"""
    mock_firestore.collection.return_value.stream.return_value = []
    
    response = client.get("/search/?q=")
    assert response.status_code == 200

def test_search_no_results(client, mock_firestore):
    """Test search with no results"""
    mock_firestore.collection.return_value.stream.return_value = []
    
    response = client.get("/search/?q=nonexistentsubject123")
    assert response.status_code == 200
    data = response.json()
    # Should return empty results, not error
    assert isinstance(data, dict)

def test_search_special_characters(client, mock_firestore):
    """Test search with special characters"""
    mock_firestore.collection.return_value.stream.return_value = []
    
    special_queries = ["c++", "3d-modeling", "self-care", "rock&roll"]
    for query in special_queries:
        response = client.get(f"/search/?q={query}")
        assert response.status_code == 200

def test_search_long_query(client, mock_firestore):
    """Test search with long query"""
    mock_firestore.collection.return_value.stream.return_value = []
    
    long_query = "advanced classical piano lessons for intermediate adult students in london"
    response = client.get(f"/search/?q={long_query}")
    assert response.status_code == 200
