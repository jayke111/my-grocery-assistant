// src/components/RecipeImporter.js

import React, { useState } from 'react';
// ADD THESE TWO IMPORTS
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAppContext } from '../AppContext'; // To refresh the meal list

const RecipeImporter = ({ onCancel }) => { 
    const { refreshUserMeals } = useAppContext(); // Get the refresh function
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
            // --- THIS IS THE NEW API CALL LOGIC ---
            const functions = getFunctions();
            const importRecipe = httpsCallable(functions, 'importRecipeFromUrl');
            
            const result = await importRecipe({ url: url });

            if (result.data.success) {
                setSuccessMessage(`Successfully imported "${result.data.mealData.name}"!`);
                setUrl(''); // Clear the input on success
                await refreshUserMeals(); // Refresh the meal list on the dashboard
                setTimeout(() => onCancel(), 2000); // Close the importer after 2 seconds
            }
            // The cloud function will throw an error on failure, which is caught below.

        } catch (err) {
            console.error("Error importing recipe:", err);
            // Display a user-friendly message from the error thrown by the cloud function
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
