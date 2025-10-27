import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProperty, updateProperty, getPropertyById, uploadPropertyImages } from '../../services/api';

const PropertyForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        property_name: '',
        property_type: 'Apartment',
        description: '',
        location: '',
        city: '',
        country: 'United States',
        price_per_night: '',
        bedrooms: 1,
        bathrooms: 1,
        max_guests: 1,
        amenities: [],
        images: []
    });

    const [uploadingImages, setUploadingImages] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const availableAmenities = [
        'WiFi', 'Kitchen', 'Parking', 'Air Conditioning', 'Heating',
        'Pool', 'Gym', 'Elevator', 'Washer', 'Dryer', 'TV',
        'Workspace', 'Fireplace', 'Beach Access', 'Hot Tub'
    ];

    const propertyTypes = ['Apartment', 'House', 'Condo', 'Villa', 'Cabin', 'Studio', 'Loft'];
    const countries = ['United States', 'Canada', 'United Kingdom', 'Australia', 'India', 'Germany', 'France', 'Japan'];

    useEffect(() => {
        if (isEdit) {
            loadProperty();
        }
    }, [id]);

    const loadProperty = async () => {
        try {
            const response = await getPropertyById(id);
            const property = response.data;
            setFormData({
                property_name: property.property_name,
                property_type: property.property_type,
                description: property.description || '',
                location: property.location,
                city: property.city,
                country: property.country,
                price_per_night: property.price_per_night,
                bedrooms: property.bedrooms,
                bathrooms: property.bathrooms,
                max_guests: property.max_guests,
                amenities: property.amenities || [],
                images: property.images || []
            });
        } catch (error) {
            console.error('Error loading property:', error);
            setError('Failed to load property');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleAmenityToggle = (amenity) => {
        const amenities = formData.amenities.includes(amenity)
            ? formData.amenities.filter(a => a !== amenity)
            : [...formData.amenities, amenity];
        
        setFormData({ ...formData, amenities });
    };

    const handleRemoveImage = (index) => {
        setFormData({
            ...formData,
            images: formData.images.filter((_, i) => i !== index)
        });
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploadingImages(true);
        try {
            const formData = new FormData();
            files.forEach(file => {
                formData.append('propertyImages', file);
            });

            const response = await uploadPropertyImages(formData);
            
            // Add uploaded filenames to images array
            const uploadedImages = response.data.filenames || [];
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...uploadedImages]
            }));
        } catch (err) {
            console.error('Upload error:', err);
            alert('Failed to upload images. Please try again.');
        } finally {
            setUploadingImages(false);
            e.target.value = ''; // Reset file input
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isEdit) {
                await updateProperty(id, formData);
            } else {
                await createProperty(formData);
            }
            navigate('/owner/properties');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save property');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-8">
            <div className="container mx-auto px-4 max-w-3xl">
                <h1 className="text-4xl font-bold text-dark mb-8">
                    {isEdit ? 'Edit Property' : 'Add New Property'}
                </h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-dark mb-2">
                                Property Name *
                            </label>
                            <input
                                type="text"
                                name="property_name"
                                value={formData.property_name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray rounded-lg focus:outline-none focus:border-primary"
                                placeholder="Beautiful Beach House"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-dark mb-2">
                                Property Type *
                            </label>
                            <select
                                name="property_type"
                                value={formData.property_type}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray rounded-lg focus:outline-none focus:border-primary"
                            >
                                {propertyTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-dark mb-2">
                                Price per Night ($) *
                            </label>
                            <input
                                type="number"
                                name="price_per_night"
                                value={formData.price_per_night}
                                onChange={handleChange}
                                required
                                min="1"
                                className="w-full px-4 py-2 border border-gray rounded-lg focus:outline-none focus:border-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-dark mb-2">
                                Address *
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray rounded-lg focus:outline-none focus:border-primary"
                                placeholder="123 Main Street"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-dark mb-2">
                                City *
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray rounded-lg focus:outline-none focus:border-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-dark mb-2">
                                Country *
                            </label>
                            <select
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray rounded-lg focus:outline-none focus:border-primary"
                            >
                                {countries.map(country => (
                                    <option key={country} value={country}>{country}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-dark mb-2">
                                Bedrooms *
                            </label>
                            <input
                                type="number"
                                name="bedrooms"
                                value={formData.bedrooms}
                                onChange={handleChange}
                                required
                                min="1"
                                className="w-full px-4 py-2 border border-gray rounded-lg focus:outline-none focus:border-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-dark mb-2">
                                Bathrooms *
                            </label>
                            <input
                                type="number"
                                name="bathrooms"
                                value={formData.bathrooms}
                                onChange={handleChange}
                                required
                                min="1"
                                className="w-full px-4 py-2 border border-gray rounded-lg focus:outline-none focus:border-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-dark mb-2">
                                Max Guests *
                            </label>
                            <input
                                type="number"
                                name="max_guests"
                                value={formData.max_guests}
                                onChange={handleChange}
                                required
                                min="1"
                                className="w-full px-4 py-2 border border-gray rounded-lg focus:outline-none focus:border-primary"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-dark mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                                className="w-full px-4 py-2 border border-gray rounded-lg focus:outline-none focus:border-primary"
                                placeholder="Describe your property..."
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-dark mb-3">
                                Amenities
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {availableAmenities.map(amenity => (
                                    <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.amenities.includes(amenity)}
                                            onChange={() => handleAmenityToggle(amenity)}
                                            className="w-4 h-4 text-primary border-gray rounded focus:ring-primary"
                                        />
                                        <span>{amenity}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-dark mb-3">
                                Property Images
                            </label>
                            
                            <div className="mb-4">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileUpload}
                                    disabled={uploadingImages}
                                    className="w-full px-4 py-2 border border-gray rounded-lg focus:outline-none focus:border-primary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-red-600 file:cursor-pointer"
                                />
                                {uploadingImages && (
                                    <p className="text-sm text-primary mt-2">📤 Uploading images...</p>
                                )}
                                <p className="text-xs text-gray-dark mt-2">
                                    Select one or multiple images (JPG, PNG, GIF). Max 5MB per file.
                                </p>
                            </div>

                            {/* Image Preview */}
                            {formData.images.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    {formData.images.map((img, index) => {
                                        // Determine if it's a URL or local file
                                        const imageUrl = (img.startsWith('http://') || img.startsWith('https://')) 
                                            ? img 
                                            : `/uploads/${img}`;
                                        
                                        return (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={imageUrl}
                                                    alt={`Property ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg border-2 border-gray"
                                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/200x150?text=Invalid+Image' }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(index)}
                                                    className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex space-x-4 mt-8">
                        <button
                            type="button"
                            onClick={() => navigate('/owner/properties')}
                            className="flex-1 px-6 py-3 border border-gray rounded-lg hover:bg-gray-light transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : (isEdit ? 'Update Property' : 'Create Property')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PropertyForm;

