import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

/**
 * PROPERTIES SLICE
 * 
 * Manages property-related state:
 * - Property search results
 * - Property details
 * - Favorites
 * - Owner properties
 */

// Async Thunks

// Search properties
export const searchProperties = createAsyncThunk(
    'properties/search',
    async (searchParams = {}, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/properties/search`, {
                params: searchParams,
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Search failed');
        }
    }
);

// Get property by ID
export const getPropertyById = createAsyncThunk(
    'properties/getById',
    async (propertyId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/properties/${propertyId}`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch property');
        }
    }
);

// Get favorites
export const getFavorites = createAsyncThunk(
    'properties/getFavorites',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/users/favorites`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch favorites');
        }
    }
);

// Add to favorites
export const addFavorite = createAsyncThunk(
    'properties/addFavorite',
    async (propertyId, { rejectWithValue }) => {
        try {
            await axios.post(`${API_BASE_URL}/users/favorites`, 
                { propertyId },
                { withCredentials: true }
            );
            return propertyId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add favorite');
        }
    }
);

// Remove from favorites
export const removeFavorite = createAsyncThunk(
    'properties/removeFavorite',
    async (propertyId, { rejectWithValue }) => {
        try {
            await axios.delete(`${API_BASE_URL}/users/favorites/${propertyId}`, {
                withCredentials: true
            });
            return propertyId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to remove favorite');
        }
    }
);

// Get owner properties
export const getOwnerProperties = createAsyncThunk(
    'properties/getOwnerProperties',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/properties/owner/my-properties`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch properties');
        }
    }
);

// Slice
const propertiesSlice = createSlice({
    name: 'properties',
    initialState: {
        searchResults: [],
        searchLoading: false,
        searchError: null,
        currentProperty: null,
        propertyLoading: false,
        propertyError: null,
        favorites: [],
        favoritesLoading: false,
        ownerProperties: [],
        ownerPropertiesLoading: false,
        lastSearchParams: null
    },
    reducers: {
        // Clear search results
        clearSearchResults: (state) => {
            state.searchResults = [];
            state.searchError = null;
        },
        // Clear current property
        clearCurrentProperty: (state) => {
            state.currentProperty = null;
            state.propertyError = null;
        },
        // Set last search params (for re-search)
        setLastSearchParams: (state, action) => {
            state.lastSearchParams = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Search Properties
            .addCase(searchProperties.pending, (state) => {
                state.searchLoading = true;
                state.searchError = null;
            })
            .addCase(searchProperties.fulfilled, (state, action) => {
                state.searchLoading = false;
                state.searchResults = action.payload;
            })
            .addCase(searchProperties.rejected, (state, action) => {
                state.searchLoading = false;
                state.searchError = action.payload;
            })
            // Get Property By ID
            .addCase(getPropertyById.pending, (state) => {
                state.propertyLoading = true;
                state.propertyError = null;
            })
            .addCase(getPropertyById.fulfilled, (state, action) => {
                state.propertyLoading = false;
                state.currentProperty = action.payload;
            })
            .addCase(getPropertyById.rejected, (state, action) => {
                state.propertyLoading = false;
                state.propertyError = action.payload;
            })
            // Get Favorites
            .addCase(getFavorites.pending, (state) => {
                state.favoritesLoading = true;
            })
            .addCase(getFavorites.fulfilled, (state, action) => {
                state.favoritesLoading = false;
                state.favorites = action.payload;
            })
            .addCase(getFavorites.rejected, (state) => {
                state.favoritesLoading = false;
            })
            // Add Favorite
            .addCase(addFavorite.fulfilled, (state, action) => {
                // Add to favorites array if not already there
                if (!state.favorites.find(f => f.id === action.payload)) {
                    state.favorites.push({ id: action.payload });
                }
            })
            // Remove Favorite
            .addCase(removeFavorite.fulfilled, (state, action) => {
                state.favorites = state.favorites.filter(f => f.id !== action.payload);
            })
            // Get Owner Properties
            .addCase(getOwnerProperties.pending, (state) => {
                state.ownerPropertiesLoading = true;
            })
            .addCase(getOwnerProperties.fulfilled, (state, action) => {
                state.ownerPropertiesLoading = false;
                state.ownerProperties = action.payload;
            })
            .addCase(getOwnerProperties.rejected, (state) => {
                state.ownerPropertiesLoading = false;
            });
    }
});

// Actions
export const { clearSearchResults, clearCurrentProperty, setLastSearchParams } = propertiesSlice.actions;

// Selectors
export const selectSearchResults = (state) => state.properties.searchResults;
export const selectSearchLoading = (state) => state.properties.searchLoading;
export const selectSearchError = (state) => state.properties.searchError;
export const selectCurrentProperty = (state) => state.properties.currentProperty;
export const selectPropertyLoading = (state) => state.properties.propertyLoading;
export const selectFavorites = (state) => state.properties.favorites;
export const selectFavoritesLoading = (state) => state.properties.favoritesLoading;
export const selectOwnerProperties = (state) => state.properties.ownerProperties;
export const selectOwnerPropertiesLoading = (state) => state.properties.ownerPropertiesLoading;
export const selectLastSearchParams = (state) => state.properties.lastSearchParams;

// Helper selector: Check if property is favorited
export const selectIsPropertyFavorited = (propertyId) => (state) => {
    return state.properties.favorites.some(f => f.id === propertyId);
};

export default propertiesSlice.reducer;

