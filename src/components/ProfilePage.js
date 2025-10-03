import React, { useState, useEffect } from 'react';
import { useAppContext } from '../AppContext';
import { ErrorMessage } from './UIComponents'; // Import ErrorMessage

export const ProfilePage = () => {
    // Get the new function and subscription status from the context
    const { user, handleUpdateProfile, setPage, subscriptionStatus, handleManageSubscription, error, isLoading } = useAppContext();
    
    const [displayName, setDisplayName] = useState('');
    const [message, setMessage] = useState('');
    // We will use the main isLoading from context for the manage subscription button

    useEffect(() => {
        if (user) {
            setDisplayName(user.displayName || '');
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            await handleUpdateProfile(displayName);
            setMessage('Profile updated successfully!');
        } catch (error) {
            setMessage('Failed to update profile. Please try again.');
        } finally {
            setTimeout(() => setMessage(''), 3000);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <button onClick={() => setPage('home')} className="mb-6 text-blue-600 hover:text-blue-800 font-semibold">&larr; Back to My Lists</button>
            
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">My Profile</h2>
            
            {error && <ErrorMessage message={error} />}

            <div className="max-w-sm mx-auto">
                <form onSubmit={handleSubmit} className="space-y-4">
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

                {/* --- ADDED: Subscription Management Section --- */}
                {subscriptionStatus === 'active' && (
                    <div className="mt-8 pt-6 border-t">
                        <h3 className="text-lg font-bold text-gray-800 text-center">Subscription</h3>
                        <p className="text-center text-sm text-gray-600 mt-2">You are a CartSpark Pro member. Thank you for your support!</p>
                        <button
                            onClick={handleManageSubscription}
                            disabled={isLoading}
                            className="mt-4 w-full bg-gray-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-700 transition disabled:bg-gray-400"
                        >
                            {isLoading ? 'Loading...' : 'Manage Subscription'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
