#!/bin/bash
# Doctor Appointment Scheduler - Startup Script

echo "🏥 Starting Doctor Appointment Scheduler..."
echo "============================================="

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "❌ Virtual environment not found. Please run:"
    echo "   python3 -m venv .venv"
    echo "   source .venv/bin/activate"
    echo "   pip install -r requirements.txt"
    exit 1
fi

# Activate virtual environment and start the application
echo "📦 Activating virtual environment..."
source .venv/bin/activate

echo "🔧 Installing/checking dependencies..."
pip install -q -r requirements.txt

echo "🚀 Starting Flask application..."
echo ""
echo "The application will be available at:"
echo "  🌐 http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop the server"
echo "============================================="

python app.py
