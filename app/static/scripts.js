async function getUserSettings() {
    const response = await fetch(`/api/settings/get-settings?`, {
        headers: {
            'Request-Source': 'JS-AJAX'
        }
    });
    const option = await response.json();
    return option;
}

// AI Usage Disclaimer: Needed some help from the AI to make the async part of this work.
document.addEventListener('DOMContentLoaded', async () => {
    if (!(localStorage.getItem('dark-mode'))) {
        if (getUserSettings()['color palette'] === 'dark mode') {
            localStorage.setItem('dark-mode', '2');
        } else {
            localStorage.setItem('dark-mode', '1');
        }
    }
    var darkModeStatus = localStorage.getItem('dark-mode');
    if (darkModeStatus === '2') {
        let colorPalette = document.getElementById('color-palette');
        if (colorPalette) {
            colorPalette.setAttribute('checked', 'checked');
        }
        document.querySelector('link').setAttribute('href', '../static/dark-style.css'); 
    } else {
        document.querySelector('link').setAttribute('href', '../static/style.css'); 
    }
});

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