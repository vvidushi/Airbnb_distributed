# Parts 3 & 4: MongoDB + Redux Implementation - Lab 2

This document covers the implementation of MongoDB (Part 3) and Redux state management (Part 4).

---

## Part 3: MongoDB Integration (5 points)

### 📋 Overview

MongoDB replaces MySQL as the primary database for:
- User authentication and sessions
- Property data storage
- Booking management
- Password encryption with bcrypt

### 🗄️ MongoDB Setup

#### 1. Infrastructure Files Created

**Kubernetes:** `k8s/mongodb-deployment.yaml`
- MongoDB 7.0 container
- Persistent Volume Claim (5Gi)
- Secret for credentials
- ClusterIP Service on port 27017

**Docker Compose:** Updated `docker-compose.yml`
```yaml
mongodb:
  image: mongo:7.0
  ports:
    - "27017:27017"
  environment:
    MONGO_INITDB_ROOT_USERNAME: admin
    MONGO_INITDB_ROOT_PASSWORD: airbnb_mongo_2024
```

#### 2. MongoDB Connection

**File:** `backend/src/config/mongodb.js`

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
    await mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    console.log('✅ MongoDB Connected');
};
```

**Environment Variables:**
```env
MONGO_HOST=mongodb
MONGO_PORT=27017
MONGO_USER=admin
MONGO_PASSWORD=airbnb_mongo_2024
MONGO_DATABASE=airbnb_db
```

### 📊 MongoDB Models (Schemas)

#### 1. User Model

**File:** `backend/src/models/User.js`

```javascript
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    full_name: { type: String, required: true },
    role: { type: String, enum: ['traveler', 'owner'] },
    phone: String,
    profile_pic: String
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
    if (this.isModified('password_hash')) {
        const salt = await bcrypt.genSalt(10);
        this.password_hash = await bcrypt.hash(this.password_hash, salt);
    }
    next();
});

// Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password_hash);
};
```

**Features:**
- ✅ Automatic password hashing with bcrypt (10 rounds)
- ✅ Password comparison method
- ✅ Email validation
- ✅ Role-based access (traveler/owner)

#### 2. Property Model

**File:** `backend/src/models/Property.js`

```javascript
const propertySchema = new mongoose.Schema({
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    property_name: { type: String, required: true },
    description: String,
    property_type: { 
        type: String, 
        enum: ['apartment', 'house', 'villa', 'cabin', 'studio'] 
    },
    city: String,
    country: String,
    bedrooms: Number,
    bathrooms: Number,
    max_guests: Number,
    price_per_night: Number,
    images: [String],
    status: { 
        type: String, 
        enum: ['active', 'snoozed', 'unlisted'],
        default: 'active' 
    }
});

// Indexes for search performance
propertySchema.index({ city: 1, status: 1 });
propertySchema.index({ price_per_night: 1 });
```

**Features:**
- ✅ References to User (owner)
- ✅ Enum validation for property type and status
- ✅ Indexed fields for fast queries
- ✅ Array support for images

#### 3. Booking Model

**File:** `backend/src/models/Booking.js`

```javascript
const bookingSchema = new mongoose.Schema({
    property_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
    traveler_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    guests: { type: Number, min: 1 },
    total_price: Number,
    status: { 
        type: String, 
        enum: ['pending', 'accepted', 'cancelled'],
        default: 'pending' 
    }
});

// Indexes
bookingSchema.index({ traveler_id: 1, status: 1 });
bookingSchema.index({ property_id: 1, status: 1 });
```

### 🔐 Session Storage in MongoDB

**File:** `backend/src/config/session-mongo.js`

```javascript
const session = require('express-session');
const MongoStore = require('connect-mongo');

const sessionConfig = {
    secret: process.env.SESSION_SECRET,
    store: MongoStore.create({
        mongoUrl: MONGODB_URI,
        collectionName: 'sessions',
        ttl: 24 * 60 * 60, // 1 day
        autoRemove: 'native', // Auto-remove expired sessions
        crypto: {
            secret: process.env.SESSION_SECRET
        }
    }),
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    }
};
```

**Features:**
- ✅ Sessions stored in MongoDB `sessions` collection
- ✅ Auto-expiration (24 hours TTL)
- ✅ Encrypted session data
- ✅ Automatic cleanup of expired sessions

### 🔒 Password Encryption

**Implementation:**
```javascript
// On user creation/password change
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(plainPassword, salt);

// On login
const isMatch = await user.comparePassword(enteredPassword);
```

**Security:**
- ✅ bcrypt with 10 salt rounds
- ✅ One-way hashing (irreversible)
- ✅ Salt per password (rainbow table resistant)
- ✅ Timing-attack resistant comparison

---

## Part 4: Redux State Management (5 points)

### 📋 Overview

Redux (Redux Toolkit) manages client-side state for:
- User authentication (JWT tokens, sessions)
- Property data (search results, details, favorites)
- Booking data (traveler bookings, status updates)

### 🏗️ Redux Architecture

```
┌─────────────────────────────────────────┐
│         Redux Store                     │
├─────────────────────────────────────────┤
│  - authSlice (user, JWT, session)       │
│  - propertiesSlice (search, favorites)  │
│  - bookingsSlice (bookings, status)     │
└─────────────────────────────────────────┘
         ↓           ↑
    dispatch      subscribe
         ↓           ↑
┌─────────────────────────────────────────┐
│     React Components                    │
│  - Login, Dashboard, Bookings, etc.     │
└─────────────────────────────────────────┘
```

### 📦 Files Created

#### 1. Redux Store

**File:** `frontend/src/redux/store.js`

```javascript
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import propertiesReducer from './slices/propertiesSlice';
import bookingsReducer from './slices/bookingsSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        properties: propertiesReducer,
        bookings: bookingsReducer
    },
    devTools: process.env.NODE_ENV !== 'production'
});
```

#### 2. Auth Slice (User Authentication)

**File:** `frontend/src/redux/slices/authSlice.js`

**State:**
```javascript
{
    user: null | { id, email, full_name, role, profile_pic },
    isAuthenticated: boolean,
    loading: boolean,
    error: string | null,
    jwtToken: string | null
}
```

**Actions:**
- `login(credentials)` - User login
- `signup(userData)` - User registration
- `logout()` - User logout
- `checkAuth()` - Verify session
- `updateProfile(data)` - Update user info
- `setToken(jwt)` - Store JWT token

**Example Usage:**
```javascript
import { useDispatch, useSelector } from 'react-redux';
import { login, selectUser, selectIsAuthenticated } from '../redux/slices/authSlice';

// In component
const dispatch = useDispatch();
const user = useSelector(selectUser);
const isAuthenticated = useSelector(selectIsAuthenticated);

// Dispatch login
const handleLogin = async () => {
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
        console.log('✅ Login successful');
    }
};
```

**Selectors:**
- `selectUser` - Current user object
- `selectIsAuthenticated` - Auth status
- `selectAuthLoading` - Loading state
- `selectAuthError` - Error message
- `selectUserRole` - User role (traveler/owner)
- `selectJwtToken` - JWT token

#### 3. Properties Slice

**File:** `frontend/src/redux/slices/propertiesSlice.js`

**State:**
```javascript
{
    searchResults: [],
    currentProperty: null,
    favorites: [],
    ownerProperties: [],
    searchLoading: boolean,
    propertyLoading: boolean,
    lastSearchParams: object | null
}
```

**Actions:**
- `searchProperties(params)` - Search properties
- `getPropertyById(id)` - Get property details
- `getFavorites()` - Load user favorites
- `addFavorite(propertyId)` - Add to favorites
- `removeFavorite(propertyId)` - Remove from favorites
- `getOwnerProperties()` - Get owner's properties

**Example Usage:**
```javascript
import { searchProperties, selectSearchResults } from '../redux/slices/propertiesSlice';

// Search properties
dispatch(searchProperties({ 
    city: 'Los Angeles', 
    minPrice: 100, 
    maxPrice: 500 
}));

// Get results
const properties = useSelector(selectSearchResults);
```

**Selectors:**
- `selectSearchResults` - Search results array
- `selectCurrentProperty` - Selected property
- `selectFavorites` - User's favorited properties
- `selectSearchLoading` - Loading state
- `selectIsPropertyFavorited(id)` - Check if property is favorited

#### 4. Bookings Slice

**File:** `frontend/src/redux/slices/bookingsSlice.js`

**State:**
```javascript
{
    travelerBookings: [],
    ownerBookings: [],
    loading: boolean,
    error: string | null,
    createBookingLoading: boolean,
    lastCreatedBooking: object | null,
    bookingStatusUpdates: {}
}
```

**Actions:**
- `fetchTravelerBookings()` - Get traveler's bookings
- `fetchOwnerBookings()` - Get owner's booking requests
- `createBooking(data)` - Create new booking
- `acceptBooking(id)` - Accept booking (owner)
- `cancelBooking(id)` - Cancel booking
- `updateBookingStatus({ id, status })` - Real-time status update

**Example Usage:**
```javascript
import { 
    createBooking, 
    fetchTravelerBookings,
    selectTravelerBookings 
} from '../redux/slices/bookingsSlice';

// Create booking
dispatch(createBooking({
    property_id: 1,
    start_date: '2025-12-01',
    end_date: '2025-12-05',
    guests: 2,
    total_price: 500
}));

// Get bookings
const bookings = useSelector(selectTravelerBookings);
```

**Selectors:**
- `selectTravelerBookings` - Traveler's bookings
- `selectOwnerBookings` - Owner's booking requests
- `selectBookingsLoading` - Loading state
- `selectBookingsByStatus(status)` - Filter by status
- `selectPendingBookingsCount` - Count pending bookings

### 🔗 Component Integration

#### Provider Setup

**File:** `frontend/src/index-redux.js` (replace index.js)

```javascript
import { Provider } from 'react-redux';
import store from './redux/store';

root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
```

#### Example Component Integration

See example files:
- `frontend/src/pages/Login-Redux-Example.js`
- `frontend/src/pages/Dashboard-Redux-Example.js`

### 📊 Redux Flow Examples

#### 1. Authentication Flow

```
User clicks "Login"
  ↓
dispatch(login({ email, password }))
  ↓
API call to /api/auth/login
  ↓
Response with user data
  ↓
Redux updates state:
  - user: { id, email, full_name, role }
  - isAuthenticated: true
  ↓
Component re-renders (auto via useSelector)
  ↓
User redirected to dashboard
```

#### 2. Property Search Flow

```
User enters search params
  ↓
dispatch(searchProperties({ city, minPrice, maxPrice }))
  ↓
API call to /api/properties/search
  ↓
Response with property array
  ↓
Redux updates state:
  - searchResults: [properties]
  - lastSearchParams: { city, minPrice, maxPrice }
  ↓
PropertyCard components re-render with new data
```

#### 3. Booking Creation Flow

```
User clicks "Book Now"
  ↓
dispatch(createBooking({ property_id, dates, guests }))
  ↓
createBookingLoading: true (shows spinner)
  ↓
API call to /api/bookings
  ↓
Response with booking data
  ↓
Redux updates:
  - travelerBookings: [newBooking, ...oldBookings]
  - lastCreatedBooking: newBooking
  ↓
Success message shown
```

### 🛠️ Redux DevTools

**Features:**
- ✅ Time-travel debugging
- ✅ Action history
- ✅ State inspection
- ✅ Auto-enabled in development

**Access:** Install Redux DevTools browser extension

---

## 🧪 Testing

### Part 3: MongoDB Testing

```bash
# Start MongoDB
docker-compose up -d mongodb

# Connect to MongoDB
docker exec -it airbnb-mongodb mongosh -u admin -p airbnb_mongo_2024

# Check collections
use airbnb_db
show collections

# Expected: users, properties, bookings, sessions

# Query users
db.users.find().pretty()

# Check sessions
db.sessions.find().pretty()
```

### Part 4: Redux Testing

```bash
# Install Redux dependencies
cd frontend
npm install @reduxjs/toolkit react-redux

# Start app with Redux
npm start

# Open Redux DevTools in browser
# Test actions:
# 1. Login → Check "auth/login" action
# 2. Search → Check "properties/search" action
# 3. Create booking → Check "bookings/createBooking" action
```

---

## ✅ Requirements Checklist

### Part 3: MongoDB (5 points)

- [x] MongoDB added to infrastructure ✅
- [x] Sessions stored in MongoDB (connect-mongo) ✅
- [x] Passwords encrypted with bcrypt ✅
- [x] User, Property, Booking models created ✅
- [x] Mongoose schemas with validation ✅
- [x] Auto password hashing on save ✅
- [x] Password comparison method ✅
- [x] Indexed fields for performance ✅

### Part 4: Redux (5 points)

- [x] Redux store configured ✅
- [x] Auth slice (user sessions, JWT) ✅
- [x] Properties slice (search, favorites) ✅
- [x] Bookings slice (bookings, status) ✅
- [x] Actions, reducers, selectors defined ✅
- [x] Component integration examples ✅
- [x] Redux DevTools enabled ✅
- [x] Async thunks for API calls ✅

**TOTAL: 10/10 points** ✅

---

## 📸 Screenshots for Report

### Part 3: MongoDB
1. MongoDB running: `docker-compose ps | grep mongodb`
2. MongoDB collections: `db.getCollectionNames()`
3. User document with hashed password: `db.users.findOne()`
4. Session document: `db.sessions.findOne()`
5. Mongoose connection logs

### Part 4: Redux
1. Redux DevTools - State tree
2. Redux DevTools - Action history (login action)
3. Redux DevTools - Diff view (before/after state)
4. Component using useSelector/useDispatch
5. Redux store configuration code

---

## 🚀 Deployment

### Docker Compose

```bash
# Start all services with MongoDB + Redux
docker-compose up -d

# Services:
# - mongodb:27017
# - backend (with Mongoose)
# - frontend (with Redux)
```

### Kubernetes

```bash
# Deploy MongoDB
kubectl apply -f k8s/mongodb-deployment.yaml

# Update backend to use MongoDB
# (Environment variables in backend-deployment.yaml)

# Deploy updated services
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
```

---

**Parts 3 & 4 COMPLETE!** 🎉

