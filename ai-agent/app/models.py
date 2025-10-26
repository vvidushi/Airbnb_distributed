from pydantic import BaseModel
from typing import Optional, List, Dict

class TravelPlanRequest(BaseModel):
    query: str
    booking_id: Optional[int] = None
    preferences: Optional[Dict] = None

class ActivityCard(BaseModel):
    title: str
    address: str
    price_tier: str
    duration: str
    tags: List[str]
    wheelchair_friendly: bool
    child_friendly: bool

class DayPlan(BaseModel):
    day: int
    date: str
    morning: List[str]
    afternoon: List[str]
    evening: List[str]

class RestaurantRecommendation(BaseModel):
    name: str
    cuisine: str
    price_range: str
    dietary_options: List[str]
    address: str

class TravelPlanResponse(BaseModel):
    response: str
    day_plans: Optional[List[DayPlan]] = None
    activities: Optional[List[ActivityCard]] = None
    restaurants: Optional[List[RestaurantRecommendation]] = None
    packing_checklist: Optional[List[str]] = None

