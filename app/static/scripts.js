async function getUserSettings() {
    const response = await fetch(`/api/settings/get-settings?`, {
        headers: {
            'Request-Source': 'JS-AJAX'
        }
    });
    const option = await response.json();
    return option;
}

function toggleDarkMode(status) {
    if (status === '2' || status === 'dark mode') {
        document.getElementById('css-id').setAttribute('href', "{{ url_for('static', filename='dark-style.css') }}");
    } else if (status === '1' || status === 'light mode') {
        document.getElementById('css-id').setAttribute('href', "{{ url_for('static', filename='stle.css') }}");
    }
}


// AI Usage Disclaimer: Needed some help from the AI to make the async part of this work.
document.addEventListener('DOMContentLoaded', async (event) => {
    darkModeStatus = localStorage.getItem('dark-mode');
    toggleDarkMode(darkModeStatus)
    if (darkModeStatus === '2') {
        let colorPalette = document.getElementById('color-palette')
        if (colorPalette) {
            colorPalette.setAttribute('checked', 'checked')
        }
    }
    else if (getUserSettings()['color-palette'] === 'dark mode') {
        let colorPalette = document.getElementById('color-palette')
        if (colorPalette) {
            colorPalette.setAttribute('checked', 'checked')
        }
    }
});