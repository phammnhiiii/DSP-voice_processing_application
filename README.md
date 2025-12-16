# 🎙️ DSP Voice Processing Application

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![Node 18+](https://img.shields.io/badge/node-18+-green.svg)](https://nodejs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)

A modern, full-stack web application for real-time audio processing using advanced **Digital Signal Processing (DSP)** algorithms. Transform voices, filter noise, convert text to speech, and transcribe audio with a beautiful, responsive UI.

[Features](#-features) • [Demo](#-demo) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## ✨ Features

### 🎭 Voice Effects
- **Chipmunk Effect** - High-pitched voice transformation
- **Robot Voice** - Mechanical, synthesized sound
- **Echo Effect** - Configurable delay and repetition
- **Electronic Voice** - Futuristic, processed sound
- **Stutter Effect** - Rhythmic repetition patterns
- **Voice Processing** - Noise reduction & echo removal

### 🔊 Audio Processing
- **Noise Filtering** - Remove background noise using spectral subtraction
- **Echo Removal** - Clean reverb and echo artifacts
- **Waveform Visualization** - Real-time audio visualization
- **Multi-format Support** - WAV, MP3, FLAC, OGG, and more

### 🗣️ Speech Technologies
- **Text-to-Speech (TTS)** - Convert text to natural-sounding audio
  - Multi-language support (8+ languages)
  - Configurable voice parameters
- **Speech-to-Text (STT)** - Accurate audio transcription
  - Real-time processing
  - Multiple language recognition

### 🌐 Supported Languages
Vietnamese • English • Japanese • Korean • Chinese • French • German • Spanish

---

## 🎥 Demo

**Frontend Interface:**
- Modern, responsive UI with dark mode support
- Real-time audio visualization
- Drag-and-drop file upload
- Live processing feedback

**API Features:**
- RESTful API endpoints
- Interactive API documentation (Swagger UI)
- WebSocket support for streaming
- CORS enabled for cross-origin requests

---

## 📁 Project Structure

```
DSP-voice_processing_application/
│
├── 📱 Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/       # UI components
│   │   │   ├── layout/       # Header, Footer
│   │   │   ├── sections/     # Feature sections
│   │   │   └── ui/           # Reusable UI components (Shadcn)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Route pages
│   │   └── lib/              # Utilities
│   ├── public/               # Static assets
│   └── package.json          # Node dependencies
│
├── 🐍 Backend (FastAPI + Python)
│   ├── src/
│   │   ├── api/              # API routes & endpoints
│   │   │   └── routes.py     # Route definitions
│   │   ├── processing/       # DSP algorithms
│   │   │   ├── effects.py    # Voice effects
│   │   │   ├── filters.py    # Noise filtering
│   │   │   └── speech.py     # TTS/STT logic
│   │   └── utils/            # Helper functions
│   │       ├── audio_io.py   # Audio I/O operations
│   │       ├── translation.py # Language translation
│   │       └── visualization.py # Waveform generation
│   ├── config/
│   │   └── settings.py       # App configuration
│   ├── tests/                # Unit tests
│   └── main.py               # FastAPI app entry point
│
├── 📊 Data (auto-generated, gitignored)
│   ├── raw/                  # Original audio files
│   └── processed/            # Processed outputs
│
├── 📚 Documentation
│   └── docs/
│       └── API.md            # API reference
│
├── 🔧 Configuration
│   ├── .env.example          # Environment template
│   ├── requirements.txt      # Python dependencies
│   └── run.sh                # Quick start script
│
└── README.md                 # This file
```

---

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:

- **Python 3.9+** ([Download](https://www.python.org/downloads/))
- **Node.js 18+** ([Download](https://nodejs.org/))
- **ffmpeg** (Required for audio format conversion)

#### Install ffmpeg

```bash
# macOS (using Homebrew)
brew install ffmpeg

# Ubuntu/Debian
sudo apt update && sudo apt install ffmpeg

# Windows (using Chocolatey)
choco install ffmpeg

# Verify installation
ffmpeg -version
```

### Installation

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/DSP-voice_processing_application.git
cd DSP-voice_processing_application
```

#### 2️⃣ Backend Setup

```bash
# Navigate to backend folder
cd backend

# Create and activate virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate        # macOS/Linux
# OR
venv\Scripts\activate           # Windows

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Setup environment file
cp .env.example .env
# Edit .env and add your ElevenLabs API key (optional, for AI voice)

# Go back to root
cd ..
```

#### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
cd ..
```

#### 4️⃣ Run the Application

```bash
# Run both backend and frontend
./run.sh

# Or run separately:
./run.sh backend    # Only backend (http://localhost:8000)
./run.sh frontend   # Only frontend (http://localhost:5173)
```

#### 5️⃣ Environment Configuration (Optional)

Edit `backend/.env` to add your ElevenLabs API key for AI voice:

```bash
ELEVENLABS_API_KEY=your_api_key_here
```

Get your API key at: https://elevenlabs.io/
# Edit .env with your configuration (optional)
# nano .env
```

### Running the Application

#### Option 1: One-Command Start (Recommended)

```bash
# Make run script executable (first time only)
chmod +x run.sh

# Start both backend and frontend
./run.sh
```

#### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
source venv/bin/activate
python main.py
# OR
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 🌐 Access the Application

- **Frontend UI**: [http://localhost:5173](http://localhost:5173)
- **API Backend**: [http://localhost:8000](http://localhost:8000)
- **API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI)
- **Alternative API Docs**: [http://localhost:8000/redoc](http://localhost:8000/redoc) (ReDoc)

---

## 🛠️ Technology Stack

### Backend Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| **FastAPI** | Web framework | 0.100+ |
| **Librosa** | Audio analysis & DSP | 0.10+ |
| **NumPy** | Numerical computing | 1.24+ |
| **SciPy** | Scientific computing & signal processing | 1.11+ |
| **pydub** | Audio manipulation | 0.25+ |
| **gTTS** | Google Text-to-Speech | 2.4+ |
| **SpeechRecognition** | Speech-to-text | 3.10+ |
| **deep-translator** | Language translation | 1.11+ |
| **Uvicorn** | ASGI server | 0.22+ |

### Frontend Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI framework | 18+ |
| **TypeScript** | Type-safe JavaScript | 5+ |
| **Vite** | Build tool & dev server | 5+ |
| **Tailwind CSS** | Utility-first CSS | 3+ |
| **Shadcn/ui** | Component library | Latest |
| **Framer Motion** | Animation library | 11+ |
| **React Hook Form** | Form handling | 7+ |
| **Axios** | HTTP client | 1.6+ |

---

## 📝 API Documentation

### Core Endpoints

| Endpoint | Method | Description | Rate Limit |
|----------|--------|-------------|------------|
| `/` | GET | Health check & API info | - |
| `/process-audio` | POST | Apply DSP effects to audio | 100/min |
| `/tts` | POST | Text-to-speech conversion | 50/min |
| `/stt` | POST | Speech-to-text transcription | 50/min |
| `/files/{filename}` | GET | Retrieve processed files | 200/min |

### Example API Usage

#### 1. Process Audio with Voice Effect

```bash
curl -X POST "http://localhost:8000/process-audio" \
  -F "file=@input.wav" \
  -F "effect=chipmunk"
```

**Response:**
```json
{
  "audio_url": "/files/output_abc123.wav",
  "waveform_url": "/files/waveform_abc123.png"
}
```

#### 2. Text-to-Speech

```bash
curl -X POST "http://localhost:8000/tts" \
  -F "text=Hello, world!" \
  -F "lang=en"
```

**Response:**
```json
{
  "audio_url": "/files/tts_xyz789.mp3"
}
```

#### 3. Speech-to-Text

```bash
curl -X POST "http://localhost:8000/stt" \
  -F "file=@speech.wav" \
  -F "language=en-US"
```

**Response:**
```json
{
  "text": "Hello, world!"
}
```

For detailed API documentation, see [docs/API.md](docs/API.md) or visit `/docs` endpoint.

---

## 🧪 Testing

### Run Unit Tests

```bash
# Activate virtual environment
source venv/bin/activate

# Run all tests
pytest

# Run with coverage
pytest --cov=src tests/

# Run specific test file
pytest tests/test_effects.py -v
```

### Frontend Tests

```bash
cd frontend
npm run test
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# API Configuration
API_HOST=0.0.0.0
API_PORT=8000

# Storage
TEMP_DIR=data/processed

# CORS Origins (comma-separated)
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Optional: API Keys for advanced features
# ELEVENLABS_API_KEY=your_api_key_here
```

### Application Settings

Edit `config/settings.py` for advanced configuration:
- Supported languages
- File upload limits
- Processing timeout
- Storage paths

---

## 🐛 Troubleshooting

### Common Issues

#### ❌ "Cannot convert audio" error
**Solution:**
```bash
# Verify ffmpeg installation
ffmpeg -version

# Reinstall if needed (macOS)
brew reinstall ffmpeg

# Check PATH environment variable
echo $PATH
```

#### ❌ Backend not starting
**Solutions:**
```bash
# 1. Check Python version
python3 --version  # Must be 3.9+

# 2. Verify virtual environment activation
which python  # Should point to venv/bin/python

# 3. Reinstall dependencies
pip install -r requirements.txt --force-reinstall

# 4. Check port availability
lsof -i :8000  # Kill process if port is in use
```

#### ❌ Frontend not starting
**Solutions:**
```bash
# 1. Check Node version
node --version  # Must be 18+

# 2. Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# 3. Try different port
npm run dev -- --port 3000
```

#### ❌ CORS errors
**Solution:** Add your frontend URL to `CORS_ORIGINS` in `config/settings.py`

#### ❌ File upload errors
**Solution:** Check file size limits and ensure `data/processed/` directory exists with write permissions

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow PEP 8 for Python code
- Use ESLint rules for TypeScript/React
- Write unit tests for new features
- Update documentation for API changes
- Use conventional commits

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 DSP Voice Processing

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 Acknowledgments

- **Librosa** team for audio processing capabilities
- **FastAPI** for the excellent web framework
- **Shadcn/ui** for beautiful UI components
- **Google** for Text-to-Speech services
- Open-source community for invaluable tools and libraries

---

## 📧 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/DSP-voice_processing_application/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/DSP-voice_processing_application/discussions)
- **Email**: your.email@example.com

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ by [Your Name/Team]

[Report Bug](https://github.com/yourusername/DSP-voice_processing_application/issues) • [Request Feature](https://github.com/yourusername/DSP-voice_processing_application/issues) • [Documentation](docs/API.md)

</div>