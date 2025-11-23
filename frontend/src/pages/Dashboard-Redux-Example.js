/**
 * DASHBOARD PAGE - REDUX INTEGRATED VERSION
 * 
 * This shows how to use Redux for:
 * - Property search and display
 * - Favorites management
 * - Property data caching
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    searchProperties,
    selectSearchResults,
    selectSearchLoading,
    selectSearchError,
    getFavorites,
    addFavorite,
    removeFavorite,
    selectFavorites,
    selectIsPropertyFavorited,
    setLastSearchParams,
    selectLastSearchParams
} from '../redux/slices/propertiesSlice';
import { selectUser } from '../redux/slices/authSlice';
import SearchBar from '../components/SearchBar';
import PropertyCard from '../components/PropertyCard';

const DashboardRedux = () => {
    const dispatch = useDispatch();
    
    // Redux selectors
    const properties = useSelector(selectSearchResults);
    const loading = useSelector(selectSearchLoading);
    const error = useSelector(selectSearchError);
    const favorites = useSelector(selectFavorites);
    const user = useSelector(selectUser);
    const lastSearchParams = useSelector(selectLastSearchParams);

    // Load favorites on mount
    useEffect(() => {
        dispatch(getFavorites());
    }, [dispatch]);

    // Load properties on mount (or use cached search params)
    useEffect(() => {
        if (lastSearchParams) {
            // Use cached search params
            dispatch(searchProperties(lastSearchParams));
        } else {
            // Initial load
            dispatch(searchProperties({}));
        }
    }, [dispatch]);

    // Handle search
    const handleSearch = (searchParams) => {
        // Save search params to Redux for caching
        dispatch(setLastSearchParams(searchParams));
        // Perform search
        dispatch(searchProperties(searchParams));
    };

    // Handle favorite toggle
    const handleFavoriteToggle = async (propertyId) => {
        const isFavorited = favorites.some(f => f.id === propertyId);
        
        if (isFavorited) {
            await dispatch(removeFavorite(propertyId));
        } else {
            await dispatch(addFavorite(propertyId));
        }
    };

    return (
        <div className="min-h-screen py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl font-bold mb-8">
                    Find Your Perfect Stay, {user?.full_name}
                </h1>

                {/* Search Bar */}
                <SearchBar onSearch={handleSearch} />

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="text-xl">Loading properties...</div>
                    </div>
                )}

                {/* Properties Grid */}
                {!loading && properties.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-xl text-gray-600">No properties found</p>
                    </div>
                )}

                {!loading && properties.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map((property) => (
                            <PropertyCard
                                key={property.id}
                                property={property}
                                onFavoriteToggle={handleFavoriteToggle}
                                isFavorite={favorites.some(f => f.id === property.id)}
                            />
                        ))}
                    </div>
                )}

                {/* Redux State Info (Dev only) */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 p-4 bg-gray-100 rounded text-xs">
                        <strong>Redux State:</strong>
                        <div>Properties: {properties.length}</div>
                        <div>Favorites: {favorites.length}</div>
                        <div>Loading: {loading ? 'Yes' : 'No'}</div>
                        {lastSearchParams && (
                            <div>Last Search: {JSON.stringify(lastSearchParams)}</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardRedux;

