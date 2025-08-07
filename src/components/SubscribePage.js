    import React, { useState } from 'react';
    import { useAppContext } from '../AppContext';
    import { ErrorMessage } from './UIComponents';

    // --- NEW IMPORTS ---
    import { getFunctions, httpsCallable } from "firebase/functions";
    import { loadStripe } from '@stripe/stripe-js';

    // --- Initialize Stripe outside of the component render ---
    const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

    export const SubscribePage = () => {
        const { user, handleGoogleLogin } = useAppContext();
        const [isLoading, setIsLoading] = useState(false);
        const [error, setError] = useState(null);

        const monthlyPriceId = process.env.REACT_APP_STRIPE_MONTHLY_PRICE_ID;
        const yearlyPriceId = process.env.REACT_APP_STRIPE_YEARLY_PRICE_ID;

        // --- NEW CHECKOUT HANDLER ---
        const handleCheckout = async (priceId) => {
            setIsLoading(true);
            setError(null);

            if (!user) {
                setError("You must be signed in to subscribe.");
                setIsLoading(false);
                return;
            }

            try {
                const functions = getFunctions();
                const createStripeCheckout = httpsCallable(functions, 'createstripecheckout');
                
                const result = await createStripeCheckout({ priceId: priceId });
                
                const sessionId = result.data.id;

                const stripe = await stripePromise;
                const stripeError = await stripe.redirectToCheckout({ sessionId });

                if (stripeError) {
                    setError(stripeError.message);
                }
            } catch (err) {
                console.error("Payment function error:", err);
                setError("Oops! Could not connect to the payment server. Please try again.");
            }

            setIsLoading(false);
        };

        const renderWelcomeMessage = () => {
            if (user) {
                return (
                    <>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center">Welcome, {user.displayName}!</h2>
                        <p className="mt-2 text-gray-600 text-center">You're one step away from unlocking CartSpark Pro.</p>
                    </>
                );
            }
            return (
                <>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center">Go Pro and Unlock Your Shopping Assistant</h2>
                    <p className="mt-2 text-gray-600 text-center">Sign in to save multiple lists, plan your meals, and get an ad-free experience!</p>
                </>
            );
        };

        const renderActionButtons = () => {
            if (user) {
                return (
                    <div className="mt-8 space-y-4">
                        <button 
                            onClick={() => handleCheckout(monthlyPriceId)} 
                            disabled={isLoading}
                            className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                        >
                            {isLoading ? 'Redirecting...' : 'Subscribe Monthly - $0.99/mo'}
                        </button>
                        <button 
                            onClick={() => handleCheckout(yearlyPriceId)} 
                            disabled={isLoading}
                            className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
                        >
                            {isLoading ? 'Redirecting...' : 'Subscribe Yearly - $9.99/yr (2 months free!)'}
                        </button>
                    </div>
                );
            }
            return (
                 <button 
                    onClick={handleGoogleLogin} 
                    className="mt-8 w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                    Sign in with Google to Go Pro
                </button>
            );
        };

        return (
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg">
                {error && <ErrorMessage message={error} />}
                
                <div className="mt-4">
                    {renderWelcomeMessage()}
                </div>

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
                </div>

                <div className="mt-10 text-center">
                    <p className="text-gray-700"><span className="text-3xl font-bold">$0.99</span> <span className="text-gray-500">/ month CAD</span></p>
                    <p className="text-sm font-semibold text-indigo-600">or $9.99 per year (2 months free!)</p>
                </div>
                
                {renderActionButtons()}
            </div>
        );
    };
    