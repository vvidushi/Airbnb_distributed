import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to={user?.role === 'owner' ? '/owner/dashboard' : '/dashboard'} className="flex items-center">
                        <span className="text-2xl font-bold text-primary">Airbnb</span>
                    </Link>

                    {/* Navigation Links */}
                    {user ? (
                        <div className="flex items-center space-x-4">
                            {user.role === 'traveler' && (
                                <>
                                    <Link to="/dashboard" className="text-gray-dark hover:text-primary transition">
                                        Dashboard
                                    </Link>
                                    <Link to="/favorites" className="text-gray-dark hover:text-primary transition">
                                        Favorites
                                    </Link>
                                    <Link to="/bookings" className="text-gray-dark hover:text-primary transition">
                                        My Trips
                                    </Link>
                                </>
                            )}

                            {user.role === 'owner' && (
                                <>
                                    <Link to="/owner/dashboard" className="text-gray-dark hover:text-primary transition">
                                        Dashboard
                                    </Link>
                                    <Link to="/owner/properties" className="text-gray-dark hover:text-primary transition">
                                        My Properties
                                    </Link>
                                    <Link to="/owner/bookings" className="text-gray-dark hover:text-primary transition">
                                        Bookings
                                    </Link>
                                </>
                            )}

                            <Link to="/profile" className="flex items-center space-x-2 text-gray-dark hover:text-primary transition">
                                <FaUser />
                                <span>{user.name}</span>
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                            >
                                <FaSignOutAlt />
                                <span>Logout</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-4">
                            <Link to="/login" className="text-gray-dark hover:text-primary transition">
                                Login
                            </Link>
                            <Link to="/signup" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-red-600 transition">
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

