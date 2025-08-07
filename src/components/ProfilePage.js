import React, { useState, useEffect } from 'react';
import { useAppContext } from '../AppContext';

export const ProfilePage = () => {
    const { user, handleUpdateProfile, setPage } = useAppContext(); // --- ADDED: Get setPage from context ---
    const [displayName, setDisplayName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || '');
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        try {
            await handleUpdateProfile(displayName);
            setMessage('Profile updated successfully!');
        } catch (error) {
            setMessage('Failed to update profile. Please try again.');
        } finally {
            setIsLoading(false);
            setTimeout(() => setMessage(''), 3000); // Clear message after 3 seconds
        }
    };

    if (!user) {
        return null; // Or a loading spinner
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
            {/* --- ADDED: Back button for easy navigation --- */}
            <button onClick={() => setPage('home')} className="mb-6 text-blue-600 hover:text-blue-800 font-semibold">&larr; Back to My Lists</button>
            
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">My Profile</h2>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={user.email}
                        disabled
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                    />
                </div>
                <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">Display Name</label>
                    <input
                        type="text"
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                >
                    {isLoading ? 'Saving...' : 'Save Profile'}
                </button>
                {message && <p className="text-sm text-center text-green-600 mt-4">{message}</p>}
            </form>
        </div>
    );
};
