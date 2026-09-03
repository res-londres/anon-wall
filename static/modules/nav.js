
import { socket } from './socket.js';
import { userProfile } from './userProfile.js';

export function setupNavigation() {
    document.querySelectorAll('nav a').forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.dataset.page;
            const action = this.dataset.action;
            showPage(page);
            if (action === 'fetchGlobalPosts') {
                socket.emit('fetch-global-posts');
            } else if (action === 'fetchUserPosts') {
                socket.emit('fetch-user-posts', {
                    user_id: userProfile.user_id
                });
            }
        });
    });
}

export function showPage(page) {
    // hide all pages
    document.querySelectorAll('.page-content').forEach(function(el) {
        el.style.display = 'none';
    });
    // show target page
    const target = document.getElementById('page-' + page);
    if (target) {
        target.style.display = 'block';
    }
    // reassign active class to active page
    document.querySelectorAll('nav a').forEach(function(el) {
        el.classList.remove('active');
    });
    document.querySelector('nav a[data-page="' + page + '"]').classList.add('active');
}

