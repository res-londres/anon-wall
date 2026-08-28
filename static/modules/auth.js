
import * as miscHelp from './helpers/misc.js';

export function checkSession() {
    fetch('/check_session')
        .then(response => response.json())
        .then(data => {
            if (data.active) {
                // auto sign up success
                console.log('[CHECK-SESSION] active session found; loggin in..');
                miscHelp.showScreen('main');
            } else {
                console.log('[CHECK-SESSION] active session not found; continuing to sign up..');
                miscHelp.showScreen('sign-up');
            }
        })
}

export function signUp() {
    const usernameInput = document.getElementById('username-input');
    const username = usernameInput.value.trim();
    if (!username || !miscHelp.isAlphanumeric(username)) {
        const invalidUsernameMessage = document.getElementById('invalid-username-message').textContent = 'Please enter a valid alphanumeric name!';
        usernameInput.focus();
        return;
    }
    const signUpButton = document.getElementById('sign-up-button');
    signUpButton.disabled = true;
    signUpButton.textContent = 'Signing up..';
    socket.emit('sign-up', {username: username});
}