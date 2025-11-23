import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import PrivateRouteRedux from './components/PrivateRouteRedux';
import backgroundImage from './airbnb-background.jpg';

// Auth pages
import Login from './pages/Login';
import LoginRedux from './pages/Login-Redux-Example';
import Signup from './pages/Signup';

// Traveler pages
import Dashboard from './pages/Dashboard';
import DashboardRedux from './pages/Dashboard-Redux-Example';
import PropertyDetails from './pages/PropertyDetails';
import Bookings from './pages/Bookings';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';

// Owner pages
import OwnerDashboard from './pages/owner/OwnerDashboard';
import OwnerProperties from './pages/owner/OwnerProperties';
import OwnerBookings from './pages/owner/OwnerBookings';
import PropertyForm from './pages/owner/PropertyForm';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div 
          className="App" 
          style={{
            minHeight: '100vh',
            position: 'relative',
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        >
          <Navbar />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Redux-integrated routes */}
            <Route path="/login-redux-example" element={<LoginRedux />} />
            <Route 
              path="/dashboard-redux" 
              element={
                <PrivateRouteRedux role="traveler">
                  <DashboardRedux />
                </PrivateRouteRedux>
              } 
            />

            {/* Traveler routes (Context-based) */}
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute role="traveler">
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/property/:id" 
              element={
                <PrivateRoute role="traveler">
                  <PropertyDetails />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/bookings" 
              element={
                <PrivateRoute role="traveler">
                  <Bookings />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/favorites" 
              element={
                <PrivateRoute role="traveler">
                  <Favorites />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } 
            />

            {/* Owner routes */}
            <Route 
              path="/owner/dashboard" 
              element={
                <PrivateRoute role="owner">
                  <OwnerDashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/owner/properties" 
              element={
                <PrivateRoute role="owner">
                  <OwnerProperties />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/owner/properties/new" 
              element={
                <PrivateRoute role="owner">
                  <PropertyForm />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/owner/properties/edit/:id" 
              element={
                <PrivateRoute role="owner">
                  <PropertyForm />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/owner/bookings" 
              element={
                <PrivateRoute role="owner">
                  <OwnerBookings />
                </PrivateRoute>
              } 
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

