import React, { useState } from 'react';
// --- THIS IS THE FIX: Import auth to get the user's token ---
import { auth } from '../firebase-config';
import { useAppContext } from '../AppContext';

const RecipeImporter = ({ onCancel }) => { 
    const { refreshUserMeals } = useAppContext();
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleImport = async (e) => {
        e.preventDefault();
        if (!url) {
            setError('Please enter a URL.');
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("You must be logged in to import recipes.");
            }

            // 1. Get the user's authentication token
            const token = await user.getIdToken();
            const functionUrl = 'https://us-central1-cartspark-85cbc.cloudfunctions.net/importRecipeFromUrl';

            // 2. Make a standard fetch request with the token in the headers
            const response = await fetch(functionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ data: { url: url } })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Request failed with status ${response.status}`);
            }

            const result = await response.json();
            const resultData = result.data; // The actual data is nested in the 'data' property

            if (resultData.success) {
                setSuccessMessage(`Successfully imported "${resultData.mealData.name}"!`);
                setUrl('');
                await refreshUserMeals();
                setTimeout(() => onCancel(), 2000);
            }

        } catch (err) {
            console.error("Error importing recipe:", err);
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="recipe-importer-container" style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px', margin: '20px 0', border: '1px solid #eee' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Import a Recipe from a URL</h3>
                <button onClick={onCancel} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#888' }}>&times;</button>
            </div>
            <form onSubmit={handleImport} style={{ marginTop: '15px' }}>
                <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.yourfavoriterecipesite.com/..."
                    className="w-full p-2 border rounded"
                    disabled={isLoading}
                />
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full mt-3 bg-purple-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-600 transition disabled:bg-gray-400"
                >
                    {isLoading ? 'Importing...' : 'Import Recipe'}
                </button>
            </form>
            {error && <p className="text-red-500 mt-3">{error}</p>}
            {successMessage && <p className="text-green-600 mt-3">{successMessage}</p>}
        </div>
    );
};

export default RecipeImporter;
