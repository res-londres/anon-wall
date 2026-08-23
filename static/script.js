const socket = io();

// ---------- cookie-helpers ---------- //
function setCookie(name, value, days) {
    const expires = '';
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + (value || '') + expires + '; path=/; SameSite=Lax';
    console.log('cookie set: ', name, '=', value);
    console.log('all cookies: ', document.cookie);
}
function deleteCookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    console.log('cookie deleted:', name);
}
