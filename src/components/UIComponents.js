import React, { useState } from 'react';

// A simple component to display an emoji icon based on the category name
export const Icon = ({ category }) => {
    const emojiMap = {
        'Produce': '🍎', 'Dairy & Eggs': '🥛', 'Meat & Seafood': '🥩', 'Bakery': '🍞',
        'Pantry': '🥫', 'Frozen Foods': '🧊', 'Beverages': '🥤', 'Household & Cleaning': '🧽',
        'Personal Care': '🧼', 'Pets': '🐾', 'Baby': '👶', 'Miscellaneous': '🛒',
    };
    return <span className="text-2xl mr-3">{emojiMap[category] || '🛒'}</span>;
};

// The main header for the application
export const Header = ({ onTitleClick, user, onLogoutClick, onLoginClick }) => (
    <header className="text-center pt-12 pb-6 md:pt-16 md:pb-8 relative">
        <div className="flex justify-center items-center gap-x-3 cursor-pointer" onClick={onTitleClick}>
            <svg className="h-10 w-10 md:h-12 md:w-12 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="21" r="1" stroke="currentColor" strokeWidth="2"/><circle cx="20" cy="21" r="1" stroke="currentColor" strokeWidth="2"/><path d="M15 6.5L16.5 4L18 6.5L19.5 4L21 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600" style={{ fontFamily: "'Poppins', sans-serif" }}>CartSpark</h1>
        </div>
        <p className="mt-3 text-lg text-gray-600">{user ? "Your Smart Shopping Assistant" : <>Your <span className="font-semibold text-green-600">FREE</span> Grocery List AI Companion</>}</p>
        <div className="absolute top-4 right-4">
            {user ? (
                <div className="flex items-center gap-x-4">
                    <span className="text-sm text-gray-600 hidden sm:inline">Welcome, {user.displayName || user.email}!</span>
                    <button onClick={onLogoutClick} className="bg-red-500 text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition">Sign Out</button>
                </div>
            ) : (
                null // The "Go Pro" button is now hidden for guest users
            )}
        </div>
    </header>
);

// A simple loading spinner
export const LoadingSpinner = ({ small = false }) => (
    <div className={`flex justify-center items-center ${small ? 'p-2' : 'p-8'}`}>
        <div className={`animate-spin rounded-full border-b-2 border-t-2 border-blue-500 ${small ? 'h-6 w-6' : 'h-12 w-12'}`}></div>
    </div>
);

// A component to display error messages
export const ErrorMessage = ({ message }) => (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md mb-4" role="alert">
        <p className="font-bold">Oops!</p>
        <p>{message}</p>
    </div>
);

// A button that copies text to the clipboard
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
        <button onClick={handleCopy} className={`mt-6 w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 ${copied ? 'bg-green-500' : 'bg-gray-700 hover:bg-gray-800'}`}>
            {copied ? 'Copied!' : 'Copy Sorted List'}
        </button>
    );
};

// A component to display when a list is empty
export const EmptyState = ({ message, subMessage }) => (
    <div className="text-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">{message}</h3>
        <p className="mt-1 text-sm text-gray-500">{subMessage}</p>
    </div>
);

// The main footer for the application
export const AppFooter = ({ setPage }) => (
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

// The login screen for non-authenticated users
export const LoginScreen = ({ onLogin }) => (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg text-center">
        <h2 className="text-2xl font-bold text-gray-800">Unlock Pro Features</h2>
        <p className="mt-4 text-gray-600">Sign in to save multiple lists, share them with family, and get an ad-free experience!</p>
        <button onClick={onLogin} className="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.16H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.84l3.66-2.75z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.16l3.66 2.84c.87-2.6 3.3-4.62 6.16-4.62z" /></svg>
            Sign in with Google
        </button>
    </div>
);
