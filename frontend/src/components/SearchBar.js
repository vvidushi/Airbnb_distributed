import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaSearch, FaFilter } from 'react-icons/fa';

const SearchBar = ({ onSearch }) => {
    const [location, setLocation] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [guests, setGuests] = useState(1);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        const searchParams = {
            location: location || undefined,
            startDate: startDate ? startDate.toISOString().split('T')[0] : undefined,
            endDate: endDate ? endDate.toISOString().split('T')[0] : undefined,
            guests: guests || undefined,
            minPrice: minPrice || undefined,
            maxPrice: maxPrice || undefined,
            sortBy: sortBy || undefined
        };
        console.log('Search params:', searchParams);
        onSearch(searchParams);
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
            <form onSubmit={handleSearch}>
                {/* Main Search Bar */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-dark mb-2">
                            Location
                        </label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Where are you going?"
                            className="w-full px-4 py-2 border border-gray rounded-lg focus:outline-none focus:border-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-dark mb-2">
                            Check In
                        </label>
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            selectsStart
                            startDate={startDate}
                            endDate={endDate}
                            minDate={new Date()}
                            placeholderText="Add dates"
                            className="w-full px-4 py-2 border border-gray rounded-lg focus:outline-none focus:border-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-dark mb-2">
                            Check Out
                        </label>
                        <DatePicker
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            selectsEnd
                            startDate={startDate}
                            endDate={endDate}
                            minDate={startDate || new Date()}
                            placeholderText="Add dates"
                            className="w-full px-4 py-2 border border-gray rounded-lg focus:outline-none focus:border-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-dark mb-2">
                            Guests
                        </label>
                        <select
                            value={guests}
                            onChange={(e) => setGuests(parseInt(e.target.value))}
                            className="w-full px-4 py-2 border border-gray rounded-lg focus:outline-none focus:border-primary"
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                                <option key={num} value={num}>{num} Guest{num > 1 ? 's' : ''}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            type="submit"
                            className="w-full bg-primary text-white px-6 py-2 rounded-lg hover:bg-red-600 transition flex items-center justify-center space-x-2"
                        >
                            <FaSearch />
                            <span>Search</span>
                        </button>
                    </div>
                </div>

                {/* Filters Toggle Button */}
                <div className="flex justify-between items-center border-t pt-4">
                    <button
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className="text-primary hover:text-red-600 flex items-center space-x-2 font-medium"
                    >
                        <FaFilter />
                        <span>{showFilters ? 'Hide Filters' : 'More Filters'}</span>
                    </button>
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-dark mb-2">
                                    Min Price (per night)
                                </label>
                                <input
                                    type="number"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    placeholder="$0"
                                    min="0"
                                    className="w-full px-4 py-2 border border-gray rounded-lg focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-dark mb-2">
                                    Max Price (per night)
                                </label>
                                <input
                                    type="number"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    placeholder="$1000"
                                    min="0"
                                    className="w-full px-4 py-2 border border-gray rounded-lg focus:outline-none focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-dark mb-2">
                                    Sort By
                                </label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray rounded-lg focus:outline-none focus:border-primary"
                                >
                                    <option value="">Default (Newest)</option>
                                    <option value="price_low">Price: Low to High</option>
                                    <option value="price_high">Price: High to Low</option>
                                    <option value="newest">Newest First</option>
                                </select>
                            </div>
                        </div>
                        
                        {/* Apply Filters Button */}
                        <div className="mt-4 flex justify-end">
                            <button
                                type="submit"
                                className="bg-primary text-white px-8 py-2 rounded-lg hover:bg-red-600 transition font-semibold"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default SearchBar;

