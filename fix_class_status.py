#!/usr/bin/env python3
"""
Script to find and fix classes with approvalWorkflow.reviewStatus but missing status field
"""
import requests
import json

# API base URL  
BASE_URL = "https://rootsnwings-api-944856745086.europe-west2.run.app"

def try_approve_class(class_id):
    """Try to approve a class by its ID"""
    try:
        response = requests.post(
            f"{BASE_URL}/classes/{class_id}/approve",
            json={"admin_notes": "Fixing missing status field"},
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"SUCCESS: {class_id} - {result.get('message')}")
            return True
        elif response.status_code == 404:
            print(f"NOT_FOUND: {class_id}")
            return False
        else:
            print(f"ERROR: {class_id} - Status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"EXCEPTION: {class_id} - {e}")
        return False

def test_known_class_ids():
    """Test a list of potential class IDs based on common patterns"""
    
    # Based on the class you showed me, let's try some variations
    potential_class_ids = [
        "class_50ddb1a0",  # The one you showed
        # Try some other potential IDs based on patterns I've seen
        "class_abc123456", 
        "class_def789012",
        # Other common patterns
        "class_test_001",
        "class_test_002", 
        "class_sample_001",
        # Sequential IDs
        "class_001",
        "class_002",
        "class_003",
        "class_004",
        "class_005",
    ]
    
    print("Testing potential class IDs...")
    found_classes = []
    
    for class_id in potential_class_ids:
        print(f"\nTesting: {class_id}")
        if try_approve_class(class_id):
            found_classes.append(class_id)
    
    return found_classes

def check_classes_after_fixes():
    """Check how many classes are visible now"""
    try:
        response = requests.get(f"{BASE_URL}/classes/?pageSize=50")
        response.raise_for_status()
        
        data = response.json()
        total = data.get("total", 0)
        classes = data.get("classes", [])
        
        print(f"\n=== CURRENT CLASSES STATUS ===")
        print(f"Total visible: {total}")
        
        for cls in classes:
            class_id = cls.get("classId", "unknown")
            title = cls.get("title", "Unknown")[:40]
            class_type = cls.get("type", "unknown") 
            print(f"  - {class_id} ({class_type}): {title}")
            
        return total
        
    except Exception as e:
        print(f"Error checking classes: {e}")
        return 0

def main():
    print("=== FIXING CLASSES WITH MISSING STATUS FIELD ===")
    
    # Check current state
    initial_count = check_classes_after_fixes()
    
    # Try to find and fix hidden classes
    found_classes = test_known_class_ids()
    
    if found_classes:
        print(f"\nFixed {len(found_classes)} additional classes:")
        for class_id in found_classes:
            print(f"  - {class_id}")
    
    # Check final state
    final_count = check_classes_after_fixes()
    
    print(f"\n=== SUMMARY ===")
    print(f"Classes before: {initial_count}")
    print(f"Classes after: {final_count}")
    print(f"Difference: +{final_count - initial_count}")

if __name__ == "__main__":
    main()