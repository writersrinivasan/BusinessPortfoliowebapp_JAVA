# Doctor Appointment Scheduler

A modern web application built with Flask that allows patients to book appointments with doctors from a predefined list.

## Features

- View list of available doctors
- Dynamic slot booking with real-time availability updates
- Data persistence using JSON storage
- Modern, responsive UI with Bootstrap
- AJAX-based interactions for seamless user experience
- Input validation and error handling
- Session-based booking tracking

## Installation & Setup

1. **Clone or navigate to the project directory:**
   ```bash
   cd Scheduler-Doctor
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On macOS/Linux
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application:**
   ```bash
   python app.py
   ```

5. **Open your browser and navigate to:**
   ```
   http://localhost:5000
   ```

## Project Structure

```
Scheduler-Doctor/
├── app.py                 # Main Flask application
├── data_manager.py        # Data persistence functions
├── requirements.txt       # Python dependencies
├── doctors_data.json      # Initial doctors and slots data
├── bookings.json          # Stored bookings data
├── static/
│   ├── css/
│   │   └── style.css     # Custom styles
│   └── js/
│       └── main.js       # Frontend JavaScript
└── templates/
    ├── base.html         # Base template
    ├── index.html        # Homepage
    └── booking.html      # Booking page
```

## Usage

1. **Homepage:** View the list of available doctors
2. **Select Doctor:** Click on a doctor to view their available slots
3. **Book Appointment:** Fill in your details and select an available time slot
4. **Confirmation:** Receive confirmation of your booking

## Test Scenario

1. Start the application
2. Navigate to the homepage
3. Select "Dr. Smith" from the doctors list
4. Choose an available slot (e.g., "10:00 AM")
5. Fill in patient details: Name "John Doe", Phone "123-456-7890"
6. Submit the booking
7. Verify the slot is no longer available for future bookings

## API Endpoints

- `GET /` - Homepage with doctors list
- `GET /booking/<doctor_id>` - Booking page for specific doctor
- `POST /book_appointment` - Submit appointment booking
- `GET /api/available_slots/<doctor_id>` - Get available slots for doctor (AJAX)

## Enhancements Included

- Bootstrap 5 for modern, responsive design
- Real-time slot availability updates
- Form validation and error handling
- Success/error message notifications
- Session-based booking tracking
- Cancellation feature (bonus)

## Technologies Used

- **Backend:** Flask (Python)
- **Frontend:** HTML5, CSS3, JavaScript (ES6)
- **Styling:** Bootstrap 5
- **Data Storage:** JSON files
- **AJAX:** Fetch API

## Future Enhancements

- Database integration (SQLite/PostgreSQL)
- User authentication and profiles
- Email notifications
- Calendar integration
- Admin panel for managing doctors and slots
- Appointment reminders
