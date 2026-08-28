
export function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

export function isAlphanumeric(str) {
    return /^[a-zA-Z0-9]+$/.test(str);
}

export function resetSignUpState() {
    document.getElementById('username-input').value = '';
    const signUpButton = document.getElementById('sign-up-button');
    signUpButton.disabled = false;
    signUpButton.textContent = 'Sign up';
}

export function showScreen(screenName) {
    const screens = ['loading', 'sign-up', 'main'];
    screens.forEach(name => {
        document.getElementById(`${name}-container`).style.display = 'none';
    });
    const displayMap = {
        loading: 'flex',
        'sign-up': 'flex',
        main: 'grid'
    };
    document.getElementById(`${screenName}-container`).style.display = displayMap[screenName];
}