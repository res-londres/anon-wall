
import { socket } from './modules/socket.js';
import * as auth from './modules/auth.js';
import * as nav from './modules/nav.js';
import * as post from './modules/post.js';
import * as profile from './modules/profile.js';
import * as cookieHelp from './modules/helpers/cookie.js';
import * as miscHelp from './modules/helpers/misc.js';

// ----------init---------- //
async function init() {
    // auth
    await auth.checkSession();
}
document.addEventListener('DOMContentLoaded', init);

// temporary -- switch to event listeners for buttons //
window.cookieHelp = cookieHelp;




