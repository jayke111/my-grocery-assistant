import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
    onAuthStateChanged, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut, 
    updateProfile,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail
} from "firebase/auth";
import * as firestore from "firebase/firestore";
import { auth, db } from './firebase-config';
import { hasItems } from './utils';
import { loadStripe } from '@stripe/stripe-js';

const AppContext = createContext();

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

export const useAppContext = () => {
    return useContext(AppContext);
};

export const AppProvider = ({ children }) => {
    const geminiApiKey = process.env.REACT_APP_GEMINI_API_KEY; 
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [dataLoading, setDataLoading] = useState(true);
    const [subscriptionStatus, setSubscriptionStatus] = useState(null);
    const [page, setPage] = useState('home');
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [newItem, setNewItem] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const [inputError, setInputError] = useState(false);
    const [needsResort, setNeedsResort] = useState(false);
    const [userLists, setUserLists] = useState(null);
    const [activeListId, setActiveListId] = useState(null);
    const [activeListData, setActiveListData] = useState(null);
    const [guestList, setGuestList] = useState(() => {
        try {
            const saved = localStorage.getItem('cartspark-guest-list');
            return saved ? JSON.parse(saved) : null;
        } catch (e) { return null; }
    });
    const isPremium = useMemo(() => subscriptionStatus === 'active', [subscriptionStatus]);
    const [userMeals, setUserMeals] = useState(null);
    const [showAddMealToListModal, setShowAddMealToListModal] = useState(false);
    const [mealPlan, setMealPlan] = useState(null);
    const [isUpdatingMealPlan, setIsUpdatingMealPlan] = useState(false);
    const [mealIdea, setMealIdea] = useState(null);
    const [isGeneratingMeal, setIsGeneratingMeal] = useState(false);
    const [suggestedItems, setSuggestedItems] = useState([]);
    const [isSuggestingItems, setIsSuggestingItems] = useState(false);
    const [ignoredSuggestions, setIgnoredSuggestions] = useState([]);
    const [listResetKey, setListResetKey] = useState(0);
    const [promptConfig, setPromptConfig] = useState({ isOpen: false });
    const [mealModalConfig, setMealModalConfig] = useState({ isOpen: false });
    const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);

    const refreshUserMeals = useCallback(async () => {
        if (!user) return;
        try {
            const mealsQuery = firestore.query(firestore.collection(db, "users", user.uid, "meals"), firestore.orderBy("name"));
            const mealsSnapshot = await firestore.getDocs(mealsQuery);
            const meals = mealsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUserMeals(meals);
        } catch (err) {
            console.error("Error refreshing user meals:", err);
            setError("Could not refresh your meal list.");
        }
    }, [user]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (user) {
            setDataLoading(true);
            const userDocRef = firestore.doc(db, "users", user.uid);
            const listsQuery = firestore.query(firestore.collection(db, "lists"), firestore.where("members", "array-contains", user.uid));
            const mealsQuery = firestore.query(firestore.collection(db, "users", user.uid, "meals"), firestore.orderBy("name"));
            const planDocRef = firestore.doc(db, "mealPlans", user.uid);

            const unsubUser = firestore.onSnapshot(userDocRef, (doc) => {
                if (doc.exists()) setSubscriptionStatus(doc.data().subscriptionStatus || 'inactive');
            });
            const unsubLists = firestore.onSnapshot(listsQuery, (snapshot) => {
                setUserLists(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)));
            });
            const unsubMeals = firestore.onSnapshot(mealsQuery, (snapshot) => {
                setUserMeals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            });
            const unsubPlan = firestore.onSnapshot(planDocRef, (docSnap) => {
                if(docSnap.exists()) setMealPlan(docSnap.data());
            });
            
            setDataLoading(false);

            return () => { 
                unsubUser(); 
                unsubLists(); 
                unsubMeals(); 
                unsubPlan(); 
            };
        } else {
            setUserLists(null); 
            setUserMeals(null); 
            setMealPlan(null); 
            setSubscriptionStatus(null);
            setDataLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (activeListId && user) {
            const listDocRef = firestore.doc(db, "lists", activeListId);
            const unsubscribe = firestore.onSnapshot(listDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    setActiveListData({ id: docSnap.id, ...docSnap.data() });
                } else {
                    console.error("No such document!");
                    setError("Could not find the selected list.");
                    setActiveListData(null);
                }
            }, (err) => {
                console.error("Error fetching active list:", err);
                setError("Could not load the selected list.");
            });
            return () => unsubscribe();
        } else {
            setActiveListData(null);
        }
    }, [activeListId, user]);

    const handleProceedToPayment = async (priceId) => {
        if (!user) {
            setError("You must be logged in to subscribe.");
            return;
        }
        if (!priceId) {
            setError("Please select a subscription plan.");
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            const stripe = await stripePromise;
            const { error } = await stripe.redirectToCheckout({
                lineItems: [{ price: priceId, quantity: 1 }],
                mode: 'subscription',
                successUrl: 'https://cartspark-85cbc.web.app/success',
                cancelUrl: 'https://cartspark-85cbc.web.app',
                customerEmail: user.email,
            });

            if (error) {
                throw new Error(error.message);
            }
        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    const callGeminiAPI = async (prompt) => {
        if (!geminiApiKey) throw new Error("API Key missing.");
        const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.3, maxOutputTokens: 2048 } };
        
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;
        
        const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error(`API request failed with status ${response.status}.`);
        const result = await response.json();
        if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
            return result.candidates[0].content.parts[0].text;
        } else {
            throw new Error(result?.promptFeedback?.blockReason ? `Request blocked: ${result.promptFeedback.blockReason}` : "Could not get a valid response from the AI.");
        }
    };

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try { 
            await signInWithPopup(auth, provider);
        } 
        catch (error) { 
            console.error("Authentication error:", error); 
            setError("Failed to sign in. Please try again."); 
        }
    };

    const handleLoginAndCheckout = async (priceId) => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const loggedInUser = result.user;

            if (loggedInUser) {
                await handleProceedToPayment(priceId);
            } else {
                throw new Error("Login failed, user not found.");
            }
        } catch (error) {
            console.error("Login and checkout error:", error);
            setError("Could not sign in. Please try again.");
        }
    };

    const handleEmailSignUp = async (email, password) => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (error) {
            throw new Error(error.message);
        }
    };

    const handleEmailLogin = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            throw new Error(error.message);
        }
    };

    const handlePasswordReset = async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            throw new Error(error.message);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        setActiveListId(null);
        setGuestList(null);
        setPage('home');
    };
    
    const categoryOrder = useMemo(() => ['Produce', 'Bakery', 'Meat & Seafood', 'Dairy & Eggs', 'Pantry', 'Frozen Foods', 'Beverages', 'Household & Cleaning', 'Personal Care', 'Pets', 'Baby', 'Miscellaneous'], []);
    
    const updateListInStorage = async (newListState) => {
        if (user && activeListId) {
            const listDocRef = firestore.doc(db, "lists", activeListId);
            await firestore.setDoc(listDocRef, { items: newListState }, { merge: true });
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

    const handleSortList = async (listToSort, listIdToUpdate, plannedMeals = []) => {
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
                 const listDocRef = firestore.doc(db, "lists", listIdToUpdate);
                 await firestore.setDoc(listDocRef, { items: completeList, lastUpdated: firestore.serverTimestamp(), plannedMeals }, { merge: true });
            } else {
                setGuestList(completeList);
            }
            setNeedsResort(false);
        } catch (err) { setError(err.message); } 
        finally { setIsLoading(false); }
    };
    
    const handleResort = () => {
        const currentListItems = Object.values(activeListData.items || {}).flat().map(item => item.name).join('\n');
        handleSortList(currentListItems, activeListId, activeListData.plannedMeals || []);
    };

    const handleGetMealIdea = async () => {
        const currentList = user ? activeListData : { items: guestList };
        if (!hasItems(currentList)) {
            setError("Please add some items to your list before asking for a meal idea.");
            return;
        }
        setIsGeneratingMeal(true);
        setError('');
        setMealIdea(null);
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
    };
    
    const handleSuggestItems = async () => {
        const currentList = user ? activeListData : { items: guestList };
        const allItems = Object.values(currentList.items || {}).flat().map(item => item.name);
        if (allItems.length === 0) {
            setError("Please add some items to your list before asking for suggestions.");
            return;
        }
        
        const newIgnored = [...ignoredSuggestions, ...suggestedItems];
        setIgnoredSuggestions(newIgnored);

        setIsSuggestingItems(true);
        setError('');
        try {
            let prompt = `Based on this grocery list: ${allItems.join(', ')}, suggest 5 more related items.`;
            if (newIgnored.length > 0) {
                prompt += ` Do not suggest any of these items: ${newIgnored.join(', ')}.`;
            }
            prompt += " Return only a comma-separated list, nothing else.";

            const responseText = await callGeminiAPI(prompt);
            const suggestions = responseText.split(',').map(s => s.trim()).filter(Boolean);
            setSuggestedItems(suggestions);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSuggestingItems(false);
        }
    };
    
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
    
    const handleAddNewItem = (itemToAdd = newItem) => {
        if (!itemToAdd.trim()) return;
        const currentList = user ? activeListData : { items: guestList };
        const currentItems = currentList?.items ? Object.values(currentList.items).flat().map(item => item.name) : [];
        const combinedList = [...currentItems, ...itemToAdd.split('\n').filter(item => item.trim() !== '')];
        const newListString = combinedList.join('\n');
        setNewItem('');
        handleSortList(newListString, activeListId, activeListData?.plannedMeals || []);
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
        setMealIdea(null);
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
                        const newListRef = await firestore.addDoc(firestore.collection(db, "lists"), { name: listName, ownerId: user.uid, members: [user.uid], createdAt: firestore.serverTimestamp(), items: null });
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
                try {
                    await firestore.deleteDoc(firestore.doc(db, "lists", listId));
                    if (activeListId === listId) setActiveListId(null);
                } catch (e) { setError("Could not delete list."); }
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
                    const emailDocRef = firestore.doc(db, "emailToUid", email.toLowerCase());
                    const emailDoc = await firestore.getDoc(emailDocRef);
            
                    if (!emailDoc.exists()) {
                        setPromptConfig({
                            isOpen: true,
                            type: 'confirm',
                            title: 'Invite User?',
                            message: `The user ${email} isn't on CartSpark yet. Would you like to send them an invitation?`,
                            confirmText: 'Send Invite',
                            onSubmit: () => {
                                const subject = "You're invited to collaborate on a grocery list!";
                                const body = `Hey!\n\nI'm using CartSpark to organize my shopping and I'd like to share a list with you.\n\nYou can sign up for free here: [Your App's URL]\n\nSee you there!\n\n- ${user.displayName || user.email}`;
                                const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                                window.location.href = mailtoLink;
                            }
                        });
                        return;
                    }
            
                    const invitedUserId = emailDoc.data().uid;
                    const listDocRef = firestore.doc(db, "lists", listId);
                    await firestore.updateDoc(listDocRef, { members: firestore.arrayUnion(invitedUserId) });
            
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
    
    // --- THIS IS THE FIX: All meal-related functions now handle the 'instructions' field ---
    const handleCreateNewMeal = () => {
        setMealModalConfig({
            isOpen: true,
            title: "Create New Meal",
            confirmText: "Save Meal",
            onSubmit: async ({ name, ingredients, instructions }) => {
                if (name && ingredients && user) {
                    const ingredientsArray = ingredients.split(',').map(item => item.trim()).filter(Boolean);
                    await firestore.addDoc(firestore.collection(db, "users", user.uid, "meals"), { 
                        name, 
                        ownerId: user.uid, 
                        createdAt: firestore.serverTimestamp(), 
                        ingredients: ingredientsArray,
                        instructions: instructions || "" // Save instructions
                    });
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
            onSubmit: async ({ name, ingredients, instructions }) => {
                if (name && ingredients) {
                    const ingredientsArray = ingredients.split(',').map(item => item.trim()).filter(Boolean);
                    const mealDocRef = firestore.doc(db, "users", user.uid, "meals", mealToEdit.id);
                    await firestore.updateDoc(mealDocRef, { 
                        name, 
                        ingredients: ingredientsArray,
                        instructions: instructions || "" // Save instructions
                    });
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
                await firestore.deleteDoc(firestore.doc(db, "users", user.uid, "meals", mealId));
            }
        });
    };

    const handleSaveMealIdea = async (mealIdeaToSave) => {
        if (!mealIdeaToSave || !user) return;
        const allIngredients = [...mealIdeaToSave.has, ...mealIdeaToSave.needs];
        try {
            await firestore.addDoc(firestore.collection(db, "users", user.uid, "meals"), {
                name: mealIdeaToSave.title,
                ownerId: user.uid,
                createdAt: firestore.serverTimestamp(),
                ingredients: allIngredients,
                instructions: mealIdeaToSave.instructions || "" // Save instructions
            });
            setPromptConfig({
                isOpen: true,
                type: 'alert',
                title: 'Meal Saved!',
                message: `"${mealIdeaToSave.title}" has been added to your meal templates.`,
            });
        } catch (e) {
            console.error("Error saving meal idea:", e);
            setError("Could not save the meal template.");
        }
    };
    
    const handleAddSuggestedMeal = async (meal) => {
        if (!meal || !user) return;
        try {
            await firestore.addDoc(firestore.collection(db, "users", user.uid, "meals"), {
                name: meal.name,
                ownerId: user.uid,
                createdAt: firestore.serverTimestamp(),
                ingredients: meal.ingredients,
                instructions: meal.instructions || "" // Save instructions
            });
        } catch (e) {
            console.error("Error adding suggested meal:", e);
            setError("Could not add the suggested meal.");
        }
    };

    const handleAddMealToPlan = async (meal, day, mealType) => {
        if (!user || !day || !mealType || !mealPlan || !userMeals) return;

        const fullMealData = userMeals.find(m => m.id === meal.id);

        if (!fullMealData) {
            setError("Could not find the selected meal template.");
            return;
        }
        
        const simpleMeal = { id: fullMealData.id, name: fullMealData.name, ingredients: fullMealData.ingredients };
        const newDays = JSON.parse(JSON.stringify(mealPlan.days));
        
        if (!newDays[day] || typeof newDays[day] !== 'object' || Array.isArray(newDays[day])) {
            newDays[day] = { breakfast: [], lunch: [], dinner: [] };
        }
        if (!Array.isArray(newDays[day][mealType])) {
            newDays[day][mealType] = [];
        }
        
        newDays[day][mealType].push(simpleMeal);
        
        setMealPlan(prevPlan => ({ ...prevPlan, days: newDays }));

        const planDocRef = firestore.doc(db, "mealPlans", user.uid);
        try {
            await firestore.setDoc(planDocRef, { days: newDays }, { merge: true });
        } catch (e) {
            console.error("Error updating meal plan:", e);
setError("Could not update meal plan. Please try again.");
            setMealPlan(mealPlan); 
        }
    };
    
    const handleAddMealToList = async (meal) => {
        if (!user || !activeListId || !activeListData) return;
        setIsLoading(true);
        setError('');
        try {
            const currentItems = activeListData?.items ? Object.values(activeListData.items).flat().map(item => item.name) : [];
            const combinedIngredients = [...new Set([...currentItems, ...meal.ingredients])];
            const newListString = combinedIngredients.join('\n');

            const prompt = `Categorize these items into a JSON object with these keys: ${categoryOrder.join(', ')}. For any category without items, use an empty array []. The list is:\n---\n${newListString}`;
            const responseText = await callGeminiAPI(prompt);
            let jsonString = responseText.substring(responseText.indexOf('{'), responseText.lastIndexOf('}') + 1).replace(/,\s*([\]}])/g, '$1');
            const parsedJson = JSON.parse(jsonString);
            const completeList = {};
            for (const category of categoryOrder) {
                completeList[category] = (parsedJson[category] || []).map(name => ({ name, checked: false }));
            }

            const currentPlannedMeals = activeListData?.plannedMeals || [];
            const newPlannedMeals = Array.from(new Set([...currentPlannedMeals, meal.name]));
            
            const listDocRef = firestore.doc(db, "lists", activeListId);
            await firestore.updateDoc(listDocRef, {
                items: completeList,
                plannedMeals: newPlannedMeals,
                lastUpdated: firestore.serverTimestamp()
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
            setShowAddMealToListModal(false);
        }
    };

    const handleRemoveMealFromPlan = async (day, mealType, mealIndex) => {
        if (!user || !mealPlan) return;

        setIsUpdatingMealPlan(true);
        const newDays = { ...mealPlan.days };
        newDays[day][mealType] = newDays[day][mealType].filter((_, index) => index !== mealIndex);
        
        const planDocRef = firestore.doc(db, "mealPlans", user.uid);
        try {
            await firestore.setDoc(planDocRef, { days: newDays }, { merge: true });
        } catch (e) {
            console.error("Error updating meal plan:", e);
        } finally {
            setIsUpdatingMealPlan(false);
        }
    };

    const handleGenerateShoppingList = async () => {
        if (!user) return;
        setIsLoading(true);
        setError('');
        try {
            const planDocRef = firestore.doc(db, "mealPlans", user.uid);
            const docSnap = await firestore.getDoc(planDocRef);

            if (!docSnap.exists()) {
                throw new Error("No meal plan found for this user.");
            }
            const currentMealPlan = docSnap.data();

            const allIngredients = new Set();
            const plannedMeals = new Set();
            
            Object.values(currentMealPlan.days).forEach(day => {
                if (Array.isArray(day)) { 
                    day.forEach(meal => {
                        if (meal && meal.ingredients && Array.isArray(meal.ingredients)) {
                            plannedMeals.add(meal.name);
                            meal.ingredients.forEach(ing => allIngredients.add(ing));
                        }
                    });
                } else if (day && typeof day === 'object') { 
                    Object.values(day).forEach(mealTypeArray => {
                        if (Array.isArray(mealTypeArray)) {
                            mealTypeArray.forEach(meal => {
                                if (meal && meal.ingredients && Array.isArray(meal.ingredients)) {
                                    plannedMeals.add(meal.name);
                                    meal.ingredients.forEach(ing => allIngredients.add(ing));
                                }
                            });
                        }
                    });
                }
            });

            if (allIngredients.size === 0) {
                setError("Your meal plan is empty. Add some meals to generate a list.");
                setIsLoading(false);
                return;
            }

            const listString = Array.from(allIngredients).join('\n');
            
            const listName = `Shopping List for ${new Date().toLocaleDateString()}`;
            const newListRef = await firestore.addDoc(firestore.collection(db, "lists"), {
                name: listName,
                ownerId: user.uid,
                members: [user.uid],
                createdAt: firestore.serverTimestamp(),
                items: null,
                plannedMeals: Array.from(plannedMeals)
            });
            
            await handleSortList(listString, newListRef.id, Array.from(plannedMeals));
            setActiveListId(newListRef.id);
            setPage('home');
        } catch (e) {
            console.error("Error generating shopping list:", e);
            setError("Could not generate shopping list.");
        } finally {
            setIsLoading(false);
        }
    };

    const generatePlainTextList = () => {
        const currentList = user ? activeListData : { items: guestList };
        if (!hasItems(currentList)) return "Your list is empty!";

        let text = `${currentList.name || 'My Grocery List'}\n\n`;
        categoryOrder.forEach(category => {
            if (currentList.items[category] && currentList.items[category].length > 0) {
                text += `--- ${category} ---\n`;
                currentList.items[category].forEach(item => {
                    text += `- ${item.name}\n`;
                });
                text += '\n';
            }
        });
        return text;
    };
    
    const handleClearMealPlan = async () => {
        if (!user) return;
        setPromptConfig({
            isOpen: true,
            type: 'confirm',
            title: "Clear Meal Plan",
            message: "Are you sure you want to clear your entire meal plan for the week?",
            confirmText: "Clear",
            onSubmit: async () => {
                setIsUpdatingMealPlan(true);
                const newPlan = { 
                    ownerId: user.uid, 
                    planVersion: 2,
                    days: { 
                        Sunday: { breakfast: [], lunch: [], dinner: [] },
                        Monday: { breakfast: [], lunch: [], dinner: [] },
                        Tuesday: { breakfast: [], lunch: [], dinner: [] },
                        Wednesday: { breakfast: [], lunch: [], dinner: [] },
                        Thursday: { breakfast: [], lunch: [], dinner: [] },
                        Friday: { breakfast: [], lunch: [], dinner: [] },
                        Saturday: { breakfast: [], lunch: [], dinner: [] }
                    } 
                };
                const planDocRef = firestore.doc(db, "mealPlans", user.uid);
                try {
                    await firestore.setDoc(planDocRef, newPlan);
                } catch (e) {
                    setError("Could not clear the meal plan.");
                } finally {
                    setIsUpdatingMealPlan(false);
                }
            }
        });
    };

    const handleUpdateListName = async (listId, newName) => {
        if (!listId || !newName) return;
        const listDocRef = firestore.doc(db, "lists", listId);
        try {
            await firestore.updateDoc(listDocRef, {
                name: newName
            });
        } catch (e) {
            console.error("Error updating list name:", e);
            setError("Could not update the list name.");
        }
    };

    const handleUpdateProfile = async (newName) => {
        if (!auth.currentUser) return;
        
        await updateProfile(auth.currentUser, {
            displayName: newName
        });
        setUser({ ...auth.currentUser }); 
    };
    
    const value = {
        user, authLoading, dataLoading, page, setPage, selectedArticle, setSelectedArticle,
        newItem, setNewItem, isLoading, setIsLoading, error, setError, mealIdea, setMealIdea,
        isGeneratingMeal, setIsGeneratingMeal, editingItem, setEditingItem, inputError, setInputError,
        needsResort, setNeedsResort, userLists, activeListId, setActiveListId, activeListData,
        guestList, setGuestList, userMeals, showAddMealToListModal, setShowAddMealToListModal,
        mealPlan, handleGoogleLogin, handleLogout, categoryOrder, updateListInStorage, handleToggleCheck,
        handleSortList, handleResort, handleEditStart, handleEditChange, handleEditSave, handleAddNewItem,
        handleDeleteItem, handleClearList, handleCreateNewList, handleDeleteList, handleShareList,
        handleCreateNewMeal, handleEditMeal, handleDeleteMeal, handleAddMealToPlan, handleRemoveMealFromPlan,
        handleGenerateShoppingList, handleAddMealToList, isPremium,
        suggestedItems, setSuggestedItems, isSuggestingItems, handleSuggestItems, handleGetMealIdea,
        generatePlainTextList, listResetKey, isUpdatingMealPlan, handleClearMealPlan,
        promptConfig, setPromptConfig, mealModalConfig, setMealModalConfig,
        subscriptionStatus,
        handleProceedToPayment,
        handleSaveMealIdea,
        handleUpdateListName,
        handleUpdateProfile,
        showSuggestionsModal, 
        setShowSuggestionsModal,
        handleAddSuggestedMeal,
        handleLoginAndCheckout,
        handleEmailSignUp,
        handleEmailLogin,
        handlePasswordReset,
        refreshUserMeals
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};
