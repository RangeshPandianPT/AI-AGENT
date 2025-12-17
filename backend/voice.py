"""
IGRIS Voice Module - Speech Recognition and Text-to-Speech
Improved version with better microphone sensitivity.
"""

import os
import threading
import time
from typing import Callable, Optional

# Voice state
is_speaking = False
stop_listening = False

# Try to import TTS engine
TTS_AVAILABLE = False
tts_lock = threading.Lock()
try:
    import pyttsx3
    TTS_AVAILABLE = True
except ImportError:
    print("[Voice Engine]: pyttsx3 not installed - TTS disabled")

# Try to import speech recognition
SR_AVAILABLE = False
try:
    import speech_recognition as sr
    SR_AVAILABLE = True
except ImportError:
    print("[Voice Engine]: SpeechRecognition not installed - STT disabled")


class VoiceEngine:
    """Voice engine for IGRIS."""
    
    def __init__(self):
        """Initialize the voice engine."""
        self.tts_engine = None
        self.recognizer = None
        self.tts_available = False
        self.stt_available = False
        
        # Wake word
        self.wake_word = "igris"
        
        # Callbacks
        self.on_listening_start: Optional[Callable] = None
        self.on_listening_stop: Optional[Callable] = None
        self.on_speech_start: Optional[Callable] = None
        self.on_speech_end: Optional[Callable] = None
        
        # Initialize
        self._init_tts()
        self._init_stt()
        
        print(f"[Voice Engine]: TTS: {self.tts_available}, STT: {self.stt_available}")
    
    def _init_tts(self):
        """Initialize TTS."""
        if not TTS_AVAILABLE:
            return
        try:
            self.tts_engine = pyttsx3.init()
            voices = self.tts_engine.getProperty('voices')
            if voices:
                for v in voices:
                    if 'david' in v.name.lower():
                        self.tts_engine.setProperty('voice', v.id)
                        break
            self.tts_engine.setProperty('rate', 170)
            self.tts_engine.setProperty('volume', 1.0)
            self.tts_available = True
        except Exception as e:
            print(f"[Voice Engine]: TTS error - {e}")
    
    def _init_stt(self):
        """Initialize speech recognition."""
        if not SR_AVAILABLE:
            return
        try:
            self.recognizer = sr.Recognizer()
            # VERY LOW threshold for sensitive microphone detection
            self.recognizer.energy_threshold = 100
            self.recognizer.dynamic_energy_threshold = False
            self.recognizer.pause_threshold = 0.5
            self.stt_available = True
            
            # Test microphone
            try:
                with sr.Microphone() as source:
                    print("[Voice Engine]: Calibrating microphone...")
                    self.recognizer.adjust_for_ambient_noise(source, duration=2)
                    print(f"[Voice Engine]: Energy threshold: {self.recognizer.energy_threshold}")
            except Exception as e:
                print(f"[Voice Engine]: Mic calibration error - {e}")
        except Exception as e:
            print(f"[Voice Engine]: STT error - {e}")
            self.stt_available = False
    
    def speak(self, text: str, callback: Optional[Callable] = None):
        """Speak text using a fresh engine each time."""
        global is_speaking
        
        if not text:
            return
        
        is_speaking = True
        print(f"[IGRIS Speaking]: {text}")
        
        if self.on_speech_start:
            try:
                self.on_speech_start()
            except:
                pass
        
        # Use subprocess to avoid TTS engine conflicts
        try:
            import subprocess
            import sys
            
            # Escape quotes in text
            safe_text = text.replace('"', '\\"').replace("'", "\\'")
            
            # Run TTS in a separate Python process
            cmd = f'''python -c "import pyttsx3; e=pyttsx3.init(); e.setProperty('rate',170); e.setProperty('volume',1.0); e.say('{safe_text}'); e.runAndWait()"'''
            
            subprocess.run(cmd, shell=True, timeout=30, capture_output=True)
            
        except Exception as e:
            print(f"[Voice TTS Error]: {e}")
            time.sleep(len(text) * 0.03)
        

        is_speaking = False
        
        if self.on_speech_end:
            try:
                self.on_speech_end()
            except:
                pass
        
        if callback:
            callback()
    
    def speak_async(self, text: str, callback: Optional[Callable] = None):
        """Speak asynchronously."""
        t = threading.Thread(target=self.speak, args=(text, callback))
        t.daemon = True
        t.start()
    
    def listen(self, timeout: int = 8, phrase_time_limit: int = 12) -> Optional[str]:
        """Listen for voice input."""
        if not self.stt_available:
            return None
        
        if self.on_listening_start:
            try:
                self.on_listening_start()
            except:
                pass
        
        try:
            with sr.Microphone() as source:
                print("[Voice Engine]: Listening... (speak now)")
                
                # Quick adjustment
                self.recognizer.adjust_for_ambient_noise(source, duration=0.3)
                
                try:
                    audio = self.recognizer.listen(
                        source,
                        timeout=timeout,
                        phrase_time_limit=phrase_time_limit
                    )
                except sr.WaitTimeoutError:
                    print("[Voice Engine]: Timeout - no speech")
                    if self.on_listening_stop:
                        self.on_listening_stop()
                    return None
            
            if self.on_listening_stop:
                try:
                    self.on_listening_stop()
                except:
                    pass
            
            # Process
            print("[Voice Engine]: Processing...")
            text = self.recognizer.recognize_google(audio)
            print(f"[User Said]: {text}")
            return text.lower()
            
        except sr.UnknownValueError:
            print("[Voice Engine]: Could not understand")
            if self.on_listening_stop:
                self.on_listening_stop()
            return None
        except sr.RequestError as e:
            print(f"[Voice Engine]: API error - {e}")
            if self.on_listening_stop:
                self.on_listening_stop()
            return None
        except Exception as e:
            print(f"[Voice Engine]: Error - {e}")
            if self.on_listening_stop:
                self.on_listening_stop()
            return None
    
    def stop(self):
        """Stop engine."""
        global stop_listening
        stop_listening = True


# Singleton
_voice_engine: Optional[VoiceEngine] = None

def get_voice_engine() -> VoiceEngine:
    global _voice_engine
    if _voice_engine is None:
        _voice_engine = VoiceEngine()
    return _voice_engine

def speak(text: str):
    get_voice_engine().speak(text)

def speak_async(text: str, callback: Optional[Callable] = None):
    get_voice_engine().speak_async(text, callback)

def listen() -> Optional[str]:
    return get_voice_engine().listen()


if __name__ == "__main__":
    print("=== IGRIS Voice Test ===")
    e = get_voice_engine()
    
    print("\nTesting TTS...")
    e.speak("Hello Master. Testing voice output.")
    
    print("\nTesting STT - speak now (8 seconds)...")
    text = e.listen()
    if text:
        print(f"SUCCESS: {text}")
        e.speak(f"You said: {text}")
    else:
        print("No speech detected")
