import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { doc, setDoc, onSnapshot, collection, query, where, addDoc, deleteDoc, serverTimestamp, getDoc, updateDoc, arrayUnion, writeBatch } from "firebase/firestore";
import { auth, db } from './firebase-config';
import { hasItems } from './utils';

const AppContext = createContext();

export const useAppContext = () => {
    return useContext(AppContext);
};

export const AppProvider = ({ children }) => {
    const geminiApiKey = "AIzaSyDUsA1lOW3tvCN5VIdk-21pXkpIDJ6QlvU"; 

    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [dataLoading, setDataLoading] = useState(true);

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
    const [isPremium, setIsPremium] = useState(() => {
        const saved = localStorage.getItem('isPremium');
        return saved ? JSON.parse(saved) : false;
    });

    const [userMeals, setUserMeals] = useState(null);
    const [showAddMealToListModal, setShowAddMealToListModal] = useState(false);
    const [mealPlan, setMealPlan] = useState(null);
    
    const [mealIdea, setMealIdea] = useState(null);
    const [isGeneratingMeal, setIsGeneratingMeal] = useState(false);
    const [suggestedItems, setSuggestedItems] = useState([]);
    const [isSuggestingItems, setIsSuggestingItems] = useState(false);
    
    const [listResetKey, setListResetKey] = useState(0);

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
            }
            setAuthLoading(false);
        });
        return () => unsubscribe(); 
    }, []);

    useEffect(() => {
        if (user) {
            setDataLoading(true);
            const listsQuery = query(collection(db, "lists"), where("members", "array-contains", user.uid));
            const mealsQuery = query(collection(db, "meals"), where("ownerId", "==", user.uid));
            const planQuery = doc(db, "mealPlans", user.uid);

            let listsLoaded = false, mealsLoaded = false, planLoaded = false;
            const checkDataLoaded = () => {
                if (listsLoaded && mealsLoaded && planLoaded) setDataLoading(false);
            };

            const unsubLists = onSnapshot(listsQuery, (snapshot) => {
                setUserLists(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)));
                listsLoaded = true; checkDataLoaded();
            }, (err) => { console.error("Error fetching lists:", err); setError("Could not load lists."); });
            
            const unsubMeals = onSnapshot(mealsQuery, (snapshot) => {
                setUserMeals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => a.name.localeCompare(b.name)));
                mealsLoaded = true; checkDataLoaded();
            }, (err) => { console.error("Error fetching meals:", err); setError("Could not load meals."); });

            const unsubPlan = onSnapshot(planQuery, (docSnap) => {
                if (docSnap.exists()) {
                    setMealPlan(docSnap.data());
                } else {
                    const newPlan = { ownerId: user.uid, days: { Sunday: [], Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [] } };
                    setDoc(planQuery, newPlan);
                    setMealPlan(newPlan);
                }
                planLoaded = true; checkDataLoaded();
            }, (err) => { console.error("Error fetching meal plan:", err); setError("Could not load meal plan."); });

            return () => { unsubLists(); unsubMeals(); unsubPlan(); };
        } else {
            setUserLists(null); setUserMeals(null); setMealPlan(null); setDataLoading(false);
        }
    }, [user]);
    
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

    useEffect(() => {
        if (!user) {
            localStorage.setItem('cartspark-guest-list', JSON.stringify(guestList));
        }
    }, [guestList, user]);

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try { await signInWithPopup(auth, provider); setPage('home'); } 
        catch (error) { console.error("Authentication error:", error); setError("Failed to sign in."); }
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
        if (!geminiApiKey) throw new Error("API Key missing.");
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

    const handleSortList = async (listToSort, listIdToUpdate, plannedMeals = []) => {
        setIsLoading(true);
        setError('');
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
        setSuggestedItems([]);
        setIsSuggestingItems(true);
        setError('');
        try {
            const prompt = `Based on this grocery list: ${allItems.join(', ')}, suggest 5 more related items. Return only a comma-separated list, nothing else.`;
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
        setNeedsResort(false);
        if(user && activeListId) {
            updateListInStorage(null);
        } else {
            setGuestList(null);
            localStorage.removeItem('cartspark-guest-list');
            setListResetKey(prevKey => prevKey + 1);
        }
    };
    
    const handleCreateNewList = async () => {
        const listName = prompt("Enter a name for your new list:", "My Grocery List");
        if (listName && user) {
            setIsLoading(true);
            try {
                const newListRef = await addDoc(collection(db, "lists"), { name: listName, ownerId: user.uid, members: [user.uid], createdAt: serverTimestamp(), items: null });
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
                await addDoc(collection(db, "meals"), { name: mealName, ownerId: user.uid, createdAt: serverTimestamp(), ingredients: ingredientsArray });
            }
        }
    };

    const handleEditMeal = async (mealToEdit) => {
        const newMealName = prompt("Enter the new name for your meal template:", mealToEdit.name);
        if (newMealName) {
            const newIngredients = prompt("Enter the new ingredients, separated by commas:", mealToEdit.ingredients.join(', '));
            if (newIngredients) {
                const ingredientsArray = newIngredients.split(',').map(item => item.trim()).filter(Boolean);
                const mealDocRef = doc(db, "meals", mealToEdit.id);
                await updateDoc(mealDocRef, { name: newMealName, ingredients: ingredientsArray });
            }
        }
    };

    const handleDeleteMeal = async (mealId) => {
        if (window.confirm("Are you sure you want to delete this meal template?")) {
            await deleteDoc(doc(db, "meals", mealId));
        }
    };

    const handleAddMealToPlan = async (meal, day) => {
        if (!user || !day || !mealPlan) return;
        const newDays = { ...mealPlan.days };
        const simpleMeal = { id: meal.id, name: meal.name, ingredients: meal.ingredients };
        newDays[day] = [...newDays[day], simpleMeal];
        await setDoc(doc(db, "mealPlans", user.uid), { days: newDays }, { merge: true });
    };
    
    const handleAddMealToList = (meal) => {
        const currentItems = activeListData?.items ? Object.values(activeListData.items).flat().map(item => item.name) : [];
        const combinedList = [...new Set([...currentItems, ...meal.ingredients])];
        const newListString = combinedList.join('\n');
        handleSortList(newListString, activeListId);
        setShowAddMealToListModal(false);
    };

    const handleRemoveMealFromPlan = async (day, mealIndex) => {
        if (!user || !mealPlan) return;
        const newDays = { ...mealPlan.days };
        newDays[day] = newDays[day].filter((_, index) => index !== mealIndex);
        await setDoc(doc(db, "mealPlans", user.uid), { days: newDays }, { merge: true });
    };

    const handleGenerateShoppingList = async () => {
        if (!user || !mealPlan) return;
        setIsLoading(true);
        try {
            const allIngredients = new Set();
            const plannedMeals = new Set();
            Object.values(mealPlan.days).forEach(meals => {
                meals.forEach(meal => {
                    plannedMeals.add(meal.name);
                    meal.ingredients.forEach(ing => allIngredients.add(ing));
                });
            });
            const listString = Array.from(allIngredients).join('\n');
            
            const listName = `Shopping List for ${new Date().toLocaleDateString()}`;
            const newListRef = await addDoc(collection(db, "lists"), {
                name: listName,
                ownerId: user.uid,
                members: [user.uid],
                createdAt: serverTimestamp(),
                items: null,
                plannedMeals: Array.from(plannedMeals)
            });
            
            await handleSortList(listString, newListRef.id, Array.from(plannedMeals));
            setActiveListId(newListRef.id);
            setPage('home');
        } catch (e) {
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

    const handleJoinWaitlist = async (email) => {
        if (!email) return;
        const waitlistRef = collection(db, "waitlist");
        try {
            await addDoc(waitlistRef, {
                email: email,
                timestamp: serverTimestamp()
            });
        } catch (e) {
            console.error("Error adding document: ", e);
            setError("Could not add you to the waitlist. Please try again.");
        }
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
        generatePlainTextList, listResetKey, handleJoinWaitlist
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};
