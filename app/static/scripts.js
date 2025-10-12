async function isAuthenticated() {
    let response = await fetch('api/global?auth=return', {
        headers: {
            'Request-Source': 'JS-AJAX',
        }
    });
    let auth = await response.json();
    if (auth) {
        return true;
    }
    return false;
}

isAuthenticated().then(auth => {
    if (auth) {
        localStorage.setItem('auth', 1);
    } else {
        localStorage.setItem('auth', 0);
    }
});

function updateClock(clock) {
    let now = new Date();
    clock['clock-date'].innerHTML = now.getDate();
    clock['clock-month'].innerHTML = now.getMonth() + 1;
    clock['clock-year'].innerHTML = now.getFullYear();
    clock['clock-time'].innerHTML = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds().toString().padStart(2, '0')}`;
}

document.addEventListener('DOMContentLoaded', () => {
    let clockDiv = document.getElementById('clock');
    clockElements = clockDiv.children;
    updateClock(clockElements)
    setInterval(() => {
        updateClock(clockElements);
    }, 1000);
});
