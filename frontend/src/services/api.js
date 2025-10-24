import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true
});

// Properties
export const searchProperties = (params) => api.get('/properties/search', { params });
export const getPropertyById = (id) => api.get(`/properties/${id}`);
export const createProperty = (data) => api.post('/properties', data);
export const updateProperty = (id, data) => api.put(`/properties/${id}`, data);
export const deleteProperty = (id) => api.delete(`/properties/${id}`);
export const getOwnerProperties = () => api.get('/properties/owner/my-properties');
export const uploadPropertyImages = (formData) => api.post('/properties/upload-images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

// Bookings
export const createBooking = (data) => api.post('/bookings', data);
export const getTravelerBookings = () => api.get('/bookings/traveler');
export const getOwnerBookings = () => api.get('/bookings/owner');
export const getBookingById = (id) => api.get(`/bookings/${id}`);
export const acceptBooking = (id) => api.put(`/bookings/${id}/accept`);
export const cancelBooking = (id) => api.put(`/bookings/${id}/cancel`);

// User
export const getProfile = () => api.get('/users/profile');
export const updateProfile = (data) => api.put('/users/profile', data);
export const uploadProfilePicture = (formData) => api.post('/users/profile-picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const addFavorite = (propertyId) => api.post('/users/favorites', { propertyId });
export const removeFavorite = (propertyId) => api.delete(`/users/favorites/${propertyId}`);
export const getFavorites = () => api.get('/users/favorites');

export default api;
