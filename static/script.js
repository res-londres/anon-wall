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
                // auto login success
                console.log('[CHECK-SESSION] active session found; loggin in..')
                document.getElementById('loading-container').style.display = 'none';
                document.getElementById('main-container').style.display = 'grid';
            } else {
                console.log('[CHECK-SESSION] active session not found; continuing to sign up..')
                document.getElementById('loading-container').style.display = 'none';
                document.getElementById('login-container').style.display = 'flex';
            }
        })
}

// ---------- cookie-helpers ---------- //
function setCookie(name, value, days) {
    const expires = '';
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


