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

document.addEventListener('DOMContentLoaded', () => {
    let datetimeDiv = document.getElementById('datetime');
    let datetimeDivElements = datetimeDiv.children;
    updateDatetime(datetimeDivElements)
    setInterval(() => {
        updateDatetime(datetimeDivElements);
    }, 1000);
});


