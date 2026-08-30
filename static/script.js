
import { socket } from './modules/socket.js';
import * as auth from './modules/auth.js';
import * as nav from './modules/nav.js';
import * as post from './modules/post.js';
import * as cookieHelp from './modules/helpers/cookie.js';
import * as miscHelp from './modules/helpers/misc.js';

// ----------init---------- //
function init() {
    // auth
    auth.checkSession();

    // setup event listeners
    nav.setupNavigation();

    post.renderPosts();
}
document.addEventListener('DOMContentLoaded', init);

// temporary -- switch to event listeners for buttons //
window.cookieHelp = cookieHelp;




