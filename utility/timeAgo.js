/**
 * converts data into time ago format
 * @param {*} date
 * @returns
 */

function timeAgo(date) {
  const now = new Date();
  const secondsPast = Math.floor((now - date) / 1000);
  if (secondsPast == 0) {
    return 'Just Now';
  }
  if (secondsPast < 60) {
    return `${secondsPast}sec`;
  }
  if (secondsPast < 3600) {
    const minutes = Math.floor(secondsPast / 60);
    return `${minutes}m`;
  }
  if (secondsPast < 86400) {
    const hours = Math.floor(secondsPast / 3600);
    return `${hours}hr`;
  }
  if (secondsPast < 604800) {
    // less than 7 days
    const days = Math.floor(secondsPast / 86400);
    return `${days}d`;
  }
  if (secondsPast < 2419200) {
    // less than 4 weeks
    const weeks = Math.floor(secondsPast / 604800);
    return `${weeks}w`;
  }
  if (secondsPast < 29030400) {
    // less than 12 months
    const months = Math.floor(secondsPast / 2419200);
    return `${months}m`;
  }
  const years = Math.floor(secondsPast / 29030400);
  return `${years}y`;
}

module.exports = timeAgo;
