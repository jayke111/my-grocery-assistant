import React, { useState, useMemo, useEffect } from 'react';

// --- Helper Components ---

const Icon = ({ category }) => {
  const emojiMap = {
    'Produce': '🍎',
    'Dairy & Eggs': '🥛',
    'Meat & Seafood': '🥩',
    'Bakery': '🍞',
    'Pantry': '🥫',
    'Frozen Foods': '🧊',
    'Beverages': '🥤',
    'Household & Cleaning': '🧽',
    'Personal Care': '🧼',
    'Pets': '🐾',
    'Baby': '👶',
    'Miscellaneous': '🛒',
  };
  return <span className="text-2xl mr-3">{emojiMap[category] || '🛒'}</span>;
};

const Header = () => (
  <header className="text-center py-6 md:py-8">
    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600" style={{ fontFamily: "'Poppins', sans-serif" }}>
      My Grocery Assistant
    </h1>
    <p className="mt-3 text-lg text-gray-600">Shopping smarter, not harder.</p>
  </header>
);

const LoadingSpinner = ({ small = false }) => (
    <div className={`flex justify-center items-center ${small ? 'p-2' : 'p-8'}`}>
        <div className={`animate-spin rounded-full border-b-2 border-t-2 border-blue-500 ${small ? 'h-6 w-6' : 'h-12 w-12'}`}></div>
    </div>
);

const ErrorMessage = ({ message }) => (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md mb-4" role="alert">
        <p className="font-bold">Oops!</p>
        <p>{message}</p>
    </div>
);

const CopyButton = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
        document.body.removeChild(textArea);
    };

    return (
        <button
            onClick={handleCopy}
            className={`mt-6 w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 ${copied ? 'bg-green-500' : 'bg-gray-700 hover:bg-gray-800'}`}
        >
            {copied ? 'Copied!' : 'Copy Sorted List'}
        </button>
    );
};

const EmptyState = () => (
    <div className="text-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No list sorted yet</h3>
        <p className="mt-1 text-sm text-gray-500">Enter your grocery list above and click "Sort My List!"</p>
    </div>
);

// --- MODIFIED: Ad Banner with Live AdSense Code ---
const AdBanner = () => {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error("AdSense error:", e);
        }
    }, []);

    return (
        <div className="mt-8 mb-4 text-center">
            <ins className="adsbygoogle"
                 style={{ display: 'block' }}
                 data-ad-client="ca-pub-8248029170091518"
                 data-ad-slot="7187747884"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
        </div>
    );
};

const AffiliateLinks = () => (
    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h4 className="font-semibold text-center text-green-800">Get Your Groceries Delivered!</h4>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a href="#" target="_blank" rel="noopener noreferrer" className="block p-3 bg-white rounded-lg shadow hover:shadow-md transition text-center font-semibold text-gray-700">
                Order on Instacart
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="block p-3 bg-white rounded-lg shadow hover:shadow-md transition text-center font-semibold text-gray-700">
                Order on Uber Eats
            </a>
        </div>
    </div>
);


// --- Main Application Component ---

export default function App() {
    const apiKey = "AIzaSyDUsA1lOW3tvCN5VIdk-21pXkpIDJ6QlvU"; 

    const [rawList, setRawList] = useState('');
    const [newItem, setNewItem] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [mealIdea, setMealIdea] = useState('');
    const [isGeneratingMeal, setIsGeneratingMeal] = useState(false);
    const [suggestedItems, setSuggestedItems] = useState([]);
    const [isSuggestingItems, setIsSuggestingItems] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [inputError, setInputError] = useState(false);
    const [isSavingEdit, setIsSavingEdit] = useState(false); // --- NEW: State to prevent double saves ---

    const [isPremium, setIsPremium] = useState(() => {
        const saved = localStorage.getItem('isPremium');
        return saved ? JSON.parse(saved) : false;
    });

    const [sortedList, setSortedList] = useState(() => {
        try {
            const savedList = localStorage.getItem('groceryAssistant-sortedList');
            return savedList ? JSON.parse(savedList) : null;
        } catch (e) {
            return null;
        }
    });

    const [ignoredSuggestions, setIgnoredSuggestions] = useState(() => {
        try {
            const savedIgnored = localStorage.getItem('groceryAssistant-ignoredSuggestions');
            return savedIgnored ? JSON.parse(savedIgnored) : [];
        } catch (e) {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('isPremium', JSON.stringify(isPremium));
    }, [isPremium]);

    useEffect(() => {
        if (sortedList) {
            localStorage.setItem('groceryAssistant-sortedList', JSON.stringify(sortedList));
        } else {
            localStorage.removeItem('groceryAssistant-sortedList');
        }
    }, [sortedList]);

    useEffect(() => {
        localStorage.setItem('groceryAssistant-ignoredSuggestions', JSON.stringify(ignoredSuggestions));
    }, [ignoredSuggestions]);

    const togglePremium = () => setIsPremium(prev => !prev);

    const categoryOrder = useMemo(() => [
        'Produce', 'Bakery', 'Meat & Seafood', 'Dairy & Eggs', 'Pantry',
        'Frozen Foods', 'Beverages', 'Household & Cleaning', 'Personal Care',
        'Pets', 'Baby', 'Miscellaneous',
    ], []);

    const hasItems = (list) => list && Object.values(list).some(cat => cat.length > 0);
    
    const handleToggleCheck = (category, itemIndex) => {
        const newSortedList = JSON.parse(JSON.stringify(sortedList));
        newSortedList[category][itemIndex].checked = !newSortedList[category][itemIndex].checked;
        setSortedList(newSortedList);
    };

    const callGeminiAPI = async (prompt) => {
        if (apiKey === "PASTE_YOUR_API_KEY_HERE" || !apiKey) {
            throw new Error("API Key missing.");
        }
        
        const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 2048 }
        };
        
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`API request failed with status ${response.status}.`);
        const result = await response.json();

        if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
            return result.candidates[0].content.parts[0].text;
        } else {
            throw new Error(result?.promptFeedback?.blockReason ? `Request blocked: ${result.promptFeedback.blockReason}` : "Could not get a valid response from the AI.");
        }
    };

    const handleSortList = async (listToSort) => {
        setError('');
        setInputError(false);
        if (!listToSort.trim()) {
            setError("Please enter a grocery list before sorting.");
            setInputError(true);
            return;
        }

        setIsLoading(true);
        setSortedList(null);
        setMealIdea('');
        setSuggestedItems([]);
        
        const categoryListForPrompt = categoryOrder.join(', ');
        const prompt = `You are an expert grocery list organizer. Categorize items from the user's list into a predefined set of categories. The user's list is:\n---\n${listToSort}\n---\nIMPORTANT INSTRUCTIONS:\n1. Use ONLY these categories: ${categoryListForPrompt}.\n2. Your response MUST be a single, valid JSON object.\n3. For ANY category without items, include the key with an empty array [].\n4. Do not add items not on the list.\n5. Do not include markdown like \`\`\`json.`;

        try {
            const responseText = await callGeminiAPI(prompt);
            let jsonString = responseText.substring(responseText.indexOf('{'), responseText.lastIndexOf('}') + 1).replace(/,\s*([\]}])/g, '$1');
            const parsedJson = JSON.parse(jsonString);
            
            const completeList = {};
            for (const category of categoryOrder) {
                const items = parsedJson[category] || [];
                completeList[category] = items.map(name => ({ name, checked: false, isEditing: false }));
            }
            setSortedList(completeList);
            setRawList('');
        } catch (err) {
            setError(err.message);
            setSortedList(null);
        } finally {
            setIsLoading(false);
            setIsSavingEdit(false); // --- NEW: Reset saving state after API call completes ---
        }
    };

    const handleGetMealIdea = async () => {
        setIsGeneratingMeal(true);
        setMealIdea('');
        setError('');
        
        const currentListItems = Object.values(sortedList || {}).flat().map(item => item.name).join(', ');
        const prompt = `Based on the following grocery list, suggest one simple meal or recipe idea. Provide a name for the recipe and a brief, easy-to-follow paragraph of instructions. Grocery list: ${currentListItems}`;
        
        try {
            const idea = await callGeminiAPI(prompt);
            setMealIdea(idea);
        } catch (err) {
            setError("Sorry, I couldn't come up with a meal idea right now.");
        } finally {
            setIsGeneratingMeal(false);
        }
    };

    const handleSuggestItems = async () => {
        setIsSuggestingItems(true);
        setSuggestedItems([]);
        setError('');

        const currentListItems = Object.values(sortedList || {}).flat().map(item => item.name).join(', ');
        const ignoreList = ignoredSuggestions.join(', ');
        const prompt = `A user has these items on their grocery list: ${currentListItems}. Suggest 3 to 5 complementary items they might have forgotten. ${ignoreList.length > 0 ? `Do NOT suggest any of these items: ${ignoreList}.` : ''} Return ONLY a single, valid JSON array of strings, like ["item1", "item2", "item3"]. Do not include any other text or markdown.`;

        try {
            const responseText = await callGeminiAPI(prompt);
            const jsonString = responseText.substring(responseText.indexOf('['), responseText.lastIndexOf(']') + 1);
            const suggestions = JSON.parse(jsonString);
            setSuggestedItems(suggestions);
            setIgnoredSuggestions(prev => [...new Set([...prev, ...suggestions])]);
        } catch (err) {
            setError("Sorry, couldn't fetch suggestions right now.");
        } finally {
            setIsSuggestingItems(false);
        }
    };

    const handleEditStart = (category, itemIndex) => setEditingItem({ category, index: itemIndex });

    const handleEditChange = (newValue, category, itemIndex) => {
        const newSortedList = JSON.parse(JSON.stringify(sortedList));
        newSortedList[category][itemIndex].name = newValue;
        setSortedList(newSortedList);
    };

    // --- MODIFIED: Added a check to prevent double submissions ---
    const handleEditSave = () => {
        if (isSavingEdit) return; // Don't do anything if already saving
        setIsSavingEdit(true); // Set saving state to true
        setEditingItem(null);
        const newRawList = categoryOrder.flatMap(cat => sortedList[cat]?.map(item => item.name) || []).join('\n');
        handleSortList(newRawList);
    };
    
    const handleAddNewItem = () => {
        if (!newItem.trim()) return;
        
        const currentItems = sortedList ? Object.values(sortedList).flat().map(item => item.name) : [];
        const combinedList = [...currentItems, ...newItem.split('\n').filter(item => item.trim() !== '')];
        const newListString = combinedList.join('\n');
        
        setNewItem('');
        handleSortList(newListString);
    };

    const handleSuggestionClick = (suggestion) => {
        setNewItem(prev => prev ? `${prev}\n${suggestion}` : suggestion);
        setSuggestedItems(prev => prev.filter(item => item !== suggestion));
    };
    
    const handleClearList = () => {
        setRawList('');
        setSortedList(null);
        setError('');
        setInputError(false);
        setMealIdea('');
        setSuggestedItems([]);
        setIgnoredSuggestions([]);
        localStorage.removeItem('groceryAssistant-sortedList');
        localStorage.removeItem('groceryAssistant-ignoredSuggestions');
    };

    const generatePlainTextList = () => {
        if (!sortedList) return '';
        return categoryOrder
            .map(category => {
                const items = sortedList[category];
                if (items && items.length > 0) {
                    const itemNames = items.map(item => item.name).join('\n');
                    return `--- ${category.toUpperCase()} ---\n${itemNames}`;
                }
                return null;
            })
            .filter(Boolean)
            .join('\n\n');
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans antialiased text-gray-900 pb-12">
             <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700&display=swap');
                .edit-icon { opacity: 0; transition: opacity 0.2s ease-in-out; }
                .list-item:hover .edit-icon { opacity: 0.5; }
                .toggle-checkbox:checked { right: 0; border-color: #4f46e5; }
                .toggle-checkbox:checked + .toggle-label { background-color: #4f46e5; }
            `}</style>
            <div className="container mx-auto p-4 max-w-2xl">
                <Header />

                <div className="flex justify-center items-center mb-6 bg-yellow-100 border border-yellow-300 text-yellow-800 p-3 rounded-lg">
                    <label htmlFor="premiumToggle" className="mr-3 font-semibold">Enable Checkboxes</label>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input 
                            type="checkbox" 
                            name="premiumToggle" 
                            id="premiumToggle"
                            checked={isPremium}
                            onChange={togglePremium}
                            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                        />
                        <label htmlFor="premiumToggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                    </div>
                     <span className="text-sm">{isPremium ? "ON" : "OFF"}</span>
                </div>

                <main className="bg-white p-6 rounded-2xl shadow-lg">
                    {isLoading && !isSavingEdit ? <LoadingSpinner /> : (
                        hasItems(sortedList) ? (
                            // --- SORTED LIST VIEW ---
                            <div className="space-y-6">
                                {error && <ErrorMessage message={error} />}
                                <h2 className="text-2xl font-bold text-center text-gray-800">Your Organized List</h2>
                                
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                  <label htmlFor="new-item" className="block text-sm font-medium text-gray-700 mb-2">
                                    Add more items:
                                  </label>
                                  <div className="flex flex-col sm:flex-row sm:space-x-2">
                                      <textarea
                                          id="new-item"
                                          rows="2"
                                          className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 mb-2 sm:mb-0"
                                          placeholder="Type here or click suggestions below"
                                          value={newItem}
                                          onChange={(e) => setNewItem(e.target.value)}
                                      />
                                      <div className="flex space-x-2">
                                        <button
                                            onClick={handleAddNewItem}
                                            disabled={isLoading}
                                            className="flex-1 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 transition"
                                        >
                                            Add
                                        </button>
                                        <button
                                            onClick={handleSuggestItems}
                                            disabled={isSuggestingItems || isLoading}
                                            className="flex-1 bg-teal-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-teal-600 disabled:bg-teal-300 transition"
                                            title="Suggest items based on your list"
                                        >
                                            ✨ Suggest
                                        </button>
                                      </div>
                                  </div>
                                  {isSuggestingItems && <LoadingSpinner small />}
                                  {suggestedItems.length > 0 && (
                                      <div className="mt-3 flex flex-wrap gap-2">
                                          {suggestedItems.map((suggestion, i) => (
                                              <button key={i} onClick={() => handleSuggestionClick(suggestion)} className="bg-teal-100 text-teal-800 text-sm font-medium px-3 py-1 rounded-full hover:bg-teal-200 transition">
                                                  + {suggestion}
                                              </button>
                                          ))}
                                      </div>
                                  )}
                                </div>

                                {categoryOrder.map(category => {
                                    const items = sortedList[category];
                                    if (items && items.length > 0) {
                                        return (
                                            <div key={category} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                                                <h3 className="text-xl font-semibold mb-3 flex items-center text-gray-700">
                                                  <Icon category={category} />
                                                  {category}
                                                </h3>
                                                <table className="w-full">
                                                    <tbody>
                                                        {items.map((item, index) => (
                                                            <tr key={`${category}-${index}-${item.name}`} className="group">
                                                                <td className="w-8 py-1 align-top">
                                                                    {isPremium && (
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={item.checked}
                                                                            onChange={() => handleToggleCheck(category, index)}
                                                                            className="h-5 w-5 mt-1 rounded border-gray-400 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                                        />
                                                                    )}
                                                                </td>
                                                                <td className="py-1">
                                                                    {editingItem?.category === category && editingItem?.index === index ? (
                                                                        <input
                                                                            type="text"
                                                                            value={item.name}
                                                                            onChange={(e) => handleEditChange(e.target.value, category, index)}
                                                                            onBlur={handleEditSave}
                                                                            onKeyPress={(e) => { if (e.key === 'Enter') handleEditSave() }}
                                                                            autoFocus
                                                                            className="p-1 rounded-md border-gray-300 shadow-sm w-full"
                                                                        />
                                                                    ) : (
                                                                        <div className="flex justify-between items-center w-full">
                                                                            <span 
                                                                                className={`cursor-pointer ${item.checked ? 'line-through text-gray-400' : ''}`}
                                                                                onClick={() => handleEditStart(category, index)}
                                                                            >
                                                                                {item.name}
                                                                            </span>
                                                                            <svg onClick={() => handleEditStart(category, index)} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 text-gray-400 cursor-pointer edit-icon flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" />
                                                                            </svg>
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
                                  <button
                                      onClick={handleGetMealIdea}
                                      disabled={isGeneratingMeal || isLoading}
                                      className="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-purple-300 transition-all"
                                  >
                                      ✨ Get Meal Idea
                                  </button>
                                  {isGeneratingMeal && <LoadingSpinner small />}
                                  {mealIdea && (
                                      <div className="mt-4 p-4 bg-white rounded-md border">
                                          <h4 className="font-semibold text-lg text-purple-800">Recipe Suggestion:</h4>
                                          <p className="mt-2 text-gray-700 whitespace-pre-wrap">{mealIdea}</p>
                                      </div>
                                  )}
                                </div>

                                <AffiliateLinks />
                                <AdBanner />
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <CopyButton textToCopy={generatePlainTextList()} />
                                    <button
                                        onClick={handleClearList}
                                        disabled={isLoading}
                                        className="w-full bg-gray-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400 transition-all"
                                    >
                                        Start New List
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // --- INITIAL INPUT VIEW ---
                            <>
                                {error && <ErrorMessage message={error} />}
                                <div className="w-full">
                                    <label htmlFor="grocery-list" className="block text-sm font-medium text-gray-700">
                                        Enter Your List to Sort it Instantly
                                    </label>
                                    <p className="text-xs text-gray-500 mb-2">(e.g., bullet points or comma-separated)</p>
                                    <textarea
                                        id="grocery-list"
                                        rows="8"
                                        className={`p-3 w-full text-base border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition ${inputError ? 'border-red-500 ring-red-500' : 'border-gray-300'}`}
                                        placeholder="- Apples&#10;- Milk&#10;- Bread&#10;- Paper towels"
                                        value={rawList}
                                        onChange={(e) => setRawList(e.target.value)}
                                    ></textarea>
                                </div>
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <button
                                        onClick={() => handleSortList(rawList)}
                                        disabled={isLoading}
                                        className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 transition-all duration-300 ease-in-out flex items-center justify-center"
                                    >
                                        Sort My List!
                                    </button>
                                    <button
                                        onClick={handleClearList}
                                        disabled={isLoading}
                                        className="w-full bg-gray-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400 transition-all"
                                    >
                                        Start Over
                                    </button>
                                </div>
                                <div className="mt-8">
                                    <EmptyState />
                                </div>
                            </>
                        )
                    )}
                </main>
            </div>
        </div>
    );
}
