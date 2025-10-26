from fastapi import APIRouter, HTTPException
from app.models import TravelPlanRequest, TravelPlanResponse
from app.services.ai_service import generate_travel_plan
import requests
import os

router = APIRouter()

@router.post("/plan", response_model=TravelPlanResponse)
async def create_travel_plan(request: TravelPlanRequest):
    """
    Generate a personalized travel plan using:
    - Ollama (local AI) for reasoning - Free & Offline
    - Tavily (web search) for real local data - Live information
    
    Hybrid approach: Best of both worlds!
    """
    try:
        # Check if Ollama is running
        ollama_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        try:
            response = requests.get(f"{ollama_url}/api/tags", timeout=2)
            if response.status_code != 200:
                raise HTTPException(
                    status_code=503,
                    detail="Ollama is not running. Please start Ollama: 'ollama serve'"
                )
        except requests.exceptions.RequestException:
            raise HTTPException(
                status_code=503,
                detail="Cannot connect to Ollama. Please ensure Ollama is installed and running. Visit: https://ollama.com/"
            )
        
        # Generate travel plan using hybrid approach
        response_text = await generate_travel_plan(
            query=request.query,
            booking_id=request.booking_id,
            preferences=request.preferences
        )
        
        return TravelPlanResponse(
            response=response_text,
            day_plans=None,
            activities=None,
            restaurants=None,
            packing_checklist=None
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error generating travel plan: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/test")
async def test_endpoint():
    """Test endpoint to verify AI service is running"""
    ollama_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    ollama_running = False
    
    try:
        response = requests.get(f"{ollama_url}/api/tags", timeout=2)
        ollama_running = response.status_code == 200
    except:
        pass
    
    # Check Tavily
    tavily_configured = False
    tavily_key = os.getenv("TAVILY_API_KEY")
    if tavily_key and tavily_key != "your_tavily_api_key_here":
        tavily_configured = True
    
    return {
        "status": "AI service is running",
        "mode": "Hybrid (Ollama + Tavily)",
        "ai_model": {
            "type": "Ollama (Local/Offline)",
            "running": ollama_running,
            "model": os.getenv("OLLAMA_MODEL", "llama2"),
            "url": ollama_url
        },
        "web_search": {
            "type": "Tavily",
            "configured": tavily_configured,
            "status": "Provides live local data (POIs, weather, events)"
        },
        "benefits": [
            "Free AI reasoning (Ollama)",
            "Real-time local data (Tavily)",
            "Best of both worlds!"
        ]
    }

# Export router
ai_router = router
