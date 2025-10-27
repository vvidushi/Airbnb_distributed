import React, { useState, useEffect } from 'react';
import { getFavorites, removeFavorite } from '../services/api';
import PropertyCard from '../components/PropertyCard';

const Favorites = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            const response = await getFavorites();
            setFavorites(response.data);
        } catch (error) {
            console.error('Error loading favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFavorite = async (propertyId) => {
        try {
            await removeFavorite(propertyId);
            setFavorites(favorites.filter(p => p.id !== propertyId));
        } catch (error) {
            console.error('Error removing favorite:', error);
        }
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

