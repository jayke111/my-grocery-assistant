import React, { useState } from 'react';
import { useAppContext } from '../AppContext';
import { ErrorMessage } from './UIComponents';
import mealPlanGif from '../assets/meal-plan-demo.gif';

const FeatureCard = ({ icon, title, children, isGif = false }) => (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col">
        {isGif ? (
            <div className="w-full max-h-96 bg-gray-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                <img 
                    src={mealPlanGif} 
                    alt="Meal Plan to Grocery List feature" 
                    className="rounded-lg object-contain w-full h-full"
                />
            </div>
        ) : (
            <div className="text-4xl mb-3">{icon}</div>
        )}
        <div className="flex-grow">
            <h3 className="font-bold text-lg text-gray-800">{title}</h3>
            <p className="text-gray-600 mt-1">{children}</p>
        </div>
    </div>
);


export const SubscribePage = () => {
    // --- THIS IS THE FIX ---
    // We now get the 'error' state and 'setError' function directly from the context.
    const { user, handleProceedToPayment, handleLoginAndCheckout, error, setError } = useAppContext();
    
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);

    const monthlyPriceId = process.env.REACT_APP_STRIPE_MONTHLY_PRICE_ID;
    const yearlyPriceId = process.env.REACT_APP_STRIPE_YEARLY_PRICE_ID;

    const handlePaymentClick = async (priceId) => {
        // Clear any previous errors.
        setError(''); 
        setSelectedPlan(priceId);
        setIsLoading(true);

        try {
            if (user) {
                await handleProceedToPayment(priceId);
            } else {
                await handleLoginAndCheckout(priceId);
            }
        } catch (err) {
            // If the context functions throw an error, we can catch it here
            // and display it, although the context itself should also set it.
            setError(err.message);
        }

        setIsLoading(false);
        setSelectedPlan(null);
    };

    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg">
            {/* This will now correctly display errors set by the payment functions. */}
            {error && <ErrorMessage message={error} />}
            
            <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                    Stop Just Shopping. <span className="text-indigo-600">Start Planning.</span>
                </h2>
                <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                    CartSpark Pro is more than a list—it's a full meal planning and shopping system designed to save you time, money, and stress.
                </p>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                <FeatureCard icon="👥" title="Real-Time List Sharing">
                    Perfect for families and roommates. Add an item at home, and it instantly appears on their phone in the store.
                </FeatureCard>
                <FeatureCard icon="📋" title="Save Unlimited Lists">
                    Create and save different lists for every occasion: weekly groceries, Costco runs, BBQ parties, or camping trips.
                </FeatureCard>
                 <FeatureCard icon="🗓️" title="Weekly Meal Planner">
                    Organize your breakfast, lunch, and dinner for the entire week with our simple and intuitive planner.
                </FeatureCard>
                <FeatureCard title="List from Meal Plan" isGif={true}>
                    The magic button. Turn your entire week's meal plan into a perfectly sorted grocery list with a single click.
                </FeatureCard>
            </div>

            <div className="mt-12">
                <h3 className="text-2xl font-bold text-center text-gray-800">Choose Your Plan</h3>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg mx-auto">
                    {/* Monthly Plan */}
                    <button 
                        onClick={() => handlePaymentClick(monthlyPriceId)} 
                        disabled={isLoading}
                        className="p-6 border-2 border-gray-300 rounded-lg text-center hover:border-indigo-500 hover:bg-indigo-50 transition disabled:opacity-50"
                    >
                        <p className="text-lg font-semibold">Monthly</p>
                        <p className="mt-2 text-3xl font-bold text-gray-900">$0.99</p>
                        <p className="text-gray-500">per month</p>
                        <span className="mt-4 block w-full text-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                            {isLoading && selectedPlan === monthlyPriceId ? 'Processing...' : 'Choose Monthly'}
                        </span>
                    </button>

                    {/* Yearly Plan */}
                    <div className="relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                                Best Value
                            </span>
                        </div>
                        <button 
                            onClick={() => handlePaymentClick(yearlyPriceId)} 
                            disabled={isLoading}
                            className="p-6 border-2 border-indigo-500 bg-indigo-50 rounded-lg text-center w-full h-full transition disabled:opacity-50"
                        >
                            <p className="text-lg font-semibold">Yearly</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">$9.99</p>
                            <p className="text-gray-500">per year</p>
                            <span className="mt-4 block w-full text-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                                {isLoading && selectedPlan === yearlyPriceId ? 'Processing...' : 'Save with Yearly'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
