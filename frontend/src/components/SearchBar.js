import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaSearch } from 'react-icons/fa';

const SearchBar = ({ onSearch }) => {
    const [location, setLocation] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [guests, setGuests] = useState(1);

    const handleSearch = (e) => {
        e.preventDefault();
        onSearch({
            location,
            startDate: startDate ? startDate.toISOString().split('T')[0] : null,
            endDate: endDate ? endDate.toISOString().split('T')[0] : null,
            guests
        });
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            </form>
        </div>
    );
};

export default SearchBar;

