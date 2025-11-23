/**
 * LOGIN PAGE - REDUX INTEGRATED VERSION
 * 
 * This is an example of how to integrate Redux into the Login component
 * Replace the existing Login.js with this pattern
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { 
    login, 
    selectIsAuthenticated, 
    selectAuthLoading, 
    selectAuthError,
    selectUserRole,
    clearError
} from '../redux/slices/authSlice';

const LoginRedux = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    // Redux state
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const loading = useSelector(selectAuthLoading);
    const error = useSelector(selectAuthError);
    const userRole = useSelector(selectUserRole);
    
    // Local state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && userRole) {
            const redirectPath = userRole === 'traveler' ? '/dashboard' : '/owner/dashboard';
            navigate(redirectPath);
        }
    }, [isAuthenticated, userRole, navigate]);

    // Clear error on unmount
    useEffect(() => {
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Dispatch Redux login action
        const result = await dispatch(login({ email, password }));
        
        if (login.fulfilled.match(result)) {
            // Login successful - Redux will update state
            // Navigation handled by useEffect above
            console.log('✅ Login successful via Redux');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900">
                        Sign in to your account
                    </h2>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {/* Redux Error Display */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="relative mt-1">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-red-700 focus:outline-none disabled:opacity-50"
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>

                    <div className="text-center">
                        <Link to="/signup" className="font-medium text-primary hover:text-red-700">
                            Don't have an account? Sign up
                        </Link>
                    </div>
                </form>

                {/* Redux DevTools indicator */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="text-xs text-gray-500 text-center mt-4">
                        🔧 Redux DevTools Active
                    </div>
                )}
            </div>
        </div>
    );
};

export default LoginRedux;

