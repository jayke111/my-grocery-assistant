import { useAppContext } from '../AppContext';
import { EmptyState, ProNav } from './UIComponents';

export const MealsDashboard = () => {
    const { userMeals, handleCreateNewMeal, handleEditMeal, handleDeleteMeal, setShowSuggestionsModal } = useAppContext();

    return (
        <div>
            <ProNav />
            <div className="bg-white p-6 rounded-b-2xl shadow-lg">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">My Meal Templates</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <button onClick={handleCreateNewMeal} className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition">+ Create New Meal</button>
                    <button onClick={() => setShowSuggestionsModal(true)} className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 transition">💡 Add from Suggestions</button>
                </div>

                {userMeals && userMeals.length > 0 ? (
                    <ul className="space-y-3">
                        {userMeals.map(meal => (
                            <li key={meal.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
                                <div className="min-w-0">
                                    <p className="font-semibold truncate">{meal.name}</p>
                                    <p className="text-sm text-gray-500 truncate">{meal.ingredients.join(', ')}</p>
                                </div>
                                <div className="flex items-center flex-shrink-0 ml-4">
                                    <button onClick={() => handleEditMeal(meal)} className="text-gray-500 hover:text-blue-700 p-2 rounded-full" title="Edit Meal">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg>
                                    </button>
                                    <button onClick={() => handleDeleteMeal(meal.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full" title="Delete Meal">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <EmptyState message="No meals saved yet" subMessage="Create meal templates to quickly add ingredients to your lists." />
                )}
            </div>
        </div>
    );
};
