import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { login, selectAuthLoading, selectAuthError, clearError } from '../redux/slices/authSlice';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const dispatch = useDispatch();
    const loading = useSelector(selectAuthLoading);
    const reduxError = useSelector(selectAuthError);
    const navigate = useNavigate();

    // Clear errors on mount
    useEffect(() => {
        dispatch(clearError());
        setError('');
    }, [dispatch]);

    // Display Redux errors if they exist
    useEffect(() => {
        if (reduxError) {
            setError(reduxError);
        }
    }, [reduxError]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        dispatch(clearError());

        try {
            const user = await dispatch(login({ email, password })).unwrap();
            // Redirect based on role
            if (user && user.role) {
                if (user.role === 'owner') {
                    navigate('/owner/dashboard');
                } else {
                    navigate('/dashboard');
                }
            }
        } catch (err) {
            const errorMessage = typeof err === 'string' ? err : (err?.message || 'Login failed. Please try again.');
            setError(errorMessage);
            console.error('Login error:', err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-3xl font-bold text-dark mb-6 text-center">Login to Airbnb</h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-dark mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray rounded-lg focus:outline-none focus:border-primary"
                            placeholder="your@email.com"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-dark mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-2 pr-12 border border-gray rounded-lg focus:outline-none focus:border-primary"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-dark hover:text-primary transition"
                            >
                                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-3 rounded-lg hover:bg-red-600 transition font-semibold disabled:opacity-50"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p className="mt-6 text-center text-gray-dark">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-primary hover:underline font-semibold">
                        Sign up
                    </Link>
                </p>

                <div className="mt-6 p-4 rounded-lg">
                    <p className="text-sm text-gray-dark mb-2 font-semibold">Test Accounts:</p>
                    <p className="text-xs text-gray-dark">Traveler: traveler@test.com / password123</p>
                    <p className="text-xs text-gray-dark">Owner: owner@test.com / password123</p>
                </div>
            </div>
        </div>
    );
};

export default Login;

