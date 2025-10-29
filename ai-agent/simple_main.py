from typing import Optional
import os
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import uvicorn

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="AI Travel Assistant", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# OpenAI Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
OPENAI_TEMPERATURE = float(os.getenv("OPENAI_TEMPERATURE", "0.3"))
OPENAI_MAX_TOKENS = int(os.getenv("OPENAI_MAX_TOKENS", "2000"))

# Tavily Configuration
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
TAVILY_BASE_URL = "https://api.tavily.com"

# Backend Configuration
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5001")
INTERNAL_API_KEY = os.getenv("INTERNAL_API_KEY", "airbnb_internal_key_2024")

# Debug: Print the API key being used
print(f"🔑 Internal API Key: {INTERNAL_API_KEY}")

# Initialize services
USE_OPENAI = bool(OPENAI_API_KEY)
USE_TAVILY = bool(TAVILY_API_KEY)

if USE_OPENAI:
    print(f"✅ OpenAI initialized ({OPENAI_MODEL}) - using requests")
else:
    print("⚠️ OpenAI API key not set. Using rule-based responses only.")

if USE_TAVILY:
    print("✅ Tavily initialized (web search enabled)")
else:
    print("⚠️ Tavily API key not set. Web search disabled.")

# Request/Response Models
class AIRequest(BaseModel):
    query: str
    userId: Optional[str] = None  # Make userId optional
    
    class Config:
        # Allow extra fields to be ignored
        extra = "ignore"

class AIResponse(BaseModel):
    response: str

def fetch_user_bookings(user_id: str = None):
    """Dynamically fetch user bookings from backend database"""
    bookings = []
    if not user_id:
        return bookings  # Return empty list if no user ID
    
    try:
        headers = {
            "x-internal-api-key": INTERNAL_API_KEY
        }
        print(f"🔑 Using API key: {INTERNAL_API_KEY[:10]}...")
        print(f"🌐 Requesting: {BACKEND_URL}/api/bookings/internal/traveler?userId={user_id}")
        backend_response = requests.get(
            f"{BACKEND_URL}/api/bookings/internal/traveler",
            params={"userId": user_id},
            headers=headers,
            timeout=5
        )
        
        if backend_response.status_code == 200:
            bookings = backend_response.json()
            print(f"📅 Fetched {len(bookings)} bookings for user {user_id}")
        else:
            print(f"⚠️ Could not fetch bookings: HTTP {backend_response.status_code}")
    except Exception as e:
        print(f"⚠️ Could not fetch bookings: {e}")
    
    return bookings

def search_tavily(query: str):
    """Use Tavily for web search as required in homework"""
    web_data = ""
    try:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {TAVILY_API_KEY}"
        }
        
        data = {
            "query": query,
            "max_results": 5
        }
        
        response = requests.post(
            f"{TAVILY_BASE_URL}/search",
            headers=headers,
            json=data,
            timeout=10
        )
        
        if response.status_code == 200:
            results = response.json()
            if results and results.get('results'):
                web_data = "\n\nLive web information:\n"
                for r in results['results']:
                    web_data += f"- {r.get('title', '')}: {r.get('content', '')[:200]}...\n"
            print(f"🔍 Tavily search completed for: {query[:60]}")
        else:
            print(f"⚠️ Tavily search error: {response.status_code}")
    except Exception as e:
        print(f"⚠️ Tavily search error: {e}")
    
    return web_data

def call_openai(prompt: str):
    """Call OpenAI API using requests directly"""
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "model": OPENAI_MODEL,
        "messages": [
            {"role": "system", "content": "You are an intelligent AI travel assistant for an Airbnb-like platform."},
            {"role": "user", "content": prompt}
        ],
        "temperature": OPENAI_TEMPERATURE,
        "max_tokens": OPENAI_MAX_TOKENS
    }

    response = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers=headers,
        json=data,
        timeout=30
    )

    if response.status_code == 200:
        result = response.json()
        return result["choices"][0]["message"]["content"]
    elif response.status_code == 429:
        error_data = response.json()
        if "quota" in error_data.get("error", {}).get("message", "").lower():
            return (
                "I'm currently experiencing high demand and my quota has been exceeded. "
                "Please try again later, or contact support if this persists."
            )
        else:
            raise Exception(f"OpenAI API rate limit: {response.text}")
    else:
        raise Exception(f"OpenAI API error: {response.status_code} - {response.text}")

@app.post("/api/ai/plan", response_model=AIResponse)
async def ai_plan(request: AIRequest):
    """Main AI endpoint - fully dynamic without hardcoded rules"""
    
    # Debug: Print the received request
    print(f"🔍 Received request: query='{request.query}', userId='{request.userId}'")
    
    # Dynamically fetch user bookings from database
    bookings = fetch_user_bookings(request.userId)

    print(f"Bookings: {bookings}")
    
    # Use OpenAI for intelligent query analysis and response generation
    if USE_OPENAI:
        try:
            # Prepare context with user's bookings
            context = ""
            if bookings:
                context = f"User has {len(bookings)} booking(s). "
                for i, booking in enumerate(bookings):  
                    location = booking.get('location') or booking.get('city', 'destination')
                    status = booking.get('status', 'unknown')
                    start_date = booking.get('start_date', '')[:10] if booking.get('start_date') else 'N/A'
                    end_date = booking.get('end_date', '')[:10] if booking.get('end_date') else 'N/A'
                    context += f"Booking {i+1}: {location} ({start_date} to {end_date}) - Status: {status}. "
            
            # Use Tavily for web search (as required in homework)
            web_data = ""
            if USE_TAVILY:
                # Smart search query generation
                search_query = request.query
                
                # Enhance search for travel-related queries
                if any(word in request.query.lower() for word in ["weather", "forecast", "temperature"]):
                    if bookings:
                        upcoming_trip = bookings[0]
                        location = upcoming_trip.get('location') or upcoming_trip.get('city', '')
                        start_date = upcoming_trip.get('start_date', '')[:10] if upcoming_trip.get('start_date') else ''
                        if location and start_date:
                            search_query = f"weather forecast {location} {start_date}"
                
                web_data = search_tavily(search_query)
            
            # Create intelligent prompt for OpenAI
            prompt = f"""You are an intelligent AI travel assistant for an Airbnb-like platform.

{context}

User query: {request.query}
{web_data}

Instructions:
1. If the user is asking about their trips/bookings, provide specific information using the booking data above
2. If the user is asking for travel planning/recommendations, provide detailed day-by-day plans with:
   - Morning/afternoon/evening activities
   - Specific locations with addresses
   - Duration estimates
   - Restaurant recommendations
   - Packing checklists (weather-aware if weather data provided)
3. Use the live web information above to enhance your responses
4. Be helpful, specific, and practical

Respond with a comprehensive, helpful answer."""

            # Call OpenAI API
            ai_response = call_openai(prompt)
            print("prompt: ", prompt)
            print(f"🤖 OpenAI ({OPENAI_MODEL}) response: {ai_response}...")
            
            # Limit response length for chat
            if len(ai_response) > 2000:
                ai_response = ai_response[:1997] + "..."
            
            return {"response": ai_response.strip()}

        except Exception as e:
            print(f"⚠️ OpenAI error: {e}. Falling back to basic response.")
            return {
                "response": (
                    "Sorry, I'm having trouble with my AI brain right now. "
                    "But I can still help! Try asking about:\n"
                    "• Your trips and bookings\n"
                    "• Travel planning and recommendations\n"
                    "• Weather information\n"
                    "• Or just say hi! 👋"
                )
            }
    
    # Fallback for when OpenAI is not available
    return {
        "response": (
            "I'm currently unable to process your request. "
            "Please make sure OpenAI API is properly configured. "
            "You can still browse properties and make bookings!"
        )
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "openai_configured": USE_OPENAI,
        "tavily_configured": USE_TAVILY,
        "model": OPENAI_MODEL if USE_OPENAI else "none"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
