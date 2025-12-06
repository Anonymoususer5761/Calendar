async function isAuthenticated() {
    let response = await fetch('/api/global?auth=return', {
        headers: {
            'Request-Source': 'JS-AJAX',
        }
    });
    let auth = await response.json();
    return auth;
}

var authorised = false;

isAuthenticated().then(auth => {
    authorised = auth;
});

function padNumber(number, toPad) {
    return String(number).padStart(toPad, '0');
}

function updateDatetime(datetime) {
    let now = new Date()
    datetime['datetime-date'].innerHTML = padNumber(now.getDate(), 2);;
    datetime['datetime-month'].innerHTML = padNumber(now.getMonth() + 1, 2);
    datetime['datetime-year'].innerHTML = padNumber(now.getFullYear(), 4);
    datetime['datetime-time'].innerHTML = `${padNumber(now.getHours(), 2)}:${padNumber(now.getMinutes(), 2)}:${padNumber(now.getSeconds(), 2)}`;
}

function formatTimeValue(timeValue, format) {
    let hours = padNumber(Math.floor(timeValue / 3600000), 2);
    let minutes = padNumber(Math.floor((timeValue / 60000) % 60), 2);
    let seconds = padNumber(Math.floor((timeValue / 1000) % 60), 2);
    let milliseconds = padNumber(Math.floor(timeValue % 1000), 3);
    
    return format.replace('%H', hours).replace('%M', minutes).replace('%S', seconds).replace('%MS', milliseconds);
}

// Used ChatGPT because I couldn't figure out that I had to convert the timestamp into milliseconds.
function formatDateTime(timestamp) {
    timestamp = parseInt(timestamp);
    let date = new Date(timestamp);
    let datetime = date.toISOString();
    datetime = datetime.replace('T', ' ').split('.')[0].slice(0, 16);
    return datetime;
}

function formatTimestampDifference(timestamp) {
    const unixEpochStartYear = 1970;
    timestamp = parseInt(timestamp);
    let date = new Date(timestamp);
    const dateTimeObject = {
        minutes: date.getUTCMinutes() != 0 ? `${date.getUTCMinutes()} minutes` : '',
        hours: date.getUTCHours() != 0 ? `${date.getUTCHours()} hours` : '',
        days: date.getUTCDate() -1 != 0 ? `${date.getUTCDate() - 1} days` : '',
        months: date.getUTCMonth() != 0 ? `${date.getUTCMonth()} months` : '',
        years: date.getUTCFullYear() - unixEpochStartYear != 0 ? `${date.getUTCFullYear() - unixEpochStartYear} years` : '',
    }
    let returnString = `${dateTimeObject.years} ${dateTimeObject.months} ${dateTimeObject.days} ${dateTimeObject.hours} ${dateTimeObject.minutes}`;
    if (returnString.trim() === '') {
        return '-';
    }
    return returnString.trim();
}

document.addEventListener('DOMContentLoaded', () => {
    let datetimeDiv = document.getElementById('datetime');
    let datetimeDivElements = datetimeDiv.children;
    updateDatetime(datetimeDivElements)
    setInterval(() => {
        updateDatetime(datetimeDivElements);
    }, 1000);
});


