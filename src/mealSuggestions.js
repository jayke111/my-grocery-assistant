// This file contains the pre-populated list of meal suggestions.
// Each meal has a name, a list of ingredients, and an array of tags for filtering.

export const mealSuggestions = [
    // --- BREAKFAST ---
    {
        name: "Apple & Cinnamon Oatmeal",
        ingredients: ["Rolled Oats", "Apple", "Cinnamon", "Water", "Maple Syrup"],
        tags: ["vegetarian", "low-histamine", "lactose-free", "breakfast", "low-sodium"]
    },
    {
        name: "Avocado Toast with Egg",
        ingredients: ["Bread", "Avocado", "Egg", "Red Pepper Flakes"],
        tags: ["low-sodium", "vegetarian", "breakfast"]
    },
    {
        name: "Blueberry Smoothie",
        ingredients: ["Blueberries", "Banana", "Almond Milk", "Chia Seeds"],
        tags: ["low-histamine", "vegetarian", "gluten-free", "lactose-free", "breakfast"]
    },
    {
        name: "Low-Histamine Sweet Potato Hash",
        ingredients: ["Sweet Potatoes", "Bell Peppers (yellow or orange)", "Onion", "Ground Turkey", "Olive Oil", "Herbs"],
        tags: ["low-histamine", "gluten-free", "lactose-free", "breakfast", "dinner"]
    },
    {
        name: "Scrambled Eggs with Herbs",
        ingredients: ["Eggs", "Fresh Parsley", "Fresh Chives", "Unsalted Butter", "Black Pepper"],
        tags: ["low-sodium", "vegetarian", "gluten-free", "low-histamine"],
        mealType: "breakfast"
    },
    {
        name: "Tofu Scramble",
        ingredients: ["Firm Tofu", "Nutritional Yeast", "Turmeric", "Onion Powder", "Garlic Powder", "Black Salt (Kala Namak)"],
        tags: ["vegetarian", "lactose-free", "breakfast"],
    },
    {
        name: "Fruit & Yogurt Parfait",
        ingredients: ["Greek Yogurt", "Mixed Berries", "Granola", "Honey"],
        tags: ["vegetarian", "low-sodium", "breakfast"],
    },
    {
        name: "Buckwheat Pancakes",
        ingredients: ["Buckwheat Flour", "Egg", "Milk", "Maple Syrup", "Baking Powder"],
        tags: ["vegetarian", "gluten-free", "low-histamine", "breakfast"],
    },

    // --- LUNCH ---
    {
        name: "Classic Chicken Salad",
        ingredients: ["Cooked Chicken", "Mayonnaise", "Celery", "Red Onion", "Lemon Juice", "Salt", "Pepper"],
        tags: ["gluten-free", "lunch"]
    },
    {
        name: "Creamy Tomato Soup",
        ingredients: ["Canned Tomatoes", "Vegetable Broth", "Onion", "Garlic", "Heavy Cream", "Basil"],
        tags: ["vegetarian", "gluten-free", "lunch"]
    },
    {
        name: "Quinoa Salad with Lemon Vinaigrette",
        ingredients: ["Quinoa", "Cucumber", "Tomatoes", "Parsley", "Olive Oil", "Lemon Juice"],
        tags: ["vegetarian", "gluten-free", "lactose-free", "lunch"]
    },
    {
        name: "Herbed Turkey Patties",
        ingredients: ["Ground Turkey", "Fresh Parsley", "Fresh Cilantro", "Garlic Powder", "Onion Powder"],
        tags: ["low-histamine", "gluten-free", "lactose-free", "lunch", "dinner"]
    },
    {
        name: "Carrot Ginger Soup",
        ingredients: ["Carrots", "Fresh Ginger", "Onion", "Coconut Milk", "Vegetable Broth"],
        tags: ["low-histamine", "vegetarian", "gluten-free", "lactose-free", "lunch"]
    },
    {
        name: "Zucchini Noodles with Pesto",
        ingredients: ["Zucchini", "Basil", "Pine Nuts", "Garlic", "Olive Oil", "Parmesan Cheese"],
        tags: ["low-histamine", "vegetarian", "gluten-free", "lunch", "dinner"]
    },
    {
        name: "Hummus & Veggie Wrap",
        ingredients: ["Hummus", "Whole Wheat Tortilla", "Cucumber", "Carrots", "Spinach", "Bell Peppers"],
        tags: ["vegetarian", "low-sodium", "lunch"],
    },
    {
        name: "Turkey Lettuce Wraps",
        ingredients: ["Ground Turkey", "Water Chestnuts", "Carrots", "Low-Sodium Soy Sauce", "Ginger", "Garlic", "Iceberg Lettuce"],
        tags: ["low-sodium", "lactose-free", "low-histamine", "lunch"],
    },
    {
        name: "Three Bean Salad",
        ingredients: ["Kidney Beans", "Garbanzo Beans", "Green Beans", "Red Onion", "Vinegar", "Olive Oil"],
        tags: ["vegetarian", "gluten-free", "lactose-free", "low-sodium", "lunch"],
    },
    {
        name: "Cucumber & Herb Chicken Salad",
        ingredients: ["Chicken Breast", "Cucumber", "Fresh Dill", "Fresh Parsley", "Plain Yogurt"],
        tags: ["low-histamine", "gluten-free", "low-sodium", "lunch"],
    },


    // --- DINNER ---
    {
        name: "Simple Salmon & Asparagus",
        ingredients: ["Salmon Fillet", "Asparagus", "Olive Oil", "Lemon", "Garlic", "Salt", "Pepper"],
        tags: ["gluten-free", "low-sodium", "lactose-free", "dinner"]
    },
    {
        name: "Hearty Beef Stew",
        ingredients: ["Beef Stew Meat", "Potatoes", "Carrots", "Celery", "Onion", "Beef Broth", "Tomato Paste"],
        tags: ["dinner"]
    },
    {
        name: "Pork Chops with Roasted Broccoli",
        ingredients: ["Pork Chops", "Broccoli", "Olive Oil", "Garlic Powder", "Salt", "Pepper"],
        tags: ["gluten-free", "lactose-free", "dinner"]
    },
    {
        name: "Vegetarian Black Bean Burgers",
        ingredients: ["Canned Black Beans", "Breadcrumbs", "Onion", "Garlic", "Cumin", "Chili Powder", "Burger Buns"],
        tags: ["vegetarian", "dinner"]
    },
    {
        name: "Lentil Shepherd's Pie",
        ingredients: ["Brown Lentils", "Potatoes", "Carrots", "Peas", "Onion", "Vegetable Broth", "Thyme"],
        tags: ["vegetarian", "gluten-free", "dinner"]
    },
    {
        name: "Vegan Chickpea Curry",
        ingredients: ["Chickpeas", "Coconut Milk", "Onion", "Garlic", "Ginger", "Turmeric", "Coriander", "Rice"],
        tags: ["vegetarian", "lactose-free", "gluten-free", "dinner"]
    },
    {
        name: "Mushroom Risotto",
        ingredients: ["Arborio Rice", "Mushrooms", "Vegetable Broth", "Onion", "Garlic", "Parmesan Cheese", "White Wine"],
        tags: ["vegetarian", "gluten-free", "dinner"]
    },
    {
        name: "Spinach and Feta Stuffed Peppers",
        ingredients: ["Bell Peppers", "Spinach", "Feta Cheese", "Quinoa", "Onion", "Garlic"],
        tags: ["vegetarian", "gluten-free", "dinner"]
    },
    {
        name: "Sweet Potato & Black Bean Tacos",
        ingredients: ["Sweet Potatoes", "Black Beans", "Corn Tortillas", "Avocado", "Lime", "Cilantro"],
        tags: ["vegetarian", "gluten-free", "lactose-free", "dinner"]
    },
    {
        name: "Eggplant Parmesan",
        ingredients: ["Eggplant", "Marinara Sauce", "Mozzarella Cheese", "Parmesan Cheese", "Breadcrumbs"],
        tags: ["vegetarian", "dinner"]
    },
    {
        name: "Low-Sodium Herb Roasted Chicken",
        ingredients: ["Whole Chicken", "Rosemary", "Thyme", "Garlic", "Lemon", "Black Pepper"],
        tags: ["low-sodium", "gluten-free", "lactose-free", "dinner"]
    },
    {
        name: "Garlic Shrimp with Zucchini Noodles",
        ingredients: ["Shrimp", "Zucchini", "Garlic", "Olive Oil", "Lemon Juice", "Red Pepper Flakes"],
        tags: ["low-sodium", "gluten-free", "lactose-free", "dinner"]
    },
    {
        name: "Unsalted Beef & Broccoli Stir-fry",
        ingredients: ["Beef Sirloin", "Broccoli", "Ginger", "Garlic", "Sesame Oil", "Rice Vinegar"],
        tags: ["low-sodium", "lactose-free", "dinner"]
    },
    {
        name: "Baked Cod with Dill",
        ingredients: ["Cod Fillets", "Fresh Dill", "Lemon", "Olive Oil", "Black Pepper"],
        tags: ["low-sodium", "gluten-free", "lactose-free", "dinner"]
    },
    {
        name: "Roasted Root Vegetables",
        ingredients: ["Carrots", "Parsnips", "Sweet Potatoes", "Olive Oil", "Herbs de Provence"],
        tags: ["low-sodium", "gluten-free", "lactose-free", "vegetarian", "dinner"]
    },
    {
        name: "Pork Tenderloin with Apple Slices",
        ingredients: ["Pork Tenderloin", "Apple", "Cinnamon", "Olive Oil"],
        tags: ["low-sodium", "gluten-free", "lactose-free", "dinner"]
    },
    {
        name: "Low-Histamine Chicken & Rice",
        ingredients: ["Chicken Breast", "White Rice", "Carrots", "Zucchini", "Olive Oil", "Salt"],
        tags: ["low-histamine", "gluten-free", "lactose-free", "dinner"]
    },
    {
        name: "Mango Chicken with Basmati Rice",
        ingredients: ["Chicken Breast", "Fresh Mango", "Coconut Milk", "Basmati Rice", "Cilantro"],
        tags: ["low-histamine", "gluten-free", "lactose-free", "dinner"]
    },
    {
        name: "Roasted Cauliflower with Turmeric",
        ingredients: ["Cauliflower", "Olive Oil", "Turmeric", "Coriander", "Salt"],
        tags: ["low-histamine", "vegetarian", "gluten-free", "lactose-free", "dinner"]
    },
    {
        name: "Simple Lamb Chops with Mint",
        ingredients: ["Lamb Chops", "Fresh Mint", "Olive Oil", "Garlic"],
        tags: ["low-histamine", "gluten-free", "lactose-free", "dinner"]
    }
];
