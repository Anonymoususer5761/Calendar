async function isAuthenticated() {
    let response = await fetch('api/global?auth=return', {
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

function updateClock(datetime) {
    let now = new Date()
    datetime['datetime-date'].innerHTML = now.getDate().toString().padStart(2, '0');;
    datetime['datetime-month'].innerHTML = (now.getMonth() + 1).toString().padStart(2, '0');
    datetime['datetime-year'].innerHTML = now.getFullYear().toString().padStart(4, '0');;
    datetime['datetime-time'].innerHTML = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
}

document.addEventListener('DOMContentLoaded', () => {
    let datetimeDiv = document.getElementById('datetime');
    datetimeDivElements = datetimeDiv.children;
    updateClock(datetimeDivElements)
    setInterval(() => {
        updateClock(datetimeDivElements);
    }, 1000);
});
