import os
from langchain_community.llms import Ollama
from langchain.prompts import PromptTemplate
from tavily import TavilyClient
from dotenv import load_dotenv
from app.services.database import get_booking_details
import json

load_dotenv()

# Initialize Ollama (Local offline AI model - Free!)
llm = Ollama(
    model=os.getenv("OLLAMA_MODEL", "llama2"),
    base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
    temperature=0.7
)

# Initialize Tavily for web search (Real local data)
tavily_client = None
tavily_api_key = os.getenv("TAVILY_API_KEY")
if tavily_api_key and tavily_api_key != "your_tavily_api_key_here":
    try:
        tavily_client = TavilyClient(api_key=tavily_api_key)
        print("✅ Tavily initialized for web search")
    except Exception as e:
        print(f"⚠️ Tavily initialization failed: {e}")
else:
    print("⚠️ Tavily API key not configured - will work without live data")

async def generate_travel_plan(query: str, booking_id: int = None, preferences: dict = None):
    """
    Generate travel plan using:
    - Ollama (local AI) for reasoning
    - Tavily (web search) for real local data
    
    Hybrid approach: Best of both worlds!
    """
    
    # Fetch booking details if provided
    booking_context = ""
    location = None
    
    if booking_id:
        booking = get_booking_details(booking_id)
        if booking:
            location = f"{booking['city']}, {booking['country']}"
            booking_context = f"""
Your upcoming trip:
- Destination: {booking['city']}, {booking['country']}
- Check-in: {booking['start_date']}
- Check-out: {booking['end_date']}
- Guests: {booking['num_guests']}
"""
    else:
        # Try to extract location from query
        if "in" in query.lower():
            parts = query.lower().split("in")
            if len(parts) > 1:
                location = parts[-1].strip()
        
        if not location:
            location = "the destination"
    
    # Get live local information using Tavily web search
    search_results = ""
    if tavily_client and location != "the destination":
        try:
            print(f"🔍 Searching web for: {location}")
            
            # Search for different aspects
            searches = [
                f"top attractions and things to do in {location}",
                f"best restaurants in {location}",
                f"current weather forecast {location}",
                f"upcoming events in {location}"
            ]
            
            all_results = []
            for search_query in searches[:3]:  # Limit to 3 searches
                try:
                    results = tavily_client.search(query=search_query, max_results=3)
                    if results and 'results' in results:
                        all_results.append({
                            'query': search_query,
                            'results': results['results']
                        })
                except Exception as e:
                    print(f"Tavily search error: {e}")
                    continue
            
            # Format search results for the AI
            if all_results:
                search_results = "\n\nLive Local Information (from web):\n"
                for search_data in all_results:
                    search_results += f"\n{search_data['query']}:\n"
                    for item in search_data['results'][:2]:
                        title = item.get('title', '')
                        content = item.get('content', '')[:200]  # Limit length
                        search_results += f"• {title}: {content}...\n"
                
                print(f"✅ Got live data for {location}")
            else:
                search_results = "\n\nNote: Limited live data available.\n"
                
        except Exception as e:
            print(f"Error fetching live data: {e}")
            search_results = "\n\nNote: Working with general knowledge.\n"
    else:
        if not tavily_client:
            search_results = "\n\nNote: Web search not available (Tavily not configured).\n"
        else:
            search_results = "\n\nNote: Using general travel knowledge.\n"
    
    # Prepare preferences context
    preferences_context = ""
    if preferences:
        prefs_list = []
        if preferences.get('budget'):
            prefs_list.append(f"Budget: {preferences['budget']}")
        if preferences.get('dietary'):
            prefs_list.append(f"Dietary needs: {', '.join(preferences['dietary'])}")
        if preferences.get('interests'):
            prefs_list.append(f"Interests: {', '.join(preferences['interests'])}")
        if preferences.get('mobility'):
            prefs_list.append(f"Mobility: {preferences['mobility']}")
        if preferences.get('with_children'):
            prefs_list.append("Traveling with children")
        
        if prefs_list:
            preferences_context = "\n\nUser Preferences:\n" + "\n".join(prefs_list)
    
    # Create prompt for the local AI
    prompt_template = """You are a helpful travel assistant for Airbnb. Help travelers plan their trips with practical recommendations.

{booking_context}{preferences_context}{search_results}

Traveler's Question: {query}

Based on the information above, provide helpful travel recommendations for {location}.

Include:
1. Activities and attractions to visit
2. Restaurant recommendations (consider dietary needs if mentioned)
3. Practical tips (transportation, weather, packing)
4. Local insights

Keep your response friendly, practical, and well-organized. Use the live local information when available.

Response:"""
    
    prompt = PromptTemplate(
        input_variables=["booking_context", "preferences_context", "search_results", "query", "location"],
        template=prompt_template
    )
    
    # Generate response using local Ollama AI
    try:
        formatted_prompt = prompt.format(
            booking_context=booking_context,
            preferences_context=preferences_context,
            search_results=search_results,
            query=query,
            location=location
        )
        
        print("🤖 Generating response with Ollama...")
        response = llm.invoke(formatted_prompt)
        print("✅ Response generated")
        return response
        
    except Exception as e:
        print(f"Error generating response: {e}")
        # Fallback response
        return f"""I'd be happy to help you plan your trip to {location}!

Here are some general travel tips:

**Activities & Attractions:**
- Explore popular tourist spots and local landmarks
- Check out museums and cultural sites
- Look for outdoor activities and parks
- Consider guided tours for unique experiences

**Dining:**
- Try local cuisine and specialties
- Check restaurant reviews online
- Ask locals for recommendations
- Consider dietary restrictions when choosing restaurants

**Practical Tips:**
- Research transportation options (public transit, car rental)
- Check weather forecast and pack accordingly
- Keep important documents secure
- Learn a few local phrases
- Download offline maps

**Packing Essentials:**
- Comfortable walking shoes
- Weather-appropriate clothing
- Phone charger and adapters
- Basic medications
- Travel documents

Feel free to ask me more specific questions about your trip!"""

async def get_packing_checklist(location: str, weather_info: str = None):
    """Generate packing checklist (can use Tavily for weather)"""
    
    weather = weather_info
    if not weather and tavily_client and location:
        try:
            results = tavily_client.search(query=f"weather forecast {location}", max_results=1)
            if results and 'results' in results and len(results['results']) > 0:
                weather = results['results'][0].get('content', '')[:100]
        except:
            pass
    
    basic_items = [
        "Passport/ID and travel documents",
        "Comfortable walking shoes",
        "Weather-appropriate clothing",
        "Toiletries and personal care items",
        "Phone charger and adapters",
        "Medications (if needed)",
        "Sunscreen and sunglasses",
        "Reusable water bottle",
        "Camera or phone for photos",
        "Light jacket or sweater"
    ]
    
    if weather:
        basic_items.insert(3, f"Note: {weather}")
    
    return basic_items

async def get_restaurant_recommendations(location: str, dietary_filters: list = None):
    """Get restaurant recommendations using Tavily + AI"""
    
    dietary_str = ", ".join(dietary_filters) if dietary_filters else "all cuisines"
    
    # Try to get real data from Tavily
    search_info = ""
    if tavily_client and location:
        try:
            query = f"best restaurants in {location}"
            if dietary_filters:
                query += f" for {dietary_str}"
            
            results = tavily_client.search(query=query, max_results=5)
            if results and 'results' in results:
                search_info = "\n\nRecent recommendations from web:\n"
                for item in results['results'][:3]:
                    search_info += f"• {item.get('title', '')}\n"
        except:
            pass
    
    prompt = f"""Suggest 5 good restaurants in {location} with options for {dietary_str}.
{search_info}
Format as a simple list with brief descriptions."""
    
    try:
        response = llm.invoke(prompt)
        return response
    except:
        return f"""Popular dining options in {location}:

1. Local cuisine restaurants - Try authentic regional dishes
2. International options - Various global cuisines available
3. Casual cafes - Perfect for quick meals and coffee
4. Fine dining - For special occasions
5. Street food - Experience local flavors

{search_info if search_info else 'Check online reviews for current recommendations and consider dietary needs: ' + dietary_str}"""
