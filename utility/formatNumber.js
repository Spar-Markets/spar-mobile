/**
 * Function to cap off decimal places for a number.
 * @param {*} number Number to format
 * @param {*} places How many decimal places to allow
 * @returns 
 */
function formatNumber(number, places) {
    // Check if the number has decimal places
    if (number % 1 !== 0) {
        // Cap the number at 2 decimal places
        return parseFloat(number.toFixed(places));
    } else {
        // Return the whole number as is
        return number;
    }
}

export default formatNumber;