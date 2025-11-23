import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectAuthLoading, selectUser } from '../redux/slices/authSlice';

/**
 * Redux-aware PrivateRoute
 * 
 * Use this for routes that should work with Redux authentication
 */
const PrivateRouteRedux = ({ children, role }) => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const loading = useSelector(selectAuthLoading);
    const user = useSelector(selectUser);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login-redux-example" />;
    }

    if (role && user.role !== role) {
        return <Navigate to={user.role === 'owner' ? '/owner/dashboard' : '/dashboard'} />;
    }

    return children;
};

export default PrivateRouteRedux;

