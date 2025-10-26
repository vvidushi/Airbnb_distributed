from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import ai_router
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Airbnb AI Travel Assistant",
    description="AI-powered travel planning and recommendations",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(ai_router, prefix="/api/ai", tags=["AI Assistant"])

@app.get("/")
async def root():
    return {
        "message": "Airbnb AI Travel Assistant API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=os.getenv("API_HOST", "0.0.0.0"),
        port=int(os.getenv("API_PORT", 8000)),
        reload=True
    )

