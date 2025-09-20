"""
Data Manager Module for Doctor Appointment Scheduler

This module handles all data persistence operations including:
- Reading and writing doctor data
- Managing appointment bookings
- Updating slot availability
- Data validation and consistency
"""

import json
import os
from datetime import datetime
from typing import Dict, List, Optional, Any
import threading

# Thread lock for ensuring data consistency during concurrent access
data_lock = threading.Lock()

class DataManager:
    """Handles all data operations for the appointment scheduler"""
    
    def __init__(self, doctors_file='doctors_data.json', bookings_file='bookings.json'):
        self.doctors_file = doctors_file
        self.bookings_file = bookings_file
        self._ensure_files_exist()
    
    def _ensure_files_exist(self):
        """Ensure that required data files exist"""
        if not os.path.exists(self.doctors_file):
            self._create_initial_doctors_data()
        
        if not os.path.exists(self.bookings_file):
            self._create_initial_bookings_data()
    
    def _create_initial_doctors_data(self):
        """Create initial doctors data if file doesn't exist"""
        initial_data = {
            "doctors": [
                {
                    "id": 1,
                    "name": "Dr. Sarah Smith",
                    "specialty": "General Medicine",
                    "description": "Experienced family physician with over 10 years of practice",
                    "available_slots": [
                        "09:00 AM", "10:00 AM", "11:00 AM", 
                        "02:00 PM", "03:00 PM", "04:00 PM"
                    ]
                }
            ]
        }
        self._write_json_file(self.doctors_file, initial_data)
    
    def _create_initial_bookings_data(self):
        """Create initial bookings data if file doesn't exist"""
        initial_data = {"bookings": []}
        self._write_json_file(self.bookings_file, initial_data)
    
    def _read_json_file(self, filename: str) -> Dict[str, Any]:
        """Safely read JSON file with error handling"""
        try:
            with open(filename, 'r', encoding='utf-8') as file:
                return json.load(file)
        except (FileNotFoundError, json.JSONDecodeError) as e:
            print(f"Error reading {filename}: {e}")
            return {}
    
    def _write_json_file(self, filename: str, data: Dict[str, Any]) -> bool:
        """Safely write JSON file with error handling"""
        try:
            with open(filename, 'w', encoding='utf-8') as file:
                json.dump(data, file, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"Error writing {filename}: {e}")
            return False
    
    def get_all_doctors(self) -> List[Dict[str, Any]]:
        """Get list of all doctors"""
        with data_lock:
            data = self._read_json_file(self.doctors_file)
            return data.get('doctors', [])
    
    def get_doctor_by_id(self, doctor_id: int) -> Optional[Dict[str, Any]]:
        """Get specific doctor by ID"""
        doctors = self.get_all_doctors()
        for doctor in doctors:
            if doctor['id'] == doctor_id:
                return doctor
        return None
    
    def get_available_slots(self, doctor_id: int) -> List[str]:
        """Get available slots for a specific doctor"""
        doctor = self.get_doctor_by_id(doctor_id)
        if doctor:
            return doctor.get('available_slots', [])
        return []
    
    def book_appointment(self, doctor_id: int, slot: str, patient_name: str, 
                        patient_phone: str, patient_email: str = "") -> Dict[str, Any]:
        """
        Book an appointment and update availability
        
        Returns:
            Dict with 'success' boolean and 'message' string
        """
        with data_lock:
            # Check if slot is still available
            doctor = self.get_doctor_by_id(doctor_id)
            if not doctor:
                return {'success': False, 'message': 'Doctor not found'}
            
            if slot not in doctor['available_slots']:
                return {'success': False, 'message': 'Slot is no longer available'}
            
            # Validate input
            if not patient_name.strip():
                return {'success': False, 'message': 'Patient name is required'}
            
            if not patient_phone.strip():
                return {'success': False, 'message': 'Patient phone is required'}
            
            # Create booking record
            booking = {
                'id': self._generate_booking_id(),
                'doctor_id': doctor_id,
                'doctor_name': doctor['name'],
                'patient_name': patient_name.strip(),
                'patient_phone': patient_phone.strip(),
                'patient_email': patient_email.strip(),
                'slot': slot,
                'booking_date': datetime.now().isoformat(),
                'status': 'confirmed'
            }
            
            # Add booking to bookings file
            bookings_data = self._read_json_file(self.bookings_file)
            bookings_data.setdefault('bookings', []).append(booking)
            
            if not self._write_json_file(self.bookings_file, bookings_data):
                return {'success': False, 'message': 'Failed to save booking'}
            
            # Remove slot from doctor's availability
            if self._remove_slot_from_doctor(doctor_id, slot):
                return {
                    'success': True, 
                    'message': f'Appointment booked successfully for {slot}',
                    'booking_id': booking['id']
                }
            else:
                # Rollback booking if slot removal failed
                self._rollback_booking(booking['id'])
                return {'success': False, 'message': 'Failed to update doctor availability'}
    
    def _generate_booking_id(self) -> str:
        """Generate unique booking ID"""
        bookings_data = self._read_json_file(self.bookings_file)
        bookings = bookings_data.get('bookings', [])
        return f"APT{len(bookings) + 1:04d}"
    
    def _remove_slot_from_doctor(self, doctor_id: int, slot: str) -> bool:
        """Remove a slot from doctor's available slots"""
        doctors_data = self._read_json_file(self.doctors_file)
        doctors = doctors_data.get('doctors', [])
        
        for doctor in doctors:
            if doctor['id'] == doctor_id:
                if slot in doctor['available_slots']:
                    doctor['available_slots'].remove(slot)
                    return self._write_json_file(self.doctors_file, doctors_data)
        return False
    
    def _rollback_booking(self, booking_id: str) -> bool:
        """Remove a booking (rollback operation)"""
        bookings_data = self._read_json_file(self.bookings_file)
        bookings = bookings_data.get('bookings', [])
        
        # Remove booking with matching ID
        bookings_data['bookings'] = [b for b in bookings if b.get('id') != booking_id]
        return self._write_json_file(self.bookings_file, bookings_data)
    
    def get_patient_bookings(self, patient_phone: str) -> List[Dict[str, Any]]:
        """Get all bookings for a patient by phone number"""
        bookings_data = self._read_json_file(self.bookings_file)
        bookings = bookings_data.get('bookings', [])
        
        return [booking for booking in bookings 
                if booking.get('patient_phone') == patient_phone 
                and booking.get('status') == 'confirmed']
    
    def cancel_appointment(self, booking_id: str, patient_phone: str) -> Dict[str, Any]:
        """Cancel an appointment and restore slot availability"""
        with data_lock:
            bookings_data = self._read_json_file(self.bookings_file)
            bookings = bookings_data.get('bookings', [])
            
            # Find the booking
            booking_to_cancel = None
            for booking in bookings:
                if (booking.get('id') == booking_id and 
                    booking.get('patient_phone') == patient_phone and
                    booking.get('status') == 'confirmed'):
                    booking_to_cancel = booking
                    break
            
            if not booking_to_cancel:
                return {'success': False, 'message': 'Booking not found or already cancelled'}
            
            # Mark booking as cancelled
            booking_to_cancel['status'] = 'cancelled'
            booking_to_cancel['cancellation_date'] = datetime.now().isoformat()
            
            # Save updated bookings
            if not self._write_json_file(self.bookings_file, bookings_data):
                return {'success': False, 'message': 'Failed to update booking status'}
            
            # Restore slot to doctor's availability
            if self._restore_slot_to_doctor(booking_to_cancel['doctor_id'], 
                                          booking_to_cancel['slot']):
                return {
                    'success': True, 
                    'message': f'Appointment cancelled successfully. Slot {booking_to_cancel["slot"]} is now available.'
                }
            else:
                return {'success': False, 'message': 'Booking cancelled but failed to restore slot availability'}
    
    def _restore_slot_to_doctor(self, doctor_id: int, slot: str) -> bool:
        """Restore a slot to doctor's available slots"""
        doctors_data = self._read_json_file(self.doctors_file)
        doctors = doctors_data.get('doctors', [])
        
        for doctor in doctors:
            if doctor['id'] == doctor_id:
                if slot not in doctor['available_slots']:
                    doctor['available_slots'].append(slot)
                    # Sort slots to maintain order
                    doctor['available_slots'] = self._sort_time_slots(doctor['available_slots'])
                    return self._write_json_file(self.doctors_file, doctors_data)
        return False
    
    def _sort_time_slots(self, slots: List[str]) -> List[str]:
        """Sort time slots in chronological order"""
        def time_to_minutes(time_str):
            """Convert time string to minutes for sorting"""
            time_part = time_str.split()[0]
            hours, minutes = map(int, time_part.split(':'))
            am_pm = time_str.split()[1]
            
            if am_pm == 'PM' and hours != 12:
                hours += 12
            elif am_pm == 'AM' and hours == 12:
                hours = 0
                
            return hours * 60 + minutes
        
        return sorted(slots, key=time_to_minutes)
    
    def get_all_bookings(self) -> List[Dict[str, Any]]:
        """Get all bookings (for admin purposes)"""
        bookings_data = self._read_json_file(self.bookings_file)
        return bookings_data.get('bookings', [])
    
    def get_booking_stats(self) -> Dict[str, Any]:
        """Get booking statistics"""
        bookings = self.get_all_bookings()
        confirmed_bookings = [b for b in bookings if b.get('status') == 'confirmed']
        cancelled_bookings = [b for b in bookings if b.get('status') == 'cancelled']
        
        return {
            'total_bookings': len(bookings),
            'confirmed_bookings': len(confirmed_bookings),
            'cancelled_bookings': len(cancelled_bookings),
            'doctors_with_bookings': len(set(b.get('doctor_id') for b in confirmed_bookings))
        }


# Create global instance
data_manager = DataManager()
