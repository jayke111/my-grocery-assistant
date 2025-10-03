import React, { useState } from 'react';
import { useAppContext } from '../AppContext';

// This component displays a "Coming Soon" banner and a form to join a waitlist.
export const ComingSoon = () => {
    const { handleJoinWaitlist } = useAppContext();
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }
        setError('');
        handleJoinWaitlist(email);
        setSubmitted(true);
    };

    return (
        <div className="mt-8 p-6 bg-indigo-50 border border-indigo-200 rounded-lg text-center">
            <h3 className="text-xl font-bold text-indigo-800">CartSpark Pro is Coming Soon! ✨</h3>
            <p className="mt-2 text-gray-600">Unlock powerful new features to save even more time and money:</p>
            <ul className="mt-4 list-none inline-block text-left text-gray-600">
                <li className="mb-2">✔️ Save & Share Unlimited Lists</li>
                <li className="mb-2">✔️ Plan Your Weekly Meals</li>
                <li className="mb-2">✔️ Get an Ad-Free Experience</li>
            </ul>
            
            {submitted ? (
                <p className="mt-6 font-semibold text-green-600">Thanks for joining! We'll be in touch.</p>
            ) : (
                <>
                    <p className="mt-6 font-medium text-gray-700">Be the first to know when it launches!</p>
                    <form onSubmit={handleSubmit} className="mt-4 flex flex-col sm:flex-row justify-center items-center gap-2">
                        <input 
                            type="email" 
                            placeholder="Enter your email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="p-2 border border-gray-300 rounded-md w-full sm:w-auto flex-grow"
                        />
                        <button type="submit" className="w-full sm:w-auto bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 transition">
                            Join Waitlist
                        </button>
                    </form>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </>
            )}
        </div>
    );
};
