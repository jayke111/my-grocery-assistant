import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAppContext } from '../AppContext';
import { LoadingSpinner } from './UIComponents';

export const ShareListModal = ({ listId, listName, onClose }) => {
    const [recipientEmail, setRecipientEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [generatedLink, setGeneratedLink] = useState('');
    const [copied, setCopied] = useState(false);

    const handleGenerateLink = async () => {
        if (!recipientEmail) {
            setError('Please enter an email address.');
            return;
        }
        setIsLoading(true);
        setError('');
        setGeneratedLink('');

        try {
            const functions = getFunctions();
            const createShareInvite = httpsCallable(functions, 'createShareInvite');
            const result = await createShareInvite({ listId, recipientEmail });
            
            const inviteId = result.data.inviteId;
            const link = `${window.location.origin}/invite/${inviteId}`;
            setGeneratedLink(link);

        } catch (err) {
            console.error("Error creating invite:", err);
            setError(err.message || 'An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(generatedLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-sm">
                <h2 className="text-xl font-bold mb-4">Share "{listName}"</h2>
                
                {generatedLink ? (
                    <div>
                        <p className="text-sm text-gray-600 mb-2">Your shareable link is ready! Send it to {recipientEmail}.</p>
                        <input 
                            type="text"
                            readOnly
                            value={generatedLink}
                            className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                        />
                        <button 
                            onClick={handleCopyLink}
                            className={`w-full mt-4 py-2 px-4 rounded-lg font-semibold text-white transition ${copied ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {copied ? 'Copied!' : 'Copy Link'}
                        </button>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-gray-600 mb-2">Enter the email of the person you want to share this list with.</p>
                        <input
                            type="email"
                            placeholder="friend@example.com"
                            value={recipientEmail}
                            onChange={(e) => setRecipientEmail(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        />
                        
                        {isLoading ? (
                            <LoadingSpinner small />
                        ) : (
                            <button 
                                onClick={handleGenerateLink}
                                className="w-full mt-4 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 transition"
                            >
                                Generate Invite Link
                            </button>
                        )}
                    </>
                )}

                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                
                <button onClick={onClose} className="w-full mt-2 text-sm text-gray-500 hover:text-gray-800">
                    Cancel
                </button>
            </div>
        </div>
    );
};