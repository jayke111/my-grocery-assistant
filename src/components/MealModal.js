import React, { useState, useEffect } from 'react';
import { useAppContext } from '../AppContext';

// This is a specialized modal for creating and editing meals with two input fields.
export const MealModal = () => {
    const { mealModalConfig, setMealModalConfig } = useAppContext();
    const [name, setName] = useState('');
    const [ingredients, setIngredients] = useState('');

    useEffect(() => {
        if (mealModalConfig.isOpen) {
            setName(mealModalConfig.initialMeal?.name || '');
            setIngredients(mealModalConfig.initialMeal?.ingredients.join(', ') || '');
        }
    }, [mealModalConfig.isOpen, mealModalConfig.initialMeal]);

    const handleClose = () => {
        setMealModalConfig({ isOpen: false });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim() && ingredients.trim()) {
            mealModalConfig.onSubmit({ name, ingredients });
            handleClose();
        }
    };

    if (!mealModalConfig.isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-bold mb-4">{mealModalConfig.title}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="meal-name" className="block text-sm font-medium text-gray-700">Meal Name</label>
                        <input
                            type="text"
                            id="meal-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                            required
                            autoFocus
                        />
                    </div>
                    <div>
                        <label htmlFor="meal-ingredients" className="block text-sm font-medium text-gray-700">Ingredients</label>
                        <p className="text-xs text-gray-500 mb-1">Enter ingredients separated by commas.</p>
                        <textarea
                            id="meal-ingredients"
                            rows="4"
                            value={ingredients}
                            onChange={(e) => setIngredients(e.target.value)}
                            className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>
                    <div className="mt-6 flex justify-end gap-x-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                        >
                            {mealModalConfig.confirmText || 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
