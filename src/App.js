import React from 'react';
import { AppProvider, useAppContext } from './AppContext';
import { Header, LoadingSpinner, AppFooter, LoginScreen } from './components/UIComponents';
import { AboutPage, PrivacyPolicyPage, BlogPage, ArticlePage } from './components/StaticPages';
import { ListManager } from './components/ListManager';
import { UserDashboard } from './components/UserDashboard';
import { MealsDashboard } from './components/MealsDashboard';
import { MealPlannerDashboard } from './components/MealPlannerDashboard';
import { AddMealToListModal } from './components/AddMealToListModal';

function AppContent() {
    const {
        user, authLoading, dataLoading, page, setPage, selectedArticle, setSelectedArticle,
        activeListId, setActiveListId, activeListData, userLists, userMeals, mealPlan,
        handleGoogleLogin, handleLogout, showAddMealToListModal, setShowAddMealToListModal, 
        handleAddMealToList, listResetKey, guestList, handleSortList, handleClearList,
        ...listManagerProps
    } = useAppContext();

    const renderPageContent = () => {
        if (authLoading || (user && dataLoading)) {
            return <LoadingSpinner />;
        }

        if (page === 'about') return <AboutPage setPage={setPage} />;
        if (page === 'privacy') return <PrivacyPolicyPage setPage={setPage} />;
        if (page === 'blog') {
            if (selectedArticle) return <ArticlePage article={selectedArticle} setSelectedArticle={setSelectedArticle} />;
            return <BlogPage setSelectedArticle={setSelectedArticle} setPage={setPage} />;
        }
        if (page === 'login') return <LoginScreen onLogin={handleGoogleLogin} />;
        
        if (user) {
            if (page === 'meals') return <MealsDashboard />;
            if (page === 'meal-plan') return <MealPlannerDashboard />;
            if (!activeListId) return <UserDashboard />;
            if (activeListData) {
                return (
                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                        <button onClick={() => setActiveListId(null)} className="mb-6 text-blue-600 hover:text-blue-800 font-semibold">&larr; Back to My Lists</button>
                        <ListManager 
                            {...listManagerProps} 
                            listData={activeListData} 
                            setShowAddMealModal={setShowAddMealToListModal} 
                            onSort={(listText) => handleSortList(listText, activeListId, activeListData.plannedMeals)}
                            onClear={handleClearList}
                        />
                    </div>
                );
            }
        }

        // GUEST VIEW
        return (
            <main className="bg-white p-6 rounded-2xl shadow-lg">
                 <ListManager 
                    key={listResetKey}
                    {...listManagerProps} 
                    listData={{items: guestList}} 
                    isGuest={true} 
                    setShowAddMealModal={setShowAddMealToListModal} 
                    onSort={(listText) => handleSortList(listText, null)}
                    onClear={handleClearList}
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

                <AppFooter setPage={setPage} />
            </div>
        </div>
    );
}

export default function App() {
    return (
        <AppProvider>
            <AppContent />
        </AppProvider>
    );
}
