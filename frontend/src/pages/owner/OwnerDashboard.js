import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOwnerProperties, getOwnerBookings } from '../../services/api';
import { FaHome, FaCalendarCheck, FaClock, FaPlus } from 'react-icons/fa';

const OwnerDashboard = () => {
    const [properties, setProperties] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [propertiesRes, bookingsRes] = await Promise.all([
                getOwnerProperties(),
                getOwnerBookings()
            ]);
            setProperties(propertiesRes.data);
            setBookings(bookingsRes.data);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const pendingBookings = bookings.filter(b => b.status === 'pending');
    const acceptedBookings = bookings.filter(b => b.status === 'accepted');

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
                <h1 className="text-4xl font-bold text-dark mb-8">Owner Dashboard</h1>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-dark text-sm">Total Properties</p>
                                <p className="text-3xl font-bold text-dark">{properties.length}</p>
                            </div>
                            <FaHome className="text-4xl text-primary" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-dark text-sm">Pending Requests</p>
                                <p className="text-3xl font-bold text-dark">{pendingBookings.length}</p>
                            </div>
                            <FaClock className="text-4xl text-yellow-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-dark text-sm">Accepted Bookings</p>
                                <p className="text-3xl font-bold text-dark">{acceptedBookings.length}</p>
                            </div>
                            <FaCalendarCheck className="text-4xl text-green-500" />
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-2xl font-semibold text-dark mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link
                            to="/owner/properties/new"
                            className="flex items-center justify-center space-x-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-red-600 transition"
                        >
                            <FaPlus />
                            <span>Add New Property</span>
                        </Link>
                        <Link
                            to="/owner/properties"
                            className="flex items-center justify-center space-x-2 bg-secondary text-white px-6 py-3 rounded-lg hover:bg-teal-600 transition"
                        >
                            <FaHome />
                            <span>Manage Properties</span>
                        </Link>
                        <Link
                            to="/owner/bookings"
                            className="flex items-center justify-center space-x-2 bg-gray-dark text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition"
                        >
                            <FaCalendarCheck />
                            <span>View Bookings</span>
                        </Link>
                    </div>
                </div>

                {/* Recent Bookings */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-semibold text-dark mb-4">Recent Booking Requests</h2>
                    {pendingBookings.length === 0 ? (
                        <p className="text-gray-dark">No pending booking requests</p>
                    ) : (
                        <div className="space-y-4">
                            {pendingBookings.slice(0, 5).map(booking => (
                                <div key={booking.id} className="flex justify-between items-center border-b border-gray pb-4">
                                    <div>
                                        <p className="font-semibold text-dark">{booking.property_name}</p>
                                        <p className="text-sm text-gray-dark">
                                            {booking.traveler_name} · {booking.num_guests} guest{booking.num_guests > 1 ? 's' : ''}
                                        </p>
                                        <p className="text-sm text-gray-dark">
                                            {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <Link
                                        to="/owner/bookings"
                                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-red-600 transition"
                                    >
                                        Review
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OwnerDashboard;

