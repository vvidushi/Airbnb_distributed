from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="Airbnb AI Agent", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "OK", "message": "AI Agent is running"}

@app.post("/api/ai/plan")
async def generate_travel_plan(request: dict):
    """Generate a simple travel plan"""
    query = request.get("query", "Unknown destination").lower().strip()
    
    # Handle greetings and casual conversation
    if any(greeting in query for greeting in ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"]):
        response_text = "Hello! I'm your AI Travel Assistant. How can I help you plan your next adventure? I can help with:\n\n• Travel itineraries for any destination\n• Restaurant and activity recommendations\n• Packing lists and travel tips\n• Day-by-day trip planning\n\nWhat would you like to know?"
    
    elif any(help_word in query for help_word in ["help", "what can you do", "how can you help"]):
        response_text = "I'm here to help you plan amazing trips! Here's what I can do:\n\n🗺️ **Travel Planning**: Create detailed itineraries for any destination\n🍽️ **Food & Activities**: Recommend restaurants, attractions, and experiences\n📋 **Travel Tips**: Provide packing lists, cultural advice, and practical tips\n📅 **Day Planning**: Organize your schedule hour by hour\n\nJust tell me where you're going or what you need help with!"
    
    elif any(thanks_word in query for thanks_word in ["thank", "thanks", "appreciate"]):
        response_text = "You're very welcome! I'm always here to help with your travel planning. Feel free to ask me anything about your upcoming trips or destinations you're curious about! 😊"
    
    # Handle specific destination queries FIRST (more specific)
    elif "paris" in query:
        response_text = "Here's a great 3-day Paris itinerary:\n\nDay 1: Visit the Eiffel Tower, explore Montmartre, and enjoy dinner in a local bistro.\n\nDay 2: Tour the Louvre Museum, walk along the Seine, and visit Notre-Dame.\n\nDay 3: Explore the Latin Quarter, visit Sainte-Chapelle, and shop at local markets.\n\nRecommendations: Try croissants at local bakeries, visit the Musée d'Orsay, and take a Seine river cruise!"
    
    elif "tokyo" in query:
        response_text = "Here's an amazing Tokyo travel plan:\n\nDay 1: Explore Senso-ji Temple in Asakusa, visit Tokyo Skytree, and try street food.\n\nDay 2: Visit Meiji Shrine, explore Harajuku district, and experience Shibuya crossing.\n\nDay 3: Tour the Imperial Palace, visit Tsukiji Fish Market, and enjoy sushi.\n\nRecommendations: Try ramen, visit teamLab Borderless, and experience a traditional tea ceremony!"
    
    elif "london" in query:
        response_text = "Here's a fantastic London itinerary:\n\nDay 1: Visit the Tower of London, walk across Tower Bridge, and explore Borough Market.\n\nDay 2: Tour Westminster Abbey, see Big Ben, and visit the British Museum.\n\nDay 3: Explore Camden Market, visit the London Eye, and enjoy afternoon tea.\n\nRecommendations: Try fish and chips, visit the Tate Modern, and take a Thames river cruise!"
    
    elif "rome" in query:
        response_text = "Here's a wonderful Rome itinerary:\n\nDay 1: Visit the Colosseum, explore the Roman Forum, and walk through Trastevere.\n\nDay 2: Tour the Vatican Museums, see St. Peter's Basilica, and visit the Pantheon.\n\nDay 3: Explore the Spanish Steps, visit the Trevi Fountain, and enjoy authentic Italian cuisine.\n\nRecommendations: Try authentic gelato, visit the Borghese Gallery, and take a food tour!"
    
    elif "barcelona" in query:
        response_text = "Here's an exciting Barcelona itinerary:\n\nDay 1: Visit Sagrada Familia, explore Park Güell, and walk down Las Ramblas.\n\nDay 2: Tour the Gothic Quarter, visit Casa Batlló, and enjoy tapas.\n\nDay 3: Relax at Barceloneta Beach, visit Montjuïc, and experience the nightlife.\n\nRecommendations: Try paella, visit the Picasso Museum, and watch a flamenco show!"
    
    # Handle location/best destination requests
    elif any(loc_word in query for loc_word in ["best location", "best destination", "where to go", "top destination", "popular destination"]):
        response_text = "Here are some of the best travel destinations based on different interests:\n\n🏛️ **Cultural & History**: Rome, Athens, Cairo, Kyoto\n🏖️ **Beaches & Relaxation**: Maldives, Bali, Santorini, Caribbean\n🏔️ **Adventure & Nature**: New Zealand, Iceland, Patagonia, Nepal\n🏙️ **Modern Cities**: Tokyo, Singapore, Dubai, New York\n🍷 **Food & Wine**: Paris, Tuscany, Barcelona, Napa Valley\n\nWhat type of experience are you looking for? I can give more specific recommendations!"
    
    # Handle recommendation requests (more general)
    elif any(rec_word in query for rec_word in ["recommendation", "recommend", "suggest", "suggestion"]):
        if any(dest_word in query for dest_word in ["paris", "tokyo", "london", "rome", "barcelona", "amsterdam", "berlin", "prague", "vienna", "budapest"]):
            # Extract destination and provide specific recommendations
            dest = next((d for d in ["paris", "tokyo", "london", "rome", "barcelona", "amsterdam", "berlin", "prague", "vienna", "budapest"] if d in query), "this destination")
            response_text = f"Here are my top recommendations for {dest.title()}:\n\n🏛️ **Must-See Attractions**: Visit iconic landmarks and cultural sites\n🍽️ **Local Cuisine**: Try authentic restaurants and street food\n🎭 **Cultural Experiences**: Museums, galleries, and local events\n🛍️ **Shopping**: Local markets and unique boutiques\n🚶 **Walking Tours**: Explore neighborhoods and hidden gems\n\nWould you like specific recommendations for any of these categories?"
        else:
            response_text = "I'd love to give you recommendations! To provide the most helpful suggestions, could you tell me:\n\n• Which destination you're interested in?\n• What type of recommendations you need (restaurants, attractions, activities)?\n• Your travel style (budget, luxury, adventure, cultural)?\n\nFor example: 'Recommend restaurants in Paris' or 'Suggest activities in Tokyo'"
    
    
    # Handle general travel questions
    elif any(travel_word in query for travel_word in ["travel", "trip", "vacation", "holiday", "destination", "visit", "go to"]):
        response_text = f"I'd love to help you plan your trip! For '{query}', I can create a detailed itinerary with:\n\n• Day-by-day activities and attractions\n• Restaurant recommendations\n• Transportation tips\n• Cultural insights\n• Budget-friendly options\n\nCould you tell me more about your destination, travel dates, and interests? This will help me give you the most personalized recommendations!"
    
    # Handle packing questions
    elif any(pack_word in query for pack_word in ["pack", "packing", "what to bring", "luggage", "clothes"]):
        response_text = "Great question! Here's a general packing checklist:\n\n👕 **Clothing**: Weather-appropriate clothes, comfortable shoes, layers\n🧴 **Toiletries**: Travel-sized essentials, medications, sunscreen\n📱 **Electronics**: Phone charger, adapter, camera\n📄 **Documents**: Passport, tickets, travel insurance\n🎒 **Essentials**: Money, credit cards, emergency contacts\n\nFor specific destinations, I can give more detailed packing advice!"
    
    # Handle budget questions
    elif any(budget_word in query for budget_word in ["budget", "cheap", "expensive", "cost", "money", "price"]):
        response_text = "I can help with budget planning! Here are some tips:\n\n💰 **Budget-Friendly Options**:\n• Stay in hostels or budget hotels\n• Eat at local markets and street food\n• Use public transportation\n• Look for free attractions and walking tours\n\n💎 **Splurge-Worthy Experiences**:\n• Fine dining restaurants\n• Guided tours and experiences\n• Luxury accommodations\n• Unique activities\n\nWhat's your budget range and destination? I can give more specific advice!"
    
    else:
        response_text = f"I'm your AI Travel Assistant! I specialize in helping with travel planning, itineraries, and destination recommendations.\n\nFor your query '{query}', I can help you with:\n\n• Creating detailed travel plans\n• Suggesting activities and attractions\n• Recommending restaurants and local experiences\n• Providing travel tips and advice\n\nWhat specific destination or travel question can I help you with today?"
    
    return {
        "response": response_text
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
