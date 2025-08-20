import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'; // MODIFIED: Added useCallback
// --- MODIFICATION: Import new functions for email authentication ---
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

    // ===================================================================
    // === ADD THIS NEW FUNCTION TO REFRESH THE MEAL LIST ===
    // ===================================================================
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

            // Note: We now fetch meals from the user's subcollection: /users/{uid}/meals
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

            // Initial data load is handled by the snapshots, so we can just set loading to false.
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
        // ... (rest of the function is unchanged)
    };

    const callGeminiAPI = async (prompt) => {
        // ... (rest of the function is unchanged)
    };

    const handleGoogleLogin = async () => {
        // ... (rest of the function is unchanged)
    };

    const handleLoginAndCheckout = async (priceId) => {
        // ... (rest of the function is unchanged)
    };

    // --- NEW: Email Sign Up Handler ---
    const handleEmailSignUp = async (email, password) => {
        // ... (rest of the function is unchanged)
    };

    // --- NEW: Email Sign In Handler ---
    const handleEmailLogin = async (email, password) => {
        // ... (rest of the function is unchanged)
    };

    // --- NEW: Password Reset Handler ---
    const handlePasswordReset = async (email) => {
        // ... (rest of the function is unchanged)
    };

    const handleLogout = async () => {
        // ... (rest of the function is unchanged)
    };
    
    const categoryOrder = useMemo(() => ['Produce', 'Bakery', 'Meat & Seafood', 'Dairy & Eggs', 'Pantry', 'Frozen Foods', 'Beverages', 'Household & Cleaning', 'Personal Care', 'Pets', 'Baby', 'Miscellaneous'], []);
    
    const updateListInStorage = async (newListState) => {
        // ... (rest of the function is unchanged)
    };
    
    const handleToggleCheck = (category, itemIndex) => {
        // ... (rest of the function is unchanged)
    };

    const handleSortList = async (listToSort, listIdToUpdate, plannedMeals = []) => {
        // ... (rest of the function is unchanged)
    };
    
    const handleResort = () => {
        // ... (rest of the function is unchanged)
    };

    const handleGetMealIdea = async () => {
        // ... (rest of the function is unchanged)
    };
    
    const handleSuggestItems = async () => {
        // ... (rest of the function is unchanged)
    };
    
    const handleEditStart = (category, itemIndex) => setEditingItem({ category, index: itemIndex });
    const handleEditChange = (newValue, category, itemIndex) => {
        // ... (rest of the function is unchanged)
    };
    const handleEditSave = () => {
        // ... (rest of the function is unchanged)
    };
    
    const handleAddNewItem = (itemToAdd = newItem) => {
        // ... (rest of the function is unchanged)
    };

    const handleDeleteItem = (categoryToDelete, indexToDelete) => {
        // ... (rest of the function is unchanged)
    };
    
    const handleClearList = () => {
        // ... (rest of the function is unchanged)
    };
    
    const handleCreateNewList = () => {
        // ... (rest of the function is unchanged)
    };

    const handleDeleteList = (listId) => {
        // ... (rest of the function is unchanged)
    };

    const handleShareList = (listId) => {
        // ... (rest of the function is unchanged)
    };
    
    const handleCreateNewMeal = () => {
        setMealModalConfig({
            isOpen: true,
            title: "Create New Meal",
            confirmText: "Save Meal",
            onSubmit: async ({ name, ingredients }) => {
                if (name && ingredients && user) {
                    const ingredientsArray = ingredients.split(',').map(item => item.trim()).filter(Boolean);
                    // MODIFIED: Save to user's subcollection
                    await firestore.addDoc(firestore.collection(db, "users", user.uid, "meals"), { name, ownerId: user.uid, createdAt: firestore.serverTimestamp(), ingredients: ingredientsArray });
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
                    const ingredientsArray = ingredients.split(',').map(item => item.trim()).filter(Boolean);
                    // MODIFIED: Update in user's subcollection
                    const mealDocRef = firestore.doc(db, "users", user.uid, "meals", mealToEdit.id);
                    await firestore.updateDoc(mealDocRef, { name, ingredients: ingredientsArray });
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
                // MODIFIED: Delete from user's subcollection
                await firestore.deleteDoc(firestore.doc(db, "users", user.uid, "meals", mealId));
            }
        });
    };

    const handleAddMealToPlan = async (meal, day, mealType) => {
        // ... (rest of the function is unchanged)
    };
    
    const handleAddMealToList = async (meal) => {
        // ... (rest of the function is unchanged)
    };

    const handleRemoveMealFromPlan = async (day, mealType, mealIndex) => {
        // ... (rest of the function is unchanged)
    };

    const handleGenerateShoppingList = async () => {
        // ... (rest of the function is unchanged)
    };

    const generatePlainTextList = () => {
        // ... (rest of the function is unchanged)
    };
    
    const handleClearMealPlan = async () => {
        // ... (rest of the function is unchanged)
    };

    const handleSaveMealIdea = async (mealIdeaToSave) => {
        if (!mealIdeaToSave || !user) return;
        const allIngredients = [...mealIdeaToSave.has, ...mealIdeaToSave.needs];
        try {
            // MODIFIED: Save to user's subcollection
            await firestore.addDoc(firestore.collection(db, "users", user.uid, "meals"), {
                name: mealIdeaToSave.title,
                ownerId: user.uid,
                createdAt: firestore.serverTimestamp(),
                ingredients: allIngredients
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

    const handleUpdateListName = async (listId, newName) => {
        // ... (rest of the function is unchanged)
    };

    const handleUpdateProfile = async (newName) => {
        // ... (rest of the function is unchanged)
    };

    const handleAddSuggestedMeal = async (meal) => {
        if (!meal || !user) return;
        try {
            // MODIFIED: Save to user's subcollection
            await firestore.addDoc(firestore.collection(db, "users", user.uid, "meals"), {
                name: meal.name,
                ownerId: user.uid,
                createdAt: firestore.serverTimestamp(),
                ingredients: meal.ingredients
            });
        } catch (e) {
            console.error("Error adding suggested meal:", e);
            setError("Could not add the suggested meal.");
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
        // --- MODIFICATION: Export new email auth functions ---
        handleEmailSignUp,
        handleEmailLogin,
        handlePasswordReset,
        // --- ADDED: Export the new refresh function ---
        refreshUserMeals
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};
