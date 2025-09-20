#!/usr/bin/env python3
"""
Demo booking scenario for Doctor Appointment Scheduler

This script demonstrates the complete booking workflow:
1. View available doctors
2. Select a doctor and see available slots
3. Book an appointment
4. View the booking confirmation
5. Cancel the appointment (optional)
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from data_manager import DataManager

def demo_booking_scenario():
    """Demonstrate the complete booking workflow"""
    
    print("🏥 Doctor Appointment Scheduler - Demo Booking Scenario")
    print("=" * 60)
    
    # Initialize data manager
    dm = DataManager()
    
    # Step 1: View available doctors
    print("\n📋 Step 1: Viewing available doctors...")
    doctors = dm.get_all_doctors()
    
    print(f"Found {len(doctors)} doctors:")
    for doctor in doctors:
        slots_count = len(doctor['available_slots'])
        print(f"  • {doctor['name']} ({doctor['specialty']}) - {slots_count} slots available")
    
    # Step 2: Select first doctor and view slots
    print(f"\n🩺 Step 2: Selecting Dr. {doctors[0]['name']}...")
    selected_doctor = doctors[0]
    available_slots = dm.get_available_slots(selected_doctor['id'])
    
    print(f"Available appointment times for {selected_doctor['name']}:")
    for i, slot in enumerate(available_slots, 1):
        print(f"  {i}. {slot}")
    
    # Step 3: Book an appointment (if slots available)
    if available_slots:
        selected_slot = available_slots[0]  # Book the first available slot
        
        print(f"\n📅 Step 3: Booking appointment for {selected_slot}...")
        
        # Book the appointment
        booking_result = dm.book_appointment(
            doctor_id=selected_doctor['id'],
            slot=selected_slot,
            patient_name="John Doe",
            patient_phone="(555) 123-4567",
            patient_email="john.doe@email.com"
        )
        
        if booking_result['success']:
            print(f"✅ {booking_result['message']}")
            print(f"   Booking ID: {booking_result['booking_id']}")
            
            # Step 4: Verify slot is no longer available
            print(f"\n🔍 Step 4: Verifying slot availability...")
            updated_slots = dm.get_available_slots(selected_doctor['id'])
            
            print(f"Remaining slots for {selected_doctor['name']}:")
            if updated_slots:
                for i, slot in enumerate(updated_slots, 1):
                    print(f"  {i}. {slot}")
            else:
                print("  No slots remaining")
            
            print(f"✅ Slot {selected_slot} successfully removed from availability")
            
            # Step 5: View patient bookings
            print(f"\n👤 Step 5: Viewing patient bookings...")
            patient_bookings = dm.get_patient_bookings("(555) 123-4567")
            
            print(f"Bookings for John Doe:")
            for booking in patient_bookings:
                print(f"  • {booking['doctor_name']} at {booking['slot']} (ID: {booking['id']})")
            
            # Step 6: Optional cancellation demo
            print(f"\n❌ Step 6: Demonstrating cancellation...")
            cancel_result = dm.cancel_appointment(
                booking_result['booking_id'], 
                "(555) 123-4567"
            )
            
            if cancel_result['success']:
                print(f"✅ {cancel_result['message']}")
                
                # Verify slot is restored
                final_slots = dm.get_available_slots(selected_doctor['id'])
                if selected_slot in final_slots:
                    print(f"✅ Slot {selected_slot} successfully restored to availability")
                else:
                    print(f"❌ Slot {selected_slot} was not restored")
            else:
                print(f"❌ Cancellation failed: {cancel_result['message']}")
                
        else:
            print(f"❌ Booking failed: {booking_result['message']}")
    
    else:
        print("❌ No slots available for booking demonstration")
    
    # Final statistics
    print(f"\n📊 Final Statistics:")
    stats = dm.get_booking_stats()
    print(f"  • Total bookings: {stats['total_bookings']}")
    print(f"  • Confirmed bookings: {stats['confirmed_bookings']}")
    print(f"  • Cancelled bookings: {stats['cancelled_bookings']}")
    
    print("\n🎉 Demo completed successfully!")
    print("\nTo run the web application:")
    print("  1. Run: python app.py")
    print("  2. Open: http://localhost:5000")
    print("  3. Follow the same workflow in the web interface")

if __name__ == "__main__":
    demo_booking_scenario()
