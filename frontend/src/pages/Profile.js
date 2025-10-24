import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile, uploadProfilePicture } from '../services/api';
import { FaCamera } from 'react-icons/fa';

const Profile = () => {
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        phone: '',
        about_me: '',
        city: '',
        country: '',
        languages: '',
        gender: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const response = await getProfile();
            setProfile(response.data);
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setProfile({
            ...profile,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSaving(true);

        try {
            await updateProfile(profile);
            setSuccess('Profile updated successfully!');
        } catch (err) {
            setError('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profilePicture', file);

        try {
            const response = await uploadProfilePicture(formData);
            setProfile({
                ...profile,
                profile_pic: response.data.filename
            });
            setSuccess('Profile picture uploaded successfully!');
        } catch (error) {
            setError('Failed to upload profile picture');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-light flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    const countries = ['United States', 'Canada', 'United Kingdom', 'Australia', 'India', 'Germany', 'France', 'Japan', 'Other'];

    return (
        <div className="min-h-screen bg-gray-light py-8">
            <div className="container mx-auto px-4 max-w-3xl">
                <h1 className="text-4xl font-bold text-dark mb-8">My Profile</h1>

                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                        {success}
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-md p-8">
                    {/* Profile Picture */}
                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden">
                                {profile.profile_pic ? (
                                    <img
                                        src={`/uploads/${profile.profile_pic}`}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl text-gray-dark">
                                        {profile.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-red-600 transition">
                                <FaCamera />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-dark mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={profile.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray rounded-lg focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-dark mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={profile.email}
                                    disabled
                                    className="w-full px-4 py-2 border border-gray rounded-lg bg-gray-light cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-dark mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={profile.phone || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray rounded-lg focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-dark mb-2">
                                    Gender
                                </label>
                                <select
                                    name="gender"
                                    value={profile.gender || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray rounded-lg focus:outline-none focus:border-primary"
                                >
                                    <option value="">Select gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-dark mb-2">
                                    City
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={profile.city || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray rounded-lg focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-dark mb-2">
                                    Country
                                </label>
                                <select
                                    name="country"
                                    value={profile.country || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray rounded-lg focus:outline-none focus:border-primary"
                                >
                                    <option value="">Select country</option>
                                    {countries.map(country => (
                                        <option key={country} value={country}>{country}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-dark mb-2">
                                    Languages
                                </label>
                                <input
                                    type="text"
                                    name="languages"
                                    value={profile.languages || ''}
                                    onChange={handleChange}
                                    placeholder="e.g., English, Spanish, French"
                                    className="w-full px-4 py-2 border border-gray rounded-lg focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-dark mb-2">
                                    About Me
                                </label>
                                <textarea
                                    name="about_me"
                                    value={profile.about_me || ''}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full px-4 py-2 border border-gray rounded-lg focus:outline-none focus:border-primary"
                                    placeholder="Tell us about yourself..."
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full mt-6 bg-primary text-white py-3 rounded-lg hover:bg-red-600 transition font-semibold disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;

