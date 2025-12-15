# API Documentation

## Base URL

```
http://localhost:8000
```

## Endpoints

### Process Audio

**POST** `/process-audio`

Apply DSP effects to audio file.

**Parameters (form-data):**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| file | File | Yes | Audio file (wav, mp3, etc) |
| effect | string | Yes | Effect name: `chipmunk`, `robot`, `echo`, `electronic`, `stutter`, `process_voice` |
| delay | float | No | Echo delay in seconds (default: 0.2) |
| repeat | int | No | Stutter repeat count (default: 3) |

**Response:**
```json
{
  "audio_url": "/files/output_xxx.wav",
  "waveform_url": "/files/waveform_xxx.png"
}
```

---

### Text to Speech

**POST** `/tts`

Convert text to speech audio.

**Parameters (form-data):**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| text | string | Yes | Text to convert |
| lang | string | No | Language code (default: `vi`) |

**Supported Languages:** vi, en, ja, ko, zh-CN, fr, de, es

**Response:**
```json
{
  "audio_url": "/files/tts_xxx.mp3"
}
```

---

### Speech to Text

**POST** `/stt`

Convert speech audio to text.

**Parameters (form-data):**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| file | File | Yes | Audio file |
| language | string | No | Language code (default: `vi-VN`) |

**Response:**
```json
{
  "text": "Transcribed text..."
}
```

---

### Get File

**GET** `/files/{filename}`

Retrieve processed audio or waveform file.
