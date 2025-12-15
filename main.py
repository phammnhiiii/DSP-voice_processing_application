# main.py - FastAPI Application Entry Point
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config.settings import CORS_ORIGINS
from src.api import router

app = FastAPI(
    title="DSP Audio Processing API",
    description="Advanced voice processing with DSP algorithms",
    version="2.0.0"
)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router)


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "message": "DSP Audio Processing API is running",
        "version": "2.0.0",
        "endpoints": [
            "/process-audio",
            "/tts",
            "/stt",
            "/files/{filename}"
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
