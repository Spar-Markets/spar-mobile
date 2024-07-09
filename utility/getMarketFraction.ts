/**
 * gets the fraction of the market day 9:30-4:00 based off of given date
 * @param currentDate 
 * @returns 
 */

function getMarketFraction(currentDate:Date) {
    // Define the market open and close times
    if (currentDate.getUTCHours() >= 13 && currentDate.getUTCMinutes() >= 30) {
        const marketOpen = new Date(currentDate);
        marketOpen.setHours(9, 30, 0, 0); // 9:30 AM

        const marketClose = new Date(currentDate);
        marketClose.setHours(16, 0, 0, 0); // 4:00 PM

        // Calculate the total market duration in milliseconds
        const marketDuration = marketClose.getTime() - marketOpen.getTime();

        // Calculate the elapsed time from market open to the current time
        const elapsedTime = currentDate.getTime() - marketOpen.getTime();

        // Calculate the fraction of the market day completed
        const fractionCompleted = elapsedTime / marketDuration;
        console.log("MARKET FRACTION:", Math.min(Math.max(fractionCompleted, 0), 1))
        // Ensure the fraction is between 0 and 1
        //console.log(fractionCompleted)
        return Math.min(Math.max(fractionCompleted, 0), 1);
    } else {
        return 1
    }
}

export default getMarketFraction