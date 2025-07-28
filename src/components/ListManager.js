import React from 'react';
import { Icon, ErrorMessage, LoadingSpinner, CopyButton } from './UIComponents';
import { InitialListInput } from './InitialListInput';
import { useAppContext } from '../AppContext';
import { hasItems } from '../utils';
import { ComingSoon } from './ComingSoon';

export const ListManager = ({ listData, onSort, onClear, isGuest, isPremium, handleToggleCheck, handleEditStart, handleEditSave, handleEditChange, handleDeleteItem, handleResort, handleAddNewItem, newItem, setNewItem, needsResort, isLoading, error, inputError, editingItem, categoryOrder, generatePlainTextList, setShowAddMealToListModal, setInputError, setError }) => {
    
    const { 
        mealIdea, isGeneratingMeal, handleGetMealIdea, error: aiError 
    } = useAppContext();

    if (!listData && !isGuest) {
        return <LoadingSpinner />;
    }

    const currentListItems = listData?.items;

    const handleGetMealIdeaClick = () => {
        handleGetMealIdea();
    };

    return (
        hasItems(listData) ? (
            <div className="space-y-6">
                {error && !inputError && <ErrorMessage message={error} />}
                {aiError && <ErrorMessage message={aiError} />}
                <h2 className="text-2xl font-bold text-center text-gray-800">{listData.name || "Your Organized List"}</h2>
                
                {listData.plannedMeals && listData.plannedMeals.length > 0 && (
                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                        <p className="text-sm font-semibold text-indigo-800">Meals for this list: <span className="font-normal">{listData.plannedMeals.join(', ')}</span></p>
                    </div>
                )}

                {needsResort && !isLoading && (
                    <div className="p-3 bg-orange-100 border border-orange-300 rounded-lg flex items-center justify-between">
                        <p className="text-sm text-orange-800 font-medium">Your list might need re-sorting.</p>
                        <button onClick={handleResort} className="bg-orange-500 text-white text-sm font-bold py-1 px-3 rounded-md hover:bg-orange-600 transition">Re-Sort Now</button>
                    </div>
                )}
                {isLoading && <LoadingSpinner small/>}
                
                {!isGuest && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <button onClick={() => setShowAddMealToListModal(true)} className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition">🍳 Add Meal to List</button>
                    </div>
                )}

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <label htmlFor="new-item" className="block text-sm font-medium text-gray-700 mb-2">Add more items:</label>
                  <div className="flex flex-col sm:flex-row sm:space-x-2">
                      <textarea id="new-item" rows="2" className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 mb-2 sm:mb-0" placeholder="Type here or click suggestions below" value={newItem} onChange={(e) => setNewItem(e.target.value)} />
                      <div className="flex space-x-2">
                        <button onClick={() => handleAddNewItem(newItem)} disabled={isLoading} className="flex-1 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 transition">Add</button>
                        {/* The Suggest button is now part of the AI Context and doesn't need to be here */}
                      </div>
                  </div>
                </div>

                {categoryOrder.map(category => {
                    const items = currentListItems ? currentListItems[category] : [];
                    if (items && items.length > 0) {
                        return (
                            <div key={category} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                                <h3 className="text-xl font-semibold mb-3 flex items-center text-gray-700"><Icon category={category} />{category}</h3>
                                <table className="w-full">
                                    <tbody>
                                        {items.map((item, index) => (
                                            <tr key={`${category}-${index}-${item.name}`}>
                                                <td className="w-8 py-1 align-top">
                                                    {/* FIX: Show checkbox if user is premium OR a guest */}
                                                    {(isPremium || isGuest) && <input type="checkbox" checked={item.checked} onChange={() => handleToggleCheck(category, index)} className="h-5 w-5 mt-1 rounded border-gray-400 text-blue-600 focus:ring-blue-500 cursor-pointer"/>}
                                                </td>
                                                <td className="py-1">
                                                    {editingItem?.category === category && editingItem?.index === index ? (
                                                        <input type="text" value={item.name} onChange={(e) => handleEditChange(e.target.value, category, index)} onBlur={handleEditSave} onKeyPress={(e) => { if (e.key === 'Enter') handleEditSave() }} autoFocus className="p-1 rounded-md border-gray-300 shadow-sm w-full"/>
                                                    ) : (
                                                        <div className="flex justify-between items-center w-full">
                                                            <span className={`cursor-pointer flex-grow ${item.checked ? 'line-through text-gray-400' : ''}`} onClick={() => handleEditStart(category, index)}>{item.name}</span>
                                                            <div className="flex items-center flex-shrink-0 ml-4 space-x-3">
                                                                <svg onClick={() => handleEditStart(category, index)} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 hover:text-blue-600 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg>
                                                                <svg onClick={() => handleDeleteItem(category, index)} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 hover:text-red-600 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    }
                    return null;
                })}
                
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <button onClick={handleGetMealIdeaClick} disabled={isGeneratingMeal || isLoading} className="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-purple-300 transition-all">✨ Get Meal Idea</button>
                  {isGeneratingMeal && <LoadingSpinner small />}
                  {mealIdea && mealIdea.title && (
                      <div className="mt-4 p-4 bg-white rounded-md border">
                          <h4 className="font-semibold text-lg text-purple-800">{mealIdea.title}</h4>
                          <div className="mt-4">
                              <h5 className="font-semibold text-sm">You have:</h5>
                              <ul className="list-disc list-inside text-sm text-gray-600">
                                  {mealIdea.has.map((item, i) => <li key={i}>{item}</li>)}
                              </ul>
                          </div>
                          <div className="mt-4">
                              <h5 className="font-semibold text-sm">You might need:</h5>
                              <ul className="list-none space-y-2 mt-2">
                                  {mealIdea.needs.map((item, i) => (
                                      <li key={i} className="flex items-center justify-between">
                                          <span className="text-sm text-gray-800">{item}</span>
                                          <button 
                                            onClick={() => handleAddNewItem(item)} 
                                            disabled={isGuest}
                                            className="text-xs bg-green-200 text-green-800 font-bold py-1 px-3 rounded-full hover:bg-green-300 transition disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                                          >
                                            {isGuest ? '✨ Pro' : '+ Add'}
                                          </button>
                                      </li>
                                  ))}
                              </ul>
                          </div>
                          <div className="mt-4">
                                <h5 className="font-semibold text-sm">Instructions:</h5>
                                <p className="text-sm text-gray-600 whitespace-pre-wrap">{mealIdea.instructions}</p>
                          </div>
                      </div>
                  )}
                </div>
                
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <CopyButton textToCopy={generatePlainTextList()} />
                    <button onClick={onClear} disabled={isLoading} className="w-full bg-gray-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-700">Start New List</button>
                </div>

                {isGuest && <ComingSoon />}
            </div>
        ) : (
            <InitialListInput onSort={onSort} onClear={onClear} isLoading={isLoading} error={error} inputError={inputError} setInputError={setInputError} setError={setError} listName={listData?.name || "New List"} />
        )
    );
};
