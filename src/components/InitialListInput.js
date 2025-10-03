import React, { useState } from 'react';
import { ErrorMessage } from './UIComponents';

export const InitialListInput = ({ onSort, onClear, isLoading, error, inputError, setInputError, setError, listName, isGuest }) => {
    const [rawList, setRawList] = useState('');

    const handleSortClick = () => {
        if (!rawList.trim()) {
            setError("Please enter at least one item to start your list.");
            setInputError(true);
            return;
        }
        onSort(rawList);
    };

    return (
        <>
            {error && inputError && <ErrorMessage message={error} />}
            <div className="w-full">
                <label htmlFor="grocery-list" className="block text-sm font-medium text-gray-700">Enter items for "{listName}"</label>
                <p className="text-xs text-gray-500 mb-2">(e.g., bullet points or comma-separated)</p>
                <textarea
                    id="grocery-list"
                    rows="8"
                    className={`p-3 w-full text-base border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition ${inputError ? 'border-red-500 ring-red-500' : 'border-gray-300'}`}
                    placeholder="- Apples&#10;- Milk&#10;- Bread&#10;- Paper towels"
                    value={rawList}
                    onChange={(e) => setRawList(e.target.value)}
                />
            </div>
            <div className="mt-4">
                <button onClick={handleSortClick} disabled={isLoading} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700">
                    Sort This List!
                </button>
            </div>

            {/* --- FIX: Only show informational text for guest users --- */}
            {isGuest && (
                <div className="mt-16 text-gray-700">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-800">How It Works</h2>
                        <p className="mt-2 text-gray-500">Transform your shopping list in seconds.</p>
                    </div>
                    <div className="mt-10 grid md:grid-cols-3 gap-10 text-center">
                        <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-500 text-white font-bold text-xl mb-4">1</div>
                            <h3 className="font-bold text-lg">Enter Your List</h3>
                            <p className="text-sm text-gray-600 mt-1">Type or paste your grocery list in any order.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-500 text-white font-bold text-xl mb-4">2</div>
                            <h3 className="font-bold text-lg">Sort Instantly</h3>
                            <p className="text-sm text-gray-600 mt-1">Our AI organizes your items by grocery store category.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-500 text-white font-bold text-xl mb-4">3</div>
                            <h3 className="font-bold text-lg">Shop Smarter</h3>
                            <p className="text-sm text-gray-600 mt-1">Save time with an organized list, get meal ideas, and more!</p>
                        </div>
                    </div>

                    <hr className="my-16 border-gray-200" />

                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-800">Your Ultimate Shopping Companion</h2>
                        <p className="mt-2 max-w-xl mx-auto text-gray-500">CartSpark does more than just sort your list. It's packed with smart features to make every grocery trip easier.</p>
                    </div>
                    <div className="mt-12 space-y-10">
                        <div className="flex items-start gap-x-5">
                            <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center bg-purple-100 text-purple-600 rounded-lg text-2xl">✨</div>
                            <div>
                                <h3 className="font-bold text-lg">Meal Ideas</h3>
                                <p className="text-sm text-gray-600 mt-1">Stuck on what to make for dinner? Get instant recipe suggestions based on the items in your cart.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-x-5">
                            <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center bg-teal-100 text-teal-600 rounded-lg text-2xl">💡</div>
                            <div>
                                <h3 className="font-bold text-lg">Smart Suggestions</h3>
                                <p className="text-sm text-gray-600 mt-1">Forget something? Our AI suggests complementary items you might have missed, like getting garlic for your pasta sauce.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-x-5">
                            <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center bg-green-100 text-green-600 rounded-lg text-2xl">✅</div>
                            <div>
                                <h3 className="font-bold text-lg">Interactive Checklist</h3>
                                <p className="text-sm text-gray-600 mt-1">Check off items as you shop. Your list is automatically saved to your device so you can pick up right where you left off.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
