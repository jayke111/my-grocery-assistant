import React, { useState, useEffect } from 'react';
import { useAppContext } from '../AppContext';

// --- Icon Component ---
export const Icon = ({ category }) => {
    const emojiMap = {
        'Produce': '🍎', 'Dairy & Eggs': '🥛', 'Meat & Seafood': '🥩', 'Bakery': '🍞',
        'Pantry': '🥫', 'Frozen Foods': '🧊', 'Beverages': '🥤', 'Household & Cleaning': '🧽',
        'Personal Care': '🧼', 'Pets': '🐾', 'Baby': '👶', 'Miscellaneous': '🛒',
    };
    return <span className="text-2xl mr-3">{emojiMap[category] || '🛒'}</span>;
};

// --- Header Component (Old - Kept for reference) ---
export const Header = ({ onTitleClick, user, onLogoutClick, onLoginClick }) => {
    const { setPage } = useAppContext();

    return (
        <header className="py-6 md:py-8">
            <div className="relative flex h-12 items-center px-4 sm:px-6">
                {user && (
                    <div className="flex">
                        <button onClick={() => setPage('profile')} className="text-sm text-gray-600 hover:text-blue-600 underline">
                            Profile
                        </button>
                    </div>
                )}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="flex items-center gap-x-3 cursor-pointer" onClick={onTitleClick}>
                        <svg className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="21" r="1" stroke="currentColor" strokeWidth="2"/><circle cx="20" cy="21" r="1" stroke="currentColor" strokeWidth="2"/><path d="M15 6.5L16.5 4L18 6.5L19.5 4L21 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600" style={{ fontFamily: "'Poppins', sans-serif" }}>CartSpark</h1>
                    </div>
                </div>
                <div className="ml-auto">
                    {user ? (
                        <button onClick={onLogoutClick} className="bg-red-500 text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition">Sign Out</button>
                    ) : (
                        <button onClick={onLoginClick} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition">Sign In</button>
                    )}
                </div>
            </div>
            <p className="text-center mt-3 text-lg text-gray-600">{user ? "Your Smart Shopping Assistant" : "Your Smart Grocery List Assistant"}</p>
        </header>
    );
};

// --- Loading Spinner Component ---
export const LoadingSpinner = ({ small = false }) => (
    <div className={`flex justify-center items-center ${small ? 'p-2' : 'p-8'}`}>
        <div className={`animate-spin rounded-full border-b-2 border-t-2 border-blue-500 ${small ? 'h-6 w-6' : 'h-12 w-12'}`}></div>
    </div>
);

// --- Error Message Component ---
export const ErrorMessage = ({ message }) => (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md mb-4" role="alert">
        <p className="font-bold">Oops!</p>
        <p>{message}</p>
    </div>
);

// --- Copy Button Component ---
export const CopyButton = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        const textarea = document.createElement("textarea");
        textarea.value = textToCopy;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
            document.execCommand('copy');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
        document.body.removeChild(textarea);
    };
    return (
        <button
            onClick={handleCopy}
            className={`w-full flex items-center justify-center gap-x-2 py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 ${copied ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            {copied ? 'Copied!' : 'Copy Sorted List'}
        </button>
    );
};

// --- Empty State Component ---
export const EmptyState = ({ message, subMessage }) => (
    <div className="text-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">{message}</h3>
        <p className="mt-1 text-sm text-gray-500">{subMessage}</p>
    </div>
);

// --- Footer Component ---
export const AppFooter = () => {
    const { setPage } = useAppContext();
    return (
        <footer className="mt-12 text-center text-gray-500 text-sm">
            <div className="flex justify-center space-x-4">
                <button onClick={() => setPage('privacy')} className="hover:text-gray-800 underline">Privacy Policy</button>
                <span>&middot;</span>
                <button onClick={() => setPage('about')} className="hover:text-gray-800 underline">About Us</button>
                <span>&middot;</span>
                <button onClick={() => setPage('blog')} className="hover:text-gray-800 underline">Blog</button>
                <span>&middot;</span>
                <a href="mailto:contactus@cartspark.io" className="hover:text-gray-800">Contact Us</a>
            </div>
            <p className="mt-4">&copy; {new Date().getFullYear()} CartSpark. All Rights Reserved.</p>
        </footer>
    );
};

// --- Login Screen Component ---
export const LoginScreen = ({ onLogin }) => (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center">Welcome to CartSpark!</h2>
        <p className="mt-2 text-gray-600 text-center">Sign in to access your lists or unlock Pro features.</p>

        <div className="mt-8 space-y-6">
            <div className="flex items-start gap-x-4">
                <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center bg-green-100 text-green-600 rounded-lg font-bold">✓</div>
                <div>
                    <h3 className="font-semibold text-gray-800">Save & Share Unlimited Lists</h3>
                    <p className="text-sm text-gray-600 mt-1">Never lose a list again. Save your weekly shops and share them with family members with a single click.</p>
                </div>
            </div>
            <div className="flex items-start gap-x-4">
                <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center bg-green-100 text-green-600 rounded-lg font-bold">✓</div>
                <div>
                    <h3 className="font-semibold text-gray-800">Plan Your Weekly Meals</h3>
                    <p className="text-sm text-gray-600 mt-1">Use our simple meal planner to organize your week and get ahead of your shopping.</p>
                </div>
            </div>
            <div className="flex items-start gap-x-4">
                <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center bg-green-100 text-green-600 rounded-lg font-bold">✓</div>
                <div>
                    <h3 className="font-semibold text-gray-800">Generate a List from Your Plan</h3>
                    <p className="text-sm text-gray-600 mt-1">With one click, turn your entire week's meal plan into a perfectly sorted grocery list.</p>
                </div>
            </div>
            <div className="flex items-start gap-x-4">
                <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center bg-green-100 text-green-600 rounded-lg font-bold">✓</div>
                <div>
                    <h3 className="font-semibold text-gray-800">Ad-Free Experience</h3>
                    <p className="text-sm text-gray-600 mt-1">Enjoy a clean, focused, and faster experience without any advertisements.</p>
                </div>
            </div>
        </div>

        <div className="mt-10 text-center">
            <p className="text-gray-700"><span className="text-3xl font-bold">$0.99</span> <span className="text-gray-500">/ month CAD</span></p>
            <p className="text-sm font-semibold text-indigo-600">or $9.99 per year (2 months free!)</p>
        </div>

        <button onClick={onLogin} className="mt-8 w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.16H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.84l3.66-2.75z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.16l3.66 2.84c.87-2.6 3.3-4.62 6.16-4.62z" /></svg>
            Sign In with Google
        </button>
    </div>
);

// --- Success Page Component (for after payment) ---
export const SuccessPage = () => {
    const { subscriptionStatus, setPage } = useAppContext();

    useEffect(() => {
        if (subscriptionStatus === 'active') {
            setPage('home');
        }
    }, [subscriptionStatus, setPage]);

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
            <h2 className="text-2xl font-bold text-gray-800">Payment Successful!</h2>
            <p className="mt-2 text-gray-600">Thank you for subscribing to CartSpark Pro.</p>
            <div className="mt-6">
                <LoadingSpinner />
                <p className="mt-4 text-sm text-gray-500 animate-pulse">Finalizing your account...</p>
            </div>
        </div>
    );
};

// --- NEW: Pro Teaser Component ---
export const ProTeaser = () => {
    const { setPage } = useAppContext();
    return (
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg text-white text-center">
            <h3 className="text-2xl font-bold">Want More Features?</h3>
            <p className="mt-2">Unlock meal planning, unlimited lists, and an ad-free experience with CartSpark Pro!</p>
            <button
                onClick={() => setPage('go-pro')}
                className="mt-4 bg-white text-indigo-600 font-bold py-2 px-6 rounded-lg hover:bg-gray-100 transition shadow"
            >
                Learn More & Go Pro ✨
            </button>
        </div>
    );
};

// --- NEW: Go Pro Page Component ---
export const GoProPage = () => {
    const { setPage, handleGoogleLogin } = useAppContext();
    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg">
            <button onClick={() => setPage('home')} className="mb-6 text-blue-600 hover:text-blue-800 font-semibold">&larr; Back to my list</button>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center">Unlock Your Ultimate Shopping Assistant</h2>
            <p className="mt-2 text-gray-600 text-center">Go Pro to save time, organize your life, and get the most out of every grocery trip.</p>

            <div className="mt-8 space-y-6">
                <div className="flex items-start gap-x-4">
                    <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center bg-green-100 text-green-600 rounded-lg font-bold">✓</div>
                    <div>
                        <h3 className="font-semibold text-gray-800">Save & Share Unlimited Lists</h3>
                        <p className="text-sm text-gray-600 mt-1">Never lose a list again. Save your weekly shops, party lists, and more. Share them with family members with a single click to shop together.</p>
                    </div>
                </div>
                <div className="flex items-start gap-x-4">
                    <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center bg-green-100 text-green-600 rounded-lg font-bold">✓</div>
                    <div>
                        <h3 className="font-semibold text-gray-800">Plan Your Weekly Meals</h3>
                        <p className="text-sm text-gray-600 mt-1">Use our simple drag-and-drop meal planner to organize your week and get ahead of your shopping.</p>
                    </div>
                </div>
                <div className="flex items-start gap-x-4">
                    <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center bg-green-100 text-green-600 rounded-lg font-bold">✓</div>
                    <div>
                        <h3 className="font-semibold text-gray-800">Generate a List from Your Plan</h3>
                        <p className="text-sm text-gray-600 mt-1">With one click, turn your entire week's meal plan into a perfectly sorted grocery list, ready for the store.</p>
                    </div>
                </div>
                <div className="flex items-start gap-x-4">
                    <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center bg-green-100 text-green-600 rounded-lg font-bold">✓</div>
                    <div>
                        <h3 className="font-semibold text-gray-800">Ad-Free Experience</h3>
                        <p className="text-sm text-gray-600 mt-1">Enjoy a clean, focused, and faster experience without any advertisements.</p>
                    </div>
                </div>
            </div>

            <div className="mt-10 text-center">
                <p className="text-gray-700"><span className="text-3xl font-bold">$0.99</span> <span className="text-gray-500">/ month CAD</span></p>
                <p className="text-sm font-semibold text-indigo-600">or $9.99 per year (2 months free!)</p>
            </div>

            <button onClick={handleGoogleLogin} className="mt-8 w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.16H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.84l3.66-2.75z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.16l3.66 2.84c.87-2.6 3.3-4.62 6.16-4.62z" /></svg>
                Sign In & Go Pro
            </button>
        </div>
    );
};

// --- HeaderV2 Component (Final Grid Version) ---
export const HeaderV2 = ({ onTitleClick, user, onLogoutClick, onLoginClick }) => {
    const { setPage } = useAppContext();

    return (
        <header className="py-4 px-2 sm:px-4">
            {/* This grid creates 3 columns: left, center, and right. */}
            <div className="grid grid-cols-3 items-center">

                {/* --- Left Column --- */}
                <div className="flex justify-start">
                    {user && (
                        <button onClick={() => setPage('profile')} className="text-sm text-gray-600 hover:text-blue-600 underline">
                            Profile
                        </button>
                    )}
                </div>

                {/* --- Center Column (Logo) --- */}
                <div className="flex justify-center">
                    <div className="flex items-center gap-x-2 cursor-pointer" onClick={onTitleClick}>
                        <svg className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="21" r="1" stroke="currentColor" strokeWidth="2"/><circle cx="20" cy="21" r="1" stroke="currentColor" strokeWidth="2"/><path d="M15 6.5L16.5 4L18 6.5L19.5 4L21 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600" style={{ fontFamily: "'Poppins', sans-serif" }}>CartSpark</h1>
                    </div>
                </div>

                {/* --- Right Column --- */}
                <div className="flex justify-end">
                    {user ? (
                        <button onClick={onLogoutClick} className="bg-red-500 text-white text-xs sm:text-sm font-bold py-2 px-3 sm:px-4 rounded-lg hover:bg-red-600 transition">Sign Out</button>
                    ) : (
                        <button onClick={onLoginClick} className="bg-blue-600 text-white text-xs sm:text-sm font-bold py-2 px-3 sm:px-4 rounded-lg hover:bg-blue-700 transition">Sign In</button>
                    )}
                </div>
            </div>

            {/* --- Subtitle --- */}
            <p className="text-center mt-2 text-gray-600 text-base sm:text-lg">{user ? "Your Smart Shopping Assistant" : "Your Smart Grocery List Assistant"}</p>
        </header>
    );
};