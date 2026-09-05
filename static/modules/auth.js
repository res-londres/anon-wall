
import { socket } from './socket.js';
import { userProfile } from './userProfile.js';
import { posts } from './postsData.js';
import { populateAltDropdowns } from './altName.js';
import * as miscHelp from './helpers/misc.js';

// --------- auth ----------- //
export function checkSession() {
    return fetch('/check_session')
        .then(response => response.json())
        .then(data => {
            if (data.active) {
                const userData = data.user;
                restoreUserData(userData);
                socket.emit('fetch-global-posts', {
                    user_id: userProfile.user_id
                });
                miscHelp.sortByDate(posts);
                // auto sign up success
                console.log(`[CHECK-SESSION] active session found: ${userProfile.user_id}; loggin in..`);
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
    const altNameInput = document.getElementById('alt-name-input');
    const altName = altNameInput.value.trim();
    if (!username || !miscHelp.isAlphanumeric(username)) {
        document.getElementById('invalid-name-message').textContent = 'Username should be alphanumeric!';
        usernameInput.focus();
        return;
    }
    if (!altName || !miscHelp.isAlphanumeric(altName)) {
        document.getElementById('invalid-name-message').textContent = 'Alt name should be alphanumeric!';
        altNameInput.focus();
        return;
    }
    const signUpButton = document.getElementById('sign-up-button');
    signUpButton.disabled = true;
    signUpButton.textContent = 'Signing up..';
    socket.emit('sign-up', {
        username: username,
        alt_name: altName
    });
}

// ---------- helper ----------- //
function restoreUserData(userData) {
    userProfile.user_data = userData.user_data;
    userProfile.user_id = userData.user_id;
    userProfile.username = userData.username;
}

// ---------- socket-listeners ---------- //
socket.on('sign-up-success', function(data) {
    if (data.set_cookie) {
        cookieHelp.setCookie('user_id', data.user_id, 365);
    }
    miscHelp.showScreen('main');
    miscHelp.resetSignUpState();
    userProfile.user_data = data.user_data;
    userProfile.user_id = data.user_id;
    userProfile.username = data.username;
    userProfile.alt_names = data.alt_names;
    populateAltDropdowns();
    console.log(userProfile);
});

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