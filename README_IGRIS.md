# 🖤 IGRIS - Interactive Graphical Real-time Intelligent System

A stunning 3D animated AI assistant interface with Python backend and real-time voice interaction.

![IGRIS Interface](frontend/screenshot.png)

---

## ✨ Features

- 🎤 **Voice Interaction** - Speak to IGRIS and get voice responses
- 🌐 **3D Animated HUD** - Beautiful Three.js interface with rotating rings and particle effects
- 🧠 **AI-Powered** - Uses Google Gemini or OpenAI for intelligent responses
- ⚡ **Real-time** - WebSocket communication for instant state updates
- 🎯 **Wake Word** - Say "Hey IGRIS" to activate
- 🌙 **Dark Sci-Fi Theme** - Neon cyan and violet accents

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

> **Note**: On Windows, you may need to install PyAudio separately:
> ```bash
> pip install pipwin
> pipwin install pyaudio
> ```

### 2. Configure API Keys

The project uses your existing `.env` file in the root directory. Make sure you have:

```env
GOOGLE_API_KEY=your_gemini_api_key_here
```

Or for OpenAI:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Run the Backend

```bash
cd backend
python main.py
```

The server will start at `http://localhost:5000`

### 4. Open the Frontend

Open `frontend/index.html` in your browser, or navigate to `http://localhost:5000`

---

## 🎮 Usage

| Action | How |
|--------|-----|
| Start listening | Click **ACTIVATE** button or press **Space** |
| Talk to IGRIS | Say "Hey IGRIS" followed by your command |
| Type instead | Use the text input at the bottom |
| Stop listening | Press **Escape** or click button again |
| Reset chat | Click **RESET** button |

---

## 📁 Project Structure

```
AI-AGENT-main/
├── backend/
│   ├── main.py          # Flask + SocketIO server
│   ├── ai_engine.py     # Gemini/OpenAI AI responses
│   ├── voice.py         # Speech recognition & TTS
│   └── requirements.txt # Python dependencies
├── frontend/
│   ├── index.html       # Main interface
│   ├── style.css        # Dark sci-fi styling
│   └── script.js        # Three.js 3D graphics
├── agent.py             # Original LiveKit agent
└── .env                 # API keys
```

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| Microphone not working | Check browser permissions and select correct input device |
| No voice output | Ensure speakers are on and pyttsx3 is installed |
| Connection error | Make sure backend server is running on port 5000 |
| API errors | Verify your API key in `.env` is valid |

---

## 🎨 Customization

### Change IGRIS's Voice
Edit `backend/voice.py` line 49 to select a different voice.

### Modify AI Personality
Edit the `IGRIS_SYSTEM_PROMPT` in `backend/ai_engine.py`.

### Adjust 3D Animation
Modify `COLORS` and `animParams` in `frontend/script.js`.

---

Created by **Master Rangesh** 🚀
