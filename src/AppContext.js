import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { doc, setDoc, onSnapshot, collection, query, where, addDoc, deleteDoc, serverTimestamp, getDoc, updateDoc, arrayUnion, writeBatch, getDocs } from "firebase/firestore";
import { auth, db } from './firebase-config';
import { hasItems } from './utils';
import { getFunctions, httpsCallable } from "firebase/functions";

const AppContext = createContext();

export const useAppContext = () => {
    return useContext(AppContext);
};

export const AppProvider = ({ children }) => {
    // NOTE: This key is now read from your .env file locally, and from Netlify's environment variables on your live site.
    const geminiApiKey = process.env.REACT_APP_GEMINI_API_KEY;

    // --- Core State ---
    const [user, setUser] = useState(null);
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [dataLoading, setDataLoading] = useState(true);
    const [page, setPage] = useState('home');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // --- Guest State ---
    const [guestList, setGuestList] = useState(() => {
        try {
            const saved = localStorage.getItem('cartspark-guest-list');
            return saved ? JSON.parse(saved) : null;
        } catch (e) { return null; }
    });
    const [listResetKey, setListResetKey] = useState(0);

    // --- Logged-in User State ---
    const [userLists, setUserLists] = useState(null);
    const [userMeals, setUserMeals] = useState(null);
    const [mealPlan, setMealPlan] = useState(null);
    const [activeListId, setActiveListId] = useState(null);
    const [activeListData, setActiveListData] = useState(null);

    // --- UI/Interaction State ---
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [newItem, setNewItem] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const [inputError, setInputError] = useState(false);
    const [needsResort, setNeedsResort] = useState(false);
    const [isPremium, setIsPremium] = useState(false); // This will be derived from user/subscription status
    const [showAddMealToListModal, setShowAddMealToListModal] = useState(false);
    const [isUpdatingMealPlan, setIsUpdatingMealPlan] = useState(false);
    const [promptConfig, setPromptConfig] = useState({ isOpen: false });
    const [mealModalConfig, setMealModalConfig] = useState({ isOpen: false });

    // --- AI Feature State ---
    const [mealIdea, setMealIdea] = useState({ title: '', has: [], needs: [], instructions: '' });
    const [isGeneratingMeal, setIsGeneratingMeal] = useState(false);
    const [suggestedItems, setSuggestedItems] = useState([]);
    const [isSuggestingItems, setIsSuggestingItems] = useState(false);
    const [ignoredSuggestions, setIgnoredSuggestions] = useState([]);

    // --- Auth Listener ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (!currentUser) {
                // Clear all user-specific data on logout
                setSubscriptionStatus(null);
                setUserLists(null);
                setUserMeals(null);
                setMealPlan(null);
                setActiveListId(null);
                setAuthLoading(false);
                setDataLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);
    
    // --- Data Loading for Logged-In Users ---
    useEffect(() => {
        if (!user) return; // Exit if no user

        setDataLoading(true);
        const userDocRef = doc(db, "users", user.uid);
        const listsQuery = query(collection(db, "lists"), where("members", "array-contains", user.uid));
        const mealsQuery = query(collection(db, "users", user.uid, "meals"));
        const planDocRef = doc(db, "mealPlans", user.uid);

        // Real-time listener for user subscription status
        const unsubUser = onSnapshot(userDocRef, (doc) => {
            setSubscriptionStatus(doc.exists() ? doc.data().subscriptionStatus || 'inactive' : 'inactive');
        }, (err) => console.error("Error fetching user status:", err));
        
        // Use Promise.all for a robust initial data load
        Promise.all([
            getDocs(listsQuery),
            getDocs(mealsQuery),
            getDoc(planDocRef)
        ]).then(([listsSnapshot, mealsSnapshot, planSnap]) => {
            const lists = listsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
            setUserLists(lists);

            const meals = mealsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => a.name.localeCompare(b.name));
            setUserMeals(meals);

            if (planSnap.exists()) {
                setMealPlan(planSnap.data());
            } else {
                const newPlan = { ownerId: user.uid, days: { Sunday: [], Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [] } };
                setDoc(planDocRef, newPlan); // Create plan if it doesn't exist
                setMealPlan(newPlan);
            }
            setDataLoading(false); // Only set loading to false after all initial data is fetched
        }).catch(err => {
            console.error("Error fetching initial data:", err);
            setError("Could not load your data.");
            setDataLoading(false);
        });

        // Attach real-time listeners for subsequent updates
        const unsubLists = onSnapshot(listsQuery, (snapshot) => {
            setUserLists(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)));
        });
        const unsubMeals = onSnapshot(mealsQuery, (snapshot) => {
            setUserMeals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => a.name.localeCompare(b.name)));
        });
        const unsubPlan = onSnapshot(planDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setMealPlan(docSnap.data());
            }
        });

        return () => { // Cleanup function
            unsubUser();
            unsubLists();
            unsubMeals();
            unsubPlan();
        };
    }, [user]);
    
    // --- Active List Data Loading ---
    useEffect(() => {
        if (activeListId && user) {
            const listDocRef = doc(db, "lists", activeListId);
            const unsubscribe = onSnapshot(listDocRef, (docSnap) => {
                setActiveListData(docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null);
            }, (err) => { console.error("Error fetching active list:", err); setError("Could not load the selected list."); });
            return () => unsubscribe();
        } else {
            setActiveListData(null);
        }
    }, [activeListId, user]);

    // --- Guest List Persistence ---
    useEffect(() => {
        if (!user) {
            localStorage.setItem('cartspark-guest-list', JSON.stringify(guestList));
        }
    }, [guestList, user]);

    // --- Authentication & Payment ---
    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try { 
            await signInWithPopup(auth, provider);
            // After login, the main useEffect will handle checking subscription status and routing.
        } catch (error) { 
            console.error("Authentication error:", error); 
            setError("Failed to sign in. Please try again."); 
        }
    };

    const handleProceedToPayment = async () => {
        if (!user) {
            setError("You must be signed in to subscribe.");
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const functions = getFunctions();
            const createStripeCheckout = httpsCallable(functions, 'createStripeCheckout');
            const { data } = await createStripeCheckout();
            const { id: sessionId } = data;

            const stripe = window.Stripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
            await stripe.redirectToCheckout({ sessionId });
        } catch (error) {
            console.error("Checkout error:", error);
            setError("Could not connect to the payment page. Please try again.");
            setIsLoading(false);
        }
    };
    
    const handleLogout = async () => {
        await signOut(auth);
        setActiveListId(null);
        setGuestList(null);
        setPage('home');
        setError('');
    };
    
    // --- Core App Logic ---
    const categoryOrder = useMemo(() => ['Produce', 'Bakery', 'Meat & Seafood', 'Dairy & Eggs', 'Pantry', 'Frozen Foods', 'Beverages', 'Household & Cleaning', 'Personal Care', 'Pets', 'Baby', 'Miscellaneous'], []);
    
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

    const callGeminiAPI = useCallback(async (prompt) => {
        if (!geminiApiKey) {
             setError("API Key is not configured correctly.");
             throw new Error("API Key missing.");
        }
        const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.3, maxOutputTokens: 2048 } };
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
        const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) {
            console.error("API Error Response:", await response.text());
            throw new Error(`API request failed with status ${response.status}.`);
        }
        const result = await response.json();
        if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
            return result.candidates[0].content.parts[0].text;
        } else {
            console.error("Invalid AI Response:", result);
            throw new Error(result?.promptFeedback?.blockReason ? `Request blocked: ${result.promptFeedback.blockReason}` : "Could not get a valid response from the AI.");
        }
    }, [geminiApiKey]);

    const handleSortList = useCallback(async (listToSort, listIdToUpdate, plannedMeals = []) => {
        setIsLoading(true);
        setError('');
        setIgnoredSuggestions([]);
        setSuggestedItems([]);
        const prompt = `Categorize these items into a JSON object with these keys: ${categoryOrder.join(', ')}. For any category without items, use an empty array []. The list is:\n---\n${listToSort}`;
        try {
            const responseText = await callGeminiAPI(prompt);
            let jsonString = responseText.substring(responseText.indexOf('{'), responseText.lastIndexOf('}') + 1).replace(/,\s*([\]}])/g, '$1');
            const parsedJson = JSON.parse(jsonString);
            const completeList = {};
            for (const category of categoryOrder) {
                completeList[category] = (parsedJson[category] || []).map(name => ({ name, checked: false }));
            }
            if (user && listIdToUpdate) {
                 const listDocRef = doc(db, "lists", listIdToUpdate);
                 await setDoc(listDocRef, { items: completeList, lastUpdated: serverTimestamp(), plannedMeals }, { merge: true });
            } else {
                setGuestList(completeList);
            }
            setNeedsResort(false);
        } catch (err) { setError(err.message); } 
        finally { setIsLoading(false); }
    }, [user, categoryOrder, callGeminiAPI]);
    
    const handleResort = useCallback(() => {
        if (!activeListData || !activeListData.items) return;
        const currentListItems = Object.values(activeListData.items || {}).flat().map(item => item.name).join('\n');
        handleSortList(currentListItems, activeListId, activeListData.plannedMeals || []);
    }, [activeListData, activeListId, handleSortList]);
    
    const handleGetMealIdea = useCallback(async () => {
        const currentList = user ? activeListData : { items: guestList };
        if (!hasItems(currentList)) {
            setError("Please add some items to your list before asking for a meal idea.");
            return;
        }
        setIsGeneratingMeal(true);
        setError('');
        setMealIdea({ title: '', has: [], needs: [], instructions: '' }); // Reset to default state
        try {
            const allItems = Object.values(currentList.items).flat().map(item => item.name);
            const prompt = `Given these grocery items: ${allItems.join(', ')}, suggest a simple meal. Return a JSON object with four keys: "title" (string), "has" (an array of strings for ingredients from the list), "needs" (an array of 1-3 strings for key ingredients NOT on the list), and "instructions" (a string with simple, step-by-step recipe instructions).`;
            const responseText = await callGeminiAPI(prompt);
            let jsonString = responseText.substring(responseText.indexOf('{'), responseText.lastIndexOf('}') + 1);
            const parsedJson = JSON.parse(jsonString);
            if (parsedJson.title && Array.isArray(parsedJson.has) && Array.isArray(parsedJson.needs) && parsedJson.instructions) {
                setMealIdea(parsedJson);
            } else {
                throw new Error("AI returned an invalid meal idea format.");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsGeneratingMeal(false);
        }
    }, [user, activeListData, guestList, callGeminiAPI]);
    
    const handleSuggestItems = useCallback(async () => {
        const currentList = user ? activeListData : { items: guestList };
        const allItems = Object.values(currentList.items || {}).flat().map(item => item.name);
        if (allItems.length === 0) {
            setError("Please add some items to your list before asking for suggestions.");
            return;
        }
        
        setSuggestedItems([]);
        const newIgnored = [...ignoredSuggestions, ...suggestedItems];
        setIgnoredSuggestions(newIgnored);

        setIsSuggestingItems(true);
        setError('');
        try {
            let prompt = `Based on this grocery list: ${allItems.join(', ')}, suggest 5 more related items.`;
            if (newIgnored.length > 0) {
                prompt += ` Do not suggest any of these items: ${newIgnored.join(', ')}.`;
            }
            prompt += " Return only a comma-separated list of strings, nothing else.";

            const responseText = await callGeminiAPI(prompt);
            const suggestions = responseText.split(',').map(s => s.trim()).filter(Boolean);
            setSuggestedItems(suggestions);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSuggestingItems(false);
        }
    }, [user, activeListData, guestList, ignoredSuggestions, suggestedItems, callGeminiAPI]);

    // --- FIX: Define the generatePlainTextList function ---
    const generatePlainTextList = useCallback(() => {
        const currentListSource = user ? activeListData : { items: guestList };
        if (!hasItems(currentListSource)) {
            return "Your list is empty!";
        }

        let plainText = "";
        const currentItems = currentListSource.items;

        for (const category of categoryOrder) {
            if (currentItems && currentItems[category] && currentItems[category].length > 0) {
                plainText += `${category}:\n`;
                currentItems[category].forEach(item => {
                    plainText += `- ${item.name}\n`;
                });
                plainText += "\n";
            }
        }
        return plainText.trim();
    }, [user, activeListData, guestList, categoryOrder]);
    
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
    
    const handleAddNewItem = useCallback((itemToAdd) => {
        if (!itemToAdd || !itemToAdd.trim()) return;
        const currentList = user ? activeListData : { items: guestList };
        const currentItems = currentList?.items ? Object.values(currentList.items).flat().map(item => item.name) : [];
        const combinedList = [...currentItems, ...itemToAdd.split('\n').filter(item => item.trim() !== '')];
        const newListString = combinedList.join('\n');
        setNewItem('');
        handleSortList(newListString, activeListId, activeListData?.plannedMeals || []);
    }, [user, activeListId, activeListData, guestList, handleSortList]);

    const handleDeleteItem = (categoryToDelete, indexToDelete) => {
        const currentListItems = user ? activeListData.items : guestList;
        const newList = JSON.parse(JSON.stringify(currentListItems));
        newList[categoryToDelete] = newList[categoryToDelete].filter((_, index) => index !== indexToDelete);
        updateListInStorage(newList);
    };
    
    const handleClearList = () => {
        setError('');
        setInputError(false);
        setMealIdea({ title: '', has: [], needs: [], instructions: '' });
        setSuggestedItems([]);
        setIgnoredSuggestions([]);
        setNeedsResort(false);
        if(user && activeListId) {
            updateListInStorage(null);
        } else {
            setGuestList(null);
            localStorage.removeItem('cartspark-guest-list');
            setListResetKey(prevKey => prevKey + 1);
        }
    };
    
    // --- List Management ---
    const handleCreateNewList = () => {
        setPromptConfig({
            isOpen: true,
            type: 'input',
            title: "Create New List",
            message: "Enter a name for your new list:",
            initialValue: "My Grocery List",
            confirmText: "Create",
            onSubmit: async (listName) => {
                if (listName && user) {
                    setIsLoading(true);
                    try {
                        const newListRef = await addDoc(collection(db, "lists"), { name: listName, ownerId: user.uid, members: [user.uid], createdAt: serverTimestamp(), items: null, plannedMeals: [] });
                        setActiveListId(newListRef.id);
                    } catch (e) { setError("Could not create new list."); } 
                    finally { setIsLoading(false); }
                }
            }
        });
    };

    const handleDeleteList = (listId) => {
        setPromptConfig({
            isOpen: true,
            type: 'confirm',
            title: "Delete List",
            message: "Are you sure you want to permanently delete this list?",
            confirmText: "Delete",
            onSubmit: async () => {
                if(user) {
                    try {
                        await deleteDoc(doc(db, "lists", listId));
                        if (activeListId === listId) setActiveListId(null);
                    } catch (e) { setError("Could not delete list."); }
                }
            }
        });
    };

    const handleShareList = (listId) => {
        setPromptConfig({
            isOpen: true,
            type: 'input',
            title: "Share List",
            message: "Enter the email address of the user you want to share this list with:",
            initialValue: "",
            confirmText: "Share",
            onSubmit: async (email) => {
                if (!email || !user) return;
                try {
                    const emailDocRef = doc(db, "emailToUid", email.toLowerCase());
                    const emailDoc = await getDoc(emailDocRef);
            
                    if (!emailDoc.exists()) {
                        setPromptConfig({
                            isOpen: true,
                            type: 'alert',
                            title: 'User Not Found',
                            message: "The user with that email address could not be found. Please make sure they have signed up for CartSpark.",
                        });
                        return;
                    }
            
                    const invitedUserId = emailDoc.data().uid;
            
                    const listDocRef = doc(db, "lists", listId);
                    await updateDoc(listDocRef, { members: arrayUnion(invitedUserId) });
            
                    setPromptConfig({
                        isOpen: true,
                        type: 'alert',
                        title: 'Success!',
                        message: 'List shared successfully!',
                    });
                } catch (e) {
                    console.error("Error sharing list: ", e);
                    setError("Could not share the list. Please try again.");
                }
            }
        });
    };
    
    // --- Meal Management ---
    const handleCreateNewMeal = () => {
        setMealModalConfig({
            isOpen: true,
            title: "Create New Meal",
            confirmText: "Save Meal",
            onSubmit: async ({ name, ingredients }) => {
                if (name && ingredients && user) {
                    const ingredientsArray = ingredients.split(/,|\n/).map(item => item.trim()).filter(Boolean);
                    await addDoc(collection(db, "users", user.uid, "meals"), { name, ownerId: user.uid, createdAt: serverTimestamp(), ingredients: ingredientsArray });
                }
            }
        });
    };

    const handleEditMeal = (mealToEdit) => {
        setMealModalConfig({
            isOpen: true,
            title: "Edit Meal",
            confirmText: "Save Changes",
            initialMeal: mealToEdit,
            onSubmit: async ({ name, ingredients }) => {
                if (name && ingredients) {
                    const ingredientsArray = ingredients.split(/,|\n/).map(item => item.trim()).filter(Boolean);
                    const mealDocRef = doc(db, "users", user.uid, "meals", mealToEdit.id);
                    await updateDoc(mealDocRef, { name, ingredients: ingredientsArray });
                }
            }
        });
    };

    const handleDeleteMeal = (mealId) => {
        setPromptConfig({
            isOpen: true,
            type: 'confirm',
            title: "Delete Meal",
            message: "Are you sure you want to delete this meal template?",
            confirmText: "Delete",
            onSubmit: async () => {
                await deleteDoc(doc(db, "users", user.uid, "meals", mealId));
            }
        });
    };

    const handleAddMealToList = useCallback(async (meal) => {
        if (!user || !activeListId || !activeListData) return;
        setIsLoading(true);
        setError('');
        try {
            const currentItems = activeListData?.items ? Object.values(activeListData.items).flat().map(item => item.name) : [];
            const combinedIngredients = [...new Set([...currentItems, ...meal.ingredients])];
            const newListString = combinedIngredients.join('\n');
            
            const currentPlannedMeals = activeListData?.plannedMeals || [];
            const newPlannedMeals = Array.from(new Set([...currentPlannedMeals, meal.name]));
            
            await handleSortList(newListString, activeListId, newPlannedMeals);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
            setShowAddMealToListModal(false);
        }
    }, [user, activeListId, activeListData, handleSortList]);

    // --- Meal Planner ---
    const handleAddMealToPlan = async (meal, day) => {
        if (!user || !day || !mealPlan) return;
        setIsUpdatingMealPlan(true);
        const newDays = JSON.parse(JSON.stringify(mealPlan.days));
        newDays[day].push({ id: meal.id, name: meal.name });
        
        const planDocRef = doc(db, "mealPlans", user.uid);
        try {
            await setDoc(planDocRef, { days: newDays }, { merge: true });
        } catch (e) {
            console.error("Error updating meal plan:", e);
            setError("Could not update meal plan.");
        } finally {
            setIsUpdatingMealPlan(false);
        }
    };
    
    const handleRemoveMealFromPlan = async (day, mealIndex) => {
        if (!user || !mealPlan) return;
        setIsUpdatingMealPlan(true);
        const newDays = { ...mealPlan.days };
        newDays[day] = newDays[day].filter((_, index) => index !== mealIndex);
        
        const planDocRef = doc(db, "mealPlans", user.uid);
        try {
            await setDoc(planDocRef, { days: newDays }, { merge: true });
        } catch (e) {
            console.error("Error updating meal plan:", e);
        } finally {
            setIsUpdatingMealPlan(false);
        }
    };

    const handleGenerateShoppingList = useCallback(async () => {
        if (!user || !mealPlan || !userMeals) return;
        setIsLoading(true);
        setError('');
        try {
            const allIngredients = new Set();
            const plannedMealsSet = new Set();
            
            Object.values(mealPlan.days).flat().forEach(plannedMeal => {
                const fullMeal = userMeals.find(m => m.id === plannedMeal.id);
                if (fullMeal) {
                    plannedMealsSet.add(fullMeal.name);
                    fullMeal.ingredients.forEach(ing => allIngredients.add(ing));
                }
            });

            if (allIngredients.size === 0) {
                setError("Your meal plan is empty. Add some meals to generate a list.");
                setIsLoading(false);
                return;
            }
            
            const listString = Array.from(allIngredients).join('\n');
            const listName = `Shopping List for ${new Date().toLocaleDateString()}`;
            
            const newListRef = await addDoc(collection(db, "lists"), {
                name: listName, ownerId: user.uid, members: [user.uid], createdAt: serverTimestamp(), items: null, plannedMeals: Array.from(plannedMealsSet)
            });
            
            await handleSortList(listString, newListRef.id, Array.from(plannedMealsSet));
            setActiveListId(newListRef.id);
            setPage('home');
        } catch (e) {
            setError("Could not generate shopping list: " + e.message);
        } finally {
            setIsLoading(false);
        }
    }, [user, mealPlan, userMeals, handleSortList]);

    const handleClearMealPlan = useCallback(async () => {
        if (!user) return;
        setPromptConfig({
            isOpen: true, type: 'confirm', title: "Clear Meal Plan",
            message: "Are you sure you want to clear your entire meal plan for the week?",
            confirmText: "Clear",
            onSubmit: async () => {
                setIsUpdatingMealPlan(true);
                const newPlan = { ownerId: user.uid, days: { Sunday: [], Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [] } };
                const planDocRef = doc(db, "mealPlans", user.uid);
                try {
                    await setDoc(planDocRef, newPlan);
                } catch (e) { setError("Could not clear the meal plan."); } 
                finally { setIsUpdatingMealPlan(false); }
            }
        });
    }, [user]);

    const value = {
        // State
        user, authLoading, dataLoading, subscriptionStatus, page, selectedArticle,
        newItem, isLoading, error, mealIdea, isGeneratingMeal, editingItem, inputError,
        needsResort, userLists, activeListId, activeListData, guestList, userMeals,
        showAddMealToListModal, mealPlan, isPremium, suggestedItems, isSuggestingItems,
        listResetKey, isUpdatingMealPlan, promptConfig, mealModalConfig, categoryOrder,

        // Setters
        setPage, setSelectedArticle, setNewItem, setIsLoading, setError, setMealIdea,
        setIsGeneratingMeal, setEditingItem, setInputError, setNeedsResort,
        setActiveListId, setGuestList, setShowAddMealToListModal,
        setPromptConfig, setMealModalConfig, setSuggestedItems,
        
        // Functions
        handleGoogleLogin, handleLogout, handleProceedToPayment,
        handleToggleCheck, handleSortList, handleResort, handleEditStart, handleEditChange, handleEditSave,
        handleAddNewItem, handleDeleteItem, handleClearList,
        handleCreateNewList, handleDeleteList, handleShareList,
        handleCreateNewMeal, handleEditMeal, handleDeleteMeal,
        handleAddMealToPlan, handleRemoveMealFromPlan, handleGenerateShoppingList,
        handleAddMealToList, handleGetMealIdea, handleSuggestItems,
        generatePlainTextList, handleClearMealPlan
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};