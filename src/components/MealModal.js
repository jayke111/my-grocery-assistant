import React, { useState, useEffect } from 'react';

export const MealModal = ({ isOpen, title, confirmText, initialMeal, onSubmit, onCancel }) => {
    const [name, setName] = useState('');
    const [ingredients, setIngredients] = useState('');
    // --- ADDED: State for the new instructions field ---
    const [instructions, setInstructions] = useState('');

    useEffect(() => {
        if (initialMeal) {
            setName(initialMeal.name || '');
            setIngredients(initialMeal.ingredients?.join(', ') || '');
            // --- ADDED: Populate instructions if they exist ---
            setInstructions(initialMeal.instructions || '');
        } else {
            setName('');
            setIngredients('');
            setInstructions('');
        }
    }, [initialMeal, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        // --- MODIFIED: Pass instructions back in the onSubmit callback ---
        onSubmit({ name, ingredients, instructions });
        onCancel(); // Close the modal after submit
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">{title}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="mealName" className="block text-sm font-medium text-gray-700">Meal Name</label>
                        <input
                            type="text"
                            id="mealName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700">Ingredients (comma-separated)</label>
                        <textarea
                            id="ingredients"
                            value={ingredients}
                            onChange={(e) => setIngredients(e.target.value)}
                            rows="3"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                    {/* --- ADDED: The new textarea for instructions --- */}
                    <div className="mb-6">
                        <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">Instructions (optional)</label>
                        <textarea
                            id="instructions"
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            rows="4"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">{confirmText}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
