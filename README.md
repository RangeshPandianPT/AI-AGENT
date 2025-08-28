Perfect 👌 Let’s draft a **README.md** for your **Igris AI Agent** so anyone (including you later) can quickly understand how to set it up and run.

Here’s a clean, professional version:

---

# 🖤 Igris AI Agent

An AI-powered real-time assistant built with **LiveKit Agents** and **Google Gemini Realtime API**.
Igris can process text & audio in real-time and respond with natural speech.

---

## 🚀 Features

* 🎤 Real-time audio & text interaction
* ⚡ Powered by **Gemini 2.0 Flash Experimental** model
* 🗣️ Voice synthesis (Puck voice by default)
* 🔑 Secure API key management
* 🛠️ Runs inside a virtual environment for clean setup

---

## 📦 Installation

### 1. Clone the repo

```bash
git clone https://github.com/your-username/Igris.git
cd Igris
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

### 3. Activate it

**Windows (PowerShell):**

```powershell
.\venv\Scripts\Activate.ps1
```

**Linux / macOS:**

```bash
source venv/bin/activate
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

---

## 🔑 API Key Setup

This agent requires a **Google Gemini API key**.

### Option 1: Temporary (PowerShell)

```powershell
$env:GOOGLE_API_KEY="YOUR_API_KEY_HERE"
```

### Option 2: Permanent with `.env` (recommended)

1. Install dotenv:

   ```bash
   pip install python-dotenv
   ```
2. Create a `.env` file in the project root:

   ```
   GOOGLE_API_KEY=YOUR_API_KEY_HERE
   ```
3. The agent automatically loads `.env`.

---

## ▶️ Running the Agent

### Console Mode

```bash
python agent.py console
```

Controls:

* **\[Ctrl+B]** → Toggle between Text/Audio mode
* **\[Q]** → Quit session

### Development Mode

```bash
uv run agent.py dev
```

---

## 🛠️ Project Structure

```
Igris/
├── agent.py          # Main entrypoint
├── requirements.txt  # Python dependencies
├── .env              # API key (not committed to GitHub)
└── README.md         # This file
```

---

## ⚠️ Troubleshooting

* **Error: "API key is required"** → Ensure you set `GOOGLE_API_KEY` in your environment or `.env`
* **Dependencies not found** → Run `pip install -r requirements.txt` again
* **PowerShell script execution blocked** → Run:

  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

---



👉 Do you want me to also add a **section with a demo usage example** (like what a sample conversation looks like in console) to make the README feel more complete?
