# DSP Voice Processing Application

A modern web application for audio processing with DSP (Digital Signal Processing) algorithms.

## 🎯 Features

- **Voice Effects**: Chipmunk, Robot, Echo, Electronic, Stutter
- **Voice Processing**: Noise reduction, echo removal
- **Text-to-Speech (TTS)**: Convert text to audio
- **Speech-to-Text (STT)**: Transcribe audio to text

## 📁 Project Structure

```
DSP-voice_processing_application/
├── config/                 # Configuration files
│   └── settings.py
├── data/                   # Data files (auto-created, gitignored)
│   ├── raw/
│   └── processed/
├── docs/                   # Documentation
│   └── API.md
├── src/                    # Backend source code
│   ├── api/               # FastAPI routes
│   ├── processing/        # DSP algorithms
│   └── utils/             # Utility functions
├── tests/                  # Unit tests
├── frontend/              # React+TypeScript frontend
├── main.py                # FastAPI entry point
├── requirements.txt       # Python dependencies
└── run.sh                 # Start script
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.9+**
- **Node.js 18+**
- **ffmpeg** (required for audio processing)

```bash
# Install ffmpeg (macOS)
brew install ffmpeg

# Install ffmpeg (Ubuntu/Debian)
sudo apt install ffmpeg
```

### 1. Clone & Setup Backend

```bash
# Clone repository
git clone <your-repo-url>
cd DSP-voice_processing_application

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate   # Windows

# Install Python dependencies
pip install -r requirements.txt
```

### 2. Setup Frontend

```bash
cd frontend
npm install
cd ..
```

### 3. Run Application

```bash
# Option 1: Run both backend & frontend
./run.sh

# Option 2: Run separately
# Terminal 1 - Backend
source venv/bin/activate
uvicorn main:app --reload --port 8000

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### 4. Open Browser

- **Frontend**: http://localhost:5173
- **API Docs**: http://localhost:8000/docs

## 🛠️ Tech Stack

**Backend:**
- FastAPI
- Librosa (audio processing)
- SciPy (signal processing)
- pydub + ffmpeg (audio conversion)
- gTTS (text-to-speech)
- SpeechRecognition (speech-to-text)

**Frontend:**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Shadcn/ui
- Framer Motion

## 📝 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/process-audio` | POST | Apply audio effects |
| `/tts` | POST | Text to speech |
| `/stt` | POST | Speech to text |
| `/files/{filename}` | GET | Get processed file |

See [docs/API.md](docs/API.md) for detailed API documentation.

## 🔧 Troubleshooting

### "Cannot convert audio" error
- Make sure `ffmpeg` is installed: `ffmpeg -version`

### Backend not starting
- Check Python version: `python3 --version` (need 3.9+)
- Ensure venv is activated: `source venv/bin/activate`

### Frontend not starting
- Check Node version: `node --version` (need 18+)
- Clear node_modules: `rm -rf node_modules && npm install`

## 📄 License

MIT License