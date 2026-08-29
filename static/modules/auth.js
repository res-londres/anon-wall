
import { socket } from './socket.js';
import * as miscHelp from './helpers/misc.js';

// --------- event-listeners ----------- //
document.getElementById('sign-up-container').addEventListener('click', function(event) {
    const actionElement = event.target.closest('[data-action]');
    if (actionElement) {
        const action = actionElement.dataset.action;
        
        event.stopPropagation();
        if (action === 'signUp') {
            signUp();
        }
    }
});

document.getElementById('sign-up-container').addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && event.shiftKey) {
        return; 
    }
    if (event.key !== 'Enter') return;
    const actionElement = event.target.closest('[data-action]');
    if (actionElement) {
        const action = actionElement.dataset.action;

        event.stopPropagation();
        event.preventDefault();
        if (action === 'enterUsername') {
            signUp();
        }
    }
});

// --------- auth ----------- //
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