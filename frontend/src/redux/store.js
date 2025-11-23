import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import propertiesReducer from './slices/propertiesSlice';
import bookingsReducer from './slices/bookingsSlice';

/**
 * Redux Store Configuration
 *
 * Manages application state for:
 * - Authentication (user sessions, JWT tokens)
 * - Properties (search results, details, favorites)
 * - Bookings (traveler bookings, status updates)
 *
 * Redux DevTools:
 * - Enabled automatically in development
 * - Can be force‑enabled in production by setting
 *   REACT_APP_ENABLE_REDUX_DEVTOOLS=true at build time
 */

const enableDevTools =
  process.env.REACT_APP_ENABLE_REDUX_DEVTOOLS === 'true' ||
  process.env.NODE_ENV !== 'production';

const store = configureStore({
  reducer: {
    auth: authReducer,
    properties: propertiesReducer,
    bookings: bookingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for date serialization
        ignoredActions: ['bookings/fetchTravelerBookings/fulfilled'],
      },
    }),
  devTools: enableDevTools,
});

export default store;

