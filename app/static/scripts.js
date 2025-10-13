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

function updateClock(clock) {
    let now = new Date()
    clock['clock-date'].innerHTML = now.getDate().toString().padStart(2, '0');;
    clock['clock-month'].innerHTML = (now.getMonth() + 1).toString().padStart(2, '0');
    clock['clock-year'].innerHTML = now.getFullYear().toString().padStart(4, '0');;
    clock['clock-time'].innerHTML = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
}

document.addEventListener('DOMContentLoaded', () => {
    let clockDiv = document.getElementById('clock');
    clockElements = clockDiv.children;
    updateClock(clockElements)
    setInterval(() => {
        updateClock(clockElements);
    }, 1000);
});
