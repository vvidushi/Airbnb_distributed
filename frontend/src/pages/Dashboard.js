import React, { useState, useEffect } from 'react';
import { searchProperties } from '../services/api';
import { addFavorite, removeFavorite, getFavorites } from '../services/api';
import SearchBar from '../components/SearchBar';
import PropertyCard from '../components/PropertyCard';
import AIAssistant from '../components/AIAssistant';

const Dashboard = () => {
    const [properties, setProperties] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useState({});

    useEffect(() => {
        loadProperties();
        loadFavorites();
    }, []);

    const loadProperties = async (params = {}) => {
        try {
            setLoading(true);
            const response = await searchProperties(params);
            setProperties(response.data);
        } catch (error) {
            console.error('Error loading properties:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadFavorites = async () => {
        try {
            const response = await getFavorites();
            const favoriteIds = response.data.map(p => p.id);
            setFavorites(favoriteIds);
        } catch (error) {
            console.error('Error loading favorites:', error);
        }
    };

    const handleSearch = (params) => {
        setSearchParams(params);
        loadProperties(params);
    };

    const handleFavoriteToggle = async (propertyId) => {
        try {
            if (favorites.includes(propertyId)) {
                await removeFavorite(propertyId);
                setFavorites(favorites.filter(id => id !== propertyId));
            } else {
                await addFavorite(propertyId);
                setFavorites([...favorites, propertyId]);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-light">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-dark mb-8">Find Your Perfect Stay</h1>
                
                <SearchBar onSearch={handleSearch} />

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
                        {properties.map(property => (
                            <PropertyCard
                                key={property.id}
                                property={property}
                                isFavorite={favorites.includes(property.id)}
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

