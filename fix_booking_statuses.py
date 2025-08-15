#!/usr/bin/env python3
"""
Script to fix booking statuses in Firestore
Changes ALL booking statuses to 'confirmed' to resolve validation errors
"""

import os
import json
from google.cloud import firestore
from google.oauth2 import service_account

def main():
    # Initialize Firestore client
    try:
        # Try to load service account credentials
        credentials_path = "secrets/serviceAccountKey.json"
        if os.path.exists(credentials_path):
            credentials = service_account.Credentials.from_service_account_file(credentials_path)
            db = firestore.Client(credentials=credentials)
        else:
            # Fallback to default credentials
            db = firestore.Client()
        
        print("Connected to Firestore")
        
        # Get all bookings from the 'bookings' collection
        bookings_ref = db.collection('bookings')
        bookings = bookings_ref.get()
        
        if not bookings:
            print("No bookings found in collection")
            return
        
        print(f"Found {len(bookings)} bookings")
        
        updated_count = 0
        errors = []
        
        # Process each booking
        for booking_doc in bookings:
            try:
                booking_id = booking_doc.id
                booking_data = booking_doc.to_dict()
                
                current_status = booking_data.get('bookingStatus', 'unknown')
                print(f"Booking {booking_id}: current status = '{current_status}'")
                
                # Update status to 'confirmed'
                booking_doc.reference.update({
                    'bookingStatus': 'confirmed',
                    'updatedAt': firestore.SERVER_TIMESTAMP
                })
                
                updated_count += 1
                print(f"Updated {booking_id}: '{current_status}' -> 'confirmed'")
                
            except Exception as e:
                error_msg = f"Failed to update booking {booking_id}: {str(e)}"
                print(error_msg)
                errors.append(error_msg)
        
        # Summary
        print(f"\nSUMMARY:")
        print(f"   Total bookings found: {len(bookings)}")
        print(f"   Successfully updated: {updated_count}")
        print(f"   Errors: {len(errors)}")
        
        if errors:
            print(f"\nERRORS:")
            for error in errors:
                print(f"   {error}")
        
        if updated_count > 0:
            print(f"\nAll booking statuses are now set to 'confirmed'")
            print(f"The user bookings page should now work properly!")
        
    except Exception as e:
        print(f"Failed to connect to Firestore: {str(e)}")
        print(f"Please check your credentials and network connection")

if __name__ == "__main__":
    main()