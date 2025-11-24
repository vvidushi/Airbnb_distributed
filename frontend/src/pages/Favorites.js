import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropertyCard from '../components/PropertyCard';
import {
    getFavorites,
    removeFavorite,
    selectFavorites,
    selectFavoritesLoading,
} from '../redux/slices/propertiesSlice';

const Favorites = () => {
    const dispatch = useDispatch();
    const favorites = useSelector(selectFavorites);
    const loading = useSelector(selectFavoritesLoading);

    useEffect(() => {
        dispatch(getFavorites());
    }, [dispatch]);

    const handleRemoveFavorite = async (propertyId) => {
        await dispatch(removeFavorite(propertyId));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl font-bold text-dark mb-8">My Favorites</h1>

                {favorites.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <p className="text-xl text-gray-dark">You haven't added any favorites yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {favorites.map(property => (
                            <PropertyCard
                                key={property.id}
                                property={property}
                                isFavorite={true}
                                onFavoriteToggle={handleRemoveFavorite}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Favorites;

