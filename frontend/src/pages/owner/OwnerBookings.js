import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaCalendar, FaUsers, FaEnvelope, FaPhone } from 'react-icons/fa';
import {
    fetchOwnerBookings,
    acceptBooking,
    cancelBooking,
    selectOwnerBookings,
    selectBookingsLoading,
    selectBookingsError,
} from '../../redux/slices/bookingsSlice';

const OwnerBookings = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const bookings = useSelector(selectOwnerBookings);
    const loading = useSelector(selectBookingsLoading);
    const error = useSelector(selectBookingsError);
    const [filter, setFilter] = useState(location.state?.filter || 'all');

    useEffect(() => {
        dispatch(fetchOwnerBookings());
    }, [dispatch]);

    const handleAccept = async (bookingId) => {
        await dispatch(acceptBooking(bookingId));
    };

    const handleCancel = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;

        await dispatch(cancelBooking(bookingId));
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

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl font-bold text-dark mb-8">Booking Requests</h1>

                {/* Filter buttons */}
                <div className="flex flex-wrap gap-4 mb-8">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-6 py-2 rounded-lg transition font-semibold ${
                            filter === 'all' 
                                ? 'bg-primary text-white shadow-md' 
                                : 'bg-white text-gray-dark hover:bg-gray-100 border border-gray'
                        }`}
                    >
                        All ({bookings.length})
                    </button>
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-6 py-2 rounded-lg transition font-semibold ${
                            filter === 'pending' 
                                ? 'bg-yellow-500 text-white shadow-md' 
                                : 'bg-white text-gray-dark hover:bg-gray-100 border border-gray'
                        }`}
                    >
                        Pending ({bookings.filter(b => b.status === 'pending').length})
                    </button>
                    <button
                        onClick={() => setFilter('accepted')}
                        className={`px-6 py-2 rounded-lg transition font-semibold ${
                            filter === 'accepted' 
                                ? 'bg-green-500 text-white shadow-md' 
                                : 'bg-white text-gray-dark hover:bg-gray-100 border border-gray'
                        }`}
                    >
                        Accepted ({bookings.filter(b => b.status === 'accepted').length})
                    </button>
                    <button
                        onClick={() => setFilter('cancelled')}
                        className={`px-6 py-2 rounded-lg transition font-semibold ${
                            filter === 'cancelled' 
                                ? 'bg-red-500 text-white shadow-md' 
                                : 'bg-white text-gray-dark hover:bg-gray-100 border border-gray'
                        }`}
                    >
                        Cancelled ({bookings.filter(b => b.status === 'cancelled').length})
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

