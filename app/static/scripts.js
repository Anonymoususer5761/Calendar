async function getUserSettings(setting) {
    const response = await fetch(`/api/settings/get-settings?setting=${setting}`, {
        headers: {
            'Request-Source': 'JS-AJAX'
        }
    });
    const option = await response.json();
    return option;
}

// AI Usage Disclaimer: Needed some help from the AI to make the async part of this work.
document.addEventListener('DOMContentLoaded', async (event) => {
    if (localStorage.getItem('dark-mode') === '2') {
        document.body.classList.add('dark-mode');
        document.getElementById('color-palette').setAttribute('checked', 'checked')
    }
    else if (await getUserSettings('color-palette') === 'dark mode') {
        document.body.classList.toggle('dark-mode');
        document.getElementById('color-palette').setAttribute('checked', 'checked');
    }
});