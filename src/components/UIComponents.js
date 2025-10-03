import React, { useState, useEffect } from 'react';
import { useAppContext } from '../AppContext';

export const ProNav = () => {
    const { page, setPage, subscriptionStatus } = useAppContext();
    
    const navItems = [
        { id: 'home', label: 'My Lists', isPro: false },
        { id: 'meals', label: 'My Meals', isPro: true },
        { id: 'meal-plan', label: 'Meal Plan', isPro: true },
    ];

    return (
        <div className="bg-white p-6 rounded-t-2xl shadow-lg">
            <div className="flex border-b">
                {navItems.map(item => (
                    <button 
                        key={item.id}
                        onClick={() => setPage(item.id)} 
                        className={`flex-1 py-2 text-center font-semibold flex items-center justify-center gap-x-2 ${page === item.id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
                    >
                        <span>{item.label}</span>
                        {item.isPro && subscriptionStatus !== 'active' && (
                            <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">PRO</span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export const Icon = ({ category }) => {
    const emojiMap = {
        'Produce': '🍎', 'Dairy & Eggs': '🥛', 'Meat & Seafood': '🥩', 'Bakery': '🍞',
        'Pantry': '🥫', 'Frozen Foods': '🧊', 'Beverages': '🥤', 'Household & Cleaning': '🧽',
        'Personal Care': '🧼', 'Pets': '🐾', 'Baby': '👶', 'Miscellaneous': '🛒',
    };
    return <span className="text-2xl mr-3">{emojiMap[category] || '🛒'}</span>;
};

export const Header = ({ onTitleClick, user, onLogoutClick, onLoginClick }) => {
    const { setPage } = useAppContext();

    return (
        <header className="text-center pt-16 pb-6 md:pt-20 md:pb-8 relative">
            <div className="flex justify-center items-center gap-x-3 cursor-pointer" onClick={onTitleClick}>
                <svg className="h-10 w-10 md:h-12 md:w-12 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="21" r="1" stroke="currentColor" strokeWidth="2"/><circle cx="20" cy="21" r="1" stroke="currentColor" strokeWidth="2"/><path d="M15 6.5L16.5 4L18 6.5L19.5 4L21 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600" style={{ fontFamily: "'Poppins', sans-serif" }}>CartSpark</h1>
            </div>
            <p className="mt-3 text-lg text-gray-600">Smart Grocery Lists. Smarter Meal Planning.</p>
            <div className="absolute top-4 right-4">
                {user ? (
                    <div className="flex items-center gap-x-4">
                        <button onClick={() => setPage('profile')} className="text-sm text-gray-600 hover:text-blue-600 underline">Profile</button>
                        <button onClick={onLogoutClick} className="bg-red-500 text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition">Sign Out</button>
                    </div>
                ) : (
                    <button onClick={onLoginClick} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition">Sign In</button>
                )}
            </div>
        </header>
    );
};

export const LoadingSpinner = ({ small = false }) => (
    <div className={`flex justify-center items-center ${small ? 'p-2' : 'p-8'}`}>
        <div className={`animate-spin rounded-full border-b-2 border-t-2 border-blue-500 ${small ? 'h-6 w-6' : 'h-12 w-12'}`}></div>
    </div>
);

export const ErrorMessage = ({ message }) => (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md mb-4" role="alert">
        <p className="font-bold">Oops!</p>
        <p>{message}</p>
    </div>
);

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

export const EmptyState = ({ message, subMessage }) => (
    <div className="text-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">{message}</h3>
        <p className="mt-1 text-sm text-gray-500">{subMessage}</p>
    </div>
);

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

// --- MODIFICATION: The LoginScreen is now a complete authentication hub ---
export const LoginScreen = () => {
    const { handleGoogleLogin, handleEmailSignUp, handleEmailLogin, handlePasswordReset } = useAppContext();
    const [mode, setMode] = useState('signIn'); // 'signIn', 'signUp', or 'reset'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            if (mode === 'signIn') {
                await handleEmailLogin(email, password);
            } else if (mode === 'signUp') {
                await handleEmailSignUp(email, password);
            } else if (mode === 'reset') {
                await handlePasswordReset(email);
                setMessage('Password reset link sent! Please check your email.');
            }
        } catch (err) {
            // Firebase provides user-friendly error messages
            const friendlyMessage = err.message.replace('Firebase: ', '').replace(/ \(auth.*\)\.?/, '.');
            setError(friendlyMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const renderForm = () => {
        if (mode === 'reset') {
            return (
                <>
                    <h2 className="text-2xl font-bold text-center">Reset Password</h2>
                    <p className="mt-2 text-center text-gray-600">Enter your email to receive a reset link.</p>
                    <div className="mt-8">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                        <input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                    </div>
                </>
            );
        }
        return (
            <>
                <h2 className="text-2xl font-bold text-center">{mode === 'signIn' ? 'Welcome Back!' : 'Create Your Account'}</h2>
                <div className="mt-8 space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                        <input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                    </div>
                    <div>
                        <label htmlFor="password"className="block text-sm font-medium text-gray-700">Password</label>
                        <input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                    </div>
                </div>
            </>
        );
    };

    const renderButtonText = () => {
        if (isLoading) return <LoadingSpinner small />;
        if (mode === 'signIn') return 'Sign In';
        if (mode === 'signUp') return 'Create Account';
        return 'Send Reset Link';
    };

    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg">
            <form onSubmit={handleSubmit}>
                {renderForm()}
                {error && <p className="mt-4 text-sm text-red-600 text-center">{error}</p>}
                {message && <p className="mt-4 text-sm text-green-600 text-center">{message}</p>}
                <div className="mt-6">
                    <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                        {renderButtonText()}
                    </button>
                </div>
                <div className="mt-4 flex justify-between text-sm">
                    {mode === 'signIn' && <button type="button" onClick={() => setMode('reset')} className="font-medium text-indigo-600 hover:text-indigo-500">Forgot your password?</button>}
                    {mode !== 'signIn' && <button type="button" onClick={() => setMode('signIn')} className="font-medium text-indigo-600 hover:text-indigo-500">&larr; Back to Sign In</button>}
                    {mode === 'signIn' && <button type="button" onClick={() => setMode('signUp')} className="font-medium text-indigo-600 hover:text-indigo-500">Create an account</button>}
                </div>
            </form>

            <div className="mt-6 relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-gray-300" /></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or continue with</span></div>
            </div>

            <div className="mt-6">
                <button onClick={handleGoogleLogin} className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.16H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.84l3.66-2.75z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.16l3.66 2.84c.87-2.6 3.3-4.62 6.16-4.62z" /></svg>
                    Sign in with Google
                </button>
            </div>
        </div>
    );
};

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
