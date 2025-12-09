const signInEL = document.getElementById('sign_in');
const rememberMeEL = document.getElementById('remember_me');

function toggleRememberMe() {
    if (signInEL.checked) {
        rememberMeEL.removeAttribute('disabled');
    } else {
        rememberMeEL.setAttribute('disabled', 'disabled');
    }
}

signInEL.addEventListener('change', () => {
    rememberMeEL.checked = false;
    toggleRememberMe();
});