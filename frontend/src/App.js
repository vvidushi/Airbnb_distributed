import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import backdropImage from './travel_backdrop.jpeg';

// Auth pages
import Login from './pages/Login';
import Signup from './pages/Signup';

// Traveler pages
import Dashboard from './pages/Dashboard';
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
            backgroundColor: '#fce7f3',
            minHeight: '100vh',
            position: 'relative'
          }}
        >
          <Navbar />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Traveler routes */}
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

