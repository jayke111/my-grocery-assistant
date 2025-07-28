import React, { useState } from 'react';
import { useAppContext } from '../AppContext';

export const MealPlannerDashboard = () => {
    const { setPage, mealPlan, userMeals, handleRemoveMealFromPlan, handleAddMealToPlan, handleGenerateShoppingList, isLoading } = useAppContext();
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const [openDay, setOpenDay] = useState(null);

    const handleAddMealClick = (day) => {
        setOpenDay(openDay === day ? null : day); // Toggle dropdown
    };

    const handleSelectMeal = (meal, day) => {
        handleAddMealToPlan(meal, day);
        setOpenDay(null); // Close dropdown after selection
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex border-b mb-6">
                <button onClick={() => setPage('home')} className="flex-1 py-2 text-center font-semibold text-gray-500 hover:text-blue-600">My Lists</button>
                <button onClick={() => setPage('meals')} className="flex-1 py-2 text-center font-semibold text-gray-500 hover:text-blue-600">My Meals</button>
                <button className="flex-1 py-2 text-center font-semibold border-b-2 border-blue-600 text-blue-600">Meal Plan</button>
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Weekly Meal Planner</h2>
            <div className="space-y-4">
                {daysOfWeek.map(day => (
                    <div key={day} className="p-4 bg-gray-50 rounded-lg border relative">
                        <h3 className="font-bold text-lg">{day}</h3>
                        <div className="mt-2 space-y-2">
                            {mealPlan?.days[day]?.map((meal, index) => (
                                <div key={index} className="flex justify-between items-center bg-white p-2 rounded">
                                    <p>{meal.name}</p>
                                    <button onClick={() => handleRemoveMealFromPlan(day, index)} className="text-red-500 hover:text-red-700">&times;</button>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => handleAddMealClick(day)} className="mt-2 text-sm text-blue-600 hover:underline">+ Add Meal</button>
                        {openDay === day && (
                            <div className="absolute z-10 mt-2 w-full bg-white rounded-md shadow-lg border max-h-48 overflow-y-auto">
                                {userMeals && userMeals.length > 0 ? (
                                    <ul className="divide-y divide-gray-100">
                                        {userMeals.map(meal => (
                                            <li key={meal.id}>
                                                <button onClick={() => handleSelectMeal(meal, day)} className="w-full text-left p-3 text-sm hover:bg-blue-50 transition">
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
            <button onClick={handleGenerateShoppingList} disabled={isLoading} className="mt-6 w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition">
                {isLoading ? "Generating..." : "Generate Shopping List for this Week"}
            </button>
        </div>
    );
};
