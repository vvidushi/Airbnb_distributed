import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPropertyById, createBooking } from '../services/api';
import DatePicker from 'react-datepicker';
import { FaBed, FaBath, FaUsers, FaMapMarkerAlt } from 'react-icons/fa';

const PropertyDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [numGuests, setNumGuests] = useState(1);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadProperty();
    }, [id]);

    const loadProperty = async () => {
        try {
            const response = await getPropertyById(id);
            setProperty(response.data);
        } catch (error) {
            console.error('Error loading property:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotalPrice = () => {
        if (!startDate || !endDate || !property) return 0;
        const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        return days * property.price_per_night;
    };

    const handleBooking = async () => {
        setError('');
        setSuccess('');

        if (!startDate || !endDate) {
            setError('Please select check-in and check-out dates');
            return;
        }

        setBookingLoading(true);

        try {
            await createBooking({
                propertyId: parseInt(id),
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
                numGuests: numGuests
            });
            setSuccess('Booking request sent successfully! Check your bookings page.');
            setTimeout(() => navigate('/bookings'), 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Booking failed. Please try again.');
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-light flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    if (!property) {
        return (
            <div className="min-h-screen bg-gray-light flex items-center justify-center">
                <div className="text-xl">Property not found</div>
            </div>
        );
    }

    const amenitiesList = Array.isArray(property.amenities) ? property.amenities : [];
    const totalPrice = calculateTotalPrice();

    return (
        <div className="min-h-screen bg-gray-light py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl font-bold text-dark mb-4">{property.property_name}</h1>
                
                <div className="flex items-center text-gray-dark mb-6">
                    <FaMapMarkerAlt className="mr-2" />
                    <span>{property.location}, {property.city}, {property.country}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Property Details */}
                    <div className="lg:col-span-2">
                        {/* Images */}
                        <div className="bg-white rounded-lg overflow-hidden mb-6">
                            <img
                                src={(() => {
                                    if (!property.images || property.images.length === 0) return 'https://via.placeholder.com/800x400';
                                    const img = property.images[0];
                                    return (img.startsWith('http://') || img.startsWith('https://')) ? img : `/uploads/${img}`;
                                })()}
                                alt={property.property_name}
                                className="w-full h-96 object-cover"
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/800x400' }}
                            />
                        </div>

                        {/* Property Info */}
                        <div className="bg-white rounded-lg p-6 mb-6">
                            <h2 className="text-2xl font-semibold mb-4">About this place</h2>
                            
                            <div className="flex items-center space-x-6 mb-6">
                                <div className="flex items-center space-x-2">
                                    <FaBed className="text-gray-dark" />
                                    <span>{property.bedrooms} Bedrooms</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <FaBath className="text-gray-dark" />
                                    <span>{property.bathrooms} Bathrooms</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <FaUsers className="text-gray-dark" />
                                    <span>Up to {property.max_guests} Guests</span>
                                </div>
                            </div>

                            <p className="text-gray-dark mb-6">{property.description || 'No description available.'}</p>

                            <h3 className="text-xl font-semibold mb-3">Amenities</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {amenitiesList.map((amenity, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                                        <span>{amenity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Booking Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-lg p-6 sticky top-20">
                            <div className="mb-6">
                                <span className="text-3xl font-bold text-dark">
                                    ${property.price_per_night}
                                </span>
                                <span className="text-gray-dark"> / night</span>
                            </div>

                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                                    {success}
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-dark mb-2">
                                    Check In
                                </label>
                                <DatePicker
                                    selected={startDate}
                                    onChange={(date) => setStartDate(date)}
                                    selectsStart
                                    startDate={startDate}
                                    endDate={endDate}
                                    minDate={new Date()}
                                    placeholderText="Select date"
                                    className="w-full"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-dark mb-2">
                                    Check Out
                                </label>
                                <DatePicker
                                    selected={endDate}
                                    onChange={(date) => setEndDate(date)}
                                    selectsEnd
                                    startDate={startDate}
                                    endDate={endDate}
                                    minDate={startDate || new Date()}
                                    placeholderText="Select date"
                                    className="w-full"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-dark mb-2">
                                    Guests
                                </label>
                                <select
                                    value={numGuests}
                                    onChange={(e) => setNumGuests(parseInt(e.target.value))}
                                    className="w-full px-4 py-2 border border-gray rounded-lg focus:outline-none focus:border-primary"
                                >
                                    {Array.from({ length: property.max_guests }, (_, i) => i + 1).map(num => (
                                        <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                                    ))}
                                </select>
                            </div>

                            {totalPrice > 0 && (
                                <div className="mb-6 pb-4 border-b border-gray">
                                    <div className="flex justify-between mb-2">
                                        <span>Total</span>
                                        <span className="font-bold text-xl">${totalPrice.toFixed(2)}</span>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleBooking}
                                disabled={bookingLoading}
                                className="w-full bg-primary text-white py-3 rounded-lg hover:bg-red-600 transition font-semibold disabled:opacity-50"
                            >
                                {bookingLoading ? 'Processing...' : 'Request to Book'}
                            </button>

                            <p className="text-xs text-gray-dark text-center mt-4">
                                You won't be charged yet. The owner will review your request.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetails;

