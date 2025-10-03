import React, { useState, useMemo } from 'react';
import { useAppContext } from '../AppContext';
import { mealSuggestions } from '../mealSuggestions'; // Import our new data

export const MealSuggestionsModal = () => {
    const { showSuggestionsModal, setShowSuggestionsModal, handleAddSuggestedMeal } = useAppContext();
    // --- MODIFIED: Added a second state for the new filter type ---
    const [activeDietaryFilter, setActiveDietaryFilter] = useState('all');
    const [activeMealTypeFilter, setActiveMealTypeFilter] = useState('all');
    
    const [addedMeals, setAddedMeals] = useState([]);

    const dietaryFilters = ['all', 'gluten-free', 'lactose-free', 'vegetarian', 'low-sodium', 'low-histamine'];
    // --- ADDED: New array for meal type filters ---
    const mealTypeFilters = ['all', 'breakfast', 'lunch', 'dinner'];

    const filteredMeals = useMemo(() => {
        let meals = mealSuggestions;

        // Apply dietary filter
        if (activeDietaryFilter !== 'all') {
            meals = meals.filter(meal => meal.tags.includes(activeDietaryFilter));
        }

        // Apply meal type filter
        if (activeMealTypeFilter !== 'all') {
            meals = meals.filter(meal => meal.tags.includes(activeMealTypeFilter));
        }

        return meals;
    }, [activeDietaryFilter, activeMealTypeFilter]);

    const handleAddClick = (meal) => {
        handleAddSuggestedMeal(meal);
        setAddedMeals(prev => [...prev, meal.name]); // Track added meals
    };

    if (!showSuggestionsModal) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Add a Meal from Suggestions</h3>
                    <button onClick={() => setShowSuggestionsModal(false)} className="text-gray-500 hover:text-gray-800 font-bold text-2xl">&times;</button>
                </div>
                
                {/* --- MODIFIED: Created two separate filter sections --- */}
                <div className="space-y-3 mb-4">
                    <div>
                        <p className="text-sm font-semibold text-gray-600 mb-2">Filter by Diet:</p>
                        <div className="flex flex-wrap gap-2">
                            {dietaryFilters.map(filter => (
                                <button 
                                    key={filter}
                                    onClick={() => setActiveDietaryFilter(filter)}
                                    className={`px-3 py-1 text-sm font-semibold rounded-full transition ${activeDietaryFilter === filter ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                >
                                    {filter.charAt(0).toUpperCase() + filter.slice(1).replace('-', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-600 mb-2">Filter by Meal Type:</p>
                        <div className="flex flex-wrap gap-2">
                            {mealTypeFilters.map(filter => (
                                <button 
                                    key={filter}
                                    onClick={() => setActiveMealTypeFilter(filter)}
                                    className={`px-3 py-1 text-sm font-semibold rounded-full transition ${activeMealTypeFilter === filter ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                >
                                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <ul className="space-y-3 max-h-80 overflow-y-auto">
                    {filteredMeals.length > 0 ? filteredMeals.map(meal => (
                        <li key={meal.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                            <div>
                                <p className="font-semibold">{meal.name}</p>
                                <p className="text-xs text-gray-500">{meal.ingredients.join(', ')}</p>
                            </div>
                            <button 
                                onClick={() => handleAddClick(meal)}
                                disabled={addedMeals.includes(meal.name)}
                                className="ml-4 text-sm font-bold py-1 px-3 rounded-full transition bg-green-200 text-green-800 hover:bg-green-300 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                            >
                                {addedMeals.includes(meal.name) ? 'Added' : '+ Add'}
                            </button>
                        </li>
                    )) : (
                        <p className="text-center text-gray-500 py-4">No meals match the selected filters.</p>
                    )}
                </ul>
            </div>
        </div>
    );
};
