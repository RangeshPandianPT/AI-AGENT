"""
IGRIS AI Engine - AI Response Generation Module
Uses Hugging Face Inference API with Llama 3.2 model.
"""

import os
import datetime
import platform
try:
    import psutil
    PSUTIL_AVAILABLE = True
except ImportError:
    PSUTIL_AVAILABLE = False
    print("[AI Engine]: psutil not installed. System stats will be limited.")

from dotenv import load_dotenv

# Load environment variables
load_dotenv()
load_dotenv("../.env")

# API Configuration
HF_API_KEY = os.getenv("HF_API_KEY")

# Check if API key is configured
if HF_API_KEY:
    print(f"[AI Engine]: Hugging Face API configured")
else:
    print("[AI Engine]: No HF_API_KEY found - please add to .env")

# IGRIS personality and system prompt
IGRIS_SYSTEM_PROMPT = """You are IGRIS, an advanced AI assistant created by Master Rangesh.

Your personality:
- Calm, intelligent, professional
- Speaks in a refined, formal manner  
- Loyal to Master Rangesh
- Responds concisely and helpfully

Rules:
1. Always address the user as "Master Rangesh" or "Master"
2. Your name is IGRIS - Interactive Graphical Real-time Intelligent System
3. You were created by Master Rangesh
4. Keep responses short (2-3 sentences) suitable for voice
5. Never break character"""

# Initialize the Hugging Face client
client = None
if HF_API_KEY:
    try:
        from huggingface_hub import InferenceClient
        client = InferenceClient(
            model="meta-llama/Llama-3.2-3B-Instruct",
            token=HF_API_KEY
        )
        print("[AI Engine]: InferenceClient initialized")
    except Exception as e:
        print(f"[AI Engine]: Error initializing client: {e}")

# Conversation history
conversation_history = []


def get_system_context() -> str:
    """Gather real-time system context to inject into prompt."""
    now = datetime.datetime.now()
    current_time = now.strftime("%I:%M %p")
    current_date = now.strftime("%B %d, %Y")
    
    context = f"Current Time: {current_time}\nCurrent Date: {current_date}\n"
    
    if PSUTIL_AVAILABLE:
        cpu_usage = psutil.cpu_percent()
        mem = psutil.virtual_memory()
        mem_usage = mem.percent
        context += f"System Status: CPU at {cpu_usage}%, Memory at {mem_usage}%\n"
    else:
        context += f"System Status: Running on {platform.system()} {platform.release()}\n"
        
    return context


def get_ai_response(user_input: str) -> str:
    """
    Generate an AI response based on user input.
    
    Args:
        user_input: The user's message/question
        
    Returns:
        str: IGRIS's response
    """
    global conversation_history
    
    if not client:
        return "I apologize, Master. The AI engine is not configured. Please add HF_API_KEY to your .env file."
    
    try:
        # Get real-time system info
        sys_info = get_system_context()
        
        # Build messages with system prompt and history
        dynamic_system_prompt = f"{IGRIS_SYSTEM_PROMPT}\n\nSYSTEM CONTEXT (Use this real data ONLY if asked about time, date, or system status):\n{sys_info}"
        
        messages = [
            {"role": "system", "content": dynamic_system_prompt}
        ]
        
        # Add conversation history (last 6 messages)
        messages.extend(conversation_history[-6:])
        
        # Add current user message
        messages.append({"role": "user", "content": user_input})
        
        # Call the API
        response = client.chat_completion(
            messages=messages,
            max_tokens=150,
            temperature=0.7
        )
        
        # Extract the response text
        assistant_message = response.choices[0].message.content
        
        # Update conversation history
        conversation_history.append({"role": "user", "content": user_input})
        conversation_history.append({"role": "assistant", "content": assistant_message})
        
        return assistant_message
        
    except Exception as e:
        error_msg = f"I apologize, Master. I encountered an issue: {str(e)[:80]}"
        print(f"[AI Engine Error]: {e}")
        return error_msg


def get_greeting() -> str:
    """Generate a greeting message for IGRIS startup."""
    return "Welcome back, Master Rangesh. IGRIS is online and ready to assist you."


def reset_conversation():
    """Reset the conversation history."""
    global conversation_history
    conversation_history = []
    print("[AI Engine]: Conversation history cleared")


# Test the module
if __name__ == "__main__":
    print("Testing IGRIS AI Engine...")
    print(f"HF API Key: {'configured' if HF_API_KEY else 'missing'}")
    print(f"Greeting: {get_greeting()}")
    
    if client:
        print("\nTesting API...")
        response = get_ai_response("Hello IGRIS, who are you?")
        print(f"Response: {response}")
