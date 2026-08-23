const socket = io();

// ----------init---------- //
function init() {
    // auth
    checkSession();
}
document.addEventListener('DOMContentLoaded', init);

// -----------auth---------- //
function checkSession() {
    fetch('/check_session')
        .then(response => response.json())
        .then(data => {
            if (data.active) {
                // auto sign up success
                console.log('[CHECK-SESSION] active session found; loggin in..')
                showScreen('main')
            } else {
                console.log('[CHECK-SESSION] active session not found; continuing to sign up..')
                showScreen('signUp')
            }
        })
}

// ---------- cookie-helpers ---------- //
function setCookie(name, value, days) {
    let expires = '';
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + (value || '') + expires + '; path=/; SameSite=Lax';
    console.log('[SET-COOKIE] cookie set: ', name, '=', value);
    console.log('[SET-COOKIE] all cookies: ', document.cookie);
}
function deleteCookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    console.log('[DELETE-COOKIE] cookie deleted:', name);
}

// ---------- sign-up ---------- //
function signUp() {
    const usernameInput = document.getElementById('username-input');
    const username = usernameInput.value.trim();
    if (!username || !isAlphanumeric(username)) {
        const invalidUsernameMessage = document.getElementById('invalid-username-message').textContent = 'Please enter a valid alphanumeric name!';
        usernameInput.focus();
        return;
    }
    const signUpButton = document.getElementById('sign-up-button');
    signUpButton.disabled = true;
    signUpButton.textContent = 'Signing up..';
    socket.emit('sign-up', {username: username});
}
socket.on('sign-up-success', function(data) {
    if (data.set_cookie) {
        setCookie('user_id', data.user_id, 365);
    }
    showScreen('main');
    resetSignUpState();
})

// ---------- misc-helpers ---------- //
function isAlphanumeric(str) {
    return /^[a-zA-Z0-9]+$/.test(str);
}
function resetSignUpState() {
    document.getElementById('username-input').value = '';
    const signUpButton = document.getElementById('sign-up-button');
    signUpButton.disabled = false;
    signUpButton.textContent = 'Sign up';
}
function showScreen(screenName) {
    const screens = ['loading', 'signUp', 'main'];
    screens.forEach(name => {
        document.getElementById(`${name}-container`).style.display = 'none';
    });
    const displayMap = {
        loading: 'flex',
        signUp: 'flex',
        main: 'grid'
    };
    document.getElementById(`${screenName}-container`).style.display = displayMap[screenName];
}


