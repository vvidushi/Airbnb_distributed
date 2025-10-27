from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Airbnb AI Agent", version="1.0.0")

# Tavily setup (for web search - live local context)
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
USE_TAVILY = bool(TAVILY_API_KEY)

if USE_TAVILY:
    try:
        from tavily import TavilyClient
        tavily_client = TavilyClient(api_key=TAVILY_API_KEY)
        print("✅ Tavily initialized (web search enabled)")
    except Exception as e:
        print(f"⚠️ Tavily not available: {e}")
        USE_TAVILY = False
        tavily_client = None
else:
    tavily_client = None
    print("ℹ️ Tavily API key not set. Using basic recommendations only.")

# Ollama setup (check if running)
def is_ollama_running():
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=1)
        return response.status_code == 200
    except:
        return False

USE_OLLAMA = is_ollama_running()

if USE_OLLAMA:
    try:
        from langchain_ollama import OllamaLLM
        llm = OllamaLLM(
            model="llama2",
            base_url="http://localhost:11434",
            temperature=0.7
        )
        print("✅ Ollama initialized (llama2)")
    except Exception as e:
        print(f"⚠️ Ollama error: {e}. Using rule-based responses only.")
        USE_OLLAMA = False
        llm = None
else:
    llm = None
    print("ℹ️ Ollama not running. Using rule-based responses only.")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Backend API URL
BACKEND_URL = "http://localhost:5001"
INTERNAL_API_KEY = "airbnb_internal_key_2024"  # Must match backend .env

@app.get("/health")
async def health_check():
    return {"status": "OK", "message": "AI Agent is running"}

@app.post("/api/ai/plan")
async def generate_travel_plan(request: dict):
    """Generate travel assistant responses with booking context"""
    query = request.get("query", "Unknown destination").strip()
    userId = request.get("userId")
    
    # Fetch user's bookings dynamically from backend API
    bookings = []
    
    if userId:
        try:
            # Use internal API with API key authentication
            headers = {"x-internal-api-key": INTERNAL_API_KEY}
            backend_response = requests.get(
                f"{BACKEND_URL}/api/bookings/internal/traveler",
                headers=headers,
                params={"userId": userId},
                timeout=2
            )
            if backend_response.status_code == 200:
                bookings = backend_response.json()
                if bookings and len(bookings) > 0:
                    print(f"📅 Fetched {len(bookings)} bookings for user {userId}")
            else:
                print(f"⚠️ Could not fetch bookings: HTTP {backend_response.status_code}")
        except Exception as e:
            print(f"⚠️ Could not fetch bookings: {e}")
    
    # Simple rule-based responses for reliability
    query_lower = query.lower()
    
    # Handle trip/booking queries with dynamic booking details
    # Skip if it's a travel planning query (e.g., "can you plan trip to bali")
    is_planning_query = "plan" in query_lower and "trip" in query_lower
    is_booking_query = any(word in query_lower for word in ["my trip", "my booking", "my travel", "show my", "existing trip", "existing booking", "how many trip", "how many booking"])
    
    # Only handle as booking if it's truly asking about existing trips/bookings
    if is_booking_query and not is_planning_query:
        if not bookings or len(bookings) == 0:
            return {"response": "You don't have any bookings yet. Browse properties to make a reservation!"}
        
        # Filter by status if requested
        if "cancelled" in query_lower or "cancel" in query_lower:
            filtered = [b for b in bookings if b.get("status") == "cancelled"]
            count = len(filtered)
            if count == 0:
                return {"response": "You don't have any cancelled trips."}
            return {"response": f"You have {count} cancelled trip(s). Check 'My Trips' for details."}
        
        elif "accepted" in query_lower:
            filtered = [b for b in bookings if b.get("status") == "accepted"]
            count = len(filtered)
            if count == 0:
                return {"response": "You don't have any accepted trips yet."}
            if count == 1:
                b = filtered[0]
                location = b.get("location") or b.get("city", "your destination")
                start = b.get("start_date", "")[:10] if b.get("start_date") else "N/A"
                end = b.get("end_date", "")[:10] if b.get("end_date") else "N/A"
                return {"response": f"You have 1 accepted trip to {location} from {start} to {end}!"}
            return {"response": f"You have {count} accepted trip(s). Check 'My Trips' for details."}
        
        elif "pending" in query_lower:
            filtered = [b for b in bookings if b.get("status") == "pending"]
            count = len(filtered)
            if count == 0:
                return {"response": "You don't have any pending trips."}
            return {"response": f"You have {count} pending trip(s). Waiting for owner approval."}
        
        elif "how many" in query_lower:
            # Count all statuses
            accepted = len([b for b in bookings if b.get("status") == "accepted"])
            pending = len([b for b in bookings if b.get("status") == "pending"])
            cancelled = len([b for b in bookings if b.get("status") == "cancelled"])
            
            return {"response": f"You have {len(bookings)} total trips: {accepted} accepted, {pending} pending, {cancelled} cancelled."}
        
        else:
            # Show recent trips
            latest = bookings[0]
            location = latest.get("location") or latest.get("city", "your destination")
            start_date = latest.get("start_date", "")[:10] if latest.get("start_date") else "N/A"
            end_date = latest.get("end_date", "")[:10] if latest.get("end_date") else "N/A"
            
            if len(bookings) == 1:
                return {"response": f"You have 1 trip to {location} from {start_date} to {end_date}. I can help plan activities for your trip!"}
            else:
                return {"response": f"You have {len(bookings)} trips. Your most recent is in {location} from {start_date} to {end_date}. Check 'My Trips' for all details!"}
    
    # Handle greetings (but avoid matching "good weather" as greeting)
    # Only match if it's clearly a greeting phrase
    is_greeting = query_lower in ["hi", "hello", "hey"] or query_lower in ["good morning", "good afternoon"] or query_lower.startswith("hi ") or query_lower.startswith("hello ") or query_lower.startswith("hey ")
    if is_greeting:
        return {"response": "Hi! I'm your AI travel assistant. I can help you with travel planning, recommendations, and activity suggestions!"}
    
    # For general queries (recommendations, travel advice, etc.), use Ollama if available
    # For booking-specific queries, we've already handled above
    
    # Try Ollama (with optional Tavily for live data)
    if USE_OLLAMA and llm:
        try:
            # Prepare context with user's bookings
            context = ""
            if bookings:
                context = f" User has {len(bookings)} upcoming booking(s). Recent trip: {bookings[0].get('city', 'N/A')}"
            
            # Use Tavily for web search if available
            web_data = ""
            if USE_TAVILY and tavily_client:
                try:
                    # Use query as-is for Tavily (don't append location)
                    search_query = query
                    
                    # Search Tavily for live local context
                    results = tavily_client.search(search_query, max_results=3)
                    if results and results.get('results'):
                        web_data = "\n\nLive local information:\n"
                        for r in results['results'][:2]:
                            web_data += f"- {r.get('title', '')}: {r.get('content', '')[:150]}...\n"
                    print(f"🔍 Tavily search completed for: {search_query[:60]}")
                except Exception as e:
                    print(f"⚠️ Tavily search error: {e}")
            
            # Create prompt for Ollama with web data
            # Enhanced for lab requirements: day-by-day plans, activity cards, restaurant recs, packing checklist
            prompt = f"""You are a helpful AI travel assistant for an Airbnb-like platform.
{context}

User query: {query}
{web_data}

Based on the above, provide:
1. A day-by-day plan (morning/afternoon/evening activities)
2. Activity cards (specific places to visit with titles, locations, duration)
3. Restaurant recommendations (if applicable)
4. Packing checklist (weather-aware if weather data provided)

Format as a practical travel guide with specific recommendations."""
            
            # Call Ollama using invoke method
            ai_response = llm.invoke(prompt)
            print(f"🦙 Ollama (llama2) response: {ai_response[:50]}...")
            
            # Limit response length for chat (increased to 1000 characters)
            if len(ai_response) > 1000:
                ai_response = ai_response[:997] + "..."
            
            return {"response": ai_response.strip()}
            
        except Exception as e:
            print(f"⚠️ Ollama error: {e}. Falling back to rule-based response.")
            return {
                "response": (
                    "Sorry, I'm having trouble with my AI brain right now. "
                    "But I can still help! Try asking about:\n"
                    "• Your trips and bookings\n"
                    "• How many cancelled/accepted trips you have\n"
                    "• Or just say hi! 👋"
                )
            }
    
    # Helpful fallback message for unknown queries
    return {
        "response": (
            "Sorry, I didn't understand that. 🤔\n\n"
            "I can help you with:\n"
            "• Checking your trips and bookings\n"
            "• Counting your accepted/pending/cancelled trips\n"
            "• Travel recommendations and advice\n\n"
            "What would you like to ask?"
        )
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
