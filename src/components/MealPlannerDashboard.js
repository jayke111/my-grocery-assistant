import React, { useState } from 'react';
import { useAppContext } from '../AppContext';

export const MealPlannerDashboard = () => {
    const { 
        setPage, mealPlan, userMeals, handleRemoveMealFromPlan, 
        handleAddMealToPlan, handleGenerateShoppingList, isLoading, 
        isUpdatingMealPlan, handleClearMealPlan 
    } = useAppContext();
    
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const mealTypes = ["breakfast", "lunch", "dinner"];

    // --- MODIFIED: State now tracks both the day and meal type for the dropdown ---
    const [openDropdown, setOpenDropdown] = useState({ day: null, type: null });

    const handleAddMealClick = (day, type) => {
        if (openDropdown.day === day && openDropdown.type === type) {
            setOpenDropdown({ day: null, type: null }); // Close if already open
        } else {
            setOpenDropdown({ day, type }); // Open new one
        }
    };

    const handleSelectMeal = (meal, day, type) => {
        handleAddMealToPlan(meal, day, type);
        setOpenDropdown({ day: null, type: null }); // Close dropdown
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex border-b mb-6">
                <button onClick={() => setPage('home')} className="flex-1 py-2 text-center font-semibold text-gray-500 hover:text-blue-600">My Lists</button>
                <button onClick={() => setPage('meals')} className="flex-1 py-2 text-center font-semibold text-gray-500 hover:text-blue-600">My Meals</button>
                <button className="flex-1 py-2 text-center font-semibold border-b-2 border-blue-600 text-blue-600">Meal Plan</button>
            </div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Weekly Meal Planner</h2>
                <button 
                    onClick={handleClearMealPlan} 
                    className="text-sm text-red-500 hover:text-red-700 font-semibold"
                    disabled={isUpdatingMealPlan}
                >
                    Clear Week
                </button>
            </div>
            <div className="space-y-4">
                {daysOfWeek.map(day => (
                    <div key={day} className="p-4 bg-gray-50 rounded-lg border">
                        <h3 className="font-bold text-lg">{day}</h3>
                        {/* --- MODIFIED: Loop through meal types to create sections --- */}
                        <div className="mt-2 space-y-4">
                            {mealTypes.map(type => (
                                <div key={type} className="relative">
                                    <p className="text-xs font-bold uppercase text-gray-500">{type}</p>
                                    <div className="mt-1 space-y-2">
                                        {mealPlan?.days[day]?.[type] && mealPlan.days[day][type].length > 0 ? (
                                            <ul className="list-none p-0 m-0 space-y-1">
                                                {mealPlan.days[day][type].map((meal, index) => (
                                                    <li key={`${meal.id}-${index}`} className="flex justify-between items-center bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
                                                        <span>{meal.name}</span>
                                                        <button onClick={() => handleRemoveMealFromPlan(day, type, index)} disabled={isUpdatingMealPlan} className="ml-2 text-indigo-600 hover:text-indigo-800 font-bold disabled:opacity-50">&times;</button>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-xs text-gray-400 italic">No {type} planned.</p>
                                        )}
                                    </div>
                                    <button onClick={() => handleAddMealClick(day, type)} disabled={isUpdatingMealPlan} className="mt-2 text-sm text-blue-600 hover:underline disabled:opacity-50">+ Add {type.charAt(0).toUpperCase() + type.slice(1)}</button>
                                    {openDropdown.day === day && openDropdown.type === type && (
                                        <div className="absolute z-10 mt-2 w-full bg-white rounded-md shadow-lg border max-h-48 overflow-y-auto">
                                            {userMeals && userMeals.length > 0 ? (
                                                <ul className="divide-y divide-gray-100">
                                                    {userMeals.map(meal => (
                                                        <li key={meal.id}>
                                                            <button onClick={() => handleSelectMeal(meal, day, type)} className="w-full text-left p-3 text-sm hover:bg-blue-50 transition">
                                                                {meal.name}
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-xs text-gray-500 text-center p-4">You haven't created any meal templates yet.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={handleGenerateShoppingList} disabled={isLoading || isUpdatingMealPlan} className="mt-6 w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition">
                {isLoading || isUpdatingMealPlan ? "Updating..." : "Generate Shopping List for this Week"}
            </button>
        </div>
    );
};
