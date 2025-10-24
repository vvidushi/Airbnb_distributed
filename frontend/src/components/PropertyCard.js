import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBed, FaBath, FaUsers, FaHeart, FaRegHeart } from 'react-icons/fa';

const PropertyCard = ({ property, onFavoriteToggle, isFavorite }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/property/${property.id}`);
    };

    const handleFavoriteClick = (e) => {
        e.stopPropagation();
        onFavoriteToggle && onFavoriteToggle(property.id);
    };

    const getImageUrl = () => {
        if (!property.images || property.images.length === 0) {
            return 'https://via.placeholder.com/400x300?text=No+Image';
        }
        const imageUrl = property.images[0];
        // Check if it's an external URL
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }
        // Otherwise it's a local upload
        return `/uploads/${imageUrl}`;
    };
    
    const imageUrl = getImageUrl();

    return (
        <div 
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
            onClick={handleCardClick}
        >
            <div className="relative h-48 bg-gray-200">
                <img 
                    src={imageUrl} 
                    alt={property.property_name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image' }}
                />
                {onFavoriteToggle && (
                    <button
                        onClick={handleFavoriteClick}
                        className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition"
                    >
                        {isFavorite ? (
                            <FaHeart className="text-primary text-xl" />
                        ) : (
                            <FaRegHeart className="text-gray-dark text-xl" />
                        )}
                    </button>
                )}
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
                        <span>{property.bedrooms} Beds</span>
                    </span>
                    <span className="flex items-center space-x-1">
                        <FaBath />
                        <span>{property.bathrooms} Baths</span>
                    </span>
                    <span className="flex items-center space-x-1">
                        <FaUsers />
                        <span>{property.max_guests} Guests</span>
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-dark">
                        ${property.price_per_night}
                        <span className="text-sm font-normal text-gray-dark">/night</span>
                    </span>
                    <span className="text-sm text-gray-dark capitalize">
                        {property.property_type}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PropertyCard;

