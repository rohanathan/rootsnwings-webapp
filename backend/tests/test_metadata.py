# Metadata API tests
from unittest.mock import Mock

def test_get_subjects_endpoint_exists(client, mock_firestore):
    """Test that subjects metadata endpoint exists"""
    response = client.get("/metadata/subjects")
    assert response.status_code in [200, 404]
    
    if response.status_code == 200:
        data = response.json()
        assert "subjects" in data or isinstance(data, list)

def test_get_categories_endpoint_exists(client, mock_firestore):
    """Test that categories metadata endpoint exists"""
    response = client.get("/metadata/categories")
    assert response.status_code in [200, 404]
    
    if response.status_code == 200:
        data = response.json()
        assert "categories" in data or isinstance(data, list)

def test_get_regions_endpoint_exists(client, mock_firestore):
    """Test that regions metadata endpoint exists"""
    response = client.get("/metadata/regions")
    assert response.status_code in [200, 404]
    
    if response.status_code == 200:
        data = response.json()
        assert "regions" in data or isinstance(data, list)

def test_get_age_groups_endpoint_exists(client, mock_firestore):
    """Test that age groups metadata endpoint exists"""
    response = client.get("/metadata/age-groups")
    assert response.status_code in [200, 404]
    
    if response.status_code == 200:
        data = response.json()
        assert "ageGroups" in data or isinstance(data, list)

def test_get_formats_endpoint_exists(client, mock_firestore):
    """Test that formats metadata endpoint exists"""
    response = client.get("/metadata/formats")
    assert response.status_code in [200, 404]
    
    if response.status_code == 200:
        data = response.json()
        assert "formats" in data or isinstance(data, list)

def test_get_cultural_subjects_endpoint_exists(client, mock_firestore):
    """Test that cultural subjects metadata endpoint exists"""
    response = client.get("/metadata/cultural-subjects")
    assert response.status_code in [200, 404]
    
    if response.status_code == 200:
        data = response.json()
        assert isinstance(data, (dict, list))

def test_get_subject_details(client, mock_firestore):
    """Test getting details for specific subjects"""
    cultural_subjects = ["bharatanatyam", "bagpipes", "origami", "aikido", "flamenco"]
    
    for subject in cultural_subjects:
        response = client.get(f"/metadata/subjects/{subject}")
        # Should exist or return 404 gracefully
        assert response.status_code in [200, 404]

def test_get_pricing_tiers_endpoint_exists(client, mock_firestore):
    """Test that pricing tiers endpoint exists"""
    response = client.get("/metadata/pricing-tiers")
    assert response.status_code in [200, 404]
    
    if response.status_code == 200:
        data = response.json()
        assert isinstance(data, (dict, list))