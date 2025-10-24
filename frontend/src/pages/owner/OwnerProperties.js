import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOwnerProperties, deleteProperty } from '../../services/api';
import { FaEdit, FaTrash, FaPlus, FaBed, FaBath } from 'react-icons/fa';

const OwnerProperties = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProperties();
    }, []);

    const loadProperties = async () => {
        try {
            const response = await getOwnerProperties();
            setProperties(response.data);
        } catch (error) {
            console.error('Error loading properties:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this property?')) return;

        try {
            await deleteProperty(id);
            setProperties(properties.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error deleting property:', error);
            alert('Failed to delete property');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-light flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-light py-8">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-dark">My Properties</h1>
                    <Link
                        to="/owner/properties/new"
                        className="flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-red-600 transition"
                    >
                        <FaPlus />
                        <span>Add New Property</span>
                    </Link>
                </div>

                {properties.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <p className="text-xl text-gray-dark mb-4">You haven't added any properties yet</p>
                        <Link
                            to="/owner/properties/new"
                            className="inline-flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-red-600 transition"
                        >
                            <FaPlus />
                            <span>Add Your First Property</span>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map(property => (
                            <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="h-48 bg-gray-200">
                                    <img
                                        src={(() => {
                                            if (!property.images || property.images.length === 0) return 'https://via.placeholder.com/400x300';
                                            const img = property.images[0];
                                            return (img.startsWith('http://') || img.startsWith('https://')) ? img : `/uploads/${img}`;
                                        })()}
                                        alt={property.property_name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300' }}
                                    />
                                </div>

                                <div className="p-4">
                                    <h3 className="text-xl font-semibold text-dark mb-2 truncate">
                                        {property.property_name}
                                    </h3>
                                    
                                    <p className="text-gray-dark mb-2">
                                        {property.city}, {property.country}
                                    </p>

                                    <div className="flex items-center space-x-4 text-sm text-gray-dark mb-3">
                                        <span className="flex items-center space-x-1">
                                            <FaBed />
                                            <span>{property.bedrooms}</span>
                                        </span>
                                        <span className="flex items-center space-x-1">
                                            <FaBath />
                                            <span>{property.bathrooms}</span>
                                        </span>
                                        <span className="text-sm capitalize">{property.property_type}</span>
                                    </div>

                                    <div className="mb-4">
                                        <span className="text-2xl font-bold text-dark">
                                            ${property.price_per_night}
                                        </span>
                                        <span className="text-sm text-gray-dark">/night</span>
                                    </div>

                                    <div className="flex space-x-2">
                                        <Link
                                            to={`/owner/properties/edit/${property.id}`}
                                            className="flex-1 flex items-center justify-center space-x-2 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition"
                                        >
                                            <FaEdit />
                                            <span>Edit</span>
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(property.id)}
                                            className="flex items-center justify-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OwnerProperties;

