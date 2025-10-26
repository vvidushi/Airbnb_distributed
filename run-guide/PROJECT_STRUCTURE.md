# Project Structure

```
airbnb/
│
├── README.md                    # Main project documentation
├── SETUP_GUIDE.md              # Detailed setup instructions
├── PROJECT_STRUCTURE.md        # This file
├── .gitignore                  # Git ignore rules
│
├── database/                   # Database files
│   ├── schema.sql             # Database schema
│   └── seed.sql               # Sample data
│
├── backend/                    # Node.js + Express Backend
│   ├── package.json           # Node dependencies
│   ├── env.example            # Environment variables template
│   ├── uploads/               # File upload directory
│   │   └── .gitkeep
│   └── src/
│       ├── server.js          # Main server file
│       ├── config/
│       │   ├── database.js    # MySQL connection
│       │   ├── session.js     # Session configuration
│       │   └── swagger.js     # API documentation config
│       ├── controllers/
│       │   ├── authController.js      # Authentication logic
│       │   ├── userController.js      # User profile management
│       │   ├── propertyController.js  # Property CRUD
│       │   └── bookingController.js   # Booking management
│       ├── routes/
│       │   ├── auth.js        # Auth routes
│       │   ├── users.js       # User routes
│       │   ├── properties.js  # Property routes
│       │   └── bookings.js    # Booking routes
│       └── middleware/
│           ├── auth.js        # Authentication middleware
│           ├── upload.js      # File upload middleware
│           └── errorHandler.js # Error handling
│
├── frontend/                   # React Frontend
│   ├── package.json           # React dependencies
│   ├── tailwind.config.js     # TailwindCSS config
│   ├── postcss.config.js      # PostCSS config
│   ├── env.example            # Environment variables template
│   ├── public/
│   │   └── index.html         # HTML template
│   └── src/
│       ├── index.js           # React entry point
│       ├── index.css          # Global styles
│       ├── App.js             # Main app component with routing
│       ├── context/
│       │   └── AuthContext.js # Authentication context
│       ├── services/
│       │   └── api.js         # API service layer
│       ├── components/
│       │   ├── Navbar.js      # Navigation bar
│       │   ├── PropertyCard.js    # Property display card
│       │   ├── SearchBar.js       # Search component
│       │   ├── AIAssistant.js     # AI chatbot UI
│       │   └── PrivateRoute.js    # Protected route wrapper
│       └── pages/
│           ├── Login.js           # Login page
│           ├── Signup.js          # Registration page
│           ├── Dashboard.js       # Traveler dashboard
│           ├── PropertyDetails.js # Property details page
│           ├── Bookings.js        # Traveler bookings
│           ├── Favorites.js       # Favorite properties
│           ├── Profile.js         # User profile
│           └── owner/
│               ├── OwnerDashboard.js  # Owner dashboard
│               ├── OwnerProperties.js # Property management
│               ├── OwnerBookings.js   # Booking management
│               └── PropertyForm.js    # Add/Edit property
│
└── ai-agent/                   # Python FastAPI AI Service
    ├── requirements.txt       # Python dependencies
    ├── env.example            # Environment variables template
    └── app/
        ├── __init__.py
        ├── main.py            # FastAPI application
        ├── models.py          # Pydantic models
        ├── routes.py          # API routes
        └── services/
            ├── __init__.py
            ├── database.py    # MySQL integration
            └── ai_service.py  # Langchain + OpenAI + Tavily
```

## Key Components

### Backend (Node.js)
- **Express Server**: RESTful API with session-based auth
- **MySQL Database**: Relational data storage
- **Swagger**: Auto-generated API documentation
- **Multer**: File upload handling
- **bcrypt**: Password hashing

### Frontend (React)
- **React Router**: Client-side routing
- **TailwindCSS**: Utility-first styling
- **Axios**: HTTP client
- **Context API**: State management
- **React DatePicker**: Date selection
- **React Icons**: Icon library

### AI Agent (Python)
- **FastAPI**: High-performance API framework
- **Langchain**: LLM orchestration
- **OpenAI GPT-3.5**: Language model
- **Tavily**: Web search integration
- **MySQL Connector**: Database queries

## API Endpoints

### Authentication (`/api/auth`)
- `POST /signup` - Register new user
- `POST /login` - User login
- `POST /logout` - User logout
- `GET /check` - Check auth status

### Users (`/api/users`)
- `GET /profile` - Get user profile
- `PUT /profile` - Update profile
- `POST /profile-picture` - Upload profile photo
- `POST /favorites` - Add to favorites
- `DELETE /favorites/:id` - Remove favorite
- `GET /favorites` - Get favorites

### Properties (`/api/properties`)
- `GET /search` - Search properties
- `GET /:id` - Get property details
- `POST /` - Create property (Owner)
- `PUT /:id` - Update property (Owner)
- `DELETE /:id` - Delete property (Owner)
- `GET /owner/my-properties` - Get owner's properties

### Bookings (`/api/bookings`)
- `POST /` - Create booking (Traveler)
- `GET /traveler` - Get traveler's bookings
- `GET /owner` - Get owner's bookings
- `GET /:id` - Get booking details
- `PUT /:id/accept` - Accept booking (Owner)
- `PUT /:id/cancel` - Cancel booking

### AI (`/api/ai`)
- `POST /plan` - Generate travel plan
- `GET /test` - Test AI service

## Database Schema

### Users Table
```sql
- id (INT, PK, AUTO_INCREMENT)
- name (VARCHAR)
- email (VARCHAR, UNIQUE)
- password_hash (VARCHAR)
- role (ENUM: 'traveler', 'owner')
- profile_pic (VARCHAR)
- phone, about_me, city, country, languages, gender
- favorite_property_ids (JSON)
- created_at, updated_at (TIMESTAMP)
```

### Properties Table
```sql
- id (INT, PK, AUTO_INCREMENT)
- owner_id (INT, FK)
- property_name (VARCHAR)
- property_type (VARCHAR)
- description (TEXT)
- location, city, country (VARCHAR)
- price_per_night (DECIMAL)
- bedrooms, bathrooms, max_guests (INT)
- amenities (JSON)
- images (JSON)
- created_at, updated_at (TIMESTAMP)
```

### Bookings Table
```sql
- id (INT, PK, AUTO_INCREMENT)
- property_id (INT, FK)
- traveler_id (INT, FK)
- start_date, end_date (DATE)
- num_guests (INT)
- total_price (DECIMAL)
- status (ENUM: 'pending', 'accepted', 'cancelled')
- created_at, updated_at (TIMESTAMP)
```

## Features Implemented

### ✅ Traveler Features
- User registration and login
- Property search with filters
- Property details view
- Booking creation and management
- Favorites system
- Profile management with photo upload
- AI travel assistant

### ✅ Owner Features
- Property posting and management
- Booking request management
- Accept/decline bookings
- Dashboard with statistics
- Profile management

### ✅ AI Features
- Natural language understanding
- Travel plan generation
- Activity recommendations
- Restaurant suggestions
- Packing checklist
- Weather-aware suggestions
- Live local information (via Tavily)

### ✅ Technical Features
- Session-based authentication
- Password encryption
- File upload support
- Responsive design
- API documentation
- Error handling
- Input validation

## Ports Used
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **AI Agent**: http://localhost:8000
- **MySQL**: localhost:3306

## Environment Variables

Each service requires its own `.env` file:
- `backend/.env` - Database and session config
- `frontend/.env` - API URLs (optional)
- `ai-agent/.env` - OpenAI and Tavily API keys

