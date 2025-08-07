import React, { useEffect } from 'react';
import { useAppContext } from './AppContext';
import { Header, LoadingSpinner, AppFooter, LoginScreen, SuccessPage } from './components/UIComponents';
import { AboutPage, PrivacyPolicyPage, BlogPage, ArticlePage } from './components/StaticPages';
import { ListManager } from './components/ListManager';
import { UserDashboard } from './components/UserDashboard';
import { MealsDashboard } from './components/MealsDashboard';
import { MealPlannerDashboard } from './components/MealPlannerDashboard';
import { ProfilePage } from './components/ProfilePage'; 
import { AddMealToListModal } from './components/AddMealToListModal';
import { PromptModal } from './components/PromptModal';
import { MealModal } from './components/MealModal';
import { SubscribePage } from './components/SubscribePage';
// --- ADDED: Import the new modal ---
import { MealSuggestionsModal } from './components/MealSuggestionsModal';

function App() {
    const {
        user, authLoading, dataLoading, page, setPage, selectedArticle, setSelectedArticle,
        activeListId, setActiveListId, activeListData,
        handleGoogleLogin, handleLogout, showAddMealToListModal, setShowAddMealToListModal, 
        handleAddMealToList, listResetKey, guestList, handleSortList, handleClearList,
        userMeals, subscriptionStatus,
        newItem, setNewItem, isLoading, error, setError, inputError, setInputError,
        editingItem, isPremium,
        handleToggleCheck, handleEditStart, handleEditChange, handleEditSave,
        handleAddNewItem, handleDeleteItem, handleResort, generatePlainTextList
    } = useAppContext();

    useEffect(() => {
        if (user && page === 'login') {
            setPage('home');
        }
    }, [user, page, setPage]);

    useEffect(() => {
        if (window.location.pathname === '/success') {
            setPage('success');
            window.history.replaceState({}, document.title, "/");
        }
    }, [setPage]);


    const renderPageContent = () => {
        if (authLoading || (user && dataLoading)) {
            return <LoadingSpinner />;
        }

        if (page === 'success') return <SuccessPage />;
        if (page === 'about') return <AboutPage setPage={setPage} />;
        if (page === 'privacy') return <PrivacyPolicyPage setPage={setPage} />;
        if (page === 'blog') {
            if (selectedArticle) return <ArticlePage article={selectedArticle} setSelectedArticle={setSelectedArticle} />;
            return <BlogPage setSelectedArticle={setSelectedArticle} setPage={setPage} />;
        }
        if (page === 'login') return <LoginScreen onLogin={handleGoogleLogin} />;
        
        if (user) {
            if (page === 'profile') return <ProfilePage />;

            if (subscriptionStatus !== 'active') {
                return <SubscribePage />;
            }

            if (page === 'meals') return <MealsDashboard />;
            if (page === 'meal-plan') return <MealPlannerDashboard />;
            
            if (activeListId) {
                if (activeListData) {
                    return (
                        <div className="bg-white p-6 rounded-2xl shadow-lg">
                            <button onClick={() => setActiveListId(null)} className="mb-6 text-blue-600 hover:text-blue-800 font-semibold">&larr; Back to My Lists</button>
                            <ListManager 
                                listData={activeListData} 
                                onSort={(listText) => handleSortList(listText, activeListId, activeListData.plannedMeals)} 
                                onClear={handleClearList}
                                isGuest={false}
                                isPremium={isPremium}
                                handleToggleCheck={handleToggleCheck}
                                handleEditStart={handleEditStart}
                                handleEditSave={handleEditSave}
                                handleEditChange={handleEditChange}
                                handleDeleteItem={handleDeleteItem}
                                handleResort={handleResort}
                                handleAddNewItem={handleAddNewItem}
                                newItem={newItem}
                                setNewItem={setNewItem}
                                isLoading={isLoading}
                                error={error}
                                inputError={inputError}
                                editingItem={editingItem}
                                generatePlainTextList={generatePlainTextList}
                                setShowAddMealToListModal={setShowAddMealToListModal}
                                setInputError={setInputError}
                                setError={setError}
                            />
                        </div>
                    );
                } else {
                    return <LoadingSpinner />;
                }
            }
            
            return <UserDashboard />; 
        }

        return (
            <main className="bg-white p-6 rounded-2xl shadow-lg">
                 <ListManager 
                    key={listResetKey}
                    listData={{items: guestList}} 
                    onSort={(listText) => handleSortList(listText, null)}
                    onClear={handleClearList}
                    isGuest={true}
                    isPremium={isPremium}
                    handleToggleCheck={handleToggleCheck}
                    handleEditStart={handleEditStart}
                    handleEditSave={handleEditSave}
                    handleEditChange={handleEditChange}
                    handleDeleteItem={handleDeleteItem}
                    handleResort={handleResort}
                    handleAddNewItem={handleAddNewItem}
                    newItem={newItem}
                    setNewItem={setNewItem}
                    isLoading={isLoading}
                    error={error}
                    inputError={inputError}
                    editingItem={editingItem}
                    generatePlainTextList={generatePlainTextList}
                    setShowAddMealToListModal={setShowAddMealToListModal}
                    setInputError={setInputError}
                    setError={setError}
                 />
            </main>
        );
    };
    
    return (
        <div className="bg-gray-50 min-h-screen font-sans antialiased text-gray-900 pb-12">
             <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700&display=swap');
             `}</style>
            <div className="container mx-auto p-4 max-w-2xl">
                <Header 
                    onTitleClick={() => { setPage('home'); setSelectedArticle(null); setActiveListId(null); }} 
                    user={user}
                    onLogoutClick={handleLogout}
                    onLoginClick={() => setPage('login')}
                />
                
                <main>
                    {renderPageContent()}
                </main>
                
                {showAddMealToListModal && <AddMealToListModal userMeals={userMeals} handleAddMealToList={handleAddMealToList} setShowAddMealToListModal={setShowAddMealToListModal} />}
                
                <PromptModal />
                <MealModal />
                {/* --- ADDED: Render the new modal --- */}
                <MealSuggestionsModal />

                <AppFooter />
            </div>
        </div>
    );
}

export default App;
