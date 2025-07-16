import React, { useState, useMemo, useEffect } from 'react';

// --- Blog Post Data ---
const articles = [
    {
        id: 'time-saving-hacks',
        title: '5 Time-Saving Hacks for Your Weekly Grocery Trip',
        snippet: 'Turn a chaotic trip into a quick and efficient mission with these five simple hacks to help you save time at the store.',
        content: `The weekly grocery run can feel like a marathon. Between navigating crowded aisles and trying to remember everything you need, it's easy to spend more time (and money) than you planned. With a little bit of strategy, you can turn a chaotic trip into a quick and efficient mission. Here are five simple hacks to help you save time at the store.\n\n**1. Never Shop Without a List**\nThis is the golden rule of efficient shopping. Going in without a plan is a recipe for impulse buys and forgotten items. Before you leave the house, take a few minutes to jot down everything you need. Using a digital tool like CartSpark allows you to build and edit your list on the fly, so you never miss a thing.\n\n**2. Organize Your List by Store Layout**\nDon't just write down items randomly. Group them by category, just like they're arranged in the store: produce, dairy, meat, pantry, etc. This prevents you from running back and forth across the store. The best part? CartSpark does this for you automatically, instantly sorting your list into a logical path.\n\n**3. Shop During Off-Peak Hours**\nIf your schedule allows, try to avoid the weekend rush or the after-work scramble. Shopping on a weekday morning or later in the evening often means fewer crowds, shorter checkout lines, and a much less stressful experience.\n\n**4. Use an Interactive Checklist**\nAs you place an item in your cart, check it off your list. This simple action provides a sense of progress and ensures you don't accidentally buy something twice. The checkbox feature in CartSpark makes this easy, and since the list is saved on your phone, you won't lose your place.\n\n**5. Plan Your Meals for the Week**\nKnowing what you're going to cook is the best way to create a focused grocery list. If you're stuck for ideas, use your list as a starting point. With features like "Get Meal Idea" in CartSpark, you can get instant recipe inspiration based on the ingredients you're already planning to buy, making meal planning a breeze.`
    },
    {
        id: 'pantry-checklist',
        title: 'The Ultimate Pantry Checklist: 10 Items You Should Never Run Out Of',
        snippet: 'A well-stocked pantry is the secret weapon of a stress-free kitchen. Here are 10 essential items you should always have on hand.',
        content: `A well-stocked pantry is the secret weapon of a stress-free kitchen. It's the foundation for quick weeknight dinners, unexpected guests, and saving you from that last-minute trip to the store. While every pantry is different, there are a few universal staples that form the backbone of countless recipes. Here are 10 essential items you should always have on hand.\n\n**1. Olive Oil:** The workhorse of the kitchen. Essential for sautéing, roasting, and making salad dressings.\n\n**2. Onions & Garlic:** These two aromatics are the starting point for an incredible number of savory dishes, from pasta sauces to stir-fries.\n\n**3. Canned Tomatoes:** Diced, crushed, or whole, canned tomatoes are incredibly versatile. They're the base for soups, stews, and countless sauces.\n\n**4. Pasta & Rice:** The perfect foundation for a quick and satisfying meal. Keep a box of your favorite pasta shape and a bag of rice for an easy dinner any night of the week.\n\n**5. Canned Beans:** Chickpeas, black beans, and kidney beans are fantastic sources of protein and fiber. Add them to salads, soups, or make a quick batch of hummus.\n\n**6. Broth or Stock:** Chicken, vegetable, or beef broth adds instant flavor to soups, sauces, and grains like rice or quinoa.\n\n**7. All-Purpose Flour:** Even if you're not a big baker, flour is essential for thickening sauces and gravies or for breading chicken or fish.\n\n**8. Eggs:** One of the most versatile ingredients you can own. They're great for breakfast, baking, or a quick protein-packed dinner like a frittata.\n\n**9. A Versatile Vinegar:** Apple cider or white wine vinegar can brighten up a salad dressing, add a tangy kick to a marinade, or balance out a rich sauce.\n\n**10. Salt & Black Pepper:** The fundamental seasonings. No explanation needed!\n\nUse this list as a starting point. The next time you're building your list in CartSpark, do a quick pantry check and add any staples you're missing!`
    },
    {
        id: 'meal-planning',
        title: 'How to Plan a Week of Meals Using Your Grocery List',
        snippet: 'Meal planning can feel daunting, but it\'s one of the best ways to save money, reduce food waste, and eliminate the daily "what\'s for dinner?" stress.',
        content: `Meal planning can feel like a daunting task, but it's one of the best ways to save money, reduce food waste, and eliminate the daily "what's for dinner?" stress. The secret is to let your grocery list guide you. Here’s a simple strategy to plan your week of meals using CartSpark.\n\n**1. Start with What You Have**\nBefore you even think about what to buy, do a quick inventory of your fridge, freezer, and pantry. What needs to be used up? If you have chicken thighs and some vegetables, that's the perfect start for a stir-fry or a sheet-pan dinner. Add those base ingredients to your CartSpark list first.\n\n**2. Let Your List Spark Inspiration**\nOnce you have a few core items on your list, use them to brainstorm meal ideas. If you have ground beef, you could make tacos, spaghetti bolognese, or burgers. Add the other necessary ingredients for those meals to your list. If you're feeling uninspired, use the **"Get Meal Idea"** feature in CartSpark. It will look at your list and give you a simple recipe suggestion to get you started.\n\n**3. Build Around Core Ingredients**\nTry to choose meals that share ingredients. If you buy a bag of onions, plan to use them in a few different dishes throughout the week. If you need cilantro for tacos on Tuesday, plan a soup or a salad that also uses cilantro for Thursday. This minimizes waste and makes your shopping more efficient.\n\n**4. Use "Suggest" to Fill the Gaps**\nOnce you have a few meal ideas planned out, take a look at your list. Does anything seem to be missing? This is the perfect time to use the **"Suggest"** feature. If you have pasta and ground beef, it might remind you to grab tomato sauce or parmesan cheese. It's a great way to catch those small but crucial items you might have forgotten.\n\nBy using your grocery list as a dynamic planning tool, you can transform meal prep from a chore into a simple, organized process.`
    }
];

// --- Helper Components ---

const Icon = ({ category }) => {
  const emojiMap = {
    'Produce': '🍎', 'Dairy & Eggs': '🥛', 'Meat & Seafood': '🥩', 'Bakery': '🍞', 'Pantry': '🥫', 'Frozen Foods': '🧊', 'Beverages': '🥤', 'Household & Cleaning': '🧽', 'Personal Care': '🧼', 'Pets': '🐾', 'Baby': '👶', 'Miscellaneous': '🛒',
  };
  return <span className="text-2xl mr-3">{emojiMap[category] || '🛒'}</span>;
};

const Header = ({ onTitleClick }) => (
  <header className="text-center py-6 md:py-8">
    <div className="flex justify-center items-center gap-x-3 cursor-pointer" onClick={onTitleClick}>
        <svg className="h-10 w-10 md:h-12 md:w-12 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="9" cy="21" r="1" stroke="currentColor" strokeWidth="2"/>
            <circle cx="20" cy="21" r="1" stroke="currentColor" strokeWidth="2"/>
            <path d="M15 6.5L16.5 4L18 6.5L19.5 4L21 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600" style={{ fontFamily: "'Poppins', sans-serif" }}>
          CartSpark
        </h1>
    </div>
    <p className="mt-3 text-lg text-gray-600">Your <span className="font-semibold text-green-600">FREE</span> Grocery List AI Companion</p>
  </header>
);

const LoadingSpinner = ({ small = false }) => (
    <div className={`flex justify-center items-center ${small ? 'p-2' : 'p-8'}`}>
        <div className={`animate-spin rounded-full border-b-2 border-t-2 border-blue-500 ${small ? 'h-6 w-6' : 'h-12 w-12'}`}></div>
    </div>
);

const ErrorMessage = ({ message }) => (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md mb-4" role="alert">
        <p className="font-bold">Oops!</p>
        <p>{message}</p>
    </div>
);

const CopyButton = ({ textToCopy }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
        document.body.removeChild(textArea);
    };
    return (
        <button
            onClick={handleCopy}
            className={`mt-6 w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 ${copied ? 'bg-green-500' : 'bg-gray-700 hover:bg-gray-800'}`}
        >
            {copied ? 'Copied!' : 'Copy Sorted List'}
        </button>
    );
};

const EmptyState = () => (
    <div className="text-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No list sorted yet</h3>
        <p className="mt-1 text-sm text-gray-500">Enter your grocery list above and click "Sort My List!"</p>
    </div>
);

const AdBanner = () => {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error("AdSense error:", e);
        }
    }, []);

    return (
        <div className="mt-8 mb-4 text-center">
            <ins className="adsbygoogle"
                 style={{ display: 'block' }}
                 data-ad-client="ca-pub-8248029170091518"
                 data-ad-slot="7187747884"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
        </div>
    );
};

const AffiliateLinks = () => (
    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h4 className="font-semibold text-center text-green-800">Get Your Groceries Delivered!</h4>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a href="#" target="_blank" rel="noopener noreferrer" className="block p-3 bg-white rounded-lg shadow hover:shadow-md transition text-center font-semibold text-gray-700">
                Order on Instacart
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="block p-3 bg-white rounded-lg shadow hover:shadow-md transition text-center font-semibold text-gray-700">
                Order on Uber Eats
            </a>
        </div>
    </div>
);

const HowItWorks = () => (
    <div className="mt-12">
        <h2 className="text-2xl font-bold text-center text-gray-800">How It Works</h2>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600 mx-auto">
                    <span className="text-xl font-bold">1</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold">Enter Your List</h3>
                <p className="mt-1 text-gray-600">Type or paste your grocery list in any order.</p>
            </div>
            <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600 mx-auto">
                    <span className="text-xl font-bold">2</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold">Sort Instantly</h3>
                <p className="mt-1 text-gray-600">Our AI organizes your items by grocery store category.</p>
            </div>
            <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600 mx-auto">
                    <span className="text-xl font-bold">3</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold">Shop Smarter</h3>
                <p className="mt-1 text-gray-600">Save time with an organized list, get meal ideas, and more!</p>
            </div>
        </div>
    </div>
);

const Features = () => (
    <div className="mt-12 py-8 bg-white rounded-2xl shadow-lg">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-center text-gray-800">Your Ultimate Shopping Companion</h2>
            <p className="mt-4 text-center text-gray-600">
                CartSpark does more than just sort your list. It's packed with smart features to make every grocery trip easier.
            </p>
            <div className="mt-8 space-y-6">
                <div className="flex">
                    <div className="flex-shrink-0"><div className="flex items-center justify-center h-10 w-10 rounded-md bg-purple-500 text-white">✨</div></div>
                    <div className="ml-4">
                        <h4 className="text-lg font-bold">Meal Ideas</h4>
                        <p className="mt-1 text-gray-600">Stuck on what to make for dinner? Get instant recipe suggestions based on the items in your cart.</p>
                    </div>
                </div>
                <div className="flex">
                    <div className="flex-shrink-0"><div className="flex items-center justify-center h-10 w-10 rounded-md bg-teal-500 text-white">💡</div></div>
                    <div className="ml-4">
                        <h4 className="text-lg font-bold">Smart Suggestions</h4>
                        <p className="mt-1 text-gray-600">Forget something? Our AI suggests complementary items you might have missed, like getting garlic for your pasta sauce.</p>
                    </div>
                </div>
                <div className="flex">
                    <div className="flex-shrink-0"><div className="flex items-center justify-center h-10 w-10 rounded-md bg-blue-500 text-white">✅</div></div>
                    <div className="ml-4">
                        <h4 className="text-lg font-bold">Interactive Checklist</h4>
                        <p className="mt-1 text-gray-600">Check off items as you shop. Your list is automatically saved to your device so you can pick up right where you left off.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// --- Page Components ---
const AboutPage = ({ setPage }) => (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg prose max-w-none">
        <button onClick={() => setPage('home')} className="mb-6 text-blue-600 hover:text-blue-800 font-semibold">&larr; Back to App</button>
        <h2>About CartSpark</h2>
        <p><strong>Our Mission: Smarter Shopping, Not Harder Shopping.</strong></p>
        <p>Welcome to CartSpark, your new grocery list AI companion! We believe that a trip to the grocery store shouldn't be a chore. It should be simple, efficient, and maybe even a little bit fun.</p>
        <p>Using the power of artificial intelligence, CartSpark instantly transforms your scattered shopping list into a perfectly organized, aisle-by-aisle path through the store.</p>
        <h4>With CartSpark, you can:</h4>
        <ul>
            <li><strong>Sort Instantly:</strong> Automatically categorize your items into Produce, Dairy, Pantry, and more.</li>
            <li><strong>Get Inspired:</strong> Use our "Get Meal Idea" feature to generate a simple recipe based on what's already on your list.</li>
            <li><strong>Never Forget an Item:</strong> Our "Suggest" feature intelligently recommends related items you might have missed.</li>
            <li><strong>Shop Your Way:</strong> Edit, add, delete, and check off items on the fly with a simple, interactive list that saves to your device.</li>
        </ul>
        <p>Our goal is to give you back your time and mental energy. Thank you for joining us on this journey!</p>
    </div>
);

const PrivacyPolicyPage = ({ setPage }) => (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg prose max-w-none">
        <button onClick={() => setPage('home')} className="mb-6 text-blue-600 hover:text-blue-800 font-semibold">&larr; Back to App</button>
        <h2>Privacy Policy for CartSpark</h2>
        <p><em>Last Updated: July 16, 2025</em></p>
        <p>Your privacy is important to us. This Privacy Policy explains how CartSpark collects, uses, and protects your information.</p>
        <h3>1. Information We Collect</h3>
        <p>CartSpark uses your browser's <code>localStorage</code> to save information directly on your device. We store:</p>
        <ul>
            <li><strong>Your Current Grocery List:</strong> Item names, categories, and checked status.</li>
            <li><strong>Your Preferences:</strong> Your choice for the "Enable Checkboxes" feature.</li>
            <li><strong>Ignored Suggestions:</strong> A temporary record of AI suggestions you've seen.</li>
        </ul>
        <p><strong>This information is stored exclusively on your device's browser. We do not have a central server, and we cannot see, access, or share your personal grocery lists.</strong></p>
        <h3>2. Third-Party Services</h3>
        <p>CartSpark uses these services:</p>
        <ul>
            <li><strong>Google Gemini API:</strong> To power AI features. Your list content is sent to Google for processing, governed by Google's Privacy Policy.</li>
            <li><strong>Google AdSense:</strong> To display ads. Google may use cookies to serve ads. You can opt out in <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google's Ads Settings</a>.</li>
            <li><strong>Affiliate Links:</strong> If you click affiliate links (e.g., Instacart, Uber Eats) and make a purchase, we may earn a commission.</li>
        </ul>
        <h3>3. Clearing Your Data</h3>
        <p>Clicking the "Start New List" or "Start Over" button will permanently delete all app-related data from your browser's storage.</p>
        <h3>4. Contact Us</h3>
        <p>If you have questions, please contact us at: <a href="mailto:contactus@cartspark.io">contactus@cartspark.io</a></p>
    </div>
);

const BlogPage = ({ setSelectedArticle, setPage }) => (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg">
        <button onClick={() => setPage('home')} className="mb-6 text-blue-600 hover:text-blue-800 font-semibold">&larr; Back to App</button>
        <h2 className="text-3xl font-bold text-center mb-8">CartSpark Blog</h2>
        <div className="space-y-8">
            {articles.map(article => (
                <div key={article.id} className="p-6 border rounded-lg">
                    <h3 className="text-2xl font-semibold text-gray-800">{article.title}</h3>
                    <p className="mt-2 text-gray-600">{article.snippet}</p>
                    <button onClick={() => setSelectedArticle(article)} className="mt-4 text-blue-600 font-semibold hover:underline">Read more &rarr;</button>
                </div>
            ))}
        </div>
    </div>
);

const ArticlePage = ({ article, setSelectedArticle }) => (
     <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg prose max-w-none">
        <button onClick={() => setSelectedArticle(null)} className="mb-6 text-blue-600 hover:text-blue-800 font-semibold">&larr; Back to Blog</button>
        <h2 className="text-3xl font-bold">{article.title}</h2>
        <div className="mt-6 text-gray-700" style={{whiteSpace: 'pre-line'}}>
            {article.content}
        </div>
    </div>
);


const AppFooter = ({ setPage }) => (
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


// --- Main Application Component ---

export default function App() {
    const apiKey = "AIzaSyDUsA1lOW3tvCN5VIdk-21pXkpIDJ6QlvU"; 

    const [page, setPage] = useState('home');
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [rawList, setRawList] = useState('');
    const [newItem, setNewItem] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [mealIdea, setMealIdea] = useState('');
    const [isGeneratingMeal, setIsGeneratingMeal] = useState(false);
    const [suggestedItems, setSuggestedItems] = useState([]);
    const [isSuggestingItems, setIsSuggestingItems] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [inputError, setInputError] = useState(false);
    const [needsResort, setNeedsResort] = useState(false);

    const [isPremium, setIsPremium] = useState(() => {
        const saved = localStorage.getItem('isPremium');
        return saved ? JSON.parse(saved) : false;
    });

    const [sortedList, setSortedList] = useState(() => {
        try {
            const savedList = localStorage.getItem('groceryAssistant-sortedList');
            return savedList ? JSON.parse(savedList) : null;
        } catch (e) { return null; }
    });

    const [ignoredSuggestions, setIgnoredSuggestions] = useState(() => {
        try {
            const savedIgnored = localStorage.getItem('groceryAssistant-ignoredSuggestions');
            return savedIgnored ? JSON.parse(savedIgnored) : [];
        } catch (e) { return []; }
    });

    useEffect(() => { localStorage.setItem('isPremium', JSON.stringify(isPremium)); }, [isPremium]);
    useEffect(() => {
        if (sortedList) { localStorage.setItem('groceryAssistant-sortedList', JSON.stringify(sortedList)); } 
        else { localStorage.removeItem('groceryAssistant-sortedList'); }
    }, [sortedList]);
    useEffect(() => { localStorage.setItem('groceryAssistant-ignoredSuggestions', JSON.stringify(ignoredSuggestions)); }, [ignoredSuggestions]);

    const togglePremium = () => setIsPremium(prev => !prev);

    const categoryOrder = useMemo(() => [
        'Produce', 'Bakery', 'Meat & Seafood', 'Dairy & Eggs', 'Pantry',
        'Frozen Foods', 'Beverages', 'Household & Cleaning', 'Personal Care',
        'Pets', 'Baby', 'Miscellaneous',
    ], []);

    const hasItems = (list) => list && Object.values(list).some(cat => cat.length > 0);
    
    const handleToggleCheck = (category, itemIndex) => {
        const newSortedList = JSON.parse(JSON.stringify(sortedList));
        newSortedList[category][itemIndex].checked = !newSortedList[category][itemIndex].checked;
        setSortedList(newSortedList);
    };

    const callGeminiAPI = async (prompt) => {
        if (apiKey === "PASTE_YOUR_API_KEY_HERE" || !apiKey) throw new Error("API Key missing.");
        
        const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 2048 }
        };
        
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

        if (!response.ok) throw new Error(`API request failed with status ${response.status}.`);
        const result = await response.json();

        if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
            return result.candidates[0].content.parts[0].text;
        } else {
            throw new Error(result?.promptFeedback?.blockReason ? `Request blocked: ${result.promptFeedback.blockReason}` : "Could not get a valid response from the AI.");
        }
    };

    const handleSortList = async (listToSort, isInitialSort = false) => {
        setError('');
        setInputError(false);
        if (!listToSort.trim()) {
            setError("Please enter a grocery list before sorting.");
            setInputError(true);
            return;
        }

        setIsLoading(true);
        if (isInitialSort) setSortedList(null);
        setMealIdea('');
        setSuggestedItems([]);
        
        const categoryListForPrompt = categoryOrder.join(', ');
        const prompt = `You are an expert grocery list organizer. Categorize items from the user's list into a predefined set of categories. The user's list is:\n---\n${listToSort}\n---\nIMPORTANT INSTRUCTIONS:\n1. Use ONLY these categories: ${categoryListForPrompt}.\n2. Your response MUST be a single, valid JSON object.\n3. For ANY category without items, include the key with an empty array [].\n4. Do not add items not on the list.\n5. Do not include markdown like \`\`\`json.`;

        try {
            const responseText = await callGeminiAPI(prompt);
            let jsonString = responseText.substring(responseText.indexOf('{'), responseText.lastIndexOf('}') + 1).replace(/,\s*([\]}])/g, '$1');
            const parsedJson = JSON.parse(jsonString);
            
            const completeList = {};
            for (const category of categoryOrder) {
                const items = parsedJson[category] || [];
                completeList[category] = items.map(name => ({ name, checked: false, isEditing: false }));
            }
            setSortedList(completeList);
            if (isInitialSort) setRawList('');
            setNeedsResort(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleResort = () => {
        const currentListItems = Object.values(sortedList || {}).flat().map(item => item.name).join('\n');
        handleSortList(currentListItems);
    };

    const handleGetMealIdea = async () => {
        setIsGeneratingMeal(true);
        setMealIdea('');
        setError('');
        
        const currentListItems = Object.values(sortedList || {}).flat().map(item => item.name).join(', ');
        const prompt = `Based on the following grocery list, suggest one simple meal or recipe idea. Provide a name for the recipe and a brief, easy-to-follow paragraph of instructions. Grocery list: ${currentListItems}`;
        
        try {
            const idea = await callGeminiAPI(prompt);
            setMealIdea(idea);
        } catch (err) {
            setError("Sorry, I couldn't come up with a meal idea right now.");
        } finally {
            setIsGeneratingMeal(false);
        }
    };

    const handleSuggestItems = async () => {
        setIsSuggestingItems(true);
        setSuggestedItems([]);
        setError('');

        const currentListItems = Object.values(sortedList || {}).flat().map(item => item.name).join(', ');
        const ignoreList = ignoredSuggestions.join(', ');
        const prompt = `A user has these items on their grocery list: ${currentListItems}. Suggest 3 to 5 complementary items they might have forgotten. ${ignoreList.length > 0 ? `Do NOT suggest any of these items: ${ignoreList}.` : ''} Return ONLY a single, valid JSON array of strings, like ["item1", "item2", "item3"]. Do not include any other text or markdown.`;

        try {
            const responseText = await callGeminiAPI(prompt);
            const jsonString = responseText.substring(responseText.indexOf('['), responseText.lastIndexOf(']') + 1);
            const suggestions = JSON.parse(jsonString);
            setSuggestedItems(suggestions);
            setIgnoredSuggestions(prev => [...new Set([...prev, ...suggestions])]);
        } catch (err) {
            setError("Sorry, couldn't fetch suggestions right now.");
        } finally {
            setIsSuggestingItems(false);
        }
    };

    const handleEditStart = (category, itemIndex) => setEditingItem({ category, index: itemIndex });

    const handleEditChange = (newValue, category, itemIndex) => {
        const newSortedList = JSON.parse(JSON.stringify(sortedList));
        newSortedList[category][itemIndex].name = newValue;
        setSortedList(newSortedList);
    };

    const handleEditSave = () => {
        setEditingItem(null);
        setNeedsResort(true);
    };
    
    const handleAddNewItem = () => {
        if (!newItem.trim()) return;
        
        const currentItems = sortedList ? Object.values(sortedList).flat().map(item => item.name) : [];
        const combinedList = [...currentItems, ...newItem.split('\n').filter(item => item.trim() !== '')];
        const newListString = combinedList.join('\n');
        
        setNewItem('');
        handleSortList(newListString);
    };

    const handleSuggestionClick = (suggestion) => {
        setNewItem(prev => prev ? `${prev}\n${suggestion}` : suggestion);
        setSuggestedItems(prev => prev.filter(item => item !== suggestion));
    };

    const handleDeleteItem = (categoryToDelete, indexToDelete) => {
        const newSortedList = JSON.parse(JSON.stringify(sortedList));
        newSortedList[categoryToDelete] = newSortedList[categoryToDelete].filter((_, index) => index !== indexToDelete);
        setSortedList(newSortedList);
    };
    
    const handleClearList = () => {
        setRawList('');
        setSortedList(null);
        setError('');
        setInputError(false);
        setMealIdea('');
        setSuggestedItems([]);
        setIgnoredSuggestions([]);
        setNeedsResort(false);
        localStorage.removeItem('groceryAssistant-sortedList');
        localStorage.removeItem('groceryAssistant-ignoredSuggestions');
    };

    const generatePlainTextList = () => {
        if (!sortedList) return '';
        return categoryOrder
            .map(category => {
                const items = sortedList[category];
                if (items && items.length > 0) {
                    const itemNames = items.map(item => item.name).join('\n');
                    return `--- ${category.toUpperCase()} ---\n${itemNames}`;
                }
                return null;
            })
            .filter(Boolean)
            .join('\n\n');
    };

    const renderPageContent = () => {
        if (page === 'about') return <AboutPage setPage={setPage} />;
        if (page === 'privacy') return <PrivacyPolicyPage setPage={setPage} />;
        if (page === 'blog') {
            if (selectedArticle) {
                return <ArticlePage article={selectedArticle} setSelectedArticle={setSelectedArticle} />;
            }
            return <BlogPage setSelectedArticle={setSelectedArticle} setPage={setPage} />;
        }

        // Home page logic
        return (
            <>
                {isLoading && !sortedList ? <LoadingSpinner /> : (
                    hasItems(sortedList) ? (
                        <div className="space-y-6">
                            {error && <ErrorMessage message={error} />}
                            <h2 className="text-2xl font-bold text-center text-gray-800">Your Organized List</h2>
                            {needsResort && !isLoading && (
                                <div className="p-3 bg-orange-100 border border-orange-300 rounded-lg flex items-center justify-between">
                                    <p className="text-sm text-orange-800 font-medium">Your list might need re-sorting.</p>
                                    <button onClick={handleResort} className="bg-orange-500 text-white text-sm font-bold py-1 px-3 rounded-md hover:bg-orange-600 transition">Re-Sort Now</button>
                                </div>
                            )}
                            {isLoading && <LoadingSpinner small/>}
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <label htmlFor="new-item" className="block text-sm font-medium text-gray-700 mb-2">Add more items:</label>
                              <div className="flex flex-col sm:flex-row sm:space-x-2">
                                  <textarea id="new-item" rows="2" className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 mb-2 sm:mb-0" placeholder="Type here or click suggestions below" value={newItem} onChange={(e) => setNewItem(e.target.value)} />
                                  <div className="flex space-x-2">
                                    <button onClick={handleAddNewItem} disabled={isLoading} className="flex-1 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 transition">Add</button>
                                    <button onClick={handleSuggestItems} disabled={isSuggestingItems || isLoading} className="flex-1 bg-teal-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-teal-600 disabled:bg-teal-300 transition" title="Suggest items based on your list">✨ Suggest</button>
                                  </div>
                              </div>
                              {isSuggestingItems && <LoadingSpinner small />}
                              {suggestedItems.length > 0 && (
                                  <div className="mt-3 flex flex-wrap gap-2">
                                      {suggestedItems.map((suggestion, i) => (
                                          <button key={i} onClick={() => handleSuggestionClick(suggestion)} className="bg-teal-100 text-teal-800 text-sm font-medium px-3 py-1 rounded-full hover:bg-teal-200 transition">+ {suggestion}</button>
                                      ))}
                                  </div>
                              )}
                            </div>
                            {categoryOrder.map(category => {
                                const items = sortedList[category];
                                if (items && items.length > 0) {
                                    return (
                                        <div key={category} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                                            <h3 className="text-xl font-semibold mb-3 flex items-center text-gray-700"><Icon category={category} />{category}</h3>
                                            <table className="w-full">
                                                <tbody>
                                                    {items.map((item, index) => (
                                                        <tr key={`${category}-${index}-${item.name}`}>
                                                            <td className="w-8 py-1 align-top">
                                                                {isPremium && <input type="checkbox" checked={item.checked} onChange={() => handleToggleCheck(category, index)} className="h-5 w-5 mt-1 rounded border-gray-400 text-blue-600 focus:ring-blue-500 cursor-pointer"/>}
                                                            </td>
                                                            <td className="py-1">
                                                                {editingItem?.category === category && editingItem?.index === index ? (
                                                                    <input type="text" value={item.name} onChange={(e) => handleEditChange(e.target.value, category, index)} onBlur={handleEditSave} onKeyPress={(e) => { if (e.key === 'Enter') handleEditSave() }} autoFocus className="p-1 rounded-md border-gray-300 shadow-sm w-full"/>
                                                                ) : (
                                                                    <div className="flex justify-between items-center w-full">
                                                                        <span className={`cursor-pointer flex-grow ${item.checked ? 'line-through text-gray-400' : ''}`} onClick={() => handleEditStart(category, index)}>{item.name}</span>
                                                                        <div className="flex items-center flex-shrink-0 ml-4 space-x-3">
                                                                            <svg onClick={() => handleEditStart(category, index)} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 hover:text-blue-600 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg>
                                                                            <svg onClick={() => handleDeleteItem(category, index)} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 hover:text-red-600 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    );
                                }
                                return null;
                            })}
                            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                              <button onClick={handleGetMealIdea} disabled={isGeneratingMeal || isLoading} className="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-purple-300 transition-all">✨ Get Meal Idea</button>
                              {isGeneratingMeal && <LoadingSpinner small />}
                              {mealIdea && (
                                  <div className="mt-4 p-4 bg-white rounded-md border">
                                      <h4 className="font-semibold text-lg text-purple-800">Recipe Suggestion:</h4>
                                      <p className="mt-2 text-gray-700 whitespace-pre-wrap">{mealIdea}</p>
                                  </div>
                              )}
                            </div>
                            <AffiliateLinks />
                            <AdBanner />
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <CopyButton textToCopy={generatePlainTextList()} />
                                <button onClick={handleClearList} disabled={isLoading} className="w-full bg-gray-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400 transition-all">Start New List</button>
                            </div>
                        </div>
                    ) : (
                        // --- INITIAL INPUT VIEW ---
                        <>
                            {error && <ErrorMessage message={error} />}
                            <div className="w-full">
                                <label htmlFor="grocery-list" className="block text-sm font-medium text-gray-700">Enter Your List to Sort it Instantly</label>
                                <p className="text-xs text-gray-500 mb-2">(e.g., bullet points or comma-separated)</p>
                                <textarea id="grocery-list" rows="8" className={`p-3 w-full text-base border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition ${inputError ? 'border-red-500 ring-red-500' : 'border-gray-300'}`} placeholder="- Apples&#10;- Milk&#10;- Bread&#10;- Paper towels" value={rawList} onChange={(e) => setRawList(e.target.value)} />
                            </div>
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <button onClick={() => handleSortList(rawList, true)} disabled={isLoading} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 transition-all duration-300 ease-in-out flex items-center justify-center">Sort My List!</button>
                                <button onClick={handleClearList} disabled={isLoading} className="w-full bg-gray-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400 transition-all">Start Over</button>
                            </div>
                            <HowItWorks />
                            <Features />
                        </>
                    )
                )}
            </>
        );
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans antialiased text-gray-900 pb-12">
             <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@700&display=swap');
                .toggle-checkbox:checked { right: 0; border-color: #4f46e5; }
                .toggle-checkbox:checked + .toggle-label { background-color: #4f46e5; }
                .prose { max-width: 65ch; margin-left: auto; margin-right: auto; color: #374151; }
                .prose h2 { font-size: 1.5rem; font-weight: 700; margin-bottom: 1em; }
                .prose h3 { font-size: 1.25rem; font-weight: 600; margin-bottom: 1em; }
                .prose h4 { font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5em; }
                .prose p { margin-bottom: 1.25em; line-height: 1.6; }
                .prose ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1.25em; }
                .prose li { margin-bottom: 0.5em; }
                .prose a { color: #4f46e5; text-decoration: underline; }
             `}</style>
            <div className="container mx-auto p-4 max-w-2xl">
                <Header onTitleClick={() => { setPage('home'); setSelectedArticle(null); }} />

                {page === 'home' && (
                    <div className="flex justify-center items-center mb-6 bg-yellow-100 border border-yellow-300 text-yellow-800 p-3 rounded-lg">
                        <label htmlFor="premiumToggle" className="mr-3 font-semibold">Enable Checkboxes</label>
                        <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                            <input 
                                type="checkbox" 
                                name="premiumToggle" 
                                id="premiumToggle"
                                checked={isPremium}
                                onChange={togglePremium}
                                className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                            />
                            <label htmlFor="premiumToggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                        </div>
                         <span className="text-sm">{isPremium ? "ON" : "OFF"}</span>
                    </div>
                )}

                <main>
                    {renderPageContent()}
                </main>
                <AppFooter setPage={setPage} />
            </div>
        </div>
    );
}
