


const formatDate = (date) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);

    // Extract day to add the correct ordinal suffix
    const day = date.getDate();
    let daySuffix;

    if (day > 3 && day < 21) {
        daySuffix = 'th';
    } else {
        switch (day % 10) {
            case 1:
                daySuffix = 'st';
                break;
            case 2:
                daySuffix = 'nd';
                break;
            case 3:
                daySuffix = 'rd';
                break;
            default:
                daySuffix = 'th';
        }
    }

    // Construct the final formatted date with the ordinal suffix
    const dateParts = formattedDate.split(' ');
    dateParts[1] = day + daySuffix; // Replace the day part with the suffixed version

    return dateParts.join(' ');
}


export default formatDate