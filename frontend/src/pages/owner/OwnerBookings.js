import React, { useState, useEffect } from 'react';
import { getOwnerBookings, acceptBooking, cancelBooking } from '../../services/api';
import { FaCalendar, FaUsers, FaEnvelope, FaPhone } from 'react-icons/fa';

const OwnerBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            const response = await getOwnerBookings();
            setBookings(response.data);
        } catch (error) {
            console.error('Error loading bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (bookingId) => {
        try {
            await acceptBooking(bookingId);
            loadBookings();
        } catch (error) {
            console.error('Error accepting booking:', error);
            alert(error.response?.data?.error || 'Failed to accept booking');
        }
    };

    const handleCancel = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;

        try {
            await cancelBooking(bookingId);
            loadBookings();
        } catch (error) {
            console.error('Error cancelling booking:', error);
            alert('Failed to cancel booking');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'accepted': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredBookings = bookings.filter(booking => {
        if (filter === 'all') return true;
        return booking.status === filter;
    });

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
                <h1 className="text-4xl font-bold text-dark mb-8">Booking Requests</h1>

                {/* Filter buttons */}
                <div className="flex space-x-4 mb-8">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-6 py-2 rounded-lg transition ${
                            filter === 'all' 
                                ? 'bg-primary text-white' 
                                : 'bg-white text-gray-dark hover:bg-gray'
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-6 py-2 rounded-lg transition ${
                            filter === 'pending' 
                                ? 'bg-primary text-white' 
                                : 'bg-white text-gray-dark hover:bg-gray'
                        }`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setFilter('accepted')}
                        className={`px-6 py-2 rounded-lg transition ${
                            filter === 'accepted' 
                                ? 'bg-primary text-white' 
                                : 'bg-white text-gray-dark hover:bg-gray'
                        }`}
                    >
                        Accepted
                    </button>
                    <button
                        onClick={() => setFilter('cancelled')}
                        className={`px-6 py-2 rounded-lg transition ${
                            filter === 'cancelled' 
                                ? 'bg-primary text-white' 
                                : 'bg-white text-gray-dark hover:bg-gray'
                        }`}
                    >
                        Cancelled
                    </button>
                </div>

                {filteredBookings.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <p className="text-xl text-gray-dark">No bookings found</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredBookings.map(booking => (
                            <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-semibold text-dark mb-2">
                                            {booking.property_name}
                                        </h3>
                                        <p className="text-gray-dark mb-4">{booking.location}, {booking.city}</p>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center text-gray-dark">
                                                <span className="font-semibold mr-2">Guest:</span>
                                                <span>{booking.traveler_name}</span>
                                            </div>
                                            <div className="flex items-center text-gray-dark">
                                                <FaEnvelope className="mr-2" />
                                                <span>{booking.traveler_email}</span>
                                            </div>
                                            {booking.traveler_phone && (
                                                <div className="flex items-center text-gray-dark">
                                                    <FaPhone className="mr-2" />
                                                    <span>{booking.traveler_phone}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center text-gray-dark">
                                                <FaCalendar className="mr-2" />
                                                <span>
                                                    {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-gray-dark">
                                                <FaUsers className="mr-2" />
                                                <span>{booking.num_guests} Guest{booking.num_guests > 1 ? 's' : ''}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold capitalize mb-4 ${getStatusColor(booking.status)}`}>
                                            {booking.status}
                                        </span>
                                        <div>
                                            <span className="text-2xl font-bold text-dark">
                                                ${booking.total_price}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {booking.status === 'pending' && (
                                    <div className="flex justify-end space-x-4 pt-4 border-t border-gray">
                                        <button
                                            onClick={() => handleCancel(booking.id)}
                                            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                        >
                                            Decline
                                        </button>
                                        <button
                                            onClick={() => handleAccept(booking.id)}
                                            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                                        >
                                            Accept
                                        </button>
                                    </div>
                                )}

                                {booking.status === 'accepted' && (
                                    <div className="flex justify-end space-x-4 pt-4 border-t border-gray">
                                        <button
                                            onClick={() => handleCancel(booking.id)}
                                            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                        >
                                            Cancel Booking
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OwnerBookings;

