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

// Code related to the navbar:
function updateDatetime(datetime) {
    let now = new Date()
    datetime['datetime-date'].innerHTML = now.getDate().toString().padStart(2, '0');;
    datetime['datetime-month'].innerHTML = (now.getMonth() + 1).toString().padStart(2, '0');
    datetime['datetime-year'].innerHTML = now.getFullYear().toString().padStart(4, '0');;
    datetime['datetime-time'].innerHTML = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
}

document.addEventListener('DOMContentLoaded', () => {
    // I had to look up an easy way to dynamically change link style on Stack Overflow, but the answer was in JQuery, so I asked ChatGPT to convert it to normal JavaScript.
    document.querySelectorAll(`a[href*='${location.pathname}']`).forEach(a => {
        a.classList.add('current')
    });
    let datetimeDiv = document.getElementById('datetime');
    datetimeDivElements = datetimeDiv.children;
    updateDatetime(datetimeDivElements)
    setInterval(() => {
        updateDatetime(datetimeDivElements);
    }, 1000);
});

// Code used for imporving readability and maintainability:
function padNumber(number, toPad) {
    return String(number).padStart(toPad, '0');
}
