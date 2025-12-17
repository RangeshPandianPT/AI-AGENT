"""
IGRIS Main Server - Flask + SocketIO Backend
Handles WebSocket communication between Python backend and web frontend.
"""

import os
import sys
import threading
import time
from flask import Flask, send_from_directory, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from dotenv import load_dotenv

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ai_engine import get_ai_response, get_greeting, reset_conversation
from voice import get_voice_engine, speak_async

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__, static_folder='../frontend', static_url_path='')
CORS(app)

# Initialize SocketIO with CORS support
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Current state of IGRIS
current_state = "idle"  # idle, listening, thinking, speaking

# Voice engine reference
voice_engine = None

# Flag for continuous listening
listening_active = False


def set_state(new_state: str):
    """
    Update IGRIS state and broadcast to all connected clients.
    
    Args:
        new_state: One of 'idle', 'listening', 'thinking', 'speaking'
    """
    global current_state
    current_state = new_state
    print(f"[IGRIS State]: {new_state.upper()}")
    socketio.emit('state_change', {'state': new_state})


def process_voice_input(text: str):
    """
    Process voice input from the user.
    
    Args:
        text: The recognized speech text
    """
    # Broadcast that we received input
    socketio.emit('user_input', {'text': text})
    
    # Switch to thinking state
    set_state('thinking')
    
    # Get AI response
    response = get_ai_response(text)
    
    # Broadcast the response
    socketio.emit('ai_response', {'text': response})
    
    # Switch to speaking state
    set_state('speaking')
    
    # Speak the response
    voice_engine.speak(response)
    
    # Return to idle
    set_state('idle')


def listening_loop():
    """Background loop for continuous voice listening."""
    global listening_active, voice_engine
    
    while listening_active:
        try:
            set_state('listening')
            text = voice_engine.listen(timeout=5, phrase_time_limit=15)
            
            if text:
                # Check for wake word
                if 'hey igris' in text.lower():
                    # Extract command after wake word
                    command = text.lower().replace('hey igris', '').strip()
                    
                    if command:
                        process_voice_input(command)
                    else:
                        # Just wake word, prompt for command
                        set_state('speaking')
                        voice_engine.speak("Yes, Master?")
                        set_state('listening')
                        
                        # Listen for the actual command
                        command = voice_engine.listen(timeout=8, phrase_time_limit=15)
                        if command:
                            process_voice_input(command)
                        else:
                            set_state('idle')
                else:
                    # If listening mode is active, process any speech
                    set_state('idle')
            else:
                set_state('idle')
            
            # Small delay between listening cycles
            time.sleep(0.1)
            
        except Exception as e:
            print(f"[Listening Error]: {e}")
            set_state('idle')
            time.sleep(1)


# ==================== HTTP Routes ====================

@app.route('/')
def index():
    """Serve the frontend index.html."""
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/status')
def status():
    """Return current IGRIS status."""
    return jsonify({
        'status': 'online',
        'state': current_state,
        'name': 'IGRIS',
        'version': '1.0.0'
    })


# ==================== WebSocket Events ====================

@socketio.on('connect')
def handle_connect():
    """Handle new client connection."""
    print(f"[WebSocket]: Client connected")
    emit('connected', {
        'message': 'Connected to IGRIS',
        'state': current_state
    })


@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection."""
    print(f"[WebSocket]: Client disconnected")


@socketio.on('start_listening')
def handle_start_listening():
    """Start continuous voice listening."""
    global listening_active
    
    if not listening_active:
        listening_active = True
        print("[IGRIS]: Starting listening mode")
        
        # Start listening in background thread
        listen_thread = threading.Thread(target=listening_loop, daemon=True)
        listen_thread.start()
        
        emit('listening_started', {'message': 'Listening mode activated'})


@socketio.on('stop_listening')
def handle_stop_listening():
    """Stop voice listening."""
    global listening_active
    listening_active = False
    set_state('idle')
    print("[IGRIS]: Listening mode stopped")
    emit('listening_stopped', {'message': 'Listening mode deactivated'})


@socketio.on('text_input')
def handle_text_input(data):
    """Handle text input from frontend (for testing without mic)."""
    text = data.get('text', '')
    if text:
        print(f"[Text Input]: {text}")
        process_voice_input(text)


@socketio.on('request_greeting')
def handle_greeting():
    """Send the IGRIS greeting."""
    global voice_engine
    
    greeting = get_greeting()
    emit('ai_response', {'text': greeting})
    
    set_state('speaking')
    voice_engine.speak(greeting)
    set_state('idle')


@socketio.on('reset_conversation')
def handle_reset():
    """Reset the conversation history."""
    reset_conversation()
    emit('conversation_reset', {'message': 'Conversation history cleared'})


# ==================== Main Entry Point ====================

def initialize():
    """Initialize IGRIS components."""
    global voice_engine
    
    print("=" * 50)
    print("  IGRIS - Interactive Graphical Real-time")
    print("          Intelligent System")
    print("=" * 50)
    print()
    
    # Initialize voice engine
    print("[IGRIS]: Initializing voice engine...")
    voice_engine = get_voice_engine()
    
    # Set up voice callbacks
    voice_engine.on_speech_start = lambda: set_state('speaking')
    voice_engine.on_speech_end = lambda: set_state('idle')
    
    print("[IGRIS]: System ready")
    print()


if __name__ == '__main__':
    # Initialize components
    initialize()
    
    # Print startup info
    print("[Server]: Starting IGRIS backend server...")
    print("[Server]: Frontend URL: http://localhost:5000")
    print("[Server]: Press Ctrl+C to stop")
    print()
    
    # Run the Flask-SocketIO server
    socketio.run(app, host='0.0.0.0', port=5000, debug=False, allow_unsafe_werkzeug=True)
