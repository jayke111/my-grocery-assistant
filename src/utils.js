// This file contains reusable helper functions that can be used by any component in the app.

/**
 * Checks if a list object contains any items.
 * @param {object} list - The list object, which should have an 'items' property.
 * @returns {boolean} - True if the list has items, false otherwise.
 */
export const hasItems = (list) => {
    // Check if the list and its 'items' property exist, then check if any category array has a length greater than 0.
    return list && list.items && Object.values(list.items).some(categoryArray => categoryArray.length > 0);
};
