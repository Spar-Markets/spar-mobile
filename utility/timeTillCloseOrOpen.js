import { formatInTimeZone } from 'date-fns-tz';

const timeTillCloseOrOpen = () => {
    // Define the Eastern Time time zone
    const timeZone = 'America/New_York';

    // Get the current date and time in Eastern Time
    const currentTime = new Date();
    const easternTimeString = formatInTimeZone(currentTime, timeZone, 'yyyy-MM-dd HH:mm:ssXXX');

    // Parse the time from the formatted string
    const [datePart, timePart] = easternTimeString.split(' ');
    const [hours, minutes, seconds] = timePart.split(':').map(Number);

    let targetTime;

    if (hours >= 4 && hours < 20) {
        // Market is open, calculate time until market close (8:00 PM ET)
        targetTime = new Date(`${datePart}T20:00:00${easternTimeString.slice(-6)}`);
    } else {
        // Market is closed, calculate time until market open (4:00 AM ET next day or same day)
        if (hours < 4) {
            // Before 4:00 AM same day
            targetTime = new Date(`${datePart}T04:00:00${easternTimeString.slice(-6)}`);
        } else {
            // Calculate time until midnight in Eastern Time
            const midnightTime = new Date(`${datePart}T24:00:00${easternTimeString.slice(-6)}`);
            // Add 4 hours to get the market open time (4:00 AM ET next day)
            targetTime = new Date(midnightTime.getTime() + 4 * 60 * 60 * 1000);
        }
    }

    // Calculate the difference in milliseconds
    const timeDifference = targetTime.getTime() - currentTime.getTime();

    return timeDifference;
};

export default timeTillCloseOrOpen;
