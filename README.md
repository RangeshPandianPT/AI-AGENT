# 🖤 Igris – AI Agent.

Igris is a custom AI agent inspired by Jarvis, designed to act as a **personal assistant** for Rangesh Pandian PT.
It provides **clear, structured, and natural conversations** — useful for coding, projects, and general queries.

---

## 🚀 Features

* 🧠 **Smart Conversations** – Understands and answers naturally..
* 👨‍💻 **Technical Help** – Explains coding and project concepts step by step.
* 📚 **Knowledgeable** – Supports learning with tips and examples.
* 🎙️ **Voice-Ready** – Can be extended with TTS/STT for full voice interaction.
* 🤝 **Friendly Personality** – Not robotic; speaks like a mentor/companion.

---

## ⚙️ Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/igris.git
   cd igris
   ```

2. **Create and activate a virtual environment**

   ```bash
   python -m venv venv
   source venv/bin/activate   # Linux/Mac
   venv\Scripts\activate      # Windows
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirments.txt
   ```

4. **Set your API key (OpenAI/Google AI/etc.)**

   ```bash
   export OPENAI_API_KEY="your_api_key_here"   # Linux/Mac
   setx OPENAI_API_KEY "your_api_key_here"     # Windows
   ```

---

## ▶️ Running Igris

To start Igris from the console:

```bash
uv run agent.py console
```

or (if not using `uv`):

```bash
python agent.py console

```

---

## 🧑‍💻 How to Use

Once running, interact directly via console:

**Example**

```
You: Igris, explain Python loops
Igris: Sure! A loop in Python is a way to repeat code multiple times...
```

---

## 📌 Roadmap

* [ ] Add memory for long-term context.
* [ ] Build a web dashboard for interaction.
* [ ] Add TTS/STT for voice mode.
* [ ] Mobile/Desktop app deployment.

---

## 🖤 Credits

Developed by **Rangesh Pandian PT**.
Igris is your personal AI assistant — **clear, supportive, and always ready to assist**.

---
