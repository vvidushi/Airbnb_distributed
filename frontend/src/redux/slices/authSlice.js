import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

/**
 * AUTH SLICE
 * 
 * Manages user authentication state:
 * - User login/signup
 * - JWT token storage
 * - Session management
 * - User profile data
 */

// Async Thunks

// Login action
export const login = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials, {
                withCredentials: true,
                timeout: 10000 // 10 second timeout
            });
            return response.data.user;
        } catch (error) {
            // Handle network errors
            if (error.code === 'ECONNABORTED') {
                return rejectWithValue('Request timeout. Please check your connection and try again.');
            }
            if (!error.response) {
                return rejectWithValue('Network error. Please check if the server is running.');
            }
            // Backend returns 'error' field, not 'message'
            return rejectWithValue(error.response?.data?.error || error.response?.data?.message || 'Login failed');
        }
    }
);

// Signup action
export const signup = createAsyncThunk(
    'auth/signup',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/signup`, userData, {
                withCredentials: true,
                timeout: 10000 // 10 second timeout
            });
            return response.data.user;
        } catch (error) {
            // Handle network errors
            if (error.code === 'ECONNABORTED') {
                return rejectWithValue('Request timeout. Please check your connection and try again.');
            }
            if (!error.response) {
                return rejectWithValue('Network error. Please check if the server is running.');
            }
            // Backend returns 'error' field, not 'message'
            return rejectWithValue(error.response?.data?.error || error.response?.data?.message || 'Signup failed');
        }
    }
);

// Check auth status
export const checkAuth = createAsyncThunk(
    'auth/checkAuth',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/auth/check`, {
                withCredentials: true,
                timeout: 5000 // 5 second timeout for auth check
            });
            return response.data.user;
        } catch (error) {
            // Don't treat network errors as "not authenticated" - just return null
            if (!error.response) {
                return null;
            }
            return rejectWithValue('Not authenticated');
        }
    }
);

// Logout action
export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
                withCredentials: true,
                timeout: 5000 // 5 second timeout
            });
            return null;
        } catch (error) {
            // Even if logout fails on server, clear local state
            return null;
        }
    }
);

// Update profile
export const updateProfile = createAsyncThunk(
    'auth/updateProfile',
    async (profileData, { rejectWithValue }) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/users/profile`, profileData, {
                withCredentials: true
            });
            return response.data.user;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Update failed');
        }
    }
);

// Fetch profile details
export const fetchProfile = createAsyncThunk(
    'auth/fetchProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/users/profile`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
        }
    }
);

// Slice
const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        isAuthenticated: false,
        loading: true, // Start as true to wait for initial auth check
        error: null,
        jwtToken: null, // JWT token for API authentication
        profile: null,
        profileLoading: false,
        profileError: null
    },
    reducers: {
        // Set JWT token (for future API calls)
        setToken: (state, action) => {
            state.jwtToken = action.payload;
        },
        // Clear error
        clearError: (state) => {
            state.error = null;
        },
        // Clear user state (for manual logout)
        clearUser: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.jwtToken = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
            })
            // Signup
            .addCase(signup.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signup.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(signup.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Check Auth
            .addCase(checkAuth.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isAuthenticated = !!action.payload; // Only authenticated if user exists
                state.loading = false;
            })
            .addCase(checkAuth.rejected, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.loading = false;
            })
            // Logout
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.jwtToken = null;
            })
            // Update Profile
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.user = action.payload;
                state.profile = action.payload;
            })
            // Fetch Profile
            .addCase(fetchProfile.pending, (state) => {
                state.profileLoading = true;
                state.profileError = null;
            })
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.profileLoading = false;
                state.profile = action.payload;
            })
            .addCase(fetchProfile.rejected, (state, action) => {
                state.profileLoading = false;
                state.profileError = action.payload;
            });
    }
});

// Actions
export const { setToken, clearError, clearUser } = authSlice.actions;

// Selectors
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectUserRole = (state) => state.auth.user?.role;
export const selectJwtToken = (state) => state.auth.jwtToken;
export const selectUserProfile = (state) => state.auth.profile;
export const selectUserProfileLoading = (state) => state.auth.profileLoading;
export const selectUserProfileError = (state) => state.auth.profileError;

export default authSlice.reducer;

