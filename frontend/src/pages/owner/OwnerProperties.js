import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaEdit, FaPlus, FaBed, FaBath, FaPause, FaPlay, FaBan } from 'react-icons/fa';
import ConfirmModal from '../../components/ConfirmModal';
import {
    getOwnerProperties,
    selectOwnerProperties,
    selectOwnerPropertiesLoading,
    toggleSnoozeProperty,
    unlistOwnerProperty,
} from '../../redux/slices/propertiesSlice';

const OwnerProperties = () => {
    const dispatch = useDispatch();
    const properties = useSelector(selectOwnerProperties);
    const loading = useSelector(selectOwnerPropertiesLoading);
    const [activeTab, setActiveTab] = useState('active'); // 'active' | 'unlisted'
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
        type: 'warning',
        confirmText: 'Confirm',
    });

    useEffect(() => {
        dispatch(getOwnerProperties());
    }, [dispatch]);

    const handleSnooze = (id) => {
        const property = properties.find(p => p.id === id);
        if (!property) return;

        const isSnoozed = property.status === 'snoozed';

        setConfirmModal({
            isOpen: true,
            title: isSnoozed ? 'Reactivate listing?' : 'Snooze listing?',
            message: isSnoozed
                ? 'This will make your place visible to guests again on the site.'
                : 'This will temporarily hide your place from guests. Perfect for renovations or taking a break.',
            confirmText: isSnoozed ? 'Reactivate' : 'Snooze',
            type: isSnoozed ? 'success' : 'warning',
            onConfirm: async () => {
                try {
                    await dispatch(toggleSnoozeProperty(id)).unwrap();
                    await dispatch(getOwnerProperties());
                } catch (error) {
                    console.error('Error updating property status:', error);
                    alert('Failed to update property status');
                } finally {
                    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                }
            },
        });
    };

    const handleUnlist = (id) => {
        const property = properties.find(p => p.id === id);
        if (!property) return;

        setConfirmModal({
            isOpen: true,
            title: 'Unlist this place?',
            message:
                'This will remove your place from all search results and prevent new bookings. You can keep the data for your records.',
            confirmText: 'Unlist property',
            type: 'danger',
            onConfirm: async () => {
                try {
                    await dispatch(unlistOwnerProperty(id)).unwrap();
                    // Reload properties so updated status is reflected
                    await dispatch(getOwnerProperties());
                } catch (error) {
                    console.error('Error unlisting property:', error);
                    alert('Failed to unlist property');
                } finally {
                    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                }
            },
        });
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'active':
                return <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">Active</span>;
            case 'snoozed':
                return <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">Snoozed</span>;
            case 'unlisted':
                return <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">Unlisted</span>;
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    // Split properties by status for clearer sections
    const activeAndSnoozed = properties.filter(
        (p) => p.status === 'active' || p.status === 'snoozed' || !p.status
    );
    const unlisted = properties.filter((p) => p.status === 'unlisted');

    return (
        <div className="min-h-screen py-8">
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                type={confirmModal.type}
                onConfirm={confirmModal.onConfirm}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
            />

            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-bold text-dark">My Properties</h1>
                    <Link
                        to="/owner/properties/new"
                        className="flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-red-600 transition"
                    >
                        <FaPlus />
                        <span>Add New Property</span>
                    </Link>
                </div>

                {/* Tabs */}
                <div className="mb-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6">
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`pb-2 text-sm font-medium border-b-2 ${
                                activeTab === 'active'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            My Properties
                        </button>
                        <button
                            onClick={() => setActiveTab('unlisted')}
                            className={`pb-2 text-sm font-medium border-b-2 ${
                                activeTab === 'unlisted'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Unlisted
                        </button>
                    </nav>
                </div>

                {/* Active / Snoozed tab */}
                {activeTab === 'active' && (
                properties.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <p className="text-xl text-gray-dark mb-4">You haven't added any properties yet</p>
                        <Link
                            to="/owner/properties/new"
                            className="inline-flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-red-600 transition"
                        >
                            <FaPlus />
                            <span>Add Your First Property</span>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeAndSnoozed.map(property => (
                            <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="h-48 bg-gray-200">
                                    <img
                                        src={(() => {
                                            if (!property.images || property.images.length === 0) return 'https://via.placeholder.com/400x300';
                                            const img = property.images[0];
                                            return (img.startsWith('http://') || img.startsWith('https://')) ? img : `/uploads/${img}`;
                                        })()}
                                        alt={property.property_name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300' }}
                                    />
                                </div>

                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-semibold text-dark truncate flex-1">
                                            {property.property_name}
                                        </h3>
                                        {getStatusBadge(property.status)}
                                    </div>
                                    
                                    <p className="text-gray-dark mb-2">
                                        {property.city}, {property.country}
                                    </p>

                                    <div className="flex items-center space-x-4 text-sm text-gray-dark mb-3">
                                        <span className="flex items-center space-x-1">
                                            <FaBed />
                                            <span>{property.bedrooms}</span>
                                        </span>
                                        <span className="flex items-center space-x-1">
                                            <FaBath />
                                            <span>{property.bathrooms}</span>
                                        </span>
                                        <span className="text-sm capitalize">{property.property_type}</span>
                                    </div>

                                    <div className="mb-4">
                                        <span className="text-2xl font-bold text-dark">
                                            ${property.price_per_night}
                                        </span>
                                        <span className="text-sm text-gray-dark">/night</span>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex space-x-2">
                                            <Link
                                                to={`/owner/properties/edit/${property.id}`}
                                                className="flex-1 flex items-center justify-center space-x-2 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition"
                                            >
                                                <FaEdit />
                                                <span>Edit</span>
                                            </Link>
                                            <button
                                                onClick={() => handleSnooze(property.id)}
                                                className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition ${
                                                    property.status === 'snoozed' 
                                                        ? 'bg-green-500 text-white hover:bg-green-600' 
                                                        : 'bg-yellow-500 text-white hover:bg-yellow-600'
                                                }`}
                                                title={property.status === 'snoozed' ? 'Reactivate' : 'Snooze'}
                                            >
                                                {property.status === 'snoozed' ? <FaPlay /> : <FaPause />}
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => handleUnlist(property.id)}
                                            className="w-full flex items-center justify-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                                        >
                                            <FaBan />
                                            <span>Unlist Property</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}

                {/* Unlisted tab */}
                {activeTab === 'unlisted' && (
                    <div>
                        {unlisted.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-md p-8 text-center">
                                <p className="text-xl text-gray-dark mb-2">
                                    You don't have any unlisted properties.
                                </p>
                            </div>
                        ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {unlisted.map((property) => (
                                <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                    <div className="h-48 bg-gray-200">
                                        <img
                                            src={(() => {
                                                if (!property.images || property.images.length === 0)
                                                    return 'https://via.placeholder.com/400x300';
                                                const img = property.images[0];
                                                return (img.startsWith('http://') || img.startsWith('https://'))
                                                    ? img
                                                    : `/uploads/${img}`;
                                            })()}
                                            alt={property.property_name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/400x300';
                                            }}
                                        />
                                    </div>
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-semibold text-dark truncate flex-1">
                                                {property.property_name}
                                            </h3>
                                            {getStatusBadge(property.status)}
                                        </div>
                                        <p className="text-gray-dark mb-2">
                                            {property.city}, {property.country}
                                        </p>
                                        <div className="mb-4">
                                            <span className="text-2xl font-bold text-dark">
                                                ${property.price_per_night}
                                            </span>
                                            <span className="text-sm text-gray-dark">/night</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OwnerProperties;

