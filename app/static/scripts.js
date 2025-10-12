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

let today = new Date()
localStorage.setItem('today', today.toISOString());