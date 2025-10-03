import React from 'react';

// This component is a pop-up that allows users to add all ingredients 
// from a saved meal to their current grocery list.
export const AddMealToListModal = ({ userMeals, handleAddMealToList, setShowAddMealToListModal }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add a Meal's Ingredients to Your List</h3>
            <div className="max-h-64 overflow-y-auto">
                {userMeals && userMeals.length > 0 ? (
                    <ul className="space-y-2">
                        {userMeals.map(meal => (
                            <li key={meal.id}>
                                <button 
                                    onClick={() => handleAddMealToList(meal)} 
                                    className="w-full text-left p-3 bg-gray-100 hover:bg-blue-100 rounded-md transition"
                                >
                                    <p className="font-semibold">{meal.name}</p>
                                    <p className="text-xs text-gray-600">{meal.ingredients.join(', ')}</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-600 text-center py-4">You haven't created any meal templates yet. Go to the "My Meals" tab to create one.</p>
                )}
            </div>
            <button 
                onClick={() => setShowAddMealToListModal(false)} 
                className="mt-6 w-full bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition"
            >
                Cancel
            </button>
        </div>
    </div>
);
