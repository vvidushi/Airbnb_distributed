import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SearchBar from '../components/SearchBar';
import PropertyCard from '../components/PropertyCard';
import AIAssistant from '../components/AIAssistant';
import {
    searchProperties as searchPropertiesAction,
    selectSearchResults,
    selectSearchLoading,
    selectSearchError,
    getFavorites as getFavoritesAction,
    addFavorite,
    removeFavorite,
    selectFavorites,
    setLastSearchParams,
    selectLastSearchParams,
} from '../redux/slices/propertiesSlice';
import { selectUser } from '../redux/slices/authSlice';

const Dashboard = () => {
    const dispatch = useDispatch();
    const properties = useSelector(selectSearchResults);
    const loading = useSelector(selectSearchLoading);
    const error = useSelector(selectSearchError);
    const favorites = useSelector(selectFavorites);
    const lastSearchParams = useSelector(selectLastSearchParams);
    const user = useSelector(selectUser);

    useEffect(() => {
        dispatch(getFavoritesAction());
    }, [dispatch]);

    useEffect(() => {
        if (lastSearchParams) {
            dispatch(searchPropertiesAction(lastSearchParams));
        } else {
            dispatch(searchPropertiesAction({}));
        }
    }, [dispatch, lastSearchParams]);

    const handleSearch = (params) => {
        dispatch(setLastSearchParams(params));
        dispatch(searchPropertiesAction(params));
    };

    const handleFavoriteToggle = async (propertyId) => {
        if (favorites.some((f) => f.id === propertyId)) {
            await dispatch(removeFavorite(propertyId));
        } else {
            await dispatch(addFavorite(propertyId));
        }
    };

    const favoriteIds = favorites.map((fav) => fav.id);

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-dark mb-2">
                    Find Your Perfect Stay{user ? `, ${user.full_name || user.name || user.email}` : ''}
                </h1>
                <p className="text-gray-dark mb-8">Search thousands of properties worldwide with real-time updates.</p>

                <SearchBar onSearch={handleSearch} />

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-4">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-12">
                        <div className="text-xl text-gray-dark">Loading properties...</div>
                    </div>
                ) : properties.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-xl text-gray-dark">No properties found. Try adjusting your search.</div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {properties.map((property) => (
                            <PropertyCard
                                key={property.id}
                                property={property}
                                isFavorite={favoriteIds.includes(property.id)}
                                onFavoriteToggle={handleFavoriteToggle}
                            />
                        ))}
                    </div>
                )}
            </div>

            <AIAssistant />
        </div>
    );
};

export default Dashboard;

