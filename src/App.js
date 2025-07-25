import React, { useState, useMemo, useEffect } from 'react';
// Import Firebase modules
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut 
} from "firebase/auth";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    onSnapshot,
    collection, 
    query, 
    where, 
    addDoc,
    deleteDoc,
    serverTimestamp,
    getDoc,
    updateDoc,
    arrayUnion,
    writeBatch
} from "firebase/firestore";

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyDWGY7ymJ0YtHpLT_kG2Ewo1YBszvbHdZc",
  authDomain: "cartspark-85cbc.firebaseapp.com",
  projectId: "cartspark-85cbc",
  storageBucket: "cartspark-85cbc.appspot.com",
  messagingSenderId: "83021752587",
  appId: "1:83021752587:web:466dc97b5e033883219a0e",
  measurementId: "G-1SZ9CTLS0G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Blog Post Data (Content is truncated for brevity) ---
const articles = [
    { id: 'time-saving-hacks', title: '5 Time-Saving Hacks for Your Weekly Grocery Trip', snippet: 'Turn a chaotic trip into a quick and efficient mission with these five simple hacks to help you save time at the store.', content: `The weekly grocery run can feel like a marathon...` },
    { id: 'pantry-checklist', title: 'The Ultimate Pantry Checklist: 10 Items You Should Never Run Out Of', snippet: 'A well-stocked pantry is the secret weapon of a stress-free kitchen...', content: `A well-stocked pantry is the secret weapon...` },
    { id: 'meal-planning', title: 'How to Plan a Week of Meals Using Your Grocery List', snippet: 'Meal planning can feel daunting, but it\'s one of the best ways to save money...', content: `Meal planning can feel like a daunting task...` }
];

// --- Helper Functions ---
const hasItems = (list) => list && list.items && Object.values(list.items).some(cat => cat.length > 0);

// --- UI Components ---
const Icon = ({ category }) => { const emojiMap = { 'Produce': '🍎', 'Dairy & Eggs': '🥛', 'Meat & Seafood': '🥩', 'Bakery': '🍞', 'Pantry': '🥫', 'Frozen Foods': '🧊', 'Beverages': '🥤', 'Household & Cleaning': '🧽', 'Personal Care': '🧼', 'Pets': '🐾', 'Baby': '👶', 'Miscellaneous': '🛒', }; return <span className="text-2xl mr-3">{emojiMap[category] || '🛒'}</span>; };
const Header = ({ onTitleClick, user, onLogoutClick, onLoginClick }) => ( <header className="text-center py-6 md:py-8 relative"> <div className="flex justify-center items-center gap-x-3 cursor-pointer" onClick={onTitleClick}> <svg className="h-10 w-10 md:h-12 md:w-12 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="21" r="1" stroke="currentColor" strokeWidth="2"/><circle cx="20" cy="21" r="1" stroke="currentColor" strokeWidth="2"/><path d="M15 6.5L16.5 4L18 6.5L19.5 4L21 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600" style={{ fontFamily: "'Poppins', sans-serif" }}>CartSpark</h1> </div> <p className="mt-3 text-lg text-gray-600">Your <span className="font-semibold text-green-600">FREE</span> Grocery List AI Companion</p> <div className="absolute top-4 right-4"> {user ? ( <div className="flex items-center gap-x-4"> <span className="text-sm text-gray-600 hidden sm:inline">Welcome, {user.displayName || user.email}!</span> <button onClick={onLogoutClick} className="bg-red-500 text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition">Sign Out</button> </div> ) : ( <button onClick={onLoginClick} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition">Go Pro ✨</button> )} </div> </header> );
const LoadingSpinner = ({ small = false }) => ( <div className={`flex justify-center items-center ${small ? 'p-2' : 'p-8'}`}><div className={`animate-spin rounded-full border-b-2 border-t-2 border-blue-500 ${small ? 'h-6 w-6' : 'h-12 w-12'}`}></div></div> );
const ErrorMessage = ({ message }) => ( <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md mb-4" role="alert"><p className="font-bold">Oops!</p><p>{message}</p></div> );
const CopyButton = ({ textToCopy }) => { const [c, setC] = useState(false); const h = () => { const t = document.createElement("textarea"); t.value = textToCopy; t.style.position = "fixed"; t.style.left = "-9999px"; document.body.appendChild(t); t.focus(); t.select(); try { document.execCommand('copy'); setC(true); setTimeout(() => setC(false), 2000); } catch (err) { console.error('Failed to copy text: ', err); } document.body.removeChild(t); }; return ( <button onClick={h} className={`mt-6 w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 ${c ? 'bg-green-500' : 'bg-gray-700 hover:bg-gray-800'}`}>{c ? 'Copied!' : 'Copy Sorted List'}</button> ); };
const EmptyState = ({message, subMessage}) => ( <div className="text-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"><svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg><h3 className="mt-2 text-sm font-medium text-gray-900">{message}</h3><p className="mt-1 text-sm text-gray-500">{subMessage}</p></div> );
const AppFooter = ({ setPage }) => ( <footer className="mt-12 text-center text-gray-500 text-sm"><div className="flex justify-center space-x-4"><button onClick={() => setPage('privacy')} className="hover:text-gray-800 underline">Privacy Policy</button><span>&middot;</span><button onClick={() => setPage('about')} className="hover:text-gray-800 underline">About Us</button><span>&middot;</span><button onClick={() => setPage('blog')} className="hover:text-gray-800 underline">Blog</button><span>&middot;</span><a href="mailto:contactus@cartspark.io" className="hover:text-gray-800">Contact Us</a></div><p className="mt-4">&copy; {new Date().getFullYear()} CartSpark. All Rights Reserved.</p></footer> );
const AboutPage = ({ setPage }) => ( <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg prose max-w-none"><button onClick={() => setPage('home')} className="mb-6 text-blue-600 hover:text-blue-800 font-semibold">&larr; Back to App</button><h2>About CartSpark</h2><p><strong>Our Mission: Smarter Shopping, Not Harder Shopping.</strong></p><p>Welcome to CartSpark, your new grocery list AI companion! We believe that a trip to the grocery store shouldn't be a chore. It should be simple, efficient, and maybe even a little bit fun.</p><p>Using the power of artificial intelligence, CartSpark instantly transforms your scattered shopping list into a perfectly organized, aisle-by-aisle path through the store.</p><h4>With CartSpark, you can:</h4><ul><li><strong>Sort Instantly:</strong> Automatically categorize your items into Produce, Dairy, Pantry, and more.</li><li><strong>Get Inspired:</strong> Use our "Get Meal Idea" feature to generate a simple recipe based on what's already on your list.</li><li><strong>Never Forget an Item:</strong> Our "Suggest" feature intelligently recommends related items you might have missed.</li><li><strong>Shop Your Way:</strong> Edit, add, delete, and check off items on the fly with a simple, interactive list that saves to your device.</li></ul><p>Our goal is to give you back your time and mental energy. Thank you for joining us on this journey!</p></div> );
const PrivacyPolicyPage = ({ setPage }) => ( <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg prose max-w-none"><button onClick={() => setPage('home')} className="mb-6 text-blue-600 hover:text-blue-800 font-semibold">&larr; Back to App</button><h2>Privacy Policy for CartSpark</h2><p><em>Last Updated: July 16, 2025</em></p><p>Your privacy is important to us. This Privacy Policy explains how CartSpark collects, uses, and protects your information.</p><h3>1. Information We Collect</h3><p>For logged-in users, we store your grocery lists and preferences in our secure cloud database. For guests, CartSpark uses your browser's <code>localStorage</code> to save information directly on your device. We store:</p><ul><li><strong>Your Current Grocery List:</strong> Item names, categories, and checked status.</li><li><strong>Ignored Suggestions:</strong> A temporary record of AI suggestions you've seen.</li></ul><p><strong>For logged-in users, your data is protected by our security rules so only you can access it. For guest users, this information is stored exclusively on your device's browser.</strong></p><h3>2. Third-Party Services</h3><p>CartSpark uses these services:</p><ul><li><strong>Google Gemini API:</strong> To power AI features. Your list content is sent to Google for processing, governed by Google's Privacy Policy.</li><li><strong>Google AdSense:</strong> To display ads for non-logged-in users. Google may use cookies to serve ads. You can opt out in <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google's Ads Settings</a>.</li><li><strong>Affiliate Links:</strong> If you click affiliate links (e.g., Instacart, Uber Eats) and make a purchase, we may earn a commission.</li></ul><h3>3. Clearing Your Data</h3><p>Clicking the "Start New List" or "Start Over" button will permanently delete your active list data. You can delete your account and all associated data by contacting us.</p><h3>4. Contact Us</h3><p>If you have questions, please contact us at: <a href="mailto:contactus@cartspark.io">contactus@cartspark.io</a></p></div> );
const BlogPage = ({ setSelectedArticle, setPage }) => ( <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg"><button onClick={() => setPage('home')} className="mb-6 text-blue-600 hover:text-blue-800 font-semibold">&larr; Back to App</button><h2 className="text-3xl font-bold text-center mb-8">CartSpark Blog</h2><div className="space-y-8">{articles.map(article => ( <div key={article.id} className="p-6 border rounded-lg"><h3 className="text-2xl font-semibold text-gray-800">{article.title}</h3><p className="mt-2 text-gray-600">{article.snippet}</p><button onClick={() => setSelectedArticle(article)} className="mt-4 text-blue-600 font-semibold hover:underline">Read more &rarr;</button></div> ))}</div></div> );
const ArticlePage = ({ article, setSelectedArticle }) => ( <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg prose max-w-none"><button onClick={() => setSelectedArticle(null)} className="mb-6 text-blue-600 hover:text-blue-800 font-semibold">&larr; Back to Blog</button><h2 className="text-3xl font-bold">{article.title}</h2><div className="mt-6 text-gray-700" style={{whiteSpace: 'pre-line'}}>{article.content}</div></div> );
const LoginScreen = ({ onLogin }) => ( <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg text-center"><h2 className="text-2xl font-bold text-gray-800">Unlock Pro Features</h2><p className="mt-4 text-gray-600">Sign in to save multiple lists, share them with family, and get an ad-free experience!</p><button onClick={onLogin} className="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"><svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.16H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.84l3.66-2.75z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.16l3.66 2.84c.87-2.6 3.3-4.62 6.16-4.62z" /></svg>Sign in with Google</button></div> );

// --- Component for the initial list input ---
const InitialListInput = ({ onSort, onClear, isLoading, error, inputError, setInputError, setError, listName }) => {
    const [rawList, setRawList] = useState('');

    const handleSortClick = () => {
        if (!rawList.trim()) {
            setError("Please enter at least one item to start your list.");
            setInputError(true);
            return;
        }
        onSort(rawList);
    };
    
    const handleClearClick = () => {
        setRawList('');
        onClear();
    };

    return (
        <>
            {error && inputError && <ErrorMessage message={error} />}
            <div className="w-full">
                <label htmlFor="grocery-list" className="block text-sm font-medium text-gray-700">Enter items for "{listName}"</label>
                <p className="text-xs text-gray-500 mb-2">(e.g., bullet points or comma-separated)</p>
                <textarea id="grocery-list" rows="8" className={`p-3 w-full text-base border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition ${inputError ? 'border-red-500 ring-red-500' : 'border-gray-300'}`} placeholder="- Apples&#10;- Milk&#10;- Bread&#10;- Paper towels" value={rawList} onChange={(e) => setRawList(e.target.value)} />
            </div>
            <div className="mt-4">
                <button onClick={handleSortClick} disabled={isLoading} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700">Sort This List!</button>
            </div>
        </>
    );
};

// --- ListManager Component: Handles the display and interaction for a single list ---
const ListManager = ({ listData, onSort, onClear, isGuest, isPremium, handleToggleCheck, handleEditStart, handleEditSave, handleEditChange, handleDeleteItem, handleResort, handleGetMealIdea, handleSuggestItems, handleAddNewItem, handleSuggestionClick, newItem, setNewItem, needsResort, isLoading, isGeneratingMeal, mealIdea, isSuggestingItems, suggestedItems, error, inputError, editingItem, categoryOrder, generatePlainTextList, setShowAddMealModal, setInputError, setError }) => {
    const currentListItems = listData?.items;
    
    return (
        hasItems(listData) ? (
            <div className="space-y-6">
                {error && !inputError && <ErrorMessage message={error} />}
                <h2 className="text-2xl font-bold text-center text-gray-800">{listData.name || "Your Organized List"}</h2>
                
                {needsResort && !isLoading && (
                    <div className="p-3 bg-orange-100 border border-orange-300 rounded-lg flex items-center justify-between">
                        <p className="text-sm text-orange-800 font-medium">Your list might need re-sorting.</p>
                        <button onClick={handleResort} className="bg-orange-500 text-white text-sm font-bold py-1 px-3 rounded-md hover:bg-orange-600 transition">Re-Sort Now</button>
                    </div>
                )}
                {isLoading && <LoadingSpinner small/>}
                
                {!isGuest && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <button onClick={() => setShowAddMealModal(true)} className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition">🍳 Add Meal to List</button>
                    </div>
                )}

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <label htmlFor="new-item" className="block text-sm font-medium text-gray-700 mb-2">Add more items:</label>
                  <div className="flex flex-col sm:flex-row sm:space-x-2">
                      <textarea id="new-item" rows="2" className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 mb-2 sm:mb-0" placeholder="Type here or click suggestions below" value={newItem} onChange={(e) => setNewItem(e.target.value)} />
                      <div className="flex space-x-2">
                        <button onClick={handleAddNewItem} disabled={isLoading} className="flex-1 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 transition">Add</button>
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
                                                    {isPremium && <input type="checkbox" checked={item.checked} onChange={() => handleToggleCheck(category, index)} className="h-5 w-5 mt-1 rounded border-gray-400 text-blue-600 focus:ring-blue-500 cursor-pointer"/>}
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
                  {mealIdea && (
                      <div className="mt-4 p-4 bg-white rounded-md border">
                          <h4 className="font-semibold text-lg text-purple-800">Recipe Suggestion:</h4>
                          <p className="mt-2 text-gray-700 whitespace-pre-wrap">{mealIdea}</p>
                      </div>
                  )}
                </div>
                
                {isGuest && <AffiliateLinks />}
                {isGuest && <AdBanner />}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <CopyButton textToCopy={generatePlainTextList()} />
                    <button onClick={onClear} disabled={isLoading} className="w-full bg-gray-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-700">Start New List</button>
                </div>
            </div>
        ) : (
            <InitialListInput onSort={onSort} onClear={onClear} isLoading={isLoading} error={error} inputError={inputError} setInputError={setInputError} setError={setError} listName={listData?.name || "New List"} />
        )
    );
};

// --- Main Application Component ---
export default function App() {
    const geminiApiKey = "AIzaSyDUsA1lOW3tvCN5VIdk-21pXkpIDJ6QlvU"; 

    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [page, setPage] = useState('home');
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [newItem, setNewItem] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [mealIdea, setMealIdea] = useState('');
    const [isGeneratingMeal, setIsGeneratingMeal] = useState(false);
    const [suggestedItems, setSuggestedItems] = useState([]);
    const [isSuggestingItems, setIsSuggestingItems] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [inputError, setInputError] = useState(false);
    const [needsResort, setNeedsResort] = useState(false);
    
    const [userLists, setUserLists] = useState([]);
    const [activeListId, setActiveListId] = useState(null);
    const [activeListData, setActiveListData] = useState(null);
    const [guestList, setGuestList] = useState(() => {
        try {
            const saved = localStorage.getItem('cartspark-guest-list');
            return saved ? JSON.parse(saved) : null;
        } catch (e) { return null; }
    });
    const [isPremium, setIsPremium] = useState(() => {
        const saved = localStorage.getItem('isPremium');
        return saved ? JSON.parse(saved) : false;
    });

    const [userMeals, setUserMeals] = useState([]);
    const [showAddMealModal, setShowAddMealModal] = useState(false);

    useEffect(() => {
        localStorage.setItem('isPremium', JSON.stringify(isPremium));
    }, [isPremium]);

    const togglePremium = () => setIsPremium(prev => !prev);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                const userDocRef = doc(db, "users", currentUser.uid);
                const emailDocRef = doc(db, "emailToUid", currentUser.email);
                const userDoc = await getDoc(userDocRef);
                if (!userDoc.exists()) {
                    const batch = writeBatch(db);
                    batch.set(userDocRef, { email: currentUser.email, createdAt: serverTimestamp() });
                    batch.set(emailDocRef, { uid: currentUser.uid });
                    await batch.commit();
                }
                
                const guestListFromStorage = localStorage.getItem('cartspark-guest-list');
                if (guestListFromStorage) {
                    try {
                        const parsedGuestList = JSON.parse(guestListFromStorage);
                        if (parsedGuestList && Object.keys(parsedGuestList).length > 0) {
                             if (window.confirm("You have an unsaved list. Would you like to save it to your new account?")) {
                                const newListRef = await addDoc(collection(db, "lists"), {
                                    name: "My First List",
                                    ownerId: currentUser.uid,
                                    members: [currentUser.uid],
                                    createdAt: serverTimestamp(),
                                    items: parsedGuestList
                                });
                                setActiveListId(newListRef.id);
                                setGuestList(null); 
                                localStorage.removeItem('cartspark-guest-list');
                            }
                        }
                    } catch(e) {
                        console.error("Error parsing guest list:", e);
                        localStorage.removeItem('cartspark-guest-list');
                    }
                }
            }
            setAuthLoading(false);
        });
        return () => unsubscribe(); 
    }, []);

    useEffect(() => {
        if (user) {
            const listsQuery = query(collection(db, "lists"), where("members", "array-contains", user.uid));
            const mealsQuery = query(collection(db, "meals"), where("ownerId", "==", user.uid));

            const unsubLists = onSnapshot(listsQuery, (snapshot) => {
                const lists = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setUserLists(lists.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)));
            }, (error) => {
                console.error("Error fetching user lists:", error);
                setError("Could not load your lists. Please try again later.");
            });
            const unsubMeals = onSnapshot(mealsQuery, (snapshot) => {
                const meals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setUserMeals(meals.sort((a, b) => a.name.localeCompare(b.name)));
            });

            return () => { unsubLists(); unsubMeals(); };
        } else {
            setUserLists([]);
            setUserMeals([]);
        }
    }, [user]);
    
    useEffect(() => {
        if (activeListId && user) {
            const listDocRef = doc(db, "lists", activeListId);
            const unsubscribe = onSnapshot(listDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    setActiveListData({ id: docSnap.id, ...docSnap.data() });
                } else {
                    setActiveListData(null);
                    setActiveListId(null);
                }
            }, (error) => {
                console.error("Error fetching active list:", error);
                setError("Could not load the selected list.");
            });
            return () => unsubscribe();
        } else {
            setActiveListData(null);
        }
    }, [activeListId, user]);

    useEffect(() => {
        if (!user) {
            localStorage.setItem('cartspark-guest-list', JSON.stringify(guestList));
        }
    }, [guestList, user]);

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            setPage('home');
        } catch (error) {
            console.error("Authentication error:", error);
            setError("Failed to sign in. Please try again.");
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        setActiveListId(null);
        setGuestList(null);
        setPage('home');
    };
    
    const categoryOrder = useMemo(() => [
        'Produce', 'Bakery', 'Meat & Seafood', 'Dairy & Eggs', 'Pantry',
        'Frozen Foods', 'Beverages', 'Household & Cleaning', 'Personal Care',
        'Pets', 'Baby', 'Miscellaneous',
    ], []);
    
    const updateListInStorage = async (newListState) => {
        if (user && activeListId) {
            const listDocRef = doc(db, "lists", activeListId);
            await setDoc(listDocRef, { items: newListState }, { merge: true });
        } else {
            setGuestList(newListState);
        }
    };
    
    const handleToggleCheck = (category, itemIndex) => {
        const currentListItems = user ? activeListData.items : guestList;
        const newList = JSON.parse(JSON.stringify(currentListItems));
        newList[category][itemIndex].checked = !newList[category][itemIndex].checked;
        updateListInStorage(newList);
    };

    const callGeminiAPI = async (prompt) => {
        if (!geminiApiKey) throw new Error("API Key missing. Please set REACT_APP_GEMINI_API_KEY in your .env file.");
        const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.3, maxOutputTokens: 2048 } };
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
        const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error(`API request failed with status ${response.status}.`);
        const result = await response.json();
        if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
            return result.candidates[0].content.parts[0].text;
        } else {
            throw new Error(result?.promptFeedback?.blockReason ? `Request blocked: ${result.promptFeedback.blockReason}` : "Could not get a valid response from the AI.");
        }
    };

    const handleSortList = async (listToSort, listIdToUpdate) => {
        setIsLoading(true);
        setError('');
        setMealIdea('');
        setSuggestedItems([]);
        
        const categoryListForPrompt = categoryOrder.join(', ');
        const prompt = `Categorize these items into a JSON object with these keys: ${categoryListForPrompt}. For any category without items, use an empty array []. The list is:\n---\n${listToSort}`;

        try {
            const responseText = await callGeminiAPI(prompt);
            let jsonString = responseText.substring(responseText.indexOf('{'), responseText.lastIndexOf('}') + 1).replace(/,\s*([\]}])/g, '$1');
            const parsedJson = JSON.parse(jsonString);
            
            const completeList = {};
            for (const category of categoryOrder) {
                const items = parsedJson[category] || [];
                completeList[category] = items.map(name => ({ name, checked: false, isEditing: false }));
            }
            
            await updateListInStorage(completeList);
            
            setNeedsResort(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleResort = () => {
        const currentListItems = Object.values(activeListData.items || {}).flat().map(item => item.name).join('\n');
        handleSortList(currentListItems, activeListId);
    };

    const handleGetMealIdea = async () => { /* ... */ };
    const handleSuggestItems = async () => { /* ... */ };
    
    const handleEditStart = (category, itemIndex) => setEditingItem({ category, index: itemIndex });
    const handleEditChange = (newValue, category, itemIndex) => {
        const currentListItems = user ? activeListData.items : guestList;
        const newList = JSON.parse(JSON.stringify(currentListItems));
        newList[category][itemIndex].name = newValue;
        user ? setActiveListData(prev => ({ ...prev, items: newList })) : setGuestList(newList);
    };
    const handleEditSave = () => {
        setEditingItem(null);
        setNeedsResort(true);
        updateListInStorage(user ? activeListData.items : guestList);
    };
    
    const handleAddNewItem = () => {
        if (!newItem.trim()) return;
        const currentList = user ? activeListData : { items: guestList };
        const currentItems = currentList?.items ? Object.values(currentList.items).flat().map(item => item.name) : [];
        const combinedList = [...currentItems, ...newItem.split('\n').filter(item => item.trim() !== '')];
        const newListString = combinedList.join('\n');
        setNewItem('');
        handleSortList(newListString, activeListId);
    };

    const handleSuggestionClick = (suggestion) => {
        setNewItem(prev => prev ? `${prev}\n${suggestion}` : suggestion);
        setSuggestedItems(prev => prev.filter(item => item !== suggestion));
    };

    const handleDeleteItem = (categoryToDelete, indexToDelete) => {
        const currentListItems = user ? activeListData.items : guestList;
        const newList = JSON.parse(JSON.stringify(currentListItems));
        newList[categoryToDelete] = newList[categoryToDelete].filter((_, index) => index !== indexToDelete);
        updateListInStorage(newList);
    };
    
    const handleClearList = () => {
        setError('');
        setInputError(false);
        setMealIdea('');
        setSuggestedItems([]);
        setIgnoredSuggestions([]);
        setNeedsResort(false);
        if(user && activeListId) {
            updateListInStorage(null);
        } else {
            setGuestList(null);
            localStorage.removeItem('cartspark-guest-list');
        }
    };
    
    const handleCreateNewList = async () => {
        const listName = prompt("Enter a name for your new list:", "My Grocery List");
        if (listName && user) {
            setIsLoading(true);
            try {
                const newListRef = await addDoc(collection(db, "lists"), {
                    name: listName, ownerId: user.uid, members: [user.uid], createdAt: serverTimestamp(), items: null
                });
                setActiveListId(newListRef.id);
            } catch (e) { setError("Could not create new list."); } 
            finally { setIsLoading(false); }
        }
    };

    const handleDeleteList = async (listId) => {
        if (window.confirm("Are you sure you want to permanently delete this list?")) {
            try {
                await deleteDoc(doc(db, "lists", listId));
                if (activeListId === listId) setActiveListId(null);
            } catch (e) { setError("Could not delete list."); }
        }
    };

    const handleShareList = async (listId) => {
        const email = prompt("Enter the email address of the user you want to share this list with:");
        if (!email || !user) return;
    
        try {
            const emailDocRef = doc(db, "emailToUid", email.toLowerCase());
            const emailDoc = await getDoc(emailDocRef);
    
            if (!emailDoc.exists()) {
                alert("User not found. Please make sure they have signed up for CartSpark.");
                return;
            }
    
            const invitedUserId = emailDoc.data().uid;
    
            const listDocRef = doc(db, "lists", listId);
            await updateDoc(listDocRef, {
                members: arrayUnion(invitedUserId)
            });
    
            alert("List shared successfully!");
        } catch (e) {
            console.error("Error sharing list: ", e);
            setError("Could not share the list. Please try again.");
        }
    };

    const handleCreateNewMeal = async () => {
        const mealName = prompt("Enter a name for your new meal template:", "e.g., Taco Night");
        if (mealName && user) {
            const ingredients = prompt("Enter the ingredients, separated by commas:", "Ground beef, Taco shells, Lettuce, Cheese");
            if (ingredients) {
                const ingredientsArray = ingredients.split(',').map(item => item.trim()).filter(Boolean);
                await addDoc(collection(db, "meals"), {
                    name: mealName,
                    ownerId: user.uid,
                    createdAt: serverTimestamp(),
                    ingredients: ingredientsArray
                });
            }
        }
    };

    const handleDeleteMeal = async (mealId) => {
        if (window.confirm("Are you sure you want to delete this meal template?")) {
            await deleteDoc(doc(db, "meals", mealId));
        }
    };

    const handleAddMealToList = (meal) => {
        const currentItems = activeListData?.items ? Object.values(activeListData.items).flat().map(item => item.name) : [];
        const combinedList = [...new Set([...currentItems, ...meal.ingredients])];
        const newListString = combinedList.join('\n');
        handleSortList(newListString, activeListId);
        setShowAddMealModal(false);
    };

    const generatePlainTextList = () => { /* ... */ };

    const renderPageContent = () => {
        if (page === 'about') return <AboutPage setPage={setPage} />;
        if (page === 'privacy') return <PrivacyPolicyPage setPage={setPage} />;
        if (page === 'blog') {
            if (selectedArticle) return <ArticlePage article={selectedArticle} setSelectedArticle={setSelectedArticle} />;
            return <BlogPage setSelectedArticle={setSelectedArticle} setPage={setPage} />;
        }
        if (page === 'login') return <LoginScreen onLogin={handleGoogleLogin} />;
        if (page === 'meals' && user) return <MealsDashboard />;

        if (user) {
            if (!activeListId) return <UserDashboard />;
            if (activeListData) {
                return (
                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                        <button onClick={() => setActiveListId(null)} className="mb-6 text-blue-600 hover:text-blue-800 font-semibold">&larr; Back to My Lists</button>
                        <ListManager listData={activeListData} onSort={(listText) => handleSortList(listText, activeListId)} onClear={handleClearList} isGuest={false} isPremium={true} handleToggleCheck={handleToggleCheck} handleEditStart={handleEditStart} handleEditSave={handleEditSave} handleEditChange={handleEditChange} handleDeleteItem={handleDeleteItem} handleResort={handleResort} handleGetMealIdea={handleGetMealIdea} handleSuggestItems={handleSuggestItems} handleAddNewItem={handleAddNewItem} handleSuggestionClick={handleSuggestionClick} newItem={newItem} setNewItem={setNewItem} needsResort={needsResort} isLoading={isLoading} isGeneratingMeal={isGeneratingMeal} mealIdea={mealIdea} isSuggestingItems={isSuggestingItems} suggestedItems={suggestedItems} error={error} inputError={inputError} editingItem={editingItem} categoryOrder={categoryOrder} generatePlainTextList={generatePlainTextList} setShowAddMealModal={setShowAddMealModal} setInputError={setInputError} setError={setError} />
                    </div>
                );
            }
            return <LoadingSpinner />;
        }

        // GUEST VIEW
        return (
            <main className="bg-white p-6 rounded-2xl shadow-lg">
                 <ListManager 
                    listData={{items: guestList}} 
                    onSort={(listText) => handleSortList(listText, null)} 
                    onClear={() => { setGuestList(null); localStorage.removeItem('cartspark-guest-list'); setError(''); setInputError(false); }} 
                    isGuest={true} 
                    isPremium={isPremium} 
                    handleToggleCheck={handleToggleCheck} 
                    handleEditStart={handleEditStart} 
                    handleEditSave={handleEditSave} 
                    handleEditChange={handleEditChange} 
                    handleDeleteItem={handleDeleteItem} 
                    handleResort={() => {}} // No resort for guests
                    handleGetMealIdea={handleGetMealIdea} 
                    handleSuggestItems={handleSuggestItems} 
                    handleAddNewItem={handleAddNewItem} 
                    handleSuggestionClick={handleSuggestionClick} 
                    newItem={newItem} 
                    setNewItem={setNewItem} 
                    needsResort={needsResort} 
                    isLoading={isLoading} 
                    isGeneratingMeal={isGeneratingMeal} 
                    mealIdea={mealIdea} 
                    isSuggestingItems={isSuggestingItems} 
                    suggestedItems={suggestedItems} 
                    error={error} 
                    inputError={inputError} 
                    editingItem={editingItem} 
                    categoryOrder={categoryOrder} 
                    generatePlainTextList={generatePlainTextList}
                    setShowAddMealModal={setShowAddMealModal}
                    setInputError={setInputError} 
                    setError={setError}
                />
            </main>
        );
    };
    
    const UserDashboard = () => (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex border-b mb-6">
                <button className="flex-1 py-2 text-center font-semibold border-b-2 border-blue-600 text-blue-600">My Lists</button>
                <button onClick={() => setPage('meals')} className="flex-1 py-2 text-center font-semibold text-gray-500 hover:text-blue-600">My Meals</button>
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">My Lists</h2>
            <button onClick={handleCreateNewList} className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition mb-6">+ Create New List</button>
            {userLists.length > 0 ? (
                <ul className="space-y-3">
                    {userLists.map(list => (
                        <li key={list.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
                            <button onClick={() => setActiveListId(list.id)} className="text-left flex-grow hover:text-blue-600 min-w-0">
                                <p className="font-semibold truncate">{list.name}</p>
                                <p className="text-sm text-gray-500">{list.ownerId !== user.uid ? `Shared by...` : `Created: ${list.createdAt?.toDate().toLocaleDateString()}`}</p>
                            </button>
                            <div className="flex items-center flex-shrink-0 ml-4">
                                {list.ownerId === user.uid && <button onClick={() => handleShareList(list.id)} className="text-blue-500 hover:text-blue-700 p-2 rounded-full" title="Share List"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6.002L15.316 6.342m0 11.316a3 3 0 100-5.304m0 5.304L8.684 9.658" /></svg></button>}
                                {list.ownerId === user.uid && <button onClick={() => handleDeleteList(list.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full" title="Delete List"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : ( <EmptyState message="No lists yet" subMessage="Click 'Create New List' to get started." /> )}
        </div>
    );

    const MealsDashboard = () => (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex border-b mb-6">
                <button onClick={() => setPage('home')} className="flex-1 py-2 text-center font-semibold text-gray-500 hover:text-blue-600">My Lists</button>
                <button className="flex-1 py-2 text-center font-semibold border-b-2 border-blue-600 text-blue-600">My Meals</button>
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">My Meal Templates</h2>
            <button onClick={handleCreateNewMeal} className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition mb-6">+ Create New Meal</button>
            {userMeals.length > 0 ? (
                <ul className="space-y-3">
                    {userMeals.map(meal => (
                        <li key={meal.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
                            <div className="min-w-0">
                                <p className="font-semibold truncate">{meal.name}</p>
                                <p className="text-sm text-gray-500 truncate">{meal.ingredients.join(', ')}</p>
                            </div>
                            <button onClick={() => handleDeleteMeal(meal.id)} className="ml-4 text-red-500 hover:text-red-700 p-2 rounded-full" title="Delete Meal">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <EmptyState message="No meals saved yet" subMessage="Create meal templates to quickly add ingredients to your lists." />
            )}
        </div>
    );

    const AddMealModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">Add a Meal to Your List</h3>
                <div className="max-h-64 overflow-y-auto">
                    {userMeals.length > 0 ? (
                        <ul className="space-y-2">
                            {userMeals.map(meal => (
                                <li key={meal.id}>
                                    <button onClick={() => handleAddMealToList(meal)} className="w-full text-left p-3 bg-gray-100 hover:bg-blue-100 rounded-md transition">
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
                <button onClick={() => setShowAddMealModal(false)} className="mt-6 w-full bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition">
                    Cancel
                </button>
            </div>
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen font-sans antialiased text-gray-900 pb-12">
             <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700&display=swap');
                /* ... other styles ... */
             `}</style>
            <div className="container mx-auto p-4 max-w-2xl">
                <Header 
                    onTitleClick={() => { setPage('home'); setSelectedArticle(null); setActiveListId(null); }} 
                    user={user}
                    onLogoutClick={handleLogout}
                    onLoginClick={() => setPage('login')}
                />
                
                {page === 'home' && !user && (
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
                )}
                
                <main>
                    {authLoading ? <LoadingSpinner /> : renderPageContent()}
                </main>
                
                {showAddMealModal && <AddMealModal />}
                <AppFooter setPage={setPage} />
            </div>
        </div>
    );
}
