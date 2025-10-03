import React, { useEffect } from 'react';
import { useAppContext } from './AppContext';
import { useAuth } from './AuthContext';
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
import { MealSuggestionsModal } from './components/MealSuggestionsModal';

function App() {
    const { user, authLoading } = useAuth();
    const {
        dataLoading, page, setPage, selectedArticle, setSelectedArticle,
        activeListId, setActiveListId, activeListData,
        handleGoogleLogin, handleLogout, showAddMealToListModal,
        listResetKey, guestList, handleSortList, handleClearList,
        subscriptionStatus,
        // --- ADDED: Get the modal config from the context ---
        mealModalConfig, setMealModalConfig 
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

    useEffect(() => {
        if (page === 'success' && subscriptionStatus === 'active') {
            const timer = setTimeout(() => {
                setPage('home');
            }, 2000); 

            return () => clearTimeout(timer);
        }
    }, [subscriptionStatus, page, setPage]);

    if (authLoading) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    const renderPageContent = () => {
        if (user && dataLoading) {
            return <LoadingSpinner />;
        }

        if (page === 'go-pro') return <SubscribePage />;
        if (page === 'success') return <SuccessPage />;
        if (page === 'about') return <AboutPage setPage={setPage} />;
        if (page === 'privacy') return <PrivacyPolicyPage setPage={setPage} />;
        if (page === 'blog') {
            if (selectedArticle) return <ArticlePage article={selectedArticle} setSelectedArticle={setSelectedArticle} />;
            return <BlogPage setSelectedArticle={setSelectedArticle} setPage={setPage} />;
        }
        if (page === 'login') return <LoginScreen onLogin={handleGoogleLogin} />;
        
        if (user) {
            if (subscriptionStatus === 'active') {
                if (page === 'profile') return <ProfilePage />;
                if (page === 'meals') return <MealsDashboard />;
                if (page === 'meal-plan') return <MealPlannerDashboard />;
                
                if (activeListId) {
                    return (
                        <div className="bg-white p-6 rounded-2xl shadow-lg">
                            <button onClick={() => setActiveListId(null)} className="mb-6 text-blue-600 hover:text-blue-800 font-semibold">&larr; Back to My Lists</button>
                            <ListManager 
                                listData={activeListData} 
                                onSort={(listText) => handleSortList(listText, activeListId, activeListData.plannedMeals)} 
                                onClear={handleClearList}
                                isGuest={false}
                            />
                        </div>
                    );
                }
                return <UserDashboard />; 
            } 
            else {
                if (page === 'meals' || page === 'meal-plan') {
                    return <SubscribePage />;
                }
                
                if (page === 'profile') return <ProfilePage />;
                if (activeListId) {
                    return (
                        <div className="bg-white p-6 rounded-2xl shadow-lg">
                            <button onClick={() => setActiveListId(null)} className="mb-6 text-blue-600 hover:text-blue-800 font-semibold">&larr; Back to My Lists</button>
                            <ListManager 
                                listData={activeListData} 
                                onSort={(listText) => handleSortList(listText, activeListId, activeListData.plannedMeals)} 
                                onClear={handleClearList}
                                isGuest={false}
                            />
                        </div>
                    );
                }
                return <UserDashboard />; 
            }
        }

        return (
            <main className="bg-white p-6 rounded-2xl shadow-lg">
                 <ListManager 
                    key={listResetKey}
                    listData={{items: guestList}} 
                    onSort={(listText) => handleSortList(listText, null)}
                    onClear={handleClearList}
                    isGuest={true}
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
                
                {showAddMealToListModal && <AddMealToListModal />}
                
                <PromptModal />

                {/* --- THIS IS THE FIX --- */}
                {/* We pass all the necessary properties from the config state to the modal */}
                <MealModal 
                    isOpen={mealModalConfig.isOpen}
                    title={mealModalConfig.title}
                    confirmText={mealModalConfig.confirmText}
                    initialMeal={mealModalConfig.initialMeal}
                    onSubmit={mealModalConfig.onSubmit}
                    onCancel={() => setMealModalConfig({ isOpen: false })}
                />

                <MealSuggestionsModal />

                <AppFooter />
            </div>
        </div>
    );
}

export default App;
