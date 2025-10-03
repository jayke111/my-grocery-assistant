import React, { useState, useEffect } from 'react';
import { useAppContext } from '../AppContext';
import { LoadingSpinner, ErrorMessage, Icon, CopyButton, ProTeaser } from './UIComponents';
import { hasItems } from '../utils';
import { InitialListInput } from './InitialListInput';

export const ListManager = ({ listData, onSort, onClear, isGuest }) => {
    const {
        isPremium, handleToggleCheck, handleEditStart, handleEditSave,
        handleEditChange, handleDeleteItem, handleResort, handleAddNewItem,
        newItem, setNewItem, needsResort, isLoading, error, inputError,
        editingItem, categoryOrder, generatePlainTextList, setShowAddMealToListModal,
        setInputError, setError,
        suggestedItems, setSuggestedItems, isSuggestingItems, handleSuggestItems,
        mealIdea, isGeneratingMeal, handleGetMealIdea,
        handleSaveMealIdea,
        handleUpdateListName
    } = useAppContext();

    const [isSavingMeal, setIsSavingMeal] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleText, setTitleText] = useState(listData?.name || '');

    useEffect(() => {
        setTitleText(listData?.name || '');
    }, [listData]);


    if (!listData && !isGuest) {
        return <LoadingSpinner />;
    }

    const currentListItems = listData?.items;

    const handleSuggestionClick = (suggestion) => {
        setNewItem(prev => prev ? `${prev}\n${suggestion}` : suggestion);
        setSuggestedItems(prev => prev.filter(item => item !== suggestion));
    };

    const onSaveMealClick = async () => {
        if (!mealIdea) return;
        setIsSavingMeal(true);
        await handleSaveMealIdea(mealIdea);
        setTimeout(() => setIsSavingMeal(false), 2000);
    };

    const handleTitleSave = () => {
        if (titleText.trim() && titleText !== listData.name) {
            handleUpdateListName(listData.id, titleText.trim());
        }
        setIsEditingTitle(false);
    };

    return (
        hasItems(listData) ? (
            <div className="space-y-6">
                {error && !inputError && <ErrorMessage message={error} />}

                <div className="text-center">
                    {isEditingTitle ? (
                        <input
                            type="text"
                            value={titleText}
                            onChange={(e) => setTitleText(e.target.value)}
                            onBlur={handleTitleSave}
                            onKeyPress={(e) => { if (e.key === 'Enter') handleTitleSave(); }}
                            className="text-2xl font-bold text-center text-gray-800 bg-gray-100 border-b-2 border-blue-500 outline-none"
                            autoFocus
                        />
                    ) : (
                        <h2 onClick={() => !isGuest && setIsEditingTitle(true)} className={`text-2xl font-bold text-center text-gray-800 ${!isGuest ? 'cursor-pointer hover:text-blue-600' : ''}`}>
                            {listData.name || "Your Organized List"} {!isGuest && '✏️'}
                        </h2>
                    )}
                </div>

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
                        <button onClick={handleSuggestItems} disabled={isSuggestingItems || isLoading} className="flex-1 bg-teal-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-teal-600 disabled:bg-teal-300 transition" title="Suggest items based on your list">✨ Suggest</button>
                      </div>
                  </div>
                  {isSuggestingItems && <LoadingSpinner small />}
                  {suggestedItems.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                          {suggestedItems.map((suggestion, i) => (
                              <button key={i} onClick={() => handleSuggestionClick(suggestion)} className="bg-teal-100 text-teal-800 text-sm font-medium px-3 py-1 rounded-full hover:bg-teal-200 transition">+ {suggestion}</button>
                          ))}
                      </div>
                  )}
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
                                                    {/* --- MODIFIED: Removed (isPremium || isGuest) condition --- */}
                                                    <input type="checkbox" checked={item.checked} onChange={() => handleToggleCheck(category, index)} className="h-5 w-5 mt-1 rounded border-gray-400 text-blue-600 focus:ring-blue-500 cursor-pointer"/>
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
                  <button onClick={handleGetMealIdea} disabled={isGeneratingMeal || isLoading} className="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-purple-300 transition-all">✨ Get Meal Idea</button>
                  {isGeneratingMeal && <LoadingSpinner small />}
                  {mealIdea && mealIdea.title && (
                      <div className="mt-4 p-4 bg-white rounded-md border">
                          <div className="flex justify-between items-center mb-2">
                              <h4 className="font-semibold text-lg text-purple-800">{mealIdea.title}</h4>
                              <button
                                onClick={onSaveMealClick}
                                disabled={isSavingMeal}
                                className={`text-xs font-bold py-1 px-3 rounded-full transition ${isSavingMeal ? 'bg-green-200 text-green-800' : 'bg-purple-200 text-purple-800 hover:bg-purple-300'}`}
                              >
                                {isSavingMeal ? 'Saved!' : 'Save as Meal Template'}
                              </button>
                          </div>
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

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <CopyButton textToCopy={generatePlainTextList()} />
                    <button
                        onClick={onClear}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-x-2 py-3 px-4 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-red-500 hover:text-white transition-all duration-300"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Start New List
                    </button>
                </div>
            </div>
        ) : (
            <>
                <InitialListInput onSort={onSort} onClear={onClear} isLoading={isLoading} error={error} inputError={inputError} setInputError={setInputError} setError={setError} listName={listData?.name || "New List"} isGuest={isGuest} />
                {isGuest && <ProTeaser />}
            </>
        )
    );
};