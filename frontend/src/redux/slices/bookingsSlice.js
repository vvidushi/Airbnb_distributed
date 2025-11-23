import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

/**
 * BOOKINGS SLICE
 * 
 * Manages booking-related state:
 * - Traveler bookings
 * - Owner booking requests
 * - Booking status updates
 * - Booking creation
 */

// Async Thunks

// Get traveler bookings
export const fetchTravelerBookings = createAsyncThunk(
    'bookings/fetchTravelerBookings',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/bookings/traveler`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings');
        }
    }
);

// Get owner bookings
export const fetchOwnerBookings = createAsyncThunk(
    'bookings/fetchOwnerBookings',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/bookings/owner`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookings');
        }
    }
);

// Create booking
export const createBooking = createAsyncThunk(
    'bookings/createBooking',
    async (bookingData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/bookings`, bookingData, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create booking');
        }
    }
);

// Accept booking (owner)
export const acceptBooking = createAsyncThunk(
    'bookings/acceptBooking',
    async (bookingId, { rejectWithValue }) => {
        try {
            const response = await axios.put(
                `${API_BASE_URL}/bookings/${bookingId}/accept`,
                {},
                { withCredentials: true }
            );
            return { bookingId, status: 'accepted', data: response.data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to accept booking');
        }
    }
);

// Cancel booking
export const cancelBooking = createAsyncThunk(
    'bookings/cancelBooking',
    async (bookingId, { rejectWithValue }) => {
        try {
            const response = await axios.put(
                `${API_BASE_URL}/bookings/${bookingId}/cancel`,
                {},
                { withCredentials: true }
            );
            return { bookingId, status: 'cancelled', data: response.data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to cancel booking');
        }
    }
);

// Slice
const bookingsSlice = createSlice({
    name: 'bookings',
    initialState: {
        travelerBookings: [],
        ownerBookings: [],
        loading: false,
        error: null,
        createBookingLoading: false,
        createBookingError: null,
        lastCreatedBooking: null,
        bookingStatusUpdates: {} // Map of booking ID to status
    },
    reducers: {
        // Clear error
        clearBookingError: (state) => {
            state.error = null;
            state.createBookingError = null;
        },
        // Clear last created booking
        clearLastCreatedBooking: (state) => {
            state.lastCreatedBooking = null;
        },
        // Update booking status (for real-time updates)
        updateBookingStatus: (state, action) => {
            const { bookingId, status } = action.payload;
            
            // Update in traveler bookings
            const travelerBooking = state.travelerBookings.find(b => b.id === bookingId);
            if (travelerBooking) {
                travelerBooking.status = status;
            }
            
            // Update in owner bookings
            const ownerBooking = state.ownerBookings.find(b => b.id === bookingId);
            if (ownerBooking) {
                ownerBooking.status = status;
            }
            
            // Track status update
            state.bookingStatusUpdates[bookingId] = status;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Traveler Bookings
            .addCase(fetchTravelerBookings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTravelerBookings.fulfilled, (state, action) => {
                state.loading = false;
                state.travelerBookings = action.payload;
            })
            .addCase(fetchTravelerBookings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Owner Bookings
            .addCase(fetchOwnerBookings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOwnerBookings.fulfilled, (state, action) => {
                state.loading = false;
                state.ownerBookings = action.payload;
            })
            .addCase(fetchOwnerBookings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create Booking
            .addCase(createBooking.pending, (state) => {
                state.createBookingLoading = true;
                state.createBookingError = null;
            })
            .addCase(createBooking.fulfilled, (state, action) => {
                state.createBookingLoading = false;
                state.lastCreatedBooking = action.payload;
                // Add to traveler bookings
                if (action.payload.booking) {
                    state.travelerBookings.unshift(action.payload.booking);
                }
            })
            .addCase(createBooking.rejected, (state, action) => {
                state.createBookingLoading = false;
                state.createBookingError = action.payload;
            })
            // Accept Booking
            .addCase(acceptBooking.fulfilled, (state, action) => {
                const { bookingId, status } = action.payload;
                const booking = state.ownerBookings.find(b => b.id === bookingId);
                if (booking) {
                    booking.status = status;
                }
            })
            // Cancel Booking
            .addCase(cancelBooking.fulfilled, (state, action) => {
                const { bookingId, status } = action.payload;
                
                // Update in owner bookings
                const ownerBooking = state.ownerBookings.find(b => b.id === bookingId);
                if (ownerBooking) {
                    ownerBooking.status = status;
                }
                
                // Update in traveler bookings
                const travelerBooking = state.travelerBookings.find(b => b.id === bookingId);
                if (travelerBooking) {
                    travelerBooking.status = status;
                }
            });
    }
});

// Actions
export const { clearBookingError, clearLastCreatedBooking, updateBookingStatus } = bookingsSlice.actions;

// Selectors
export const selectTravelerBookings = (state) => state.bookings.travelerBookings;
export const selectOwnerBookings = (state) => state.bookings.ownerBookings;
export const selectBookingsLoading = (state) => state.bookings.loading;
export const selectBookingsError = (state) => state.bookings.error;
export const selectCreateBookingLoading = (state) => state.bookings.createBookingLoading;
export const selectCreateBookingError = (state) => state.bookings.createBookingError;
export const selectLastCreatedBooking = (state) => state.bookings.lastCreatedBooking;

// Helper selectors
export const selectBookingsByStatus = (status) => (state) => {
    return state.bookings.travelerBookings.filter(b => b.status === status);
};

export const selectOwnerBookingsByStatus = (status) => (state) => {
    return state.bookings.ownerBookings.filter(b => b.status === status);
};

export const selectPendingBookingsCount = (state) => {
    return state.bookings.ownerBookings.filter(b => b.status === 'pending').length;
};

export default bookingsSlice.reducer;

